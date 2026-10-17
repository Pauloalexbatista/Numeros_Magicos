import fs from 'fs';
import path from 'path';

export interface MetaSystemConfig {
  id: string;
  polarity: 'DIRETO' | 'ESPELHO';
}

export interface MetaSystemStats {
  totalDraws: number;
  distribution: Record<number, number>;
  jackpotsDirect: number;
  jackpotsMirror: number;
  totalJackpots: number;
  nearDirect: number;
  nearMirror: number;
  totalNear: number;
  noise: number;
  fitness: number;
  separationRatio: number;
}

export interface MetaSystemEntry {
  game: string;
  size: number;
  systemIds: string[];
  polarities: number[];
  config: MetaSystemConfig[];
  stats: MetaSystemStats;
}

export interface LabDiscoveryData {
  generatedAt: string;
  games: Record<string, MetaSystemEntry[]>;
}

const LAB_DATA_FILE = path.resolve(process.cwd(), 'src/data/lab_meta_systems.json');
const CONSOLIDATED_DIR = path.resolve(process.cwd(), 'data/consolidated');

const GAME_SPECS: Record<string, { totalBalls: number; pickCount: number; winningBalls: number; label: string }> = {
  euromillions: { totalBalls: 50, pickCount: 25, winningBalls: 5, label: 'Euromilhões' },
  totoloto: { totalBalls: 49, pickCount: 25, winningBalls: 5, label: 'Totoloto' },
  eurodreams: { totalBalls: 40, pickCount: 20, winningBalls: 6, label: 'EuroDreams' },
  megasena: { totalBalls: 60, pickCount: 30, winningBalls: 6, label: 'Mega-Sena' }
};

/**
 * Lê os meta-sistemas de ouro descobertos pelo script offline de polaridade extrema
 */
export function getSavedMetaSystems(gameKey: string = 'euromillions'): {
  game: string;
  specs: { totalBalls: number; pickCount: number; winningBalls: number; label: string };
  generatedAt: string;
  topMetaSystems: MetaSystemEntry[];
} {
  const specs = GAME_SPECS[gameKey] || GAME_SPECS['euromillions'];

  if (!fs.existsSync(LAB_DATA_FILE)) {
    return {
      game: gameKey,
      specs,
      generatedAt: new Date().toISOString(),
      topMetaSystems: []
    };
  }

  try {
    const raw = fs.readFileSync(LAB_DATA_FILE, 'utf-8');
    const data: LabDiscoveryData = JSON.parse(raw);
    const topMetaSystems = data.games?.[gameKey] || [];
    return {
      game: gameKey,
      specs,
      generatedAt: data.generatedAt,
      topMetaSystems
    };
  } catch (e) {
    console.error('Erro ao ler lab_meta_systems.json:', e);
    return {
      game: gameKey,
      specs,
      generatedAt: new Date().toISOString(),
      topMetaSystems: []
    };
  }
}

/**
 * Simula em tempo real uma combinação arbitrária de especialistas e polaridades
 */
export function simulateCustomEnsemble(
  gameKey: string,
  configs: { systemId: string; polarity: 'DIRETO' | 'ESPELHO' }[]
): {
  success: boolean;
  error?: string;
  stats?: MetaSystemStats;
  nextDrawNumbers?: {
    direct: number[];
    mirror: number[];
    allRanked: number[];
  };
} {
  const specs = GAME_SPECS[gameKey];
  if (!specs) return { success: false, error: 'Jogo inválido' };
  if (!configs || configs.length === 0) return { success: false, error: 'Selecione pelo menos um sistema' };

  try {
    const systemsData: Record<string, any[]> = {};

    for (const c of configs) {
      const fileName = `${c.systemId}_${gameKey}.json`;
      const filePath = path.join(CONSOLIDATED_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `Ficheiro para o sistema ${c.systemId} não encontrado.` };
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      systemsData[c.systemId] = JSON.parse(raw);
    }

    // Alinhamento de sorteios
    const drawMap = new Map<number, {
      drawId: number;
      date: string;
      winningNumbers: number[];
      predictions: Record<string, number[]>;
    }>();

    for (const c of configs) {
      const draws = systemsData[c.systemId];
      for (const d of draws) {
        if (!drawMap.has(d.drawId)) {
          drawMap.set(d.drawId, {
            drawId: d.drawId,
            date: d.draw?.date || '',
            winningNumbers: typeof d.draw?.numbers === 'string' ? JSON.parse(d.draw.numbers) : (d.draw?.numbers || []),
            predictions: {}
          });
        }
        const entry = drawMap.get(d.drawId)!;
        entry.predictions[c.systemId] = typeof d.prediction === 'string' ? JSON.parse(d.prediction) : d.prediction;
      }
    }

    const alignedDraws: any[] = [];
    for (const entry of drawMap.values()) {
      let valid = true;
      for (const c of configs) {
        if (!entry.predictions[c.systemId] || entry.predictions[c.systemId].length < specs.totalBalls) {
          valid = false;
          break;
        }
      }
      if (valid && entry.winningNumbers && entry.winningNumbers.length === specs.winningBalls) {
        alignedDraws.push(entry);
      }
    }

    alignedDraws.sort((a, b) => a.drawId - b.drawId);

    if (alignedDraws.length === 0) {
      return { success: false, error: 'Nenhum sorteio histórico alinhado entre estes sistemas.' };
    }

    const distribution: Record<number, number> = {};
    for (let h = 0; h <= specs.winningBalls; h++) distribution[h] = 0;

    const scores = new Float32Array(specs.totalBalls + 1);

    for (let i = 0; i < alignedDraws.length; i++) {
      const d = alignedDraws[i];
      scores.fill(0);

      for (const c of configs) {
        const pred = d.predictions[c.systemId];
        const isDirect = c.polarity === 'DIRETO';

        if (isDirect) {
          for (let rank = 0; rank < specs.totalBalls; rank++) {
            scores[pred[rank]] += (specs.totalBalls - rank);
          }
        } else {
          for (let rank = 0; rank < specs.totalBalls; rank++) {
            scores[pred[rank]] += (rank + 1);
          }
        }
      }

      const rankedBalls: number[] = [];
      for (let b = 1; b <= specs.totalBalls; b++) rankedBalls.push(b);
      rankedBalls.sort((a, b) => scores[b] - scores[a]);

      const topPicks = new Set(rankedBalls.slice(0, specs.pickCount));
      let hits = 0;
      for (let w = 0; w < specs.winningBalls; w++) {
        if (topPicks.has(d.winningNumbers[w])) hits++;
      }
      distribution[hits]++;
    }

    const totalDraws = alignedDraws.length;
    const jackpotsDirect = distribution[specs.winningBalls] || 0;
    const jackpotsMirror = distribution[0] || 0;
    const totalJackpots = jackpotsDirect + jackpotsMirror;
    const nearDirect = distribution[specs.winningBalls - 1] || 0;
    const nearMirror = distribution[1] || 0;
    const totalNear = nearDirect + nearMirror;

    let noise = 0;
    if (specs.winningBalls === 5) {
      noise = (distribution[2] || 0) + (distribution[3] || 0);
    } else {
      noise = (distribution[3] || 0);
    }

    const fitness = (totalJackpots * 10) + (totalNear * 1.5) - (noise * 0.1);
    const separationRatio = ((totalJackpots + totalNear) / totalDraws) * 100;

    // Calcular os números para o próximo sorteio (usando o último sorteio disponível)
    const latestDraw = alignedDraws[alignedDraws.length - 1];
    scores.fill(0);
    for (const c of configs) {
      const pred = latestDraw.predictions[c.systemId];
      if (c.polarity === 'DIRETO') {
        for (let rank = 0; rank < specs.totalBalls; rank++) {
          scores[pred[rank]] += (specs.totalBalls - rank);
        }
      } else {
        for (let rank = 0; rank < specs.totalBalls; rank++) {
          scores[pred[rank]] += (rank + 1);
        }
      }
    }

    const allRanked: number[] = [];
    for (let b = 1; b <= specs.totalBalls; b++) allRanked.push(b);
    allRanked.sort((a, b) => scores[b] - scores[a]);

    const direct = allRanked.slice(0, specs.pickCount).sort((a, b) => a - b);
    const mirror = allRanked.slice(specs.pickCount).sort((a, b) => a - b);

    return {
      success: true,
      stats: {
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
      },
      nextDrawNumbers: {
        direct,
        mirror,
        allRanked
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
