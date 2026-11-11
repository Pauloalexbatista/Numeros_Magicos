import * as XLSX from 'xlsx';
import { DailyReportData } from '@/services/dailyReportService';

export function exportReportToExcel(report: DailyReportData) {
  if (!report) return;

  const wb = XLSX.utils.book_new();

  // ==========================================
  // FOLHA 1: MATRIZ DE CRUZAMENTO ALGORÍTMICO
  // ==========================================
  const matrixHeaders = [
    'Sistema',
    'Família',
    'Recomendação Polaridade',
    ...Array.from({ length: report.totalBalls }, (_, i) => `Bola ${i + 1}`)
  ];

  const matrixRows: (string | number)[][] = [matrixHeaders];

  // System rows
  report.systemsMatrix.forEach(sys => {
    const recLabel = sys.family === 'PRIORITÁRIO' 
      ? 'Via Negativa (Corte)' 
      : (sys.recommendation === 'DIRECT' ? '☀️ Direto' : (sys.recommendation === 'MIRROR' ? '🌑 Espelho' : '⚖️ Neutro'));

    const row: (string | number)[] = [
      sys.name,
      sys.family,
      recLabel
    ];

    for (let b = 1; b <= report.totalBalls; b++) {
      row.push(sys.ranks[b] ?? report.totalBalls);
    }
    matrixRows.push(row);
  });

  // Empty separator
  matrixRows.push([]);

  // Footer: Média Posição Geral
  const avgRow: (string | number)[] = ['MÉDIA POSIÇÃO GERAL', 'Consenso Geral', 'Média Ponderada'];
  for (let b = 1; b <= report.totalBalls; b++) {
    const item = report.consensus.find(c => c.ball === b);
    avgRow.push(item ? item.avgRank : 0);
  }
  matrixRows.push(avgRow);

  // Footer: Votos no Top 5 (Frequência em Sistemas)
  const top5Row: (string | number)[] = ['VOTOS NO TOP 5 (Sistemas)', 'Consenso Geral', 'Frequência de Top'];
  for (let b = 1; b <= report.totalBalls; b++) {
    const item = report.consensus.find(c => c.ball === b);
    top5Row.push(item ? item.top5Votes : 0);
  }
  matrixRows.push(top5Row);

  // Footer: Votos no Top 10
  const top10Row: (string | number)[] = ['VOTOS NO TOP 10 (Sistemas)', 'Consenso Geral', 'Frequência Top 10'];
  for (let b = 1; b <= report.totalBalls; b++) {
    const item = report.consensus.find(c => c.ball === b);
    top10Row.push(item ? item.top10Votes : 0);
  }
  matrixRows.push(top10Row);

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriz_Cruzamento');

  // ==========================================
  // FOLHA 2: RADAR DE MATURAÇÃO (JPI)
  // ==========================================
  const radarHeaders = [
    '#',
    'Sistema',
    'Família',
    'Estado Algorítmico',
    'JPI Score',
    'Atraso Atual (Sorteios)',
    'Média Ciclo (Sorteios)',
    'Traves Desde Último Jack',
    'Média Traves por Jack',
    'Traves Últimos 5 Sorteios',
    'Traves Últimos 10 Sorteios',
    'Total Jackpots Histórico',
    'Total Traves Histórico'
  ];

  const radarRows: (string | number)[][] = [radarHeaders];

  report.radarTable.forEach((r, idx) => {
    radarRows.push([
      idx + 1,
      r.systemName,
      r.family || 'CYCLES',
      r.statusLabel,
      r.jpiScore,
      r.currentDelay,
      r.cycleMean,
      r.travesSinceLastJackpot,
      r.travesPerJackpotMean,
      r.travesLast5,
      r.travesLast10,
      r.totalJackpots,
      r.totalTraves
    ]);
  });

  const wsRadar = XLSX.utils.aoa_to_sheet(radarRows);
  XLSX.utils.book_append_sheet(wb, wsRadar, 'Radar_Maturacao');

  // ==========================================
  // FOLHA 3: MATRIZ DE CORTE
  // ==========================================
  const maxBallsCount = Math.max(report.matrizCorte.survivingBalls.length, report.matrizCorte.cutBalls.length);
  const corteHeaders = [
    'Classificação',
    'Total Bolas',
    ...Array.from({ length: maxBallsCount }, (_, i) => `Bola ${i + 1}`)
  ];

  const corteRows: (string | number)[][] = [
    corteHeaders,
    [
      'Sobreviventes Recomendadas',
      report.matrizCorte.survivingBalls.length,
      ...report.matrizCorte.survivingBalls
    ],
    [
      'Eliminadas / Cortadas',
      report.matrizCorte.cutBalls.length,
      ...report.matrizCorte.cutBalls
    ]
  ];

  const wsCorte = XLSX.utils.aoa_to_sheet(corteRows);
  XLSX.utils.book_append_sheet(wb, wsCorte, 'Matriz_Corte');

  // ==========================================
  // FOLHA 4: DECISÕES DE VALOR & CONSENSO
  // ==========================================
  const decisoesHeaders = [
    'Métrica / Decisão de Valor',
    'Critério Algorítmico',
    'Valor / Detalhe',
    'Bola 1',
    'Bola 2',
    'Bola 3',
    'Bola 4',
    'Bola 5'
  ];

  const top5Consenso = report.summary.top5Consensus || [];
  const top5MaisSistemas = report.summary.top5MostSystems || [];
  const top5Pascal = report.summary.top5Pascal || [];

  const decisoesRows: (string | number)[][] = [
    decisoesHeaders,
    [
      'Top 5 Menor Média Geral',
      'Média aritmética de posição em todos os sistemas (mais próximas do topo)',
      'Menor Média Global',
      ...top5Consenso
    ],
    [
      'Top 5 em Mais Sistemas',
      'Contagem de sistemas independentes que escolheram a bola para o seu Top 5',
      'Maior Frequência nos Top 5',
      ...top5MaisSistemas
    ],
    [
      'Top 5 Pirâmide de Pascal',
      'Geometria de densidade triangular',
      'Vértices Pascal',
      ...top5Pascal
    ],
    [
      'Sistema Mais Maturado (Líder Radar)',
      'Algoritmo no Ponto Óptimo de convergência e maturação do ciclo',
      `${report.summary.radarLeader} (JPI: ${report.summary.radarLeaderJpi || 'Alto'})`,
      '-', '-', '-', '-', '-'
    ]
  ];

  const wsDecisoes = XLSX.utils.aoa_to_sheet(decisoesRows);
  XLSX.utils.book_append_sheet(wb, wsDecisoes, 'Decisoes_De_Valor');

  // ==========================================
  // TRIGGER DOWNLOAD
  // ==========================================
  const fileName = `Relatorio_Previsoes_${report.game}_${report.nextDrawDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
