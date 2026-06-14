const fs = require('fs');

const b64 = (str) => Buffer.from(str, 'base64').toString('utf8');
const euFlag = b64('8J+HqvCfh7o='); // 🇪🇺
const ptFlag = b64('8J+HtfCfh7k='); // 🇵🇹
const brFlag = b64('8J+Hp/Cfh7A='); // 🇧🇷

// Fix games page
let gamesCode = fs.readFileSync('src/app/games/page.tsx', 'utf8');
gamesCode = gamesCode.replace(new RegExp(euFlag + ' ', 'g'), '');
gamesCode = gamesCode.replace(new RegExp(ptFlag + ' ', 'g'), '');
gamesCode = gamesCode.replace(new RegExp(brFlag + ' ', 'g'), '');
fs.writeFileSync('src/app/games/page.tsx', gamesCode, 'utf8');

// Fix login page
let loginCode = fs.readFileSync('src/app/login/page.tsx', 'utf8');
loginCode = loginCode.replace(new RegExp(euFlag + ' ', 'g'), '');
loginCode = loginCode.replace(new RegExp(ptFlag + ' ', 'g'), '');
loginCode = loginCode.replace(new RegExp(brFlag + ' ', 'g'), '');
fs.writeFileSync('src/app/login/page.tsx', loginCode, 'utf8');

console.log('Removed text flags');
