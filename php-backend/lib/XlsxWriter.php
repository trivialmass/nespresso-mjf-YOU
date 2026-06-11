<?php
// Minimal XLSX writer — inlineStr cells (no sharedStrings.xml), row-level styles.
// Style indices: 0=default 1=header(navy/white/bold) 2=yellow 3=green 4=subtotal(gray/bold)
class XlsxWriter
{
    const S_DEFAULT  = 0;
    const S_HEADER   = 1;
    const S_YELLOW   = 2;
    const S_GREEN    = 3;
    const S_SUBTOTAL = 4;

    private array $sheets = [];

    public function addSheet(string $name, array $rows, array $colWidths = []): void
    {
        $this->sheets[] = [$name, $rows, $colWidths];
    }

    public function download(string $filename): void
    {
        $data = $this->build();
        while (ob_get_level() > 0) ob_end_clean();
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . rawurlencode($filename) . '"');
        header('Content-Length: ' . strlen($data));
        echo $data;
        exit;
    }

    private static function colName(int $n): string
    {
        $s = '';
        do { $s = chr(65 + $n % 26) . $s; $n = intdiv($n, 26) - 1; } while ($n >= 0);
        return $s;
    }

    private static function esc(string $v): string
    {
        return htmlspecialchars(
            preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $v),
            ENT_XML1, 'UTF-8'
        );
    }

    private function sheetXml(array $rows, array $widths): string
    {
        $nrows = count($rows);
        $ncols = 0;
        foreach ($rows as $r) {
            $ncols = max($ncols, count($r['cells'] ?? []));
        }

        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
             . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';

        if ($nrows > 0 && $ncols > 0) {
            $xml .= '<dimension ref="A1:' . self::colName($ncols - 1) . $nrows . '"/>';
        }

        $xml .= '<sheetViews><sheetView workbookViewId="0">'
              . '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
              . '</sheetView></sheetViews>'
              . '<sheetFormatPr defaultRowHeight="15"/>';

        if ($widths) {
            $xml .= '<cols>';
            foreach ($widths as $i => $w) {
                $c = $i + 1;
                $xml .= '<col min="' . $c . '" max="' . $c . '" width="' . $w . '" customWidth="1"/>';
            }
            $xml .= '</cols>';
        }

        $xml .= '<sheetData>';
        foreach ($rows as $ri => $row) {
            $rn = $ri + 1;
            $s  = (int)($row['s'] ?? 0);
            $xml .= '<row r="' . $rn . '">';
            foreach (($row['cells'] ?? []) as $ci => $cell) {
                $ref = self::colName($ci) . $rn;
                if ($cell === null || $cell === '') {
                    $xml .= '<c r="' . $ref . '" s="' . $s . '"/>';
                } elseif (is_int($cell) || is_float($cell)) {
                    $xml .= '<c r="' . $ref . '" s="' . $s . '"><v>' . $cell . '</v></c>';
                } else {
                    $xml .= '<c r="' . $ref . '" t="inlineStr" s="' . $s . '"><is><t>'
                          . self::esc((string)$cell) . '</t></is></c>';
                }
            }
            $xml .= '</row>';
        }
        $xml .= '</sheetData></worksheet>';
        return $xml;
    }

    private function stylesXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
             . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
             . '<fonts count="3">'
             .   '<font><sz val="11"/><name val="Calibri"/></font>'
             .   '<font><b/><sz val="11"/><name val="Calibri"/></font>'
             .   '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
             . '</fonts>'
             . '<fills count="6">'
             .   '<fill><patternFill patternType="none"/></fill>'
             .   '<fill><patternFill patternType="gray125"/></fill>'
             .   '<fill><patternFill patternType="solid"><fgColor rgb="FF1C2869"/><bgColor indexed="64"/></patternFill></fill>'
             .   '<fill><patternFill patternType="solid"><fgColor rgb="FFFFF3CD"/><bgColor indexed="64"/></patternFill></fill>'
             .   '<fill><patternFill patternType="solid"><fgColor rgb="FFC8E6C9"/><bgColor indexed="64"/></patternFill></fill>'
             .   '<fill><patternFill patternType="solid"><fgColor rgb="FFDDDDDD"/><bgColor indexed="64"/></patternFill></fill>'
             . '</fills>'
             . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
             . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
             . '<cellXfs count="5">'
             .   '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
             .   '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'
             .   '<xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/>'
             .   '<xf numFmtId="0" fontId="0" fillId="4" borderId="0" xfId="0" applyFill="1"/>'
             .   '<xf numFmtId="0" fontId="1" fillId="5" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'
             . '</cellXfs>'
             . '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
             . '</styleSheet>';
    }

    private function build(): string
    {
        $n = count($this->sheets);

        $sheetXmls = [];
        foreach ($this->sheets as [$name, $rows, $widths]) {
            $sheetXmls[] = $this->sheetXml($rows, $widths);
        }

        $cts = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
             . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
             . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
             . '<Default Extension="xml" ContentType="application/xml"/>'
             . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
             . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.stylesheet+xml"/>';
        for ($i = 1; $i <= $n; $i++) {
            $cts .= '<Override PartName="/xl/worksheets/sheet' . $i . '.xml"'
                  . ' ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
        }
        $cts .= '</Types>';

        $wbSheets = '';
        $wbRels   = '';
        for ($i = 0; $i < $n; $i++) {
            $rid = 'rId' . ($i + 1);
            $nm  = self::esc($this->sheets[$i][0]);
            $wbSheets .= '<sheet name="' . $nm . '" sheetId="' . ($i + 1) . '" r:id="' . $rid . '"/>';
            $wbRels   .= '<Relationship Id="' . $rid . '"'
                       . ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"'
                       . ' Target="worksheets/sheet' . ($i + 1) . '.xml"/>';
        }
        $wbRels .= '<Relationship Id="rId' . ($n + 1) . '"'
                 . ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"'
                 . ' Target="styles.xml"/>';

        $tmp = tempnam(sys_get_temp_dir(), 'xlsx');
        unlink($tmp);
        $zip = new ZipArchive();
        if ($zip->open($tmp, ZipArchive::CREATE) !== true) {
            throw new RuntimeException('Cannot create XLSX ZIP');
        }

        $zip->addFromString('[Content_Types].xml', $cts);
        $zip->addFromString('_rels/.rels',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1"'
            . ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"'
            . ' Target="xl/workbook.xml"/>'
            . '</Relationships>');
        $zip->addFromString('xl/workbook.xml',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
            . ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets>' . $wbSheets . '</sheets>'
            . '</workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . $wbRels
            . '</Relationships>');
        $zip->addFromString('xl/styles.xml', $this->stylesXml());
        foreach ($sheetXmls as $i => $shXml) {
            $zip->addFromString('xl/worksheets/sheet' . ($i + 1) . '.xml', $shXml);
        }
        $zip->close();

        $data = file_get_contents($tmp);
        unlink($tmp);
        return $data;
    }
}
