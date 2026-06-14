const fs = require('fs');
const rankFile = 'src/app/ranking/[game]/page.tsx';
let rankContent = fs.readFileSync(rankFile, 'utf8');

rankContent = rankContent.replace('"--glow": gameConfig?.ui.glow,', '"--glow": "color-mix(in srgb, " + gameConfig?.ui.accent + " 20%, transparent)",');

fs.writeFileSync(rankFile, rankContent, 'utf8');
console.log('Fixed Ranking glow syntax');
