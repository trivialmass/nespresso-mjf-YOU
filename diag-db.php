<?php
require_once __DIR__ . '/php-backend/api/credentials.php';
$pdo = new PDO(
    "mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME').";charset=utf8mb4",
    getenv('DB_USER'), getenv('DB_PASS'),
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);
header('Content-Type: text/plain');

echo "MySQL: " . $pdo->query('SELECT VERSION()')->fetchColumn() . "\n\n";

$idx = $pdo->query("SHOW INDEX FROM results WHERE Key_name = 'idx_email_event'")->fetchAll();
echo "idx_email_event: " . (count($idx) ? "EXISTS (".count($idx)." parts)" : "MISSING!") . "\n\n";

$dups = $pdo->query("
    SELECT email, event_date, COUNT(*) cnt FROM results
    GROUP BY email, event_date HAVING cnt > 1 LIMIT 10
")->fetchAll(PDO::FETCH_ASSOC);
echo "Duplicate (email,event_date) rows: " . count($dups) . "\n";
foreach ($dups as $d) echo "  {$d['email']} / {$d['event_date']}: {$d['cnt']} rows\n";

echo "\nLast 15 rows:\n";
$rows = $pdo->query("
    SELECT id, email, event_date,
           IF(profile='','(empty)',LEFT(profile,25)) profile,
           IF(answers='[]' OR answers='','(empty)',LEFT(answers,20)) answers,
           created_at
    FROM results ORDER BY id DESC LIMIT 15
")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "  #{$r['id']} {$r['email']} [{$r['event_date']}] profile={$r['profile']} answers={$r['answers']} {$r['created_at']}\n";
}
