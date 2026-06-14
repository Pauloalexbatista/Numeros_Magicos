const fs = require('fs');
const rankFile = 'src/app/ranking/[game]/page.tsx';
let rankContent = fs.readFileSync(rankFile, 'utf8');

rankContent = rankContent.replace(/,\s*,\s*"--glow"/g, ',\n"--glow"');

fs.writeFileSync(rankFile, rankContent, 'utf8');
console.log('Fixed Ranking syntax error');
