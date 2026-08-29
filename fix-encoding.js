const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('Usage: node fix-encoding.js <fichier>'); process.exit(1); }
console.log('Lecture de', file, '...');
let content = fs.readFileSync(file, 'utf8');
console.log('Lu -', content.length, 'caracteres');

const map = {
  // minuscules
  'Ã©':'é','Ã¨':'è','Ãª':'ê','Ã«':'ë','Ã¢':'â',
  'Ã®':'î','Ã¯':'ï','Ã´':'ô','Ã¶':'ö','Ã¹':'ù','Ã»':'û','Ã¼':'ü','Ã§':'ç',
  // majuscules
  'Ã€':'À','Ã‚':'Â','Ã‰':'É','Ãˆ':'È','ÃŠ':'Ê','Ã‹':'Ë',
  'ÃŽ':'Î','Ã':'Ï','Ã”':'Ô','Ã™':'Ù','Ã›':'Û','Ã‡':'Ç',
  // ponctuation
  'â€™':'\u2019','â€œ':'«','â€':'»','â€“':'–','â€”':'—',
  // "à" minuscule mal decode avec espace insecable
  'Ã\u00A0':'à',
  // espace insecable isole mal decode
  'Â ':' '
};

let before = content;
for (const k in map) { content = content.split(k).join(map[k]); }
console.log(content !== before ? 'Remplacements effectues.' : 'Aucun motif trouve.');

fs.writeFileSync(file, content, { encoding: 'utf8' });
console.log('Ecrit avec succes.');

const check = fs.readFileSync(file, 'utf8');
console.log(/Ã.|â€.?/.test(check) ? 'ATTENTION: reste corrompu' : 'Verification OK: propre.');
