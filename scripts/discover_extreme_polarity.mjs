import fs from 'fs';
import path from 'path';

// Diretório de dados consolidados
const CONSOLIDATED_DIR = path.resolve('data/consolidated');
const OUTPUT_FILE = path.resolve('src/data/lab_meta_systems.json');

const GAME_SPECS = {
  euromillions: { totalBalls: 50, pickCount: 25, winningBalls: 5, label: 'Euromilhões' },
  totoloto: { totalBalls: 49, pickCount: 25, winningBalls: 5, label: 'Totoloto' },
  eurodreams: { totalBalls: 40, pickCount: 20, winningBalls: 6, label: 'EuroDreams' },
  megasena: { totalBalls: 60, pickCount: 30, winningBalls: 6, label: 'Mega-Sena' }
};

// Carrega todos os ficheiros consolidados de um jogo
function loadGameSystems(gameKey) {
  if (!fs.existsSync(CONSOLIDATED_DIR)) {
    throw new Error(`Diretório ${CONSOLIDATED_DIR} não encontrado.`);
  }

  const files = fs.readdirSync(CONSOLIDATED_DIR).filter(f => 
    f.endsWith(`_${gameKey}.json`) && !f.includes('_stars_')
  );

  const systems = {};
  for (const file of files) {
    const systemId = file.replace(`_${gameKey}.json`, '');
    // Ignorar meta-sistemas agregadores já prévios para descobrir pares elementares
    if (systemId === 'supersistema_neuronal' || systemId === 'separacao_aguas') continue;

    try {
      const raw = fs.readFileSync(path.join(CONSOLIDATED_DIR, file), 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 50) {
        systems[systemId] = data;
      }
    } catch (e) {
      console.warn(`Erro a ler ${file}:`, e.message);
    }
  }

  return systems;
}

// Alinha sorteios comuns entre múltiplos especialistas
function prepareCommonDraws(systems, systemIds, gameKey) {
  const specs = GAME_SPECS[gameKey];
  // Mapa de sorteios por drawId
  const drawMap = new Map();

  for (const sysId of systemIds) {
    const draws = systems[sysId];
    if (!draws) return null;

    for (const d of draws) {
      const id = d.drawId;
      if (!drawMap.has(id)) {
        drawMap.set(id, {
          drawId: id,
          date: d.draw?.date || '',
          winningNumbers: typeof d.draw?.numbers === 'string' ? JSON.parse(d.draw.numbers) : (d.draw?.numbers || []),
          predictions: {}
        });
      }
      const entry = drawMap.get(id);
      const pred = typeof d.prediction === 'string' ? JSON.parse(d.prediction) : d.prediction;
      entry.predictions[sysId] = pred;
    }
  }

  // Filtrar apenas sorteios onde TODOS os especialistas selecionados têm predição válida
  const alignedDraws = [];
  for (const entry of drawMap.values()) {
    let allPresent = true;
    for (const sysId of systemIds) {
      if (!entry.predictions[sysId] || entry.predictions[sysId].length < specs.totalBalls) {
        allPresent = false;
        break;
      }
    }
    if (allPresent && entry.winningNumbers && entry.winningNumbers.length === specs.winningBalls) {
      alignedDraws.push(entry);
    }
  }

  alignedDraws.sort((a, b) => a.drawId - b.drawId);
  return alignedDraws;
}

// Avalia uma combinação específica com pesos de polaridade (+1 ou -1)
function evaluateEnsemble(alignedDraws, systemIds, polarities, gameKey) {
  const specs = GAME_SPECS[gameKey];
  const totalBalls = specs.totalBalls;
  const pickCount = specs.pickCount;
  const winningBalls = specs.winningBalls;

  const distribution = {};
  for (let h = 0; h <= winningBalls; h++) {
    distribution[h] = 0;
  }

  const scores = new Float32Array(totalBalls + 1);

  for (let i = 0; i < alignedDraws.length; i++) {
    const d = alignedDraws[i];
    scores.fill(0);

    for (let s = 0; s < systemIds.length; s++) {
      const sysId = systemIds[s];
      const pol = polarities[s]; // +1 para Direto, -1 para Espelho
      const pred = d.predictions[sysId];

      if (pol === 1) {
        // Direto: topo tem maior pontuação
        for (let rank = 0; rank < totalBalls; rank++) {
          const ball = pred[rank];
          scores[ball] += (totalBalls - rank);
        }
      } else {
        // Espelho: cauda tem maior pontuação
        for (let rank = 0; rank < totalBalls; rank++) {
          const ball = pred[rank];
          scores[ball] += (rank + 1);
        }
      }
    }

    // Ordenar as bolas pelo score descrescente
    // Criamos um array de [1..totalBalls]
    const rankedBalls = [];
    for (let b = 1; b <= totalBalls; b++) {
      rankedBalls.push(b);
    }
    rankedBalls.sort((a, b) => scores[b] - scores[a]);

    // Pegar no top pickCount
    const topPicks = new Set(rankedBalls.slice(0, pickCount));

    // Contar acertos
    let hits = 0;
    for (let w = 0; w < winningBalls; w++) {
      if (topPicks.has(d.winningNumbers[w])) {
        hits++;
      }
    }

    distribution[hits]++;
  }

  const totalDraws = alignedDraws.length;
  if (totalDraws === 0) return null;

  // Cálculo da métrica de Separação das Águas & Fitness
  // Jackpots das pontas
  const jackpotsDirect = distribution[winningBalls] || 0;
  const jackpotsMirror = distribution[0] || 0;
  const totalJackpots = jackpotsDirect + jackpotsMirror;

  // Quase jackpots
  const nearDirect = distribution[winningBalls - 1] || 0;
  const nearMirror = distribution[1] || 0;
  const totalNear = nearDirect + nearMirror;

  // Ruído central (meio da curva)
  let noise = 0;
  if (winningBalls === 5) {
    noise = (distribution[2] || 0) + (distribution[3] || 0);
  } else if (winningBalls === 6) {
    noise = (distribution[3] || 0);
  }

  // Fitness function da Lei da Separação das Águas:
  // Maximiza as pontas (jackpots e traves) e penaliza fortemente o ruído central
  const fitness = (totalJackpots * 10) + (totalNear * 1.5) - (noise * 0.1);

  // Índice de Separação dos Extremos (Extremes Ratio %: pontas / total)
  const extremesCount = totalJackpots + totalNear;
  const separationRatio = (extremesCount / totalDraws) * 100;

  return {
    totalDraws,
    distribution,
    jackpotsDirect,
    jackpotsMirror,
    totalJackpots,
    nearDirect,
    nearMirror,
    totalNear,
    noise,
    fitness: parseFloat(fitness.toFixed(2)),
    separationRatio: parseFloat(separationRatio.toFixed(2))
  };
}

// Otimizador combinatório: procura os melhores conjuntos de 3 e 5 especialistas
export function runOptimization(gameKey = 'euromillions', maxResults = 10) {
  console.log(`\n===============================================================`);
  console.log(`🚀 INICIANDO LABORATÓRIO DE POLARIDADE EXTREMA: ${GAME_SPECS[gameKey]?.label || gameKey}`);
  console.log(`===============================================================\n`);

  const systems = loadGameSystems(gameKey);
  const sysIds = Object.keys(systems);
  console.log(`📦 Especialistas disponíveis (${sysIds.length}):`, sysIds.join(', '));

  if (sysIds.length < 3) {
    console.error('❌ Especialistas insuficientes para cruzamento.');
    return [];
  }

  const results = [];

  // Gera combinações de tamanho K (3 e 5)
  function getCombinations(arr, k) {
    const res = [];
    function backtrack(start, comb) {
      if (comb.length === k) {
        res.push([...comb]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        comb.push(arr[i]);
        backtrack(i + 1, comb);
        comb.pop();
      }
    }
    backtrack(0, []);
    return res;
  }

  // Permutações de polaridade (+1 e -1)
  function getPolarityPermutations(k) {
    const res = [];
    const total = 1 << k;
    for (let i = 0; i < total; i++) {
      const p = [];
      for (let bit = 0; bit < k; bit++) {
        p.push((i & (1 << bit)) ? 1 : -1);
      }
      res.push(p);
    }
    return res;
  }

  const minDraws = gameKey === 'eurodreams' ? 50 : 300;

  // 1. Testar ensembles de 3 especialistas
  const comb3 = getCombinations(sysIds, 3);
  const pol3 = getPolarityPermutations(3);
  console.log(`🔍 A testar ${comb3.length} trios x ${pol3.length} polaridades = ${comb3.length * pol3.length} permutações (mínimo ${minDraws} sorteios)...`);

  let countTested = 0;

  for (const combo of comb3) {
    const aligned = prepareCommonDraws(systems, combo, gameKey);
    if (!aligned || aligned.length < minDraws) continue;

    for (const pol of pol3) {
      countTested++;
      const evalRes = evaluateEnsemble(aligned, combo, pol, gameKey);
      if (!evalRes) continue;

      results.push({
        game: gameKey,
        size: 3,
        systemIds: combo,
        polarities: pol,
        config: combo.map((id, idx) => ({ id, polarity: pol[idx] === 1 ? 'DIRETO' : 'ESPELHO' })),
        stats: evalRes
      });
    }
  }

  // 2. Testar amostra selecionada de ensembles de 5 especialistas (top sistemas)
  // Ordena os melhores trios para extrair os sistemas mais promissores
  results.sort((a, b) => b.stats.fitness - a.stats.fitness);
  const topCandidates = Array.from(new Set(results.slice(0, 30).flatMap(r => r.systemIds))).slice(0, 8);

  if (topCandidates.length >= 5) {
    const comb5 = getCombinations(topCandidates, 5);
    const pol5 = getPolarityPermutations(5);
    console.log(`🔬 A refinar quintetos com os 8 sistemas mais promissores: ${comb5.length} quintetos x ${pol5.length} polaridades...`);

    for (const combo of comb5) {
      const aligned = prepareCommonDraws(systems, combo, gameKey);
      if (!aligned || aligned.length < minDraws) continue;

      for (const pol of pol5) {
        countTested++;
        const evalRes = evaluateEnsemble(aligned, combo, pol, gameKey);
        if (!evalRes) continue;

        results.push({
          game: gameKey,
          size: 5,
          systemIds: combo,
          polarities: pol,
          config: combo.map((id, idx) => ({ id, polarity: pol[idx] === 1 ? 'DIRETO' : 'ESPELHO' })),
          stats: evalRes
        });
      }
    }
  }

  console.log(`✅ Total de simulações realizadas: ${countTested}`);

  // Ordena por Fitness decrescente
  results.sort((a, b) => b.stats.fitness - a.stats.fitness);

  // Elimina duplicados de polaridade invertida simétrica (se A+ B- der o mesmo que A- B+)
  const uniqueMeta = [];
  const seenFingerprints = new Set();

  for (const r of results) {
    // fingerprint invariante por simetria
    const fp = `${r.systemIds.join('_')}_${r.stats.totalJackpots}_${r.stats.totalNear}_${r.stats.noise}`;
    if (!seenFingerprints.has(fp)) {
      seenFingerprints.add(fp);
      uniqueMeta.push(r);
      if (uniqueMeta.length >= maxResults) break;
    }
  }

  console.log(`\n🏆 TOP ${uniqueMeta.length} META-SISTEMAS DESCOBERTOS (${GAME_SPECS[gameKey]?.label}):`);
  uniqueMeta.forEach((m, idx) => {
    const formula = m.config.map(c => `${c.polarity === 'DIRETO' ? '+' : '-'}${c.id}`).join(' ');
    console.log(`  #${idx + 1} [Fitness: ${m.stats.fitness}] ${formula}`);
    console.log(`     Jackpots: ${m.stats.totalJackpots} (5/5: ${m.stats.jackpotsDirect} | 0/5: ${m.stats.jackpotsMirror}) | Traves: ${m.stats.totalNear} (4/1: ${m.stats.nearDirect} | 1/4: ${m.stats.nearMirror}) | Separação: ${m.stats.separationRatio}%`);
  });

  return uniqueMeta;
}

// Execução principal se chamado diretamente pelo terminal
if (process.argv[1].endsWith('discover_extreme_polarity.mjs')) {
  const targetGame = process.argv[2] || 'all';

  const finalOutput = {
    generatedAt: new Date().toISOString(),
    games: {}
  };

  const gamesToRun = targetGame === 'all' 
    ? ['euromillions', 'totoloto', 'eurodreams', 'megasena'] 
    : [targetGame];

  for (const g of gamesToRun) {
    try {
      finalOutput.games[g] = runOptimization(g, 10);
    } catch (err) {
      console.error(`Erro ao otimizar ${g}:`, err);
    }
  }

  // Cria pasta data se não existir
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalOutput, null, 2), 'utf-8');
  console.log(`\n💾 Resultados do laboratório guardados com sucesso em:\n   ${OUTPUT_FILE}\n`);
}
