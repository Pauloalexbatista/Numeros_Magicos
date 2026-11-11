import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface StrategyDrawStep {
  step: 'T+1' | 'T+2' | 'T+3';
  drawId?: number;
  date?: string;
  directHits?: number;
  apostaHits?: number;
  isWinner?: boolean; // quadra ou quina/jackpot
  isPending?: boolean;
}

export interface StrategyEntry {
  id: string;
  game: 'TOTOLOTO' | 'EUROMILLIONS' | 'EURODREAMS' | 'MEGASENA';
  systemSlug: string;
  systemName: string;
  triggerEvent: 'JACKPOT_MAX' | 'ANTI_JACKPOT_0';
  triggerDate: string;
  triggerDrawId: number;
  triggerDescription: string;
  targetSide: 'DIRECT' | 'MIRROR'; // DIRECT = Manter no Sistema Principal; MIRROR = Mudar para o Anti-Sistema
  thesisEvidence: string;
  steps: StrategyDrawStep[];
  highestHit: number;
  status: 'ATIVA' | 'CONCRETIZADA' | 'EXPIRADA_SEM_PREMIO';
  winningDraw?: {
    step: string;
    drawId?: number;
    date?: string;
    hits: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyMetrics {
  total: number;
  ativas: number;
  concretizadas: number;
  expiradas: number;
  taxaConcretizacao: number; // percentagem de concluídas que tiveram sucesso
}

interface GameConfig {
  slug: 'TOTOLOTO' | 'EUROMILLIONS' | 'EURODREAMS' | 'MEGASENA';
  pickSize: number;
  hitCol: 'num_hits_25' | 'num_hits_20' | 'num_hits_30';
  winThreshold: number; // acertos mínimos para considerar vitória (ex: 4 para 5 bolas, 5 para 6 bolas)
}

const GAME_CONFIGS: Record<string, GameConfig> = {
  TOTOLOTO:     { slug: 'TOTOLOTO',     pickSize: 5, hitCol: 'num_hits_25', winThreshold: 4 },
  EUROMILLIONS: { slug: 'EUROMILLIONS', pickSize: 5, hitCol: 'num_hits_25', winThreshold: 4 },
  EURODREAMS:   { slug: 'EURODREAMS',   pickSize: 6, hitCol: 'num_hits_20', winThreshold: 5 },
  MEGASENA:     { slug: 'MEGASENA',     pickSize: 6, hitCol: 'num_hits_30', winThreshold: 5 }
};

interface SystemProfileItem {
  actionPostMax?: 'DIRECT' | 'MIRROR';
  actionPost0?: 'DIRECT' | 'MIRROR';
  pMax?: string;
  p0?: string;
  historicalN?: number;
  directRate?: number;
  mirrorRate?: number;
  baseline?: number;
  lift?: number;
}

export const SYSTEM_PROFILES: Record<string, {
  name: string;
  dbAliases: string[];
  totoloto?: SystemProfileItem;
  euromillions?: SystemProfileItem;
  eurodreams?: SystemProfileItem;
  megasena?: SystemProfileItem;
}> = {
  mais_quentes: {
    name: 'Mais Quentes',
    dbAliases: ['Mais Quentes', 'Hot Numbers'],
    euromillions: {
      actionPostMax: 'DIRECT',
      historicalN: 60,
      directRate: 58.3,
      mirrorRate: 28.3,
      baseline: 43.7,
      lift: 14.6,
      pMax: 'Inércia comprovada na BD (N=60): 58.3% repete >=4 no Bloco Direto em W3 (vs apenas 28.3% no Anti-Sistema; +14.6% sobre o acaso).'
    },
    totoloto: {
      actionPostMax: 'DIRECT',
      historicalN: 43,
      directRate: 46.5,
      mirrorRate: 44.2,
      baseline: 45.5,
      lift: 1.0,
      pMax: 'Inércia comprovada na BD (N=43): 46.5% mantém >=4 no Bloco Direto em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      pMax: 'Inércia contínua: 94.1% mantém >=4 em W3 (+67.8% sobre o acaso de 26.3%).'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      pMax: 'Inércia: 80.2% bate >=4 em W3 (+60.6% sobre o acaso de 19.6%).'
    }
  },
  mais_sorteadas_sempre: {
    name: 'Mais Sorteadas de Sempre',
    dbAliases: ['Mais Sorteadas de Sempre'],
    euromillions: {
      actionPostMax: 'DIRECT',
      historicalN: 52,
      directRate: 57.7,
      mirrorRate: 36.5,
      baseline: 43.7,
      lift: 14.0,
      pMax: 'Inércia comprovada na BD (N=52): 57.7% repete >=4 no Bloco Direto em W3 (53.8% recente; +14.0% sobre o acaso).'
    },
    totoloto: {
      actionPostMax: 'DIRECT',
      historicalN: 42,
      directRate: 47.6,
      mirrorRate: 42.9,
      baseline: 45.5,
      lift: 2.1,
      pMax: 'Inércia comprovada na BD (N=42): 47.6% mantém >=4 no Bloco Direto em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      pMax: 'Inércia: 86.7% mantém >=4 em W3.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      pMax: 'Inércia: 75.9% bate >=4 em W3.'
    }
  },
  mais_atrasados: {
    name: 'Mais Atrasados',
    dbAliases: ['Mais Atrasados', 'Late Numbers'],
    euromillions: {
      actionPostMax: 'DIRECT',
      historicalN: 49,
      directRate: 57.1,
      mirrorRate: 28.6,
      baseline: 43.7,
      lift: 13.4,
      pMax: 'Inércia comprovada na BD (N=49): 57.1% repete >=4 no Bloco Direto em W3 (vs 28.6% no Anti-Sistema; +13.4% sobre o acaso).'
    }
  },
  tiro_certeiro: {
    name: 'Tiro Certeiro',
    dbAliases: ['Tiro Certeiro'],
    euromillions: {
      actionPostMax: 'DIRECT',
      historicalN: 78,
      directRate: 55.1,
      mirrorRate: 35.9,
      baseline: 43.7,
      lift: 11.4,
      pMax: 'Inércia comprovada na BD (N=78): 55.1% repete >=4 no Bloco Direto em W3 (56.0% recente; +11.4% sobre o acaso).'
    },
    totoloto: {
      actionPostMax: 'DIRECT',
      historicalN: 34,
      directRate: 52.9,
      mirrorRate: 44.4,
      baseline: 45.5,
      lift: 7.4,
      pMax: 'Inércia comprovada na BD (N=34): 52.9% mantém >=4 no Bloco Direto em W3.'
    }
  },
  supersistema_neuronal: {
    name: 'SuperSistema Neuronal',
    dbAliases: ['SuperSistema Neuronal', 'Supersistema Neuronal'],
    totoloto: {
      actionPostMax: 'DIRECT',
      historicalN: 45,
      directRate: 57.8,
      mirrorRate: 26.7,
      baseline: 45.5,
      lift: 12.3,
      pMax: 'Inércia comprovada na BD (N=45): 57.8% repete >=4 no Bloco Direto em W3 (61.5% recente vs 26.7% no Anti-Sistema; +12.3% sobre o acaso).'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      pMax: 'Inércia neural: 85.7% de continuidade em W3 (+59% sobre o acaso de 26.3%).'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      pMax: 'Inércia: 77.8% bate >=4 em W3 (+58% sobre o acaso de 19.6%).'
    }
  },
  geometria_ciclos: {
    name: 'Geometria & Ciclos',
    dbAliases: ['Geometria & Ciclos'],
    totoloto: {
      actionPostMax: 'DIRECT',
      historicalN: 43,
      directRate: 58.1,
      mirrorRate: 37.2,
      baseline: 45.5,
      lift: 12.6,
      pMax: 'Inércia comprovada na BD (N=43): 58.1% repete >=4 no Bloco Direto em W3 (53.8% recente; +12.6% sobre o acaso).'
    }
  },
  separacao_aguas_v2: {
    name: 'Separação das Águas 2.0',
    dbAliases: ['Separação das Águas 2.0'],
    totoloto: {
      actionPostMax: 'DIRECT',
      historicalN: 52,
      directRate: 50.0,
      mirrorRate: 40.4,
      baseline: 45.5,
      lift: 4.5,
      pMax: 'Inércia imediata T+1: 26.9% repete 4 ou 5 no sorteio seguinte (dobro do Anti-Sistema); 50.0% concentra >=4 em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      historicalN: 33,
      directRate: 81.8,
      baseline: 70.0,
      lift: 11.8,
      pMax: 'Consistência de elite EuroDreams (N=33): 81.8% mantém >=4 acertos em W3 (91.7% recente; +11.8% sobre o acaso).'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      pMax: 'Inércia: 80.7% bate Quadra/Quina na janela W3.'
    }
  },
  harmonia_antigravity: {
    name: 'Harmonia Dimensional',
    dbAliases: ['Harmonia Dimensional', 'Harmonia Dimensional (Antigravity)'],
    eurodreams: {
      actionPostMax: 'DIRECT',
      historicalN: 39,
      directRate: 38.5,
      baseline: 24.9,
      lift: 13.6,
      pMax: 'Inércia de elite EuroDreams (N=39): 38.5% repete >=5 acertos em W3 (45.5% recente; +13.6% sobre o acaso de 24.9%).'
    }
  }
};

const DATA_FILE = path.join(process.cwd(), 'data', 'strategies_tracker.json');

export function loadStrategies(): StrategyEntry[] {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler strategies_tracker.json:', e);
    return [];
  }
}

export function saveStrategies(list: StrategyEntry[]) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

/**
 * Varredura direta e segura da Base de Dados Prisma (Draw e SystemPrediction).
 * Garante fidelidade de 100% à verdade do histórico sem recorrer a ficheiros com registos fantasma.
 */
export async function scanAndSyncStrategies(games: Array<'TOTOLOTO' | 'EUROMILLIONS' | 'EURODREAMS' | 'MEGASENA'> = ['TOTOLOTO', 'EUROMILLIONS', 'EURODREAMS', 'MEGASENA']): Promise<{
  added: number;
  updated: number;
  total: number;
}> {
  const currentStrategies: StrategyEntry[] = [];
  let addedCount = 0;
  let updatedCount = 0;

  for (const game of games) {
    const gameConfig = GAME_CONFIGS[game];
    if (!gameConfig) continue;
    const gameLower = game.toLowerCase();

    // 1. Obter todos os sorteios reais ordenados por data cronológica
    const draws = await prisma.draw.findMany({
      where: { game },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, numbers: true }
    });

    if (draws.length === 0) continue;

    for (const [sysSlug, meta] of Object.entries(SYSTEM_PROFILES)) {
      let profile: SystemProfileItem | undefined;
      if (game === 'TOTOLOTO') profile = meta.totoloto;
      else if (game === 'EUROMILLIONS') profile = meta.euromillions;
      else if (game === 'EURODREAMS') profile = meta.eurodreams;
      else if (game === 'MEGASENA') profile = meta.megasena;

      if (!profile) continue;

      // 2. Carregar predições reais da Base de Dados para o sistema
      const dbNames = meta.dbAliases && meta.dbAliases.length > 0 ? meta.dbAliases : [meta.name];
      const preds = await prisma.systemPrediction.findMany({
        where: {
          game,
          systemName: { in: dbNames },
          domain: 'NUMBERS'
        },
        select: {
          drawId: true,
          num_hits_25: true,
          num_hits_20: true,
          num_hits_30: true
        }
      });

      const predMap = new Map<number, number>();
      preds.forEach(p => {
        const val = p[gameConfig.hitCol];
        if (val !== null && val !== undefined) {
          predMap.set(p.drawId, val);
        }
      });

      // 3. Varrer histórico à procura de gatilhos reais (desde final de 2025 e 2026)
      for (let i = 0; i < draws.length; i++) {
        const curDraw = draws[i];
        const dateStr = curDraw.date.toISOString().split('T')[0];

        if (!dateStr || (!dateStr.startsWith('2026') && !dateStr.startsWith('2025-1'))) {
          continue;
        }

        const hits = predMap.get(curDraw.id);
        if (hits === undefined) continue;

        const isMaxHit = hits === gameConfig.pickSize;
        const isZeroHit = hits === 0;

        if (!isMaxHit && !isZeroHit) continue;

        const triggerType: 'JACKPOT_MAX' | 'ANTI_JACKPOT_0' = isMaxHit ? 'JACKPOT_MAX' : 'ANTI_JACKPOT_0';
        const targetSide = isMaxHit ? profile.actionPostMax : profile.actionPost0;
        const thesisEvidence = isMaxHit ? profile.pMax : profile.p0;

        // Filtro de Rigor: só regista se existir uma regra de valor comprovada na BD para este evento
        if (!targetSide || !thesisEvidence) continue;
        const triggerDesc = isMaxHit
          ? `Saiu Jackpot Máximo (${gameConfig.pickSize}/${gameConfig.pickSize} no Sistema Principal)`
          : `Saiu Anti-Jackpot (0/${gameConfig.pickSize} no Principal = ${gameConfig.pickSize}/${gameConfig.pickSize} no Anti-Sistema)`;

        const stratId = `${gameLower}_${sysSlug}_${curDraw.id}`;

        // 4. Acompanhamento rigoroso dos 3 sorteios cronologicamente seguintes
        const steps: StrategyDrawStep[] = [];
        let highestHit = 0;
        let success = false;
        let winningDraw: { step: string; drawId?: number; date?: string; hits: number } | null = null;

        for (let stepIdx = 1; stepIdx <= 3; stepIdx++) {
          const nextDraw = draws[i + stepIdx];
          const stepLabel: 'T+1' | 'T+2' | 'T+3' = `T+${stepIdx}` as any;

          if (!nextDraw) {
            steps.push({
              step: stepLabel,
              isPending: true
            });
            continue;
          }

          const nextDate = nextDraw.date.toISOString().split('T')[0];
          const nextDirectHits = predMap.get(nextDraw.id);

          if (nextDirectHits === undefined || nextDirectHits === null) {
            steps.push({
              step: stepLabel,
              drawId: nextDraw.id,
              date: nextDate,
              isPending: true
            });
            continue;
          }

          const apostaHits = targetSide === 'DIRECT' ? nextDirectHits : (gameConfig.pickSize - nextDirectHits);
          if (apostaHits > highestHit) highestHit = apostaHits;

          const isWinner = apostaHits >= gameConfig.winThreshold;
          if (isWinner && !success) {
            success = true;
            winningDraw = {
              step: stepLabel,
              drawId: nextDraw.id,
              date: nextDate,
              hits: apostaHits
            };
          }

          steps.push({
            step: stepLabel,
            drawId: nextDraw.id,
            date: nextDate,
            directHits: nextDirectHits,
            apostaHits,
            isWinner,
            isPending: false
          });
        }

        const isCompleted = steps.length === 3 && steps.every(s => !s.isPending);
        const status: 'ATIVA' | 'CONCRETIZADA' | 'EXPIRADA_SEM_PREMIO' = 
          success 
            ? 'CONCRETIZADA' 
            : (isCompleted ? 'EXPIRADA_SEM_PREMIO' : 'ATIVA');

        const nowIso = new Date().toISOString();

        currentStrategies.push({
          id: stratId,
          game,
          systemSlug: sysSlug,
          systemName: meta.name,
          triggerEvent: triggerType,
          triggerDate: dateStr,
          triggerDrawId: curDraw.id,
          triggerDescription: triggerDesc,
          targetSide,
          thesisEvidence,
          steps,
          highestHit,
          status,
          winningDraw,
          createdAt: nowIso,
          updatedAt: nowIso
        });
        addedCount++;
      }
    }
  }

  // Ordenar as estratégias pelas datas mais recentes no topo
  currentStrategies.sort((a, b) => new Date(b.triggerDate).getTime() - new Date(a.triggerDate).getTime());

  saveStrategies(currentStrategies);

  return {
    added: addedCount,
    updated: updatedCount,
    total: currentStrategies.length
  };
}

export function computeMetrics(strategies: StrategyEntry[]): StrategyMetrics {
  const total = strategies.length;
  const ativas = strategies.filter(s => s.status === 'ATIVA').length;
  const concretizadas = strategies.filter(s => s.status === 'CONCRETIZADA').length;
  const expiradas = strategies.filter(s => s.status === 'EXPIRADA_SEM_PREMIO').length;
  const concluidas = concretizadas + expiradas;
  const taxaConcretizacao = concluidas > 0 ? Math.round((concretizadas / concluidas) * 1000) / 10 : 0;

  return {
    total,
    ativas,
    concretizadas,
    expiradas,
    taxaConcretizacao
  };
}
