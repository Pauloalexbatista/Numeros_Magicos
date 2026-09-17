const fs = require('fs');
const path = require('path');

const GAMES = {
  euromillions: {
    gameKey: 'EUROMILLIONS',
    maxNum: 50,
    halfPoint: 25,
    betSize: 5,
    maxHits: 5,
    hitCol: 'num_hits_25',
    isInverted: true,
    baselineMean: 39.9
  },
  totoloto: {
    gameKey: 'TOTOLOTO',
    maxNum: 49,
    halfPoint: 25,
    betSize: 5,
    maxHits: 5,
    hitCol: 'num_hits_25',
    isInverted: true,
    baselineMean: 35.9
  },
  eurodreams: {
    gameKey: 'EURODREAMS',
    maxNum: 40,
    halfPoint: 20,
    betSize: 6,
    maxHits: 6,
    hitCol: 'num_hits_20',
    isInverted: false,
    baselineMean: 70.3
  },
  megasena: {
    gameKey: 'MEGASENA',
    maxNum: 60,
    halfPoint: 30,
    betSize: 6,
    maxHits: 6,
    hitCol: 'num_hits_30',
    isInverted: false,
    baselineMean: 84.1
  }
};

const PRIMARY_SYSTEMS = [
  { key: 'clustering', name: 'Agrupamento (Clustering)' },
  { key: 'diagonais_matriz_3d', name: 'Diagonais da Matriz 3D' },
  { key: 'diagonais_matriz', name: 'Diagonais da Matriz 2D' },
  { key: 'mais_quentes', name: 'Mais Quentes (Hot)' },
  { key: 'mais_sorteadas_sempre', name: 'Mais Sorteadas de Sempre' },
  { key: 'markov', name: 'Cadeia de Markov' },
  { key: 'media_3_otimizado', name: 'Média 3 Otimizado' },
  { key: 'monte_carlo', name: 'Simulação Monte Carlo' },
  { key: 'oscilacao_universal', name: 'Oscilação Universal' },
  { key: 'piramide_intervalos', name: 'Pirâmide de Intervalos' },
  { key: 'piramide_pascal', name: 'Pirâmide de Pascal' },
  { key: 'random_forest', name: 'Random Forest' },
  { key: 'ultimos_a_sair', name: 'Últimos a Sair' }
];

function getQuinaPoints(rank, halfPoint) {
  const quinaIdx = Math.floor(rank / 5);
  const maxQuina = halfPoint / 5;
  if (quinaIdx >= maxQuina) return 0;
  switch (quinaIdx) {
    case 0: return 100;
    case 1: return 75;
    case 2: return 50;
    case 3: return 30;
    case 4: return 15;
    case 5: return 8;
    default: return 0;
  }
}

function combineSpecialists(specialistPredictions, maxNum, halfPoint, isInverted) {
  const points = new Float32Array(maxNum + 1);
  const consensusCount = new Uint8Array(maxNum + 1);

  for (const predArr of specialistPredictions) {
    for (let rank = 0; rank < predArr.length; rank++) {
      const num = predArr[rank];
      if (num >= 1 && num <= maxNum) {
        if (rank < halfPoint) {
          points[num] += 1000 + getQuinaPoints(rank, halfPoint);
          consensusCount[num]++;
        } else {
          points[num] -= 1000;
        }
      }
    }
  }

  const scores = [];
  for (let num = 1; num <= maxNum; num++) {
    scores.push({ num, pts: points[num], consensus: consensusCount[num] });
  }

  scores.sort((a, b) => {
    const diff = isInverted ? a.pts - b.pts : b.pts - a.pts;
    if (Math.abs(diff) > 0.0001) return diff;
    const cDiff = isInverted ? a.consensus - b.consensus : b.consensus - a.consensus;
    if (cDiff !== 0) return cDiff;
    return a.num - b.num;
  });

  return scores.map(s => s.num);
}

for (const [gameSlug, gCfg] of Object.entries(GAMES)) {
  console.log(`\n========================================`);
  console.log(`PROCESSANDO JOGO: ${gCfg.gameKey} (${gameSlug})`);
  console.log(`========================================`);

  const refFile = path.join('data', 'consolidated', `clustering_${gameSlug}.json`);
  if (!fs.existsSync(refFile)) {
    console.error(`Ficheiro de referência não encontrado: ${refFile}`);
    continue;
  }

  const refData = JSON.parse(fs.readFileSync(refFile, 'utf8'));
  const officialDraws = refData.map(x => ({
    drawId: x.drawId,
    date: x.draw.date,
    numbersRaw: x.draw.numbers,
    numbersSet: new Set(typeof x.draw.numbers === 'string' ? JSON.parse(x.draw.numbers) : x.draw.numbers)
  }));
  const totalDraws = officialDraws.length;
  console.log(`Total de sorteios oficiais: ${totalDraws}`);

  // Carregar predições e acertos dos 13 primários
  const sysPreds = {};
  const sysHits = {};

  PRIMARY_SYSTEMS.forEach(sys => {
    const fPath = path.join('data', 'consolidated', `${sys.key}_${gameSlug}.json`);
    const d = JSON.parse(fs.readFileSync(fPath, 'utf8'));
    sysPreds[sys.key] = d.map(x => typeof x.prediction === 'string' ? JSON.parse(x.prediction) : x.prediction);
    sysHits[sys.key] = d.map((x, i) => {
      if (x[gCfg.hitCol] !== undefined && typeof x[gCfg.hitCol] === 'number') {
        return x[gCfg.hitCol];
      }
      let h = 0;
      const pool = sysPreds[sys.key][i].slice(0, gCfg.halfPoint);
      for (const n of pool) {
        if (officialDraws[i].numbersSet.has(n)) h++;
      }
      return h;
    });
  });

  const lastJackpot = {};
  const allCycles = {};
  PRIMARY_SYSTEMS.forEach(sys => {
    lastJackpot[sys.key] = 0;
    allCycles[sys.key] = [];
  });

  const results = [];
  let totalJackpots = 0;
  let totalTraves = 0;

  for (let i = 0; i < totalDraws; i++) {
    const seq = i + 1;
    const currentDraw = officialDraws[i];

    let top3Keys = [];
    let specialistDetails = [];

    if (i < 30) {
      // Fase inicial de aquecimento do histórico: convocar os top 3 com melhor histórico inicial
      top3Keys = ['diagonais_matriz', 'mais_sorteadas_sempre', 'oscilacao_universal'];
      specialistDetails = top3Keys.map(k => ({
        key: k,
        name: PRIMARY_SYSTEMS.find(s => s.key === k).name,
        jpi: 75,
        delay: seq,
        status: 'warming'
      }));
    } else {
      // Calcular JPI para cada sistema com o histórico estritamente ANTERIOR ao sorteio i
      const jpiList = [];
      PRIMARY_SYSTEMS.forEach(sys => {
        const k = sys.key;
        const delay = seq - lastJackpot[k];
        const cycles = allCycles[k];
        const mean = cycles.length > 0
          ? cycles.reduce((a, b) => a + b, 0) / cycles.length
          : gCfg.baselineMean;

        const ratio = mean > 0 ? delay / mean : 0;
        let cScore = 0;
        if (ratio <= 0.6) cScore = (ratio / 0.6) * 40;
        else if (ratio <= 1.2) cScore = 40 + ((ratio - 0.6) / 0.6) * 60;
        else cScore = Math.max(20, 100 - (ratio - 1.2) * 50);

        const rec10 = sysHits[k].slice(Math.max(0, i - 10), i);
        const t10 = rec10.filter(h => h === gCfg.maxHits - 1).length;
        const t5 = rec10.slice(-5).filter(h => h === gCfg.maxHits - 1).length;
        const therm = Math.min(100, (t5 * 35) + (t10 * 15));

        const jpi = Math.round((cScore * 0.6) + (therm * 0.4));
        let status = 'warming';
        if (jpi >= 70) status = 'ripe';
        else if (jpi < 40) status = 'green';
        else if (ratio > 1.4 && t5 === 0) status = 'overdue';

        jpiList.push({
          key: k,
          name: sys.name,
          jpi,
          delay,
          mean: Math.round(mean * 10) / 10,
          status
        });
      });

      jpiList.sort((a, b) => b.jpi - a.jpi);
      const selected = jpiList.slice(0, 3);
      top3Keys = selected.map(x => x.key);
      specialistDetails = selected;
    }

    // 2. Colher predições geradas pelos 3 sistemas para o sorteio i
    const specPreds = top3Keys.map(k => sysPreds[k][i]);
    const finalNumbers = combineSpecialists(specPreds, gCfg.maxNum, gCfg.halfPoint, gCfg.isInverted);

    // 3. Avaliar acertos por corte (5, 10, 15, ..., 60)
    const cutoffs = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const hitStats = {};
    cutoffs.forEach(cut => {
      const pool = new Set(finalNumbers.slice(0, cut));
      let h = 0;
      for (const n of pool) {
        if (currentDraw.numbersSet.has(n)) h++;
      }
      hitStats[`num_hits_${cut}`] = h;
    });

    const halfPoolHits = hitStats[gCfg.hitCol];
    if (halfPoolHits === gCfg.maxHits) totalJackpots++;
    if (halfPoolHits === gCfg.maxHits - 1) totalTraves++;

    // 4. Construir objeto do sorteio com os metadados dos especialistas utilizados
    const item = {
      drawId: currentDraw.drawId,
      prediction: JSON.stringify(finalNumbers),
      cutoff: gCfg.maxNum,
      ...hitStats,
      specialists: specialistDetails.map(s => s.name),
      specialistDetails: specialistDetails,
      draw: {
        date: currentDraw.date,
        numbers: currentDraw.numbersRaw
      }
    };

    results.push(item);

    // 5. Atualizar ciclos dos 13 primários após o sorteio i ter ocorrido
    PRIMARY_SYSTEMS.forEach(sys => {
      const k = sys.key;
      if (sysHits[k][i] === gCfg.maxHits) {
        allCycles[k].push(seq - lastJackpot[k]);
        lastJackpot[k] = seq;
      }
    });
  }

  // Gravar ficheiro consolidado
  const outPath = path.join('data', 'consolidated', `destilador_sweet_spot_${gameSlug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

  console.log(`Gravado: ${outPath} (${results.length} sorteios)`);
  console.log(`Jackpots (Prémio Máximo no Top Half): ${totalJackpots}`);
  console.log(`Traves (2º Prémio): ${totalTraves}`);
  console.log(`Taxa de Sucesso Top Half: ${(((totalJackpots + totalTraves) / totalDraws) * 100).toFixed(2)}%`);
}

console.log('\nRecálculo completo de todos os jogos concluído com sucesso!');
