const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');
const regex = /.{0,15}(Ã.|â€.?).{0,15}/g;
const found = new Set();
let m;
while ((m = regex.exec(content)) !== null) {
  found.add(m[0].replace(/\n/g, '\\n'));
}
console.log('Motifs corrompus restants (' + found.size + ' occurrences uniques) :');
[...found].forEach(s => console.log('  ->', s));
