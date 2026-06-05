<?php
// TEMPORARY — delete after use
require_once __DIR__ . '/php-backend/api/credentials.php';
require_once __DIR__ . '/php-backend/lib/sendMail.php';

$to = filter_input(INPUT_GET, 'to', FILTER_VALIDATE_EMAIL) ?: 'leonard@trivialmass.com';
$tplFilter = $_GET['tpl'] ?? null;

$templates = [
    'invitation_o_july_8' => '[TEST] Invitation O — July 8',
    'invitation_o_july_9' => '[TEST] Invitation O — July 9',
    'invitation_t_july_8' => '[TEST] Invitation T — July 8',
    'invitation_t_july_9' => '[TEST] Invitation T — July 9',
    'invitation_z_july_8' => '[TEST] Invitation Z — July 8',
    'invitation_z_july_9' => '[TEST] Invitation Z — July 9',
    'confirmation_july_8' => '[TEST] Confirmation — July 8',
    'confirmation_july_9' => '[TEST] Confirmation — July 9',
];

if ($tplFilter && isset($templates[$tplFilter])) {
    $templates = [$tplFilter => $templates[$tplFilter]];
}

$results = [];
foreach ($templates as $tpl => $subject) {
    $path = __DIR__ . '/assets/mails/' . $tpl . '.html';
    if (!file_exists($path)) {
        $results[$tpl] = 'FILE NOT FOUND';
        continue;
    }
    $body = file_get_contents($path);
    $ok = sendMail($to, $subject, $body);
    $results[$tpl] = $ok ? 'OK' : 'FAILED';
    sleep(2);
}

header('Content-Type: text/plain');
foreach ($results as $tpl => $status) {
    echo "$status  $tpl\n";
}
