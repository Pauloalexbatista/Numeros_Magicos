const fs = require('fs');
const file = 'src/components/dashboard/TopStarSystemsWidget.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace('function RankingRow({ systemName, score, game }: { systemName: string; score: number; game: GameType }) {', 'function RankingRow({ systemName, score, game, index }: { systemName: string; score: number; game: GameType; index: number }) {');
fs.writeFileSync(file, c, 'utf8');
console.log('Fixed ' + file);