import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'data', 'consolidated', 'harmonia_antigravity_totoloto.json');
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
console.log('Total records:', data.length);
let jackpots = 0;
let traves = 0;
data.forEach((r: any) => {
  if (r.num_hits_25 === 5) jackpots++;
  if (r.num_hits_25 === 4) traves++;
});
console.log('Totoloto Harmonia Antigravity - Jackpots:', jackpots, 'Traves:', traves);
const lastJackpotIndex = data.map((r: any, idx: number) => r.num_hits_25 === 5 ? idx : -1).filter((idx: number) => idx !== -1).pop();
const currentDelay = data.length - 1 - (lastJackpotIndex ?? 0);
console.log('Current Delay since last Jackpot:', currentDelay);

// Check last 10 draws
console.log('\nÚltimos 10 sorteios do Totoloto (Harmonia Antigravity):');
data.slice(-10).forEach((r: any) => {
  console.log(`Draw #${r.drawId} (${r.draw.date.slice(0, 10)}): ${r.num_hits_25}/5 acertos`);
});
