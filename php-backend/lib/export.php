<?php
require_once __DIR__ . '/XlsxWriter.php';

function exportXlsx(PDO $pdo): void
{
    $allRows = $pdo->query("SELECT * FROM results ORDER BY guest_count ASC, created_at ASC")->fetchAll();

    $july8   = array_values(array_filter($allRows, fn($r) => ($r['event_date'] ?? '') === 'July 8'));
    $july9   = array_values(array_filter($allRows, fn($r) => ($r['event_date'] ?? '') === 'July 9'));
    $walkins = array_values(array_filter($allRows, fn($r) => !in_array($r['event_date'] ?? '', ['July 8', 'July 9'], true)));

    $widths = [15, 15, 20, 30, 14, 10, 10, 20, 12];
    $xlsx = new XlsxWriter();
    $xlsx->addSheet('8 juillet', _sheetRows($july8),   $widths);
    $xlsx->addSheet('9 juillet', _sheetRows($july9),   $widths);
    $xlsx->addSheet('Walk-ins',  _sheetRows($walkins), $widths);
    $xlsx->download('inscriptions-trivial-you.xlsx');
}

function _sheetRows(array $rows): array
{
    $COLS  = ['Prénom', 'Nom', 'Société', 'Email', 'Tél.', 'Présence', '+Invités', 'Profil', 'Date'];
    $sMap  = [0 => XlsxWriter::S_DEFAULT, 1 => XlsxWriter::S_YELLOW, 2 => XlsxWriter::S_GREEN];
    $lMap  = [0 => 'Solo (0 invité)', 1 => '+1 invité', 2 => '+2 invités'];
    $blank = array_fill(0, count($COLS), '');

    $out = [['s' => XlsxWriter::S_HEADER, 'cells' => $COLS]];

    $present = array_values(array_filter($rows, fn($r) => (int)($r['attending'] ?? 1) === 1));
    $absent  = array_values(array_filter($rows, fn($r) => (int)($r['attending'] ?? 1) === 0));

    $groups = [0 => [], 1 => [], 2 => []];
    foreach ($present as $r) {
        $groups[min((int)($r['guest_count'] ?? 0), 2)][] = $r;
    }

    foreach ([0, 1, 2] as $gc) {
        if (empty($groups[$gc])) {
            continue;
        }
        foreach ($groups[$gc] as $r) {
            $p  = _parseProfile($r['profile'] ?? '');
            $fn = $r['first_name'] ?: (explode(' ', $r['name'] ?? ' ')[0] ?? '');
            $ln = $r['last_name']  ?: (implode(' ', array_slice(explode(' ', $r['name'] ?? ''), 1)) ?: '');
            $out[] = [
                's' => $sMap[$gc],
                'cells' => [$fn, $ln, $r['company'] ?? '', $r['email'] ?? '', $r['phone'] ?? '',
                            'Oui', $gc, is_array($p) ? ($p['drink'] ?? '') : '',
                            substr($r['created_at'] ?? '', 0, 10)],
            ];
        }
        $cnt     = count($groups[$gc]);
        $persons = (int)array_sum(array_map(fn($r) => (int)($r['guest_count'] ?? 0) + 1, $groups[$gc]));
        $sub     = $blank;
        $sub[0]  = 'Sous-total ' . $lMap[$gc] . ' — '
                 . $cnt . ' inscrit' . ($cnt > 1 ? 's' : '') . ', '
                 . $persons . ' personne' . ($persons > 1 ? 's' : '');
        $out[] = ['s' => XlsxWriter::S_SUBTOTAL, 'cells' => $sub];
        $out[] = ['s' => XlsxWriter::S_DEFAULT,  'cells' => $blank];
    }

    if (!empty($present)) {
        $total   = count($present);
        $persons = (int)array_sum(array_map(fn($r) => (int)($r['guest_count'] ?? 0) + 1, $present));
        $tot     = $blank;
        $tot[0]  = 'TOTAL PRÉSENTS — '
                 . $total . ' inscrit' . ($total > 1 ? 's' : '') . ', '
                 . $persons . ' personne' . ($persons > 1 ? 's' : '');
        $out[] = ['s' => XlsxWriter::S_SUBTOTAL, 'cells' => $tot];
    }

    if (!empty($absent)) {
        $out[] = ['s' => XlsxWriter::S_DEFAULT, 'cells' => $blank];
        $ab    = $blank;
        $ab[0] = 'ABSENTS';
        $out[] = ['s' => XlsxWriter::S_HEADER, 'cells' => $ab];
        foreach ($absent as $r) {
            $p  = _parseProfile($r['profile'] ?? '');
            $fn = $r['first_name'] ?: (explode(' ', $r['name'] ?? ' ')[0] ?? '');
            $ln = $r['last_name']  ?: (implode(' ', array_slice(explode(' ', $r['name'] ?? ''), 1)) ?: '');
            $out[] = [
                's' => XlsxWriter::S_DEFAULT,
                'cells' => [$fn, $ln, $r['company'] ?? '', $r['email'] ?? '', $r['phone'] ?? '',
                            'Non', 0, is_array($p) ? ($p['drink'] ?? '') : '',
                            substr($r['created_at'] ?? '', 0, 10)],
            ];
        }
        $acnt   = count($absent);
        $ab2    = $blank;
        $ab2[0] = 'Sous-total absents — ' . $acnt . ' inscrit' . ($acnt > 1 ? 's' : '');
        $out[] = ['s' => XlsxWriter::S_SUBTOTAL, 'cells' => $ab2];
    }

    return $out;
}

function _parseProfile(?string $raw): ?array
{
    if (!$raw) {
        return null;
    }
    $p = json_decode($raw, true);
    return is_string($p) ? json_decode($p, true) : $p;
}
