import fs from 'fs';
import path from 'path';

['totoloto', 'euromillions'].forEach(game => {
  const file = path.join(process.cwd(), 'data', 'consolidated', `separacao_aguas_v2_${game}.json`);
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  console.log(`=== ${game.toUpperCase()} (Total: ${data.length}) ===`);
  const tail = data.slice(-25);
  tail.forEach((r: any) => {
    console.log(`Draw #${r.drawId} (${r.draw.date.slice(0, 10)}): num_hits_25 = ${r.num_hits_25}, numbers = ${r.draw.numbers}`);
  });
});
