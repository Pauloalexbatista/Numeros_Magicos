import { prisma } from '@/lib/prisma';

export interface GameSpec {
  name: string;
  totalBalls: number;
  drawnBalls: number;
  cutSize: number;
  hasStars: boolean;
  starName: string;
  totalStars?: number;
  drawnStars?: number;
  jackpotHits: number;
  traveHits: number;
  antiJackpotHits: number;
}

export const GAME_SPECS: Record<string, GameSpec> = {
  EUROMILLIONS: {
    name: 'Euromilhões',
    totalBalls: 50,
    drawnBalls: 5,
    cutSize: 25,
    hasStars: true,
    starName: 'Estrelas',
    totalStars: 12,
    drawnStars: 2,
    jackpotHits: 5,
    traveHits: 4,
    antiJackpotHits: 0
  },
  TOTOLOTO: {
    name: 'Totoloto',
    totalBalls: 49,
    drawnBalls: 5,
    cutSize: 25,
    hasStars: true,
    starName: 'Número da Sorte',
    totalStars: 13,
    drawnStars: 1,
    jackpotHits: 5,
    traveHits: 4,
    antiJackpotHits: 0
  },
  EURODREAMS: {
    name: 'EuroDreams',
    totalBalls: 40,
    drawnBalls: 6,
    cutSize: 20,
    hasStars: true,
    starName: 'Número Dream',
    totalStars: 5,
    drawnStars: 1,
    jackpotHits: 6,
    traveHits: 5,
    antiJackpotHits: 0
  },
  MEGASENA: {
    name: 'Mega-Sena',
    totalBalls: 60,
    drawnBalls: 6,
    cutSize: 30,
    hasStars: false,
    starName: '',
    jackpotHits: 6,
    traveHits: 5,
    antiJackpotHits: 0
  },
  LOTOFACIL: {
    name: 'Lotofácil',
    totalBalls: 25,
    drawnBalls: 15,
    cutSize: 20,
    hasStars: false,
    starName: '',
    jackpotHits: 15,
    traveHits: 14,
    antiJackpotHits: 8
  }
};

export interface BallPosition {
  ball: number;
  position: number;
  inCut: boolean;
}

export interface SystemAuditItem {
  id: number;
  systemName: string;
  systemType: 'base' | 'ensemble';
  cutSize: number;
  totalBalls: number;
  suggestedBalls: number[];
  remainingBalls: number[];
  suggestedHits: number[];
  remainingHits: number[];
  hitCount: number;
  totalDrawn: number;
  isJackpot: boolean;
  isTrave: boolean;
  isAntiJackpot: boolean;
  ballPositions: BallPosition[];
}

export interface DrawAuditResult {
  draw: {
    id: number;
    game: string;
    gameName: string;
    date: string;
    sequenceNumber?: number | null;
    numbers: number[];
    stars: number[];
    jackpot?: number | null;
  };
  spec: GameSpec;
  summary: {
    totalSystems: number;
    jackpotCount: number;
    traveCount: number;
    antiJackpotCount: number;
    averageHits: number;
    maxHits: number;
    champions: string[];
  };
  systems: SystemAuditItem[];
}

export interface DrawSummaryItem {
  id: number;
  game: string;
  date: string;
  sequenceNumber?: number | null;
  numbers: number[];
  stars: number[];
  jackpot?: number | null;
}

/**
 * Obtém os sorteios recentes para a seleção do utilizador.
 */
export async function getRecentDraws(game: string, limit = 50): Promise<DrawSummaryItem[]> {
  const normalizedGame = game.toUpperCase();
  const draws = await prisma.draw.findMany({
    where: { game: normalizedGame },
    orderBy: { date: 'desc' },
    take: limit,
    select: {
      id: true,
      game: true,
      date: true,
      sequenceNumber: true,
      numbers: true,
      stars: true,
      jackpot: true
    }
  });

  return draws.map(d => ({
    id: d.id,
    game: d.game,
    date: d.date.toISOString().slice(0, 10),
    sequenceNumber: d.sequenceNumber,
    numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers,
    stars: typeof d.stars === 'string' ? JSON.parse(d.stars) : (d.stars || []),
    jackpot: d.jackpot
  }));
}

/**
 * Obtém a auditoria completa de um sorteio específico e de todos os seus sistemas registados na BD.
 */
export async function getDrawAudit(drawId: number): Promise<DrawAuditResult | null> {
  const draw = await prisma.draw.findUnique({
    where: { id: drawId }
  });

  if (!draw) return null;

  const predictions = await prisma.systemPrediction.findMany({
    where: {
      drawId,
      domain: 'NUMBERS'
    }
  });

  const game = draw.game;
  const spec = GAME_SPECS[game] || {
    name: game,
    totalBalls: 50,
    drawnBalls: 5,
    cutSize: 25,
    hasStars: false,
    starName: '',
    jackpotHits: 5,
    traveHits: 4,
    antiJackpotHits: 0
  };

  const parsedNumbers: number[] = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
  const parsedStars: number[] = typeof draw.stars === 'string' ? JSON.parse(draw.stars) : (draw.stars || []);
  const drawnSet = new Set(parsedNumbers);

  const systems: SystemAuditItem[] = [];

  for (const p of predictions) {
    if (!p.prediction) continue;
    let fullPrediction: number[] = [];
    try {
      fullPrediction = typeof p.prediction === 'string' ? JSON.parse(p.prediction) : p.prediction;
    } catch {
      continue;
    }

    if (!Array.isArray(fullPrediction) || fullPrediction.length === 0) continue;

    const cutSize = spec.cutSize;
    const suggestedBalls = fullPrediction.slice(0, cutSize);
    const remainingBalls = fullPrediction.slice(cutSize);

    const suggestedHits = suggestedBalls.filter(n => drawnSet.has(n));
    const remainingHits = remainingBalls.filter(n => drawnSet.has(n));
    const hitCount = suggestedHits.length;

    // Calcular posição exata de cada bola sorteada neste sistema
    const ballPositions: BallPosition[] = parsedNumbers.map(ball => {
      const idx = fullPrediction.indexOf(ball);
      const position = idx >= 0 ? idx + 1 : 999;
      return {
        ball,
        position,
        inCut: idx >= 0 && idx < cutSize
      };
    });

    // Ordenar ballPositions pela posição obtida (as que ficaram melhor classificadas primeiro)
    ballPositions.sort((a, b) => a.position - b.position);

    const isJackpot = hitCount === spec.jackpotHits;
    const isTrave = hitCount === spec.traveHits;
    const isAntiJackpot = hitCount <= spec.antiJackpotHits;

    const isEnsemble = p.systemName.includes('Separação') || 
                      p.systemName.includes('SuperSistema') || 
                      p.systemName.includes('Random Forest') ||
                      p.systemName.includes('Harmonia');

    systems.push({
      id: p.id,
      systemName: p.systemName,
      systemType: isEnsemble ? 'ensemble' : 'base',
      cutSize,
      totalBalls: spec.totalBalls,
      suggestedBalls,
      remainingBalls,
      suggestedHits,
      remainingHits,
      hitCount,
      totalDrawn: spec.drawnBalls,
      isJackpot,
      isTrave,
      isAntiJackpot,
      ballPositions
    });
  }

  // Ordenar sistemas: primeiro por quem teve mais acertos, depois por nome
  systems.sort((a, b) => {
    if (b.hitCount !== a.hitCount) return b.hitCount - a.hitCount;
    return a.systemName.localeCompare(b.systemName);
  });

  const totalSystems = systems.length;
  const jackpotCount = systems.filter(s => s.isJackpot).length;
  const traveCount = systems.filter(s => s.isTrave).length;
  const antiJackpotCount = systems.filter(s => s.isAntiJackpot).length;
  const averageHits = totalSystems > 0 
    ? Number((systems.reduce((acc, s) => acc + s.hitCount, 0) / totalSystems).toFixed(2))
    : 0;
  
  const maxHits = systems.length > 0 ? systems[0].hitCount : 0;
  const champions = systems.filter(s => s.hitCount === maxHits).map(s => s.systemName);

  return {
    draw: {
      id: draw.id,
      game: draw.game,
      gameName: spec.name,
      date: draw.date.toISOString().slice(0, 10),
      sequenceNumber: draw.sequenceNumber,
      numbers: parsedNumbers,
      stars: parsedStars,
      jackpot: draw.jackpot
    },
    spec,
    summary: {
      totalSystems,
      jackpotCount,
      traveCount,
      antiJackpotCount,
      averageHits,
      maxHits,
      champions
    },
    systems
  };
}
