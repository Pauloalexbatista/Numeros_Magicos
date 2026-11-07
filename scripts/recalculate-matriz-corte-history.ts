import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { calculateMatrizCorte } from '../src/services/matriz-corte-engine';

const CONSOLIDATED_DIR = path.join(process.cwd(), 'data', 'consolidated');

const GAMES = [
  { key: 'EURODREAMS', slug: 'eurodreams', name: 'EuroDreams', maxNum: 40, pickSize: 6 },
  { key: 'EUROMILLIONS', slug: 'euromillions', name: 'Euromilhões', maxNum: 50, pickSize: 5 },
  { key: 'TOTOLOTO', slug: 'totoloto', name: 'Totoloto', maxNum: 49, pickSize: 5 },
  { key: 'MEGASENA', slug: 'megasena', name: 'Mega-Sena', maxNum: 60, pickSize: 6 },
  { key: 'LOTOFACIL', slug: 'lotofacil', name: 'Lotofácil', maxNum: 25, pickSize: 15 }
];

function calculateHits(prediction: number[], actual: number[]) {
  const hits: Record<string, number> = {};
  for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
    const top = prediction.slice(0, cut);
    hits[`num_hits_${cut}`] = top.filter(n => actual.includes(n)).length;
  }
  return hits;
}

function parseNums(raw: any): number[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

async function recalculateGame(g: typeof GAMES[0]) {
  console.log(`\n======================================================`);
  console.log(`>> A RECALCULAR MATRIZ DE CORTE DESDE O SORTEIO 0: ${g.name} (${g.key})`);
  console.log(`======================================================`);

  // Carregar todos os sorteios ordenados cronologicamente do sorteio 1 ao último
  const draws = await prisma.draw.findMany({
    where: { game: g.key },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, numbers: true }
  });

  console.log(`Total de sorteios em histórico: ${draws.length}`);
  if (draws.length < 15) {
    console.log(`Poucos sorteios para cálculo.`);
    return;
  }

  // Preparar os draws no formato leve em memória
  const parsedDraws = draws.map(d => ({
    id: d.id,
    date: d.date,
    numbers: parseNums(d.numbers).sort((a, b) => a - b)
  })).filter(d => d.numbers.length >= g.pickSize);

  const totalN = parsedDraws.length;
  const START_INDEX = 15; // Mínimo de histórico para calibração estatística
  const records: { drawId: number; prediction: number[]; hits: Record<string, number>; drawDate: Date }[] = [];

  const startTime = Date.now();
  let jackpotIntactCount = 0;
  let totalEvaluated = 0;

  for (let i = START_INDEX; i < totalN; i++) {
    const historyBeforeTarget = parsedDraws.slice(0, i);
    const targetDraw = parsedDraws[i];

    // Executa a Matriz de Corte estritamente sobre os sorteios passados (sem olhar para o sorteio i)
    const result = await calculateMatrizCorte(g.key, undefined, historyBeforeTarget);

    // Ordenar do Mais Limpo/Sobrevivente (menor compositeScore) para o Mais Condenado (maior compositeScore)
    const sorted = [...result.balls].sort((a, b) => {
      if (a.compositeScore !== b.compositeScore) return a.compositeScore - b.compositeScore;
      if (a.maxProximityPct !== b.maxProximityPct) return a.maxProximityPct - b.maxProximityPct;
      return a.ball - b.ball;
    });

    const prediction = sorted.map(b => b.ball);
    const actual = targetDraw.numbers;
    const hits = calculateHits(prediction, actual);

    // Avaliar corte cirúrgico leve (corta as 4 piores no EuroDreams/Euromilhões)
    const worst4 = new Set(sorted.slice(-4).map(b => b.ball));
    const winCut4 = actual.filter(n => worst4.has(n));
    if (winCut4.length === 0) {
      jackpotIntactCount++;
    }
    totalEvaluated++;

    records.push({
      drawId: targetDraw.id,
      prediction,
      hits,
      drawDate: targetDraw.date
    });

    if (totalEvaluated % 200 === 0 || i === totalN - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  Progresso: ${totalEvaluated}/${totalN - START_INDEX} sorteios calculados (${elapsed}s)...`);
    }
  }

  console.log(`  Gravação na BD (SystemPrediction) para ${records.length} sorteios...`);

  // Assegurar registo em RankedSystem
  await prisma.rankedSystem.upsert({
    where: { name_game: { name: 'Matriz de Corte', game: g.key } },
    update: { isActive: true },
    create: {
      name: 'Matriz de Corte',
      game: g.key,
      domain: 'NUMBERS',
      systemType: 'BASE',
      isActive: true,
      description: 'Sistema de corte e podagem com matrizes de invariantes e limites históricos.'
    }
  });

  // Limpar previsões antigas deste sistema e inserir o histórico novo completo
  await prisma.systemPrediction.deleteMany({
    where: { game: g.key, systemName: 'Matriz de Corte', domain: 'NUMBERS' }
  });

  const CHUNK = 500;
  for (let i = 0; i < records.length; i += CHUNK) {
    const slice = records.slice(i, i + CHUNK);
    await prisma.systemPrediction.createMany({
      data: slice.map(r => ({
        drawId: r.drawId,
        game: g.key,
        domain: 'NUMBERS',
        systemName: 'Matriz de Corte',
        prediction: JSON.stringify(r.prediction),
        cutoff: r.prediction.length,
        ...r.hits
      }))
    });
  }

  // Exportar para data/consolidated/matriz_corte_{slug}.json
  if (!fs.existsSync(CONSOLIDATED_DIR)) {
    fs.mkdirSync(CONSOLIDATED_DIR, { recursive: true });
  }

  const exportData = records.map(r => ({
    drawId: r.drawId,
    prediction: r.prediction,
    cutoff: r.prediction.length,
    ...r.hits,
    draw: {
      id: r.drawId,
      date: r.drawDate.toISOString()
    }
  }));

  const outPath = path.join(CONSOLIDATED_DIR, `matriz_corte_${g.slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2), 'utf-8');
  console.log(`  ✅ Ficheiro consolidado gravado: ${outPath}`);

  // Atualizar ranking de precisão (Top 10)
  const avgHitsTop10 = records.reduce((acc, r) => acc + (r.hits.num_hits_10 || 0), 0) / records.length;
  const avgAccuracy = (avgHitsTop10 / g.pickSize) * 100;

  await prisma.systemRanking.upsert({
    where: { systemName_game: { systemName: 'Matriz de Corte', game: g.key } },
    update: {
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      totalPredictions: records.length,
      lastUpdated: new Date()
    },
    create: {
      game: g.key,
      systemName: 'Matriz de Corte',
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      totalPredictions: records.length,
      lastUpdated: new Date()
    }
  });

  const jackpotPct = totalEvaluated > 0 ? (jackpotIntactCount / totalEvaluated) * 100 : 0;
  console.log(`  🏆 Auditoria Concluída: ${records.length} previsões recalculadas desde o sorteio 15.`);
  console.log(`  🎯 Preservação de Jackpot no Corte 4: ${jackpotIntactCount}/${totalEvaluated} (${jackpotPct.toFixed(1)}%).`);
  console.log(`  📊 Precisão Média Top-10: ${avgAccuracy.toFixed(1)}%`);
}

async function main() {
  console.log('=== INÍCIO DO RECÁLCULO GLOBAL HISTÓRICO DA MATRIZ DE CORTE ===');
  for (const g of GAMES) {
    await recalculateGame(g);
  }
  console.log('\n🎉 TODOS OS JOGOS FORAM RECALCULADOS DESDE O INÍCIO DO HISTÓRICO COM SUCESSO!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Erro no recálculo global:', err);
  process.exit(1);
});
