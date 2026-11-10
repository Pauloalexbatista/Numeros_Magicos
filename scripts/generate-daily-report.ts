import path from 'path';
import fs from 'fs';
import { prisma } from '../src/lib/prisma';
import { getNextDrawAllSuggestions, SYSTEMS_META } from '../src/services/polarity-compass';
import { calculateMatrizCorte } from '../src/services/matriz-corte-engine';

const SYSTEM_DISPLAY_NAMES: Record<string, string> = {
  tiro_certeiro: "Tiro Certeiro",
  separacao_aguas: "Separação das Águas",
  supersistema_neuronal: "Supersistema Neuronal",
  random_forest: "Random Forest",
  oscilacao_universal: "Oscilação Universal",
  markov: "Cadeia de Markov",
  clustering: "Agrupamento (Clustering)",
  diagonais_matriz: "Diagonais da Matriz 2D",
  diagonais_matriz_3d: "Diagonais da Matriz 3D",
  mais_quentes: "Mais Quentes (Hot)",
  mais_sorteadas_sempre: "Mais Sorteadas de Sempre",
  media_3_otimizado: "Média 3 Otimizado",
  monte_carlo: "Simulação Monte Carlo",
  piramide_intervalos: "Pirâmide de Intervalos",
  piramide_pascal: "Pirâmide de Pascal",
  ultimos_a_sair: "Últimos a Sair",
  matriz_corte: "Matriz de Corte (Via Negativa)",
  geometria_ciclos: "Geometria & Ciclos",
  harmonia_antigravity: "Harmonia Dimensional (Antigravity)",
  separacao_aguas_v2: "Separação das Águas 2.0"
};

const FAMILY_NAMES: Record<string, string> = {
  INTELLIGENCE: '🧠 Inteligência Artificial & Especialistas',
  INERTIA: '🔥 Inércia, Calor & Recência',
  GEOMETRY: '📐 Geometria & Matrizes Dimensionais',
  CYCLES: '🔄 Ciclos, Pêndulo & Probabilidade'
};

const FAMILY_ORDER = ['INTELLIGENCE', 'INERTIA', 'GEOMETRY', 'CYCLES'];

export async function computeRadarTable(game: string) {
  const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');
  const gameSlug = game.toLowerCase();

  const files = fs.readdirSync(consolidatedDir).filter(f =>
    f.endsWith(`_${gameSlug}.json`) && !f.includes('_stars_')
  );

  const systemsStats: any[] = [];

  for (const file of files) {
    const slug = file.replace(`_${gameSlug}.json`, '');
    try {
      const content = JSON.parse(fs.readFileSync(path.join(consolidatedDir, file), 'utf8'));
      if (!Array.isArray(content) || content.length === 0) continue;

      const totalDraws = content.length;
      const hits5 = content.filter(d => (d.hits?.num_hits_25 === 5 || d.num_hits_25 === 5 || d.num_hits_5 === 5));
      const hits4 = content.filter(d => (d.hits?.num_hits_25 === 4 || d.num_hits_25 === 4 || d.num_hits_4 === 4));

      // Calculate intervals
      const intervals: number[] = [];
      let lastSeq = 0;
      hits5.forEach((h, idx) => {
        const seq = h.drawId || (idx + 1);
        if (lastSeq > 0) intervals.push(seq - lastSeq);
        lastSeq = seq;
      });

      const mean = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 35.9;
      
      const lastJackpotSeq = hits5.length > 0 ? (hits5[hits5.length - 1].drawId || totalDraws) : 0;
      const currentDelay = totalDraws - (hits5.length > 0 ? (content.findIndex(d => d.drawId === lastJackpotSeq) + 1) : 0);

      const last5 = content.slice(-5);
      const last10 = content.slice(-10);
      const travesLast5 = last5.filter(d => (d.hits?.num_hits_25 === 4 || d.num_hits_25 === 4)).length;
      const travesLast10 = last10.filter(d => (d.hits?.num_hits_25 === 4 || d.num_hits_25 === 4)).length;

      const travesSinceLastJackpot = hits4.filter(h => (h.drawId || 0) > lastJackpotSeq).length;
      const travesPerJackpotMean = hits5.length > 0 ? Math.round((hits4.length / hits5.length) * 10) / 10 : 0;

      // JPI calculation
      const ratio = mean > 0 ? currentDelay / mean : 0;
      let sCiclo = 50;
      if (ratio >= 0.85 && ratio <= 1.30) sCiclo = 100;
      else if (ratio >= 0.70 && ratio < 0.85) sCiclo = 80;
      else if (ratio > 1.30 && ratio <= 1.70) sCiclo = 75;
      else if (ratio < 0.40) sCiclo = 25;
      else sCiclo = 45;

      let sAccum = 50;
      if (travesSinceLastJackpot >= travesPerJackpotMean) sAccum = 90;
      else if (travesSinceLastJackpot >= travesPerJackpotMean * 0.6) sAccum = 70;
      else sAccum = 30;

      let sRecent = 20;
      if (travesLast5 >= 2) sRecent = 100;
      else if (travesLast5 === 1) sRecent = 85;
      else if (travesLast10 >= 2) sRecent = 75;
      else if (travesLast10 === 1) sRecent = 60;

      const jpiScore = Math.min(100, Math.max(0, Math.round(0.45 * sCiclo + 0.30 * sAccum + 0.25 * sRecent)));

      let statusLabel = "Em Maturação";
      if (jpiScore >= 75 || (travesLast5 >= 2 && currentDelay >= 2)) {
        statusLabel = "🔥 Ponto Óptimo (Convergência)";
      } else if (jpiScore >= 60) {
        statusLabel = "Alta Probabilidade";
      } else if (ratio < 0.25) {
        statusLabel = "Arrefecimento Recente";
      } else if (ratio > 1.80) {
        statusLabel = "Ciclo Prolongado";
      }

      systemsStats.push({
        systemId: slug,
        systemName: SYSTEM_DISPLAY_NAMES[slug] || slug,
        statusLabel,
        jpiScore,
        currentDelay,
        cycleMean: Math.round(mean * 10) / 10,
        travesSinceLastJackpot,
        travesPerJackpotMean,
        travesLast5,
        travesLast10,
        totalJackpots: hits5.length,
        totalTraves: hits4.length
      });
    } catch (e) {
      // ignore
    }
  }

  systemsStats.sort((a, b) => b.jpiScore - a.jpiScore);
  return systemsStats;
}

async function run() {
  console.log('=== RELATÓRIO DE PREVISÕES - TOTOLOTO ===');
  
  // 1. Radar
  const radar = await computeRadarTable('TOTOLOTO');
  console.log('\n--- RADAR DE MATURAÇÃO (Ordenado por JPI) ---');
  console.table(radar.map(r => ({
    Sistema: r.systemName,
    Estado: r.statusLabel,
    JPI: r.jpiScore,
    Atraso: r.currentDelay,
    'Média Ciclo': r.cycleMean,
    'Traves Ciclo': `${r.travesSinceLastJackpot} / ${r.travesPerJackpotMean}`,
    'Traves Recentes': `${r.travesLast5} (5s) | ${r.travesLast10} (10s)`,
    Jackpots: r.totalJackpots
  })));

  // 2. Matriz de Corte
  const matriz = await calculateMatrizCorte('TOTOLOTO');
  console.log('\n--- MATRIZ DE CORTE V2 ---');
  const cutBalls = matriz.balls.slice(0, matriz.targetEliminate).map(b => b.ball);
  const survivingBalls = matriz.balls.slice(matriz.targetEliminate).map(b => b.ball);
  console.log(`Bolas a Eliminar (${cutBalls.length}):`, cutBalls.join(', '));
  console.log(`Bolas Sobreviventes Recomendadas (${survivingBalls.length}):`, survivingBalls.join(', '));

  // 3. Sistemas por Família
  const suggestions = await getNextDrawAllSuggestions('TOTOLOTO');
  console.log(`\n--- SISTEMAS POR FAMÍLIA (${suggestions.length} sistemas) ---`);
  
  for (const famKey of FAMILY_ORDER) {
    const famSystems = suggestions.filter(s => s.family === famKey && s.systemSlug !== 'matriz_corte');
    console.log(`\n### ${FAMILY_NAMES[famKey] || famKey}`);
    famSystems.forEach(s => {
      const nums = (s.recommendation === 'DIRECT' ? s.topHalf : s.mirrorHalf || s.topHalf);
      console.log(`* **${s.systemName}** (${s.recommendation === 'DIRECT' ? '☀️ Direto' : '🌑 Espelho'}): ${nums.join(', ')}`);
    });
  }
  // 4. Matriz Comparativa (Tabela: Sistema x Números de 1 a 49 com a posição de importância)
  console.log('\n--- MATRIZ DE POSIÇÕES (1 a 49) ---');
  
  // Matriz de Corte ranks: surviving balls get 1..25, cut balls get 26..49
  const matrizRanks: Record<number, number> = {};
  survivingBalls.forEach((b, idx) => { matrizRanks[b] = idx + 1; });
  cutBalls.forEach((b, idx) => { matrizRanks[b] = 25 + idx + 1; });

  const systemsMatrix: Array<{ name: string; family: string; ranks: Record<number, number> }> = [
    { name: 'Matriz de Corte V2', family: 'PRIORITÁRIO', ranks: matrizRanks }
  ];

  for (const famKey of FAMILY_ORDER) {
    const famSystems = suggestions.filter(s => s.family === famKey && s.systemSlug !== 'matriz_corte');
    famSystems.forEach(s => {
      const fullOrdered = (s.recommendation === 'DIRECT' ? s.fullPool : [...(s.mirrorHalf || []), ...(s.topHalf || [])]);
      const ranks: Record<number, number> = {};
      fullOrdered.forEach((ball, idx) => {
        ranks[ball] = idx + 1;
      });
      systemsMatrix.push({
        name: s.systemName,
        family: famKey,
        ranks
      });
    });
  }

  // Calculate consensus for each ball 1 to 49 (average position and top 5 votes)
  const ballConsensus: Array<{ ball: number; avgRank: number; top5Votes: number; top10Votes: number }> = [];
  for (let b = 1; b <= 49; b++) {
    let sum = 0;
    let t5 = 0;
    let t10 = 0;
    systemsMatrix.forEach(sys => {
      const r = sys.ranks[b] || 49;
      sum += r;
      if (r <= 5) t5++;
      if (r <= 10) t10++;
    });
    ballConsensus.push({
      ball: b,
      avgRank: Math.round((sum / systemsMatrix.length) * 10) / 10,
      top5Votes: t5,
      top10Votes: t10
    });
  }

  ballConsensus.sort((a, b) => a.avgRank - b.avgRank);
  console.log('Top 10 Bolas com melhor média de importância em todos os sistemas:');
  console.table(ballConsensus.slice(0, 10));

  // Save JSON for UI widget and Admin Reports archive
  const reportsDir = path.join(process.cwd(), 'data', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const fullReport = {
    id: 'TOTOLOTO_2026-11-11_' + Math.floor(Date.now() / 1000),
    game: 'TOTOLOTO',
    gameName: 'Totoloto',
    nextDrawDate: '2026-11-11',
    nextDrawWeekday: 'Quarta-feira',
    createdAt: new Date().toISOString(),
    totalBalls: 49,
    pickSize: 5,
    radarTable: radar,
    matrizCorte: {
      survivingBalls,
      cutBalls
    },
    systemsMatrix,
    consensus: ballConsensus,
    summary: {
      top5Consensus: ballConsensus.slice(0, 5).map(c => c.ball),
      top5Pascal: [40, 14, 3, 1, 25],
      radarLeader: radar[0]?.systemName || 'Pirâmide de Pascal'
    }
  };

  fs.writeFileSync(path.join(reportsDir, `${fullReport.id}.json`), JSON.stringify(fullReport, null, 2));
  fs.writeFileSync(path.join(reportsDir, 'latest_TOTOLOTO.json'), JSON.stringify(fullReport, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'data', 'daily_totoloto_matrix.json'), JSON.stringify(fullReport, null, 2));
  console.log('Saved to data/reports/ archive and data/daily_totoloto_matrix.json');
}

run().catch(console.error);
