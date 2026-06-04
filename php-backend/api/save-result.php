<?php
// Allow cross-origin requests from the same origin only
$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: 'https://nespresso-mjf.trivialmass.com';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Vary: Origin');
}
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── DB config — all values must be set via environment variables ──────────
// Load credentials.php if present (shared hosting fallback, never committed)
$credFile = __DIR__ . '/credentials.php';
if (file_exists($credFile)) require_once $credFile;

$host = getenv('DB_HOST');
$db   = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

if (!$host || !$db || !$user || $pass === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}

// Auto-create table if it doesn't exist
$pdo->exec("
    CREATE TABLE IF NOT EXISTS results (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(255)  DEFAULT '',
        first_name  VARCHAR(255)  DEFAULT '',
        last_name   VARCHAR(255)  DEFAULT '',
        company     VARCHAR(255)  DEFAULT '',
        email       VARCHAR(255)  DEFAULT '',
        phone       VARCHAR(50)   DEFAULT '',
        event_date  VARCHAR(20)   DEFAULT '',
        guest_count TINYINT       DEFAULT 0,
        profile     TEXT          DEFAULT '',
        answers     TEXT          DEFAULT '',
        created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Add columns for existing tables that predate this migration
$pdo->exec("ALTER TABLE results ADD COLUMN IF NOT EXISTS event_date  VARCHAR(20)  DEFAULT ''");
$pdo->exec("ALTER TABLE results ADD COLUMN IF NOT EXISTS guest_count TINYINT      DEFAULT 0");

// Unique index on (email, event_date) enables upsert: quiz completion updates the RSVP row
// Remove junk rows with empty email before creating the unique index
$pdo->exec("DELETE FROM results WHERE email = '' OR email IS NULL");
try {
    $pdo->exec("
        CREATE UNIQUE INDEX IF NOT EXISTS idx_email_event
        ON results (email(191), event_date)
    ");
} catch (PDOException $e) {
    // Index likely already exists — safe to ignore
}

// ── Parse body ─────────────────────────────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$firstName = $body['first_name'] ?? '';
$lastName  = $body['last_name']  ?? '';
$name      = $body['name']       ?? trim("$firstName $lastName");
$company   = $body['company']    ?? '';
$email     = $body['email']      ?? '';
$phone     = $body['phone']      ?? '';
$eventDate  = $body['event_date']  ?? '';
$guestCount = isset($body['guest_count']) ? (int)$body['guest_count'] : 0;

// Validate event_date against known event dates
if ($eventDate !== '' && !in_array($eventDate, ['July 8', 'July 9'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid event_date']);
    exit;
}

// Validate guest_count range (0–2 per spec)
if ($guestCount < 0 || $guestCount > 2) {
    http_response_code(400);
    echo json_encode(['error' => 'guest_count must be between 0 and 2']);
    exit;
}

$profile   = isset($body['profile'])
    ? (is_string($body['profile']) ? $body['profile'] : json_encode($body['profile']))
    : '';
$answers   = isset($body['answers'])
    ? (is_string($body['answers']) ? $body['answers'] : json_encode($body['answers']))
    : '[]';

$stmt = $pdo->prepare("
    INSERT INTO results (name, first_name, last_name, company, email, phone, event_date, guest_count, profile, answers)
    VALUES (:name, :first_name, :last_name, :company, :email, :phone, :event_date, :guest_count, :profile, :answers)
    ON DUPLICATE KEY UPDATE
        profile = IF(VALUES(profile) != '', VALUES(profile), profile),
        answers = IF(VALUES(answers) != '' AND VALUES(answers) != '[]', VALUES(answers), answers)
");
$stmt->execute([
    'name'        => $name,
    'first_name'  => $firstName,
    'last_name'   => $lastName,
    'company'     => $company,
    'email'       => $email,
    'phone'       => $phone,
    'event_date'  => $eventDate,
    'guest_count' => $guestCount,
    'profile'     => $profile,
    'answers'     => $answers,
]);

// ── Confirmation email (only on first save = INSERT, not on quiz upsert) ───────
// rowCount() == 1 → INSERT, 2 → ON DUPLICATE KEY UPDATE, 0 → no change
$attending = $body['attending'] ?? true; // default true for quiz-complete saves
$isNewRow  = $stmt->rowCount() === 1;

if ($isNewRow && $attending && $email) {
    $dateSlug = $eventDate === 'July 8' ? 'july_8' : 'july_9';
    $tplPath  = __DIR__ . '/../../assets/mails/confirmation_' . $dateSlug . '.html';

    if (file_exists($tplPath)) {
        require_once __DIR__ . '/../lib/sendMail.php';
        $htmlBody = file_get_contents($tplPath);
        $htmlBody = str_replace('&laquo;First_Name&raquo;', htmlspecialchars($firstName ?: $name), $htmlBody);
        sendMail($email, 'Your attendance is confirmed — Nespresso × MJF', $htmlBody);
    }
}

echo json_encode(['success' => true]);
