import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fileTiro = path.join(process.cwd(), 'data', 'consolidated', 'tiro_certeiro_euromillions.json');
  const dataTiro = JSON.parse(fs.readFileSync(fileTiro, 'utf-8'));

  const draws = await prisma.draw.findMany({
    where: { game: 'EUROMILLIONS' },
    select: { id: true, numbers: true }
  });

  const drawMap = new Map<number, number[]>();
  draws.forEach(d => {
    let nums: number[] = [];
    if (typeof d.numbers === 'string') {
      try { nums = JSON.parse(d.numbers); } catch {}
    } else if (Array.isArray(d.numbers)) {
      nums = d.numbers as unknown as number[];
    }
    if (nums.length === 5) drawMap.set(d.id, nums);
  });

  let jDirect = 0;
  let jMirror = 0;
  let tDirect = 0;
  let tMirror = 0;
  let totalCompared = 0;

  dataTiro.forEach((r: any) => {
    const winning = drawMap.get(r.drawId);
    if (!winning) return;

    let pred = r.prediction;
    if (typeof pred === 'string') {
      try { pred = JSON.parse(pred); } catch { return; }
    }
    if (!Array.isArray(pred)) return;

    const top25 = new Set(pred.slice(0, 25));
    const hits = winning.filter(n => top25.has(n)).length;

    if (hits === 5) jDirect++;
    if (hits === 0) jMirror++;
    if (hits === 4) tDirect++;
    if (hits === 1) tMirror++;
    totalCompared++;
  });

  console.log(`\n======================================================`);
  console.log(`TIRO CERTEIRO SOZINHO (EUROMILHÕES - ${totalCompared} sorteios alinhados)`);
  console.log(`======================================================`);
  console.log(`🎯 Jackpots Diretos (5 acertos): ${jDirect}`);
  console.log(`⚖️ Jackpots Espelho (0 acertos): ${jMirror}`);
  console.log(`🏆 TOTAL JACKPOTS DE PONTA (5s + 0s): ${jDirect + jMirror}`);
  console.log(`🥈 Traves Diretas (4 acertos): ${tDirect}`);
  console.log(`🥈 Traves Espelho (1 acerto): ${tMirror}`);
  console.log(`🥈 TOTAL TRAVES DE PONTA (4s + 1s): ${tDirect + tMirror}`);
  const extremeSeparation = ((jDirect + jMirror + tDirect + tMirror) / totalCompared) * 100;
  console.log(`📊 Separação Extremos (Pontas): ${extremeSeparation.toFixed(2)}%`);

  // Ler o Meta-Sistema #1 do Lab
  const labFile = path.join(process.cwd(), 'src', 'data', 'lab_meta_systems.json');
  if (fs.existsSync(labFile)) {
    const labData = JSON.parse(fs.readFileSync(labFile, 'utf-8'));
    const top1 = labData.games?.euromillions?.[0];
    if (top1) {
      console.log(`\n======================================================`);
      console.log(`META-SISTEMA #1 DO LABORATÓRIO (Ensemble 5 Especialistas com Inversão)`);
      console.log(`Sistemas: ${top1.systemIds.join(' + ')}`);
      console.log(`Polaridades: ${top1.polarities.map((p: number) => p === 1 ? '+1 Dir' : '-1 Esp').join(', ')}`);
      console.log(`======================================================`);
      console.log(`🎯 Jackpots Diretos (5 acertos): ${top1.stats.jackpotsDirect}`);
      console.log(`⚖️ Jackpots Espelho (0 acertos): ${top1.stats.jackpotsMirror}`);
      console.log(`🏆 TOTAL JACKPOTS DE PONTA (5s + 0s): ${top1.stats.totalJackpots}`);
      console.log(`🥈 Traves Diretas (4 acertos): ${top1.stats.nearDirect}`);
      console.log(`🥈 Traves Espelho (1 acerto): ${top1.stats.nearMirror}`);
      console.log(`🥈 TOTAL TRAVES DE PONTA (4s + 1s): ${top1.stats.totalNear}`);
      console.log(`📊 Separação Extremos (Pontas): ${(top1.stats.separationRatio * 100).toFixed(2)}%`);
      console.log(`⚡ Fitness Score: ${top1.stats.fitness}`);
    }
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
});
