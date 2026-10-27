import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fileSep = path.join(process.cwd(), 'data', 'consolidated', 'separacao_aguas_euromillions.json');
  const dataSep = JSON.parse(fs.readFileSync(fileSep, 'utf-8'));

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

  let j5 = 0;
  let j0 = 0;
  let t4 = 0;
  let t1 = 0;
  let totalCompared = 0;

  dataSep.forEach((r: any) => {
    const winning = drawMap.get(r.drawId);
    if (!winning) return;

    let pred = r.prediction;
    if (typeof pred === 'string') {
      try { pred = JSON.parse(pred); } catch { return; }
    }
    if (!Array.isArray(pred)) return;

    const top25 = new Set(pred.slice(0, 25));
    const hits = winning.filter(n => top25.has(n)).length;

    if (hits === 5) j5++;
    if (hits === 0) j0++;
    if (hits === 4) t4++;
    if (hits === 1) t1++;
    totalCompared++;
  });

  console.log(`\n======================================================`);
  console.log(`SEPARAÇÃO DAS ÁGUAS (EUROMILHÕES - ${totalCompared} sorteios)`);
  console.log(`======================================================`);
  console.log(`🎯 5 Acertos (Direto): ${j5}`);
  console.log(`⚖️ 0 Acertos (Espelho): ${j0}`);
  console.log(`🏆 TOTAL JACKPOTS PONTAS (5s + 0s): ${j5 + j0}`);
  console.log(`🥈 4 Acertos (Trave Direta): ${t4}`);
  console.log(`🥈 1 Acerto (Trave Espelho): ${t1}`);
  console.log(`🥈 TOTAL TRAVES PONTAS (4s + 1s): ${t4 + t1}`);
  const sepPct = ((j5 + j0 + t4 + t1) / totalCompared) * 100;
  console.log(`📊 Separação Extremos: ${sepPct.toFixed(2)}%`);

  // Meta-Sistema #1 e #2 do Lab
  const labFile = path.join(process.cwd(), 'src', 'data', 'lab_meta_systems.json');
  if (fs.existsSync(labFile)) {
    const labData = JSON.parse(labFile ? fs.readFileSync(labFile, 'utf-8') : '{}');
    const top1 = labData.games?.euromillions?.[0];
    const top2 = labData.games?.euromillions?.[1];

    console.log(`\n======================================================`);
    console.log(`META-SISTEMA #1 DO LABORATÓRIO`);
    console.log(`======================================================`);
    console.log(`🎯 5 Acertos: ${top1.stats.jackpotsDirect}`);
    console.log(`⚖️ 0 Acertos: ${top1.stats.jackpotsMirror}`);
    console.log(`🏆 TOTAL JACKPOTS PONTAS: ${top1.stats.totalJackpots}`);
    console.log(`🥈 4 Acertos: ${top1.stats.nearDirect}`);
    console.log(`🥈 1 Acerto: ${top1.stats.nearMirror}`);
    console.log(`🥈 TOTAL TRAVES PONTAS: ${top1.stats.totalNear}`);
    console.log(`📊 Separação Extremos: ${(top1.stats.separationRatio * 100).toFixed(2)}%`);
    console.log(`Ruído Centro: ${top1.stats.noise}`);

    console.log(`\n======================================================`);
    console.log(`META-SISTEMA #2 DO LABORATÓRIO`);
    console.log(`======================================================`);
    console.log(`🎯 5 Acertos: ${top2.stats.jackpotsDirect}`);
    console.log(`⚖️ 0 Acertos: ${top2.stats.jackpotsMirror}`);
    console.log(`🏆 TOTAL JACKPOTS PONTAS: ${top2.stats.totalJackpots}`);
    console.log(`🥈 4 Acertos: ${top2.stats.nearDirect}`);
    console.log(`🥈 1 Acerto: ${top2.stats.nearMirror}`);
    console.log(`🥈 TOTAL TRAVES PONTAS: ${top2.stats.totalNear}`);
    console.log(`📊 Separação Extremos: ${(top2.stats.separationRatio * 100).toFixed(2)}%`);
    console.log(`Ruído Centro: ${top2.stats.noise}`);
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
});
