<?php
// admin.php — deployed to site root. NOT committed to git (contains credentials).
session_start();

// ── Config ────────────────────────────────────────────────────────────────────
// Load credentials from credentials.php (gitignored, uploaded manually)
$credFile = __DIR__ . '/php-backend/api/credentials.php';
if (file_exists($credFile)) require_once $credFile;

$host            = getenv('DB_HOST');
$dbName          = getenv('DB_NAME');
$user            = getenv('DB_USER');
$pass            = getenv('DB_PASS');
$base_url        = getenv('BASE_URL') ?: 'https://nespresso-mjf.trivialmass.com';
$allowed_domains = ['trivialmass.com', 'trivialmass.ch'];

if (!$host || !$dbName || !$user || $pass === false) {
    die('Server configuration error: DB credentials not set.');
}
// ── DB ────────────────────────────────────────────────────────────────────────
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbName;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    die('DB connection failed: ' . htmlspecialchars($e->getMessage()));
}

$pdo->exec("CREATE TABLE IF NOT EXISTS magic_links (
    token      VARCHAR(64)  PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT      DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS admin_sessions (
    token      VARCHAR(64)  PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS results (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255),
    first_name  VARCHAR(255),
    last_name   VARCHAR(255),
    company     VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    event_date  VARCHAR(50),
    guest_count INT       DEFAULT 0,
    attending   TINYINT(1) DEFAULT 1,
    profile     TEXT,
    answers     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
try { $pdo->exec("ALTER TABLE results ADD COLUMN attending TINYINT(1) DEFAULT 1"); } catch (PDOException $e) {}

// ── Session check ─────────────────────────────────────────────────────────────
$isAuth       = false;
$sessionEmail = '';
if (!empty($_COOKIE['admin_session'])) {
    $stmt = $pdo->prepare("SELECT * FROM admin_sessions WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$_COOKIE['admin_session']]);
    $session = $stmt->fetch();
    if ($session) {
        $isAuth       = true;
        $sessionEmail = $session['email'];
    }
}

// ── Magic link verification ───────────────────────────────────────────────────
$error   = '';
$message = '';

if (isset($_GET['token']) && !$isAuth) {
    $tok  = trim($_GET['token']);
    $stmt = $pdo->prepare("SELECT * FROM magic_links WHERE token = ? AND expires_at > NOW() AND used = 0");
    $stmt->execute([$tok]);
    $link = $stmt->fetch();

    if ($link) {
        $pdo->prepare("UPDATE magic_links SET used = 1 WHERE token = ?")->execute([$tok]);
        $sessToken = bin2hex(random_bytes(32));
        $exp       = date('Y-m-d H:i:s', strtotime('+7 days'));
        $pdo->prepare("INSERT INTO admin_sessions (token, email, expires_at) VALUES (?, ?, ?)")
            ->execute([$sessToken, $link['email'], $exp]);
        setcookie('admin_session', $sessToken, [
            'expires'  => strtotime('+7 days'),
            'path'     => '/',
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Strict',
        ]);
        header('Location: /admin');
        exit;
    }

    $error = 'Lien invalide ou expiré.';
}

// ── Magic link request ────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email']) && !$isAuth) {
    $email  = trim($_POST['email']);
    $parts  = explode('@', $email);
    $domain = strtolower($parts[1] ?? '');

    if (!in_array($domain, $allowed_domains, true)) {
        $error = 'Domaine email non autorisé.';
    } else {
        $tok   = bin2hex(random_bytes(32));
        $exp   = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        $pdo->prepare("INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)")
            ->execute([$tok, $email, $exp]);

        $linkUrl = "$base_url/admin?token=$tok";
        $subject = "Votre lien d'accès Trivial YOU";
        $body    = "Bonjour,\n\nVoici votre lien d'accès (valide 15 minutes) :\n\n$linkUrl\n\nSi vous n'avez pas fait cette demande, ignorez ce message.";
        require_once __DIR__ . '/php-backend/lib/sendMail.php';
        $adminFrom = getenv('MAIL_ADMIN_FROM') ?: 'noreply@trivialmass.com';
        sendMail($email, $subject, nl2br(htmlspecialchars($body)), $adminFrom, 'Trivial YOU Admin');

        $message = '✅ Lien envoyé ! Vérifiez votre boîte mail.';
    }
}

// ── Clear all entries ─────────────────────────────────────────────────────────
if ($isAuth && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'clear_results') {
    $pdo->exec("DELETE FROM results");
    header('Location: /admin');
    exit;
}

// ── CSV export ────────────────────────────────────────────────────────────────
if ($isAuth && isset($_GET['export']) && $_GET['export'] === 'csv') {
    $rows = $pdo->query("SELECT * FROM results ORDER BY created_at DESC")->fetchAll();
    $esc  = fn($v) => '"' . str_replace('"', '""', $v) . '"';

    $lines   = [];
    $lines[] = implode(',', array_map($esc, ['Date', 'Prénom', 'Nom', 'Email', 'Tél.', 'Date événement', 'Présence', 'Invités', 'Profil', 'Réponses']));

    foreach ($rows as $r) {
        $profile = '';
        if ($r['profile']) {
            $p = json_decode($r['profile'], true);
            if (is_string($p)) $p = json_decode($p, true);
            $profile = $p['drink'] ?? '';
        }
        $answers = '';
        try {
            $ans     = json_decode($r['answers'] ?? '[]', true);
            $answers = implode(' | ', array_map(fn($a) => ($a['question']['question'] ?? $a['question'] ?? '') . ' → ' . ($a['answer'] ?? ''), $ans));
        } catch (Exception $e) {
        }

        $lines[] = implode(',', array_map($esc, [
            substr($r['created_at'] ?? '', 0, 16),
            $r['first_name'] ?? explode(' ', $r['name'] ?? '')[0] ?? '',
            $r['last_name']  ?? implode(' ', array_slice(explode(' ', $r['name'] ?? ''), 1)) ?? '',
            $r['email']      ?? '',
            $r['phone']      ?? '',
            $r['event_date'] ?? '',
            ($r['attending'] ?? 1) ? 'Oui' : 'Non',
            $r['guest_count'] ?? '0',
            $profile,
            $answers,
        ]));
    }

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="resultats-trivial-you.csv"');
    echo "\xEF\xBB\xBF" . implode("\r\n", $lines);
    exit;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
$DRINK_COLORS = [
    'Ice Yuzu Tonic'    => '#a5ff02',
    'Ice Pina Colada'   => '#ffcc00',
    'Nespresso Martini' => '#c084fc',
];

function parseProfile(string $raw): ?array
{
    if (!$raw) return null;
    try {
        $p = json_decode($raw, true);
        return is_string($p) ? json_decode($p, true) : $p;
    } catch (Exception $e) {
        return null;
    }
}

function parseAnswers(string $raw): array
{
    try {
        return json_decode($raw ?: '[]', true) ?: [];
    } catch (Exception $e) {
        return [];
    }
}

?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin — Trivial YOU</title>
    <style>
        * {
            box-sizing: border-box
        }

        body {
            font-family: Helvetica, sans-serif;
            margin: 0;
            background: #111;
            color: #fff
        }

        <?php if (!$isAuth): ?>body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh
        }

        .box {
            background: #1a1a1a;
            padding: 48px;
            border-radius: 16px;
            width: 360px;
            text-align: center
        }

        h1 {
            font-size: 22px;
            margin: 0 0 8px
        }

        p {
            color: #999;
            font-size: 14px;
            margin: 0 0 24px
        }

        input {
            width: 100%;
            padding: 12px 16px;
            border-radius: 8px;
            border: none;
            font-size: 15px;
            margin-bottom: 16px
        }

        button {
            width: 100%;
            padding: 14px;
            background: #a5ff02;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer
        }

        button:hover {
            background: #c0ff40
        }

        .msg {
            margin-top: 16px;
            font-size: 14px;
            min-height: 20px;
            color: #a5ff02
        }

        .err {
            color: #ff5555
        }

        <?php else: ?>body {
            padding: 32px
        }

        h1 {
            font-size: 22px;
            margin: 0 0 4px
        }

        .meta {
            color: #666;
            font-size: 13px;
            margin-bottom: 16px
        }

        .stats {
            margin-bottom: 20px
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            margin-right: 8px;
            color: #000
        }

        .export-btn {
            display: inline-block;
            padding: 8px 18px;
            background: #a5ff02;
            color: #000;
            font-weight: 700;
            font-size: 13px;
            border-radius: 8px;
            text-decoration: none;
            margin-bottom: 20px
        }

        .export-btn:hover {
            background: #c0ff40
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px
        }

        th {
            background: #1a1a1a;
            color: #888;
            padding: 8px 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .05em;
            border-bottom: 1px solid #333
        }

        td {
            padding: 10px 12px;
            border-bottom: 1px solid #1e1e1e;
            vertical-align: top
        }

        tr:hover td {
            background: #161616
        }

        .chip {
            display: inline-block;
            background: #1e1e1e;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 2px 8px;
            font-size: 11px;
            margin: 2px 2px 2px 0;
            white-space: nowrap
        }

        .profile-badge {
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            color: #000
        }

        .tagline {
            color: #999;
            font-size: 11px
        }

        <?php endif; ?>
    </style>
</head>

<body>

    <?php if (!$isAuth): ?>
        <div class="box">
            <h1>Trivial YOU — Admin</h1>
            <p>Entrez votre adresse @trivialmass pour recevoir un lien d'accès.</p>
            <form method="POST" action="/admin">
                <input type="email" name="email" placeholder="vous@trivialmass.ch" required autofocus />
                <button type="submit">Envoyer le lien</button>
            </form>
            <?php if ($message): ?><div class="msg"><?= htmlspecialchars($message) ?></div><?php endif; ?>
            <?php if ($error):   ?><div class="msg err"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        </div>

    <?php else:
        $rows = $pdo->query("SELECT * FROM results ORDER BY created_at DESC")->fetchAll();

        // Stats per drink
        $stats = [];
        foreach ($rows as $r) {
            $p = parseProfile($r['profile'] ?? '');
            $drink = $p['drink'] ?? 'Inconnu';
            $stats[$drink] = ($stats[$drink] ?? 0) + 1;
        }
    ?>

        <h1>Résultats du quiz</h1>
        <?php
            $attending_yes = count(array_filter($rows, fn($r) => ($r['attending'] ?? 1) == 1));
            $attending_no  = count($rows) - $attending_yes;
        ?>
        <p class="meta"><?= count($rows) ?> participant<?= count($rows) !== 1 ? 's' : '' ?> · <?= $attending_yes ?> présent<?= $attending_yes !== 1 ? 's' : '' ?> · <?= $attending_no ?> absent<?= $attending_no !== 1 ? 's' : '' ?> · <?= htmlspecialchars($sessionEmail) ?></p>

        <div class="stats">
            <?php foreach ($stats as $drink => $count):
                $color = $DRINK_COLORS[$drink] ?? '#888'; ?>
                <span class="badge" style="background:<?= $color ?>"><?= $count ?> × <?= htmlspecialchars($drink) ?></span>
            <?php endforeach; ?>
        </div>

        <a class="export-btn" href="/admin?export=csv">⬇ Exporter CSV</a>
        <form method="POST" action="/admin" style="display:inline" onsubmit="return confirm('Supprimer toutes les entrées ? Cette action est irréversible.')">
            <input type="hidden" name="action" value="clear_results">
            <button type="submit" class="export-btn" style="background:#ff5555;border:none;cursor:pointer">🗑 Vider les entrées</button>
        </form>

        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Prénom</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Tél.</th>
                    <th>Événement</th>
                    <th>Présence</th>
                    <th>Invités</th>
                    <th>Profil</th>
                    <th>Réponses</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($rows)): ?>
                    <tr>
                        <td colspan="9" style="color:#555;padding:24px">Aucun résultat.</td>
                    </tr>
                    <?php else: foreach ($rows as $r):
                        $profile = parseProfile($r['profile'] ?? '');
                        $answers = parseAnswers($r['answers'] ?? '[]');
                        $drink   = $profile['drink'] ?? '';
                        $color   = $DRINK_COLORS[$drink] ?? '#555';
                        $fn      = $r['first_name'] ?: explode(' ', $r['name'] ?? '')[0] ?? '';
                        $ln      = $r['last_name']  ?: implode(' ', array_slice(explode(' ', $r['name'] ?? ''), 1)) ?: '';
                    ?>
                        <tr>
                            <td style="white-space:nowrap;color:#aaa;font-size:12px"><?= htmlspecialchars(substr($r['created_at'] ?? '', 0, 16)) ?></td>
                            <td style="color:#ccc"><?= htmlspecialchars($fn) ?></td>
                            <td style="color:#ccc"><?= htmlspecialchars($ln) ?></td>
                            <td style="color:#ccc"><?= htmlspecialchars($r['email'] ?? '') ?></td>
                            <td style="color:#ccc"><?= htmlspecialchars($r['phone'] ?? '') ?></td>
                            <td style="color:#ccc;white-space:nowrap"><?= htmlspecialchars($r['event_date'] ?? '') ?></td>
                            <td style="text-align:center"><?= ($r['attending'] ?? 1) ? '<span style="color:#a5ff02">✓</span>' : '<span style="color:#ff5555">✗</span>' ?></td>
                            <td style="color:#ccc;text-align:center"><?= (int)($r['guest_count'] ?? 0) ?></td>
                            <td><?php if ($drink): ?>
                                    <span class="profile-badge" style="background:<?= $color ?>"><?= htmlspecialchars($drink) ?></span><br>
                                    <span class="tagline"><?= htmlspecialchars($profile['tagline'] ?? '') ?></span>
                                <?php else: ?><span style="color:#555">—</span><?php endif; ?>
                            </td>
                            <td><?php foreach ($answers as $a):
                                    $q = is_array($a['question'] ?? null) ? ($a['question']['question'] ?? '') : ($a['question'] ?? '');
                                    $label = rtrim(is_string($q) ? $q : '', '?');
                                ?><span class="chip"><b><?= htmlspecialchars($label) ?></b> → <?= htmlspecialchars($a['answer'] ?? '') ?></span><?php endforeach; ?></td>
                        </tr>
                <?php endforeach;
                endif; ?>
            </tbody>
        </table>
    <?php endif; ?>
</body>

</html>