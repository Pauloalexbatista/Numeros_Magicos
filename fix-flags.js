const fs = require('fs');

const b64 = (str) => Buffer.from(str, 'base64').toString('utf8');

const euFlag = b64('8J+HqvCfh7o='); // 🇪🇺
const ptFlag = b64('8J+HtfCfh7k='); // 🇵🇹
const brFlag = b64('8J+Hp/Cfh7A='); // 🇧🇷

let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

code = code.replace(/title: '\?\?\?\? Euromilh\ufffdes',/g, "title: '" + euFlag + " Euromilh\u00f5es',");
code = code.replace(/title: '\?\?\?\? Totoloto',/g, "title: '" + ptFlag + " Totoloto',");
code = code.replace(/title: '\?\?\?\? EuroDreams',/g, "title: '" + euFlag + " EuroDreams',");
code = code.replace(/title: '\?\?\?\? Mega-Sena',/g, "title: '" + brFlag + " Mega-Sena',");

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Fixed flags');
