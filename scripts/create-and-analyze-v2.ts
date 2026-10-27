import fs from 'fs';
import path from 'path';

const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');

interface GameSpec {
  game: string;
  slug: string;
  totalBalls: number;
  pickCount: number;
  winningBalls: number;
}

const GAMES: GameSpec[] = [
  { game: 'EUROMILLIONS', slug: 'euromillions', totalBalls: 50, pickCount: 25, winningBalls: 5 },
  { game: 'TOTOLOTO', slug: 'totoloto', totalBalls: 49, pickCount: 25, winningBalls: 5 },
  { game: 'EURODREAMS', slug: 'eurodreams', totalBalls: 40, pickCount: 20, winningBalls: 6 },
  { game: 'MEGASENA', slug: 'megasena', totalBalls: 60, pickCount: 30, winningBalls: 6 }
];

const ENSEMBLE_CONFIG = [
  { systemId: 'clustering', polarity: 'ESPELHO' },
  { systemId: 'ultimos_a_sair', polarity: 'DIRETO' },
  { systemId: 'mais_quentes', polarity: 'DIRETO' },
  { systemId: 'piramide_pascal', polarity: 'ESPELHO' },
  { systemId: 'tiro_certeiro', polarity: 'DIRETO' }
];

function buildSeparacaoAguasV2(g: GameSpec) {
  console.log(`\n================================================================`);
  console.log(`A construir Separação das Águas 2.0 para ${g.game}...`);
  console.log(`================================================================`);

  const systemsData: Record<string, any[]> = {};
  for (const c of ENSEMBLE_CONFIG) {
    const fileName = `${c.systemId}_${g.slug}.json`;
    const filePath = path.join(consolidatedDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`Arquivo ${fileName} não encontrado!`);
      return null;
    }
    systemsData[c.systemId] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Alinhamento de sorteios
  const drawMap = new Map<number, {
    drawId: number;
    date: string;
    winningNumbers: number[];
    predictions: Record<string, number[]>;
  }>();

  for (const c of ENSEMBLE_CONFIG) {
    for (const d of systemsData[c.systemId]) {
      if (!drawMap.has(d.drawId)) {
        let winning: number[] = [];
        if (d.draw?.numbers) {
          winning = typeof d.draw.numbers === 'string' ? JSON.parse(d.draw.numbers) : d.draw.numbers;
        }
        drawMap.set(d.drawId, {
          drawId: d.drawId,
          date: d.draw?.date || '',
          winningNumbers: winning,
          predictions: {}
        });
      }
      const entry = drawMap.get(d.drawId)!;
      let pred = d.prediction;
      if (typeof pred === 'string') {
        try { pred = JSON.parse(pred); } catch { pred = []; }
      }
      entry.predictions[c.systemId] = pred;
    }
  }

  const alignedDraws: any[] = [];
  for (const entry of drawMap.values()) {
    let valid = true;
    for (const c of ENSEMBLE_CONFIG) {
      if (!entry.predictions[c.systemId] || entry.predictions[c.systemId].length < g.totalBalls) {
        valid = false;
        break;
      }
    }
    if (valid && entry.winningNumbers && entry.winningNumbers.length === g.winningBalls) {
      alignedDraws.push(entry);
    }
  }

  alignedDraws.sort((a, b) => a.drawId - b.drawId);
  console.log(`Sorteios alinhados válidos: ${alignedDraws.length}`);

  const consolidatedRecords: any[] = [];
  const scores = new Float32Array(g.totalBalls + 1);

  const hitsSequence: number[] = [];

  for (let i = 0; i < alignedDraws.length; i++) {
    const d = alignedDraws[i];
    scores.fill(0);

    for (const c of ENSEMBLE_CONFIG) {
      const pred = d.predictions[c.systemId];
      const isDirect = c.polarity === 'DIRETO';
      if (isDirect) {
        for (let rank = 0; rank < g.totalBalls; rank++) {
          scores[pred[rank]] += (g.totalBalls - rank);
        }
      } else {
        for (let rank = 0; rank < g.totalBalls; rank++) {
          scores[pred[rank]] += (rank + 1);
        }
      }
    }

    const rankedBalls: number[] = [];
    for (let b = 1; b <= g.totalBalls; b++) rankedBalls.push(b);
    rankedBalls.sort((a, b) => scores[b] - scores[a]);

    const hitsAt = (cutoff: number) => {
      const topSlice = new Set(rankedBalls.slice(0, cutoff));
      return d.winningNumbers.filter((n: number) => topSlice.has(n)).length;
    };

    const mainHits = hitsAt(g.pickCount);
    hitsSequence.push(mainHits);

    consolidatedRecords.push({
      drawId: d.drawId,
      prediction: JSON.stringify(rankedBalls),
      cutoff: g.totalBalls,
      num_hits_5: hitsAt(5),
      num_hits_10: hitsAt(10),
      num_hits_15: hitsAt(15),
      num_hits_20: hitsAt(20),
      num_hits_25: hitsAt(25),
      num_hits_30: hitsAt(30),
      num_hits_35: hitsAt(35),
      num_hits_40: hitsAt(40),
      num_hits_45: hitsAt(45),
      num_hits_50: hitsAt(50),
      num_hits_55: hitsAt(55),
      num_hits_60: hitsAt(60),
      draw: {
        date: d.date,
        numbers: JSON.stringify(d.winningNumbers)
      }
    });
  }

  // Guardar no consolidated
  const outFile = path.join(consolidatedDir, `separacao_aguas_v2_${g.slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(consolidatedRecords, null, 2), 'utf-8');
  console.log(`✅ Ficheiro gravado: ${outFile} (${consolidatedRecords.length} registos)`);

  // Análise Estatística do Efeito Pêndulo
  analyzePendulum(g.game, hitsSequence, g.winningBalls);
}

function analyzePendulum(gameName: string, seq: number[], maxHits: number) {
  console.log(`\n🔍 ANÁLISE FORENSE DO EFEITO PÊNDULO: ${gameName}`);
  console.log(`Total de Concursos: ${seq.length}`);

  const counts: Record<number, number> = {};
  for (let h = 0; h <= maxHits; h++) counts[h] = 0;
  seq.forEach(h => counts[h]++);

  console.log('Distribuição Geral:');
  for (let h = maxHits; h >= 0; h--) {
    console.log(`  ${h} acertos: ${counts[h]} vezes (${((counts[h] / seq.length) * 100).toFixed(2)}%)`);
  }

  // 1. O que acontece nos 3 seguintes a um JACKPOT DIRETO (maxHits)?
  const afterJackpot: Record<number, number> = {};
  for (let h = 0; h <= maxHits; h++) afterJackpot[h] = 0;

  let totalAfterJackpot = 0;
  let jackToZeroIn3 = 0;
  let jackToZeroOrOneIn3 = 0;
  let jackToAnotherJackIn3 = 0;

  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i] === maxHits) {
      // Sorteio imediatamente seguinte (T+1)
      const next1 = seq[i + 1];
      afterJackpot[next1]++;
      totalAfterJackpot++;

      // Nos próximos 3 sorteios (T+1, T+2, T+3)
      const next3 = seq.slice(i + 1, Math.min(seq.length, i + 4));
      if (next3.includes(0)) jackToZeroIn3++;
      if (next3.some(h => h <= 1)) jackToZeroOrOneIn3++;
      if (next3.includes(maxHits)) jackToAnotherJackIn3++;
    }
  }

  console.log(`\n--- DINÂMICA PÓS-JACKPOT DIRETO (${maxHits} acertos - ${totalAfterJackpot} ocorrências) ---`);
  console.log(`1. Sorteio Imediatamente Seguinte (T+1):`);
  for (let h = maxHits; h >= 0; h--) {
    const c = afterJackpot[h] || 0;
    const pct = totalAfterJackpot > 0 ? ((c / totalAfterJackpot) * 100).toFixed(2) : '0';
    console.log(`   ${h} acertos: ${c}x (${pct}%)`);
  }

  console.log(`2. Janela dos 3 Concursos Seguintes (T+1 a T+3):`);
  console.log(`   Sai um 0 (Anti-Jackpot puro): ${jackToZeroIn3}x (${((jackToZeroIn3 / totalAfterJackpot) * 100).toFixed(2)}%)`);
  console.log(`   Sai 0 ou 1 (Anti-Sistema potente): ${jackToZeroOrOneIn3}x (${((jackToZeroOrOneIn3 / totalAfterJackpot) * 100).toFixed(2)}%)`);
  console.log(`   Repete outro Jackpot (${maxHits}): ${jackToAnotherJackIn3}x (${((jackToAnotherJackIn3 / totalAfterJackpot) * 100).toFixed(2)}%)`);

  // 2. O que acontece nos 3 seguintes a um ZERO (Anti-Jackpot)?
  let totalAfterZero = 0;
  let zeroToJackIn3 = 0;
  let zeroToJackOrTraveIn3 = 0;

  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i] === 0) {
      totalAfterZero++;
      const next3 = seq.slice(i + 1, Math.min(seq.length, i + 4));
      if (next3.includes(maxHits)) zeroToJackIn3++;
      if (next3.some(h => h >= maxHits - 1)) zeroToJackOrTraveIn3++;
    }
  }

  console.log(`\n--- DINÂMICA PÓS-ZERO (0 acertos - ${totalAfterZero} ocorrências) ---`);
  console.log(`Janela dos 3 Concursos Seguintes (T+1 a T+3):`);
  console.log(`   Sai um ${maxHits} (Jackpot Direto puro): ${zeroToJackIn3}x (${((zeroToJackIn3 / totalAfterZero) * 100).toFixed(2)}%)`);
  console.log(`   Sai ${maxHits} ou ${maxHits - 1} (Jackpot ou Trave): ${zeroToJackOrTraveIn3}x (${((zeroToJackOrTraveIn3 / totalAfterZero) * 100).toFixed(2)}%)`);
}

async function main() {
  for (const g of GAMES) {
    buildSeparacaoAguasV2(g);
  }
}

main().catch(console.error);
