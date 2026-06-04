<?php
// TEMPORARY — delete after use
require_once __DIR__ . '/php-backend/api/credentials.php';
require_once __DIR__ . '/php-backend/lib/sendMail.php';

$to = 'janissa@trivialmass.com';
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
}

header('Content-Type: text/plain');
foreach ($results as $tpl => $status) {
    echo "$status  $tpl\n";
}
