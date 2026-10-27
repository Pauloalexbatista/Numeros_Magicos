import fs from 'fs';
import path from 'path';

function inspect(gameSlug: string) {
  const file = path.join(process.cwd(), 'data', 'consolidated', `separacao_aguas_v2_${gameSlug}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  console.log(`\n======================================================`);
  console.log(`Radar Stats: Separação das Águas 2.0 (${gameSlug.toUpperCase()})`);
  console.log(`======================================================`);
  console.log(`Total Sorteios: ${data.length}`);
  
  const last10 = data.slice(-10);
  console.log('Últimos 10 sorteios:');
  last10.forEach((r: any) => {
    console.log(`  Sorteio #${r.drawId} (${r.draw.date.slice(0, 10)}): ${r.num_hits_25}/5 acertos`);
  });

  const lastJackIdx = data.map((r: any, idx: number) => r.num_hits_25 === 5 ? idx : -1).filter((idx: number) => idx !== -1).pop();
  const lastZeroIdx = data.map((r: any, idx: number) => r.num_hits_25 === 0 ? idx : -1).filter((idx: number) => idx !== -1).pop();

  console.log(`Atraso desde o último 5 (Jackpot Direto): ${data.length - 1 - (lastJackIdx ?? 0)} sorteios`);
  console.log(`Atraso desde o último 0 (Anti-Jackpot): ${data.length - 1 - (lastZeroIdx ?? 0)} sorteios`);
}

inspect('euromillions');
inspect('totoloto');
