import fs from 'fs';
import path from 'path';

const labFile = path.join(process.cwd(), 'src', 'data', 'lab_meta_systems.json');
if (fs.existsSync(labFile)) {
  const labData = JSON.parse(fs.readFileSync(labFile, 'utf-8'));
  const totolotoMeta = labData.games?.totoloto || [];
  console.log(`=== META-SISTEMAS DO TOTOLOTO (${totolotoMeta.length} encontrados) ===`);
  totolotoMeta.slice(0, 5).forEach((m: any, idx: number) => {
    console.log(`\n#${idx + 1} - Fitness: ${m.stats.fitness} | Separação: ${(m.stats.separationRatio * 100).toFixed(2)}%`);
    console.log(`  Jackpots Totais (Pontas): ${m.stats.totalJackpots} (Diretos: ${m.stats.jackpotsDirect} / Espelho: ${m.stats.jackpotsMirror})`);
    console.log(`  Traves Totais (Pontas): ${m.stats.totalNear} (Diretas: ${m.stats.nearDirect} / Espelho: ${m.stats.nearMirror})`);
    console.log(`  Sistemas envolvidos:`, m.systemIds.join(', '));
    console.log(`  Polaridades:`, m.polarities.map((p: number) => p === 1 ? '+1 Dir' : '-1 Esp').join(', '));
  });
}
