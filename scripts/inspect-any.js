const XLSX = require('xlsx');
const file = process.argv[2];
const wb = XLSX.readFile(file);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true, blankrows: true });
console.log('sheets:', wb.SheetNames.join(', '));
for (let r = 0; r < Math.min(rows.length, 30); r++) {
  const cells = (rows[r] || []).map((v) => {
    if (v === '' || v === undefined) return '\u00b7';
    if (typeof v === 'number') return v;
    return '[' + String(v) + ']';
  });
  console.log((r + 1) + '\t' + cells.join('\t'));
}
console.log('total rows:', rows.length);