const XLSX = require('xlsx');
const wb = XLSX.readFile('C:\\Users\\MDX\\Desktop\\08-09-26.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true, blankrows: true });
const merges = (ws['!merges'] || []).map((m) => `${m.s.r}:${m.s.c}->${m.e.r}:${m.e.c}`);
console.log('MERGES:');
console.log(merges.join('\n'));
const show = [];
for (let r = 0; r < Math.min(rows.length, 93); r++) {
  const cells = Array.from({ length: 8 }, (_, c) => {
    const v = rows[r] && rows[r][c];
    if (v === '' || v === undefined) return '·';
    if (typeof v === 'number') return v;
    return String(v);
  });
  show.push(`${r + 1}\t${cells.join('\t')}`);
}
console.log('\nROWS 1-93 (formatted):');
console.log(show.join('\n'));
console.log('\nROW COUNTS: total=' + rows.length);
