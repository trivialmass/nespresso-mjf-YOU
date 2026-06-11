<?php
require_once __DIR__ . '/XlsxWriter.php';

function exportXlsx(PDO $pdo): void
{
    $allRows = $pdo->query("SELECT * FROM results ORDER BY created_at ASC")->fetchAll();

    $july8   = array_values(array_filter($allRows, fn($r) => ($r['event_date'] ?? '') === 'July 8'));
    $july9   = array_values(array_filter($allRows, fn($r) => ($r['event_date'] ?? '') === 'July 9'));
    $walkins = array_values(array_filter($allRows, fn($r) => !in_array($r['event_date'] ?? '', ['July 8', 'July 9'], true)));

    // Date | Prénom | Nom | Email | Tél. | Date événement | Présence | +Invités | Profil | Réponses
    $widths = [16, 12, 15, 30, 13, 14, 10, 9, 18, 55];

    $xlsx = new XlsxWriter();
    $xlsx->addSheet('8 juillet', _sheetRows($july8),   $widths);
    $xlsx->addSheet('9 juillet', _sheetRows($july9),   $widths);
    $xlsx->addSheet('Walk-ins',  _sheetRows($walkins), $widths);
    $xlsx->download('inscriptions-trivial-you.xlsx');
}

function _sheetRows(array $rows): array
{
    $COLS  = ['Date', 'Prénom', 'Nom', 'Email', 'Tél.', 'Date événement', 'Présence', '+Invités', 'Profil', 'Réponses'];
    $sMap  = [0 => XlsxWriter::S_DEFAULT, 1 => XlsxWriter::S_YELLOW, 2 => XlsxWriter::S_GREEN];
    $blank = array_fill(0, count($COLS), '');

    // Title + header
    $title    = $blank; $title[0] = 'Nespresso × MJF';
    $out = [
        ['s' => XlsxWriter::S_HEADER, 'cells' => $title],
        ['s' => XlsxWriter::S_HEADER, 'cells' => $COLS],
    ];

    $present = array_values(array_filter($rows, fn($r) => (int)($r['attending'] ?? 1) === 1));
    $absent  = array_values(array_filter($rows, fn($r) => (int)($r['attending'] ?? 1) === 0));

    foreach ($present as $r) {
        $p  = _parseProfile($r['profile'] ?? '');
        $gc = min((int)($r['guest_count'] ?? 0), 2);
        $fn = $r['first_name'] ?: (explode(' ', $r['name'] ?? ' ')[0] ?? '');
        $ln = $r['last_name']  ?: (implode(' ', array_slice(explode(' ', $r['name'] ?? ''), 1)) ?: '');
        $out[] = [
            's' => $sMap[$gc],
            'cells' => [
                substr($r['created_at'] ?? '', 0, 16),
                $fn, $ln,
                $r['email']      ?? '',
                $r['phone']      ?? '',
                $r['event_date'] ?? '',
                'Oui',
                $gc ?: '',
                is_array($p) ? ($p['drink'] ?? '') : '',
                _formatAnswers($r['answers'] ?? ''),
            ],
        ];
    }

    if (!empty($present)) {
        $total   = count($present);
        $persons = (int)array_sum(array_map(fn($r) => (int)($r['guest_count'] ?? 0) + 1, $present));
        $tot     = $blank;
        $tot[0]  = 'TOTAL — ' . $total . ' inscrit' . ($total > 1 ? 's' : '') . ', '
                 . $persons . ' personne' . ($persons > 1 ? 's' : '');
        $out[] = ['s' => XlsxWriter::S_SUBTOTAL, 'cells' => $tot];
    }

    if (!empty($absent)) {
        $out[] = ['s' => XlsxWriter::S_DEFAULT, 'cells' => $blank];
        $ab    = $blank; $ab[0] = 'ABSENTS';
        $out[] = ['s' => XlsxWriter::S_HEADER, 'cells' => $ab];
        foreach ($absent as $r) {
            $p  = _parseProfile($r['profile'] ?? '');
            $fn = $r['first_name'] ?: (explode(' ', $r['name'] ?? ' ')[0] ?? '');
            $ln = $r['last_name']  ?: (implode(' ', array_slice(explode(' ', $r['name'] ?? ''), 1)) ?: '');
            $out[] = [
                's' => XlsxWriter::S_DEFAULT,
                'cells' => [
                    substr($r['created_at'] ?? '', 0, 16),
                    $fn, $ln,
                    $r['email']      ?? '',
                    $r['phone']      ?? '',
                    $r['event_date'] ?? '',
                    'Non', 0,
                    is_array($p) ? ($p['drink'] ?? '') : '',
                    _formatAnswers($r['answers'] ?? ''),
                ],
            ];
        }
        $acnt   = count($absent);
        $ab2    = $blank;
        $ab2[0] = 'Sous-total absents — ' . $acnt . ' inscrit' . ($acnt > 1 ? 's' : '');
        $out[] = ['s' => XlsxWriter::S_SUBTOTAL, 'cells' => $ab2];
    }

    return $out;
}

function _formatAnswers(?string $raw): string
{
    if (!$raw) {
        return '';
    }
    $answers = json_decode($raw, true);
    if (!is_array($answers)) {
        return '';
    }
    $parts = [];
    foreach ($answers as $a) {
        $q   = is_array($a['question'] ?? null) ? ($a['question']['question'] ?? '') : ($a['question'] ?? '');
        $q   = rtrim(strtoupper((string)$q), '?');
        $ans = $a['answer'] ?? '';
        if ($q !== '' && $ans !== '') {
            $parts[] = $q . '? → ' . $ans;
        }
    }
    return implode(' | ', $parts);
}

function _parseProfile(?string $raw): ?array
{
    if (!$raw) {
        return null;
    }
    $p = json_decode($raw, true);
    return is_string($p) ? json_decode($p, true) : $p;
}
