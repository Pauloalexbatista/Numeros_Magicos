import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getNextDrawAllSuggestions, SYSTEMS_META } from '@/services/polarity-compass';
import { calculateMatrizCorte } from '@/services/matriz-corte-engine';

export interface GameReportConfig {
  key: string;
  name: string;
  totalBalls: number;
  pickSize: number;
  drawDays: number[]; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
}

export const GAME_REPORT_CONFIGS: Record<string, GameReportConfig> = {
  TOTOLOTO: {
    key: 'TOTOLOTO',
    name: 'Totoloto',
    totalBalls: 49,
    pickSize: 5,
    drawDays: [3, 6] // Wed, Sat
  },
  EUROMILLIONS: {
    key: 'EUROMILLIONS',
    name: 'Euromilhões',
    totalBalls: 50,
    pickSize: 5,
    drawDays: [2, 5] // Tue, Fri
  },
  EURODREAMS: {
    key: 'EURODREAMS',
    name: 'EuroDreams',
    totalBalls: 40,
    pickSize: 6,
    drawDays: [1, 4] // Mon, Thu
  },
  MEGASENA: {
    key: 'MEGASENA',
    name: 'Mega-Sena',
    totalBalls: 60,
    pickSize: 6,
    drawDays: [2, 4, 6] // Tue, Thu, Sat
  },
  LOTOFACIL: {
    key: 'LOTOFACIL',
    name: 'Lotofácil',
    totalBalls: 25,
    pickSize: 15,
    drawDays: [1, 2, 3, 4, 5, 6] // Mon-Sat
  }
};

import { calculateRadarData, CANONICAL_SYSTEM_NAMES } from '@/services/radarService';

const SYSTEM_DISPLAY_NAMES: Record<string, string> = CANONICAL_SYSTEM_NAMES;

const FAMILY_NAMES: Record<string, string> = {
  PRIORITÁRIO: '✂️ Matriz de Corte (Prioritário)',
  INTELLIGENCE: '🧠 Inteligência Artificial & Especialistas',
  INERTIA: '🔥 Inércia, Calor & Recência',
  GEOMETRY: '📐 Geometria & Matrizes Dimensionais',
  CYCLES: '🔄 Ciclos, Pêndulo & Probabilidade'
};

const FAMILY_ORDER = ['INTELLIGENCE', 'INERTIA', 'GEOMETRY', 'CYCLES'];

export interface RadarRow {
  systemId: string;
  systemName: string;
  family: string;
  statusLabel: string;
  jpiScore: number;
  currentDelay: number;
  cycleMean: number;
  travesSinceLastJackpot: number;
  travesPerJackpotMean: number;
  travesLast5: number;
  travesLast10: number;
  totalJackpots: number;
  totalTraves: number;
}

export interface SystemMatrixRow {
  name: string;
  family: string;
  recommendation: 'DIRECT' | 'MIRROR' | 'NEUTRAL';
  ranks: Record<number, number>; // ballNumber -> rank position 1..N
}

export interface BallConsensus {
  ball: number;
  avgRank: number;
  top5Votes: number;
  top10Votes: number;
}

export interface DailyReportData {
  id: string; // e.g. "TOTOLOTO_2026-11-11_1762734000"
  game: string;
  gameName: string;
  nextDrawDate: string; // YYYY-MM-DD
  nextDrawWeekday: string;
  createdAt: string; // ISO
  totalBalls: number;
  pickSize: number;
  radarTable: RadarRow[];
  matrizCorte: {
    survivingBalls: number[];
    cutBalls: number[];
  };
  systemsMatrix: SystemMatrixRow[];
  consensus: BallConsensus[];
  summary: {
    top5Consensus: number[];
    top5MostSystems: number[];
    top5Pascal: number[];
    radarLeader: string;
    radarLeaderJpi: number;
    radarLeaderDelay: number;
    radarLeaderMean: number;
  };
}

const REPORTS_DIR = path.join(process.cwd(), 'data', 'reports');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

export function computeNextDrawDate(gameKey: string, baseDate?: Date): { dateStr: string; weekday: string } {
  const cfg = GAME_REPORT_CONFIGS[gameKey.toUpperCase()] || GAME_REPORT_CONFIGS.TOTOLOTO;
  const start = baseDate ? new Date(baseDate) : new Date();
  
  // Advance at least 1 day
  const candidate = new Date(start);
  candidate.setDate(candidate.getDate() + 1);

  for (let i = 0; i < 7; i++) {
    const dayOfWeek = candidate.getUTCDay();
    if (cfg.drawDays.includes(dayOfWeek)) {
      break;
    }
    candidate.setDate(candidate.getDate() + 1);
  }

  const weekdaysPt = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const yyyy = candidate.getUTCFullYear();
  const mm = String(candidate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(candidate.getUTCDate()).padStart(2, '0');

  return {
    dateStr: `${yyyy}-${mm}-${dd}`,
    weekday: weekdaysPt[candidate.getUTCDay()]
  };
}

export async function computeRadarStats(game: string): Promise<RadarRow[]> {
  try {
    const radarData = await calculateRadarData(game, false);
    return radarData.systems.map(s => ({
      systemId: s.systemId,
      systemName: s.systemName,
      family: SYSTEMS_META[s.systemId]?.family || 'CYCLES',
      statusLabel: s.statusLabel,
      jpiScore: s.jpiScore,
      currentDelay: s.currentDelay,
      cycleMean: s.cycleMean,
      travesSinceLastJackpot: s.travesSinceLastJackpot,
      travesPerJackpotMean: s.travesPerJackpotMean,
      travesLast5: s.travesLast5,
      travesLast10: s.travesLast10,
      totalJackpots: s.totalJackpots,
      totalTraves: s.totalTraves
    }));
  } catch (err) {
    console.error('Erro ao calcular estatísticas do radar para relatório diário:', err);
    return [];
  }
}

export async function generateDailyReport(gameKey: string): Promise<DailyReportData> {
  ensureReportsDir();
  const game = gameKey.toUpperCase();
  const cfg = GAME_REPORT_CONFIGS[game] || GAME_REPORT_CONFIGS.TOTOLOTO;

  // 1. Next draw timing
  let latestDrawDate: Date | undefined = undefined;
  try {
    const latestDraw = await prisma.draw.findFirst({
      where: { game },
      orderBy: { date: 'desc' }
    });
    if (latestDraw?.date) latestDrawDate = new Date(latestDraw.date);
  } catch {
    // fallback
  }

  const { dateStr: nextDrawDate, weekday: nextDrawWeekday } = computeNextDrawDate(game, latestDrawDate);

  // 2. Radar de Maturação
  const radarTable = await computeRadarStats(game);

  // 3. Matriz de Corte V2
  const matrizResult = await calculateMatrizCorte(game);
  const cutBalls = matrizResult.balls.slice(0, matrizResult.targetEliminate).map(b => b.ball);
  const survivingBalls = matrizResult.balls.slice(matrizResult.targetEliminate).map(b => b.ball);

  // 4. Polarity / Systems Suggestions
  const suggestions = await getNextDrawAllSuggestions(game);

  // 5. Build Systems Matrix (1..N)
  const matrizRanks: Record<number, number> = {};
  survivingBalls.forEach((b, idx) => { matrizRanks[b] = idx + 1; });
  cutBalls.forEach((b, idx) => { matrizRanks[b] = survivingBalls.length + idx + 1; });

  const systemsMatrix: SystemMatrixRow[] = [
    {
      name: 'Matriz de Corte',
      family: 'PRIORITÁRIO',
      recommendation: 'DIRECT',
      ranks: matrizRanks
    }
  ];

  for (const famKey of FAMILY_ORDER) {
    const famSystems = suggestions.filter(s => s.family === famKey && s.systemSlug !== 'matriz_corte');
    famSystems.forEach(s => {
      // Ordem canónica intrínseca de preferência do sistema (1º a N), em perfeita concordância com o histórico/ranking
      const fullOrdered = s.fullPool && s.fullPool.length > 0 ? s.fullPool : [];
      const ranks: Record<number, number> = {};
      fullOrdered.forEach((ball, idx) => {
        ranks[ball] = idx + 1;
      });
      systemsMatrix.push({
        name: s.systemName,
        family: famKey,
        recommendation: s.recommendation,
        ranks
      });
    });
  }

  // 6. Consensus calculations
  const consensus: BallConsensus[] = [];
  for (let b = 1; b <= cfg.totalBalls; b++) {
    let sum = 0;
    let t5 = 0;
    let t10 = 0;
    systemsMatrix.forEach(sys => {
      const r = sys.ranks[b] || cfg.totalBalls;
      sum += r;
      if (r <= 5) t5++;
      if (r <= 10) t10++;
    });
    consensus.push({
      ball: b,
      avgRank: Math.round((sum / systemsMatrix.length) * 10) / 10,
      top5Votes: t5,
      top10Votes: t10
    });
  }

  // 1. Top 5 com menor média de posição geral (mais próximo do topo no conjunto de todos os sistemas)
  const sortedByAvg = [...consensus].sort((a, b) => a.avgRank - b.avgRank);
  const top5Consensus = sortedByAvg.slice(0, 5).map(c => c.ball);

  // 2. Top 5 presentes em mais sistemas (maior quantidade de votos no Top 5)
  const sortedByTop5Votes = [...consensus].sort((a, b) => b.top5Votes - a.top5Votes || a.avgRank - b.avgRank);
  const top5MostSystems = sortedByTop5Votes.slice(0, 5).map(c => c.ball);

  const pascalSys = suggestions.find(s => s.systemSlug === 'piramide_pascal');
  const top5Pascal = pascalSys ? pascalSys.top5 : [];

  const topRadar = radarTable[0];
  const radarLeader = topRadar?.systemName || 'N/A';
  const radarLeaderJpi = topRadar?.jpiScore || 0;
  const radarLeaderDelay = topRadar?.currentDelay || 0;
  const radarLeaderMean = topRadar?.cycleMean || 0;

  const timestamp = Math.floor(Date.now() / 1000);
  const reportId = `${game}_${nextDrawDate}_${timestamp}`;

  const reportData: DailyReportData = {
    id: reportId,
    game,
    gameName: cfg.name,
    nextDrawDate,
    nextDrawWeekday,
    createdAt: new Date().toISOString(),
    totalBalls: cfg.totalBalls,
    pickSize: cfg.pickSize,
    radarTable,
    matrizCorte: {
      survivingBalls,
      cutBalls
    },
    systemsMatrix,
    consensus,
    summary: {
      top5Consensus,
      top5MostSystems,
      top5Pascal,
      radarLeader,
      radarLeaderJpi,
      radarLeaderDelay,
      radarLeaderMean
    }
  };

  // Persist to file
  const fileName = `${reportId}.json`;
  fs.writeFileSync(path.join(REPORTS_DIR, fileName), JSON.stringify(reportData, null, 2), 'utf8');

  // Also maintain a "latest" alias
  const latestFileName = `latest_${game}.json`;
  fs.writeFileSync(path.join(REPORTS_DIR, latestFileName), JSON.stringify(reportData, null, 2), 'utf8');

  return reportData;
}

export function listDailyReports(gameFilter?: string): Array<{
  id: string;
  game: string;
  nextDrawDate: string;
  createdAt: string;
  top5Consensus: number[];
  fileName: string;
}> {
  ensureReportsDir();
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('latest_'));

  const list = files.map(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8'));
      return {
        id: content.id || file.replace('.json', ''),
        game: content.game,
        nextDrawDate: content.nextDrawDate,
        createdAt: content.createdAt,
        top5Consensus: content.summary?.top5Consensus || [],
        fileName: file
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as any[];

  if (gameFilter) {
    return list.filter(r => r.game.toUpperCase() === gameFilter.toUpperCase());
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDailyReport(id: string): DailyReportData | null {
  ensureReportsDir();
  const filePath = path.join(REPORTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    // Try latest alias
    const latestPath = path.join(REPORTS_DIR, `latest_${id.toUpperCase()}.json`);
    if (fs.existsSync(latestPath)) {
      return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    }
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function deleteDailyReport(id: string): boolean {
  ensureReportsDir();
  const safeId = path.basename(id).replace(/\.json$/, '');
  const filePath = path.join(REPORTS_DIR, `${safeId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
