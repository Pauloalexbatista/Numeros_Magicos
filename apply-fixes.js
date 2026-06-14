const fs = require('fs');
let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// Fix Euromillions ID
code = code.replace(/id: 'europoker',/g, "id: 'euromillions',");

// Fix initial state
code = code.replace(/useState<string>\('europoker'\);/g, "useState<string>('euromillions');");

// Add flags to titles
const b64 = (str) => Buffer.from(str, 'base64').toString('utf8');
const euFlag = b64('8J+HqvCfh7o='); // 🇪🇺
const ptFlag = b64('8J+HtfCfh7k='); // 🇵🇹
const brFlag = b64('8J+Hp/Cfh7A='); // 🇧🇷

code = code.replace(/title: 'Euromilh\u00f5es',/g, "title: '" + euFlag + " Euromilh\u00f5es',");
code = code.replace(/title: 'Totoloto',/g, "title: '" + ptFlag + " Totoloto',");
code = code.replace(/title: 'EuroDreams',/g, "title: '" + euFlag + " EuroDreams',");
code = code.replace(/title: 'Mega-Sena',/g, "title: '" + brFlag + " Mega-Sena',");

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Fixed correctly');
