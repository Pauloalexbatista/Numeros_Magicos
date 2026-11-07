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
  actionPostMax: 'DIRECT' | 'MIRROR';
  actionPost0: 'DIRECT' | 'MIRROR';
  pMax: string;
  p0: string;
}

export const SYSTEM_PROFILES: Record<string, {
  name: string;
  dbAliases: string[];
  totoloto?: SystemProfileItem;
  euromillions?: SystemProfileItem;
  eurodreams?: SystemProfileItem;
  megasena?: SystemProfileItem;
}> = {
  piramide_pascal: {
    name: 'Pirâmide de Pascal',
    dbAliases: ['Pirâmide de Pascal'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia comprovada: 6.8% repete 5 em T+1 (2.4x superior ao acaso) e 45.5% tem >=4 na janela W3.',
      p0: 'Rebote de elite pós-zero: 56.4% de probabilidade de disparar 4 ou 5 na janela W3 (#1 do Totoloto).'
    },
    euromillions: {
      actionPostMax: 'MIRROR',
      actionPost0: 'DIRECT',
      pMax: 'Pêndulo violento: 53.1% bate 0 ou 1 em W3 (jogar no Anti-Sistema/25 rejeitadas).',
      p0: 'Rebote: 43.4% bate 4 ou 5 no Bloco Direto em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia contínua: 95.8% mantém >=4 acertos em W3 no EuroDreams.',
      p0: 'Rebote Pós-Zero: 100% (3 em 3) bateu >=4 nos sorteios seguintes.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 88.4% bate Quadra ou Quina em W3.',
      p0: 'Rebote: 65.2% bate Quina ou Sena após um zero em W3.'
    }
  },
  separacao_aguas: {
    name: 'Separação das Águas',
    dbAliases: ['Separação das Águas'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 46.2% repete >=4 na janela W3.',
      p0: 'Rebote pós-zero: 42.1% bate 4 ou 5 nos 3 sorteios seguintes.'
    },
    euromillions: {
      actionPostMax: 'MIRROR',
      actionPost0: 'DIRECT',
      pMax: 'Pêndulo: 51.5% vira para o Anti-Sistema nos 3 concursos seguintes.',
      p0: 'Rebote pós-zero: 44.8% responde com 4 ou 5 no Bloco Direto.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia contínua: 92.0% mantém >=4 em W3.',
      p0: 'Rebote: 100% responde com alta pontuação após zero.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 76.5% bate >=4 em W3.',
      p0: 'Rebote: 68.0% dispara Quina/Sena em W3.'
    }
  },
  separacao_aguas_v2: {
    name: 'Separação das Águas 2.0',
    dbAliases: ['Separação das Águas 2.0'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia imediata T+1: 35.0% repete 4 ou 5 no sorteio seguinte; 50.0% concentra >=4 em W3.',
      p0: 'Rebote pós-zero: 40.7% bate 4 ou 5 nos 3 sorteios seguintes.'
    },
    euromillions: {
      actionPostMax: 'MIRROR',
      actionPost0: 'DIRECT',
      pMax: 'Pêndulo clássico pós-5: 53.3% bate 0 ou 1 em W3 (virar para o Anti-Sistema).',
      p0: 'Rebote pós-zero: 46.5% responde com 4 ou 5 nos 3 sorteios seguintes.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia absoluta: 100% de vitórias em W3 após um acerto máximo.',
      p0: 'Rebote: 100% (5 em 5) bateu prémio após um zero em W3.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 80.7% bate Quadra/Quina na janela W3.',
      p0: 'Rebote líder: 75.0% dispara Quina/Sena nos 3 seguintes (#1 Mega-Sena).'
    }
  },
  supersistema_neuronal: {
    name: 'SuperSistema Neuronal AI',
    dbAliases: ['SuperSistema Neuronal', 'Supersistema Neuronal'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia máxima: 62.5% repete >=4 no bloco direto na janela W3 (#1 do Totoloto).',
      p0: 'Rebote: 40.5% bate 4 ou 5 em W3.'
    },
    euromillions: {
      actionPostMax: 'MIRROR',
      actionPost0: 'DIRECT',
      pMax: 'Pêndulo: 54.2% bate 0 ou 1 em W3 (desdobrar Anti-Sistema).',
      p0: 'Rebote de elite: 62.0% bate 4 ou 5 em W3 (#1 absoluto do Euromilhões).'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia neural: 85.7% de continuidade em W3.',
      p0: 'Rebote: 100% responde com alta pontuação após um zero.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 77.8% bate >=4 em W3.',
      p0: 'Rebote de elite: 78.1% dispara Quina/Sena em W3 (#2 Mega-Sena).'
    }
  },
  clustering: {
    name: 'Agrupamento (Clustering)',
    dbAliases: ['Agrupamento de Padrões (Clustering)', 'Agrupamento de PadrÃµes (Clustering)', 'Clustering'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia de cluster: 54.0% bate >=4 no Bloco Direto na janela W3.',
      p0: 'Rebote: 48.0% bate 4 ou 5 em W3.'
    },
    euromillions: {
      actionPostMax: 'MIRROR',
      actionPost0: 'DIRECT',
      pMax: 'Pêndulo: 48.8% vira para o Anti-Sistema em W3.',
      p0: 'Rebote: 51.0% bate 4 ou 5 em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 97.2% mantém alta pontuação em W3.',
      p0: 'Rebote: 100% bate >=4 nos 3 sorteios seguintes.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 78.6% bate >=4 em W3.',
      p0: 'Rebote: 61.5% bate Quina/Sena em W3.'
    }
  },
  diagonais_matriz: {
    name: 'Diagonais da Matriz 2D',
    dbAliases: ['Diagonais da Matriz', 'Diagonais da Matriz 2D'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 7.5% repete 5 logo em T+1; 47.2% concentra >=4 em W3.',
      p0: 'Rebote: 48.6% bate 4 ou 5 em W3.'
    },
    euromillions: {
      actionPostMax: 'MIRROR',
      actionPost0: 'DIRECT',
      pMax: 'Pêndulo: 46.4% vira para o Anti-Sistema em W3.',
      p0: 'Rebote: 53.7% bate 4 ou 5 em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia geométrica: 92.5% mantém alta pontuação em W3.',
      p0: 'Rebote: 100% bate >=4 nos 3 sorteios seguintes.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 75.4% bate >=4 em W3.',
      p0: 'Rebote: 69.8% bate Quina/Sena em W3.'
    }
  },
  mais_sorteadas_sempre: {
    name: 'Mais Sorteadas de Sempre',
    dbAliases: ['Mais Sorteadas de Sempre'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia contínua: 48.8% bate >=4 no Bloco Direto em W3.',
      p0: 'Rebote: 45.2% bate 4 ou 5 em W3.'
    },
    euromillions: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia contínua: Bloco Direto mantém >=4 em 57.7% dos casos em W3 (#1 Euromilhões).',
      p0: 'Rebote: 38.9% bate 4 ou 5 em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 86.7% mantém >=4 em W3.',
      p0: 'Rebote: 0/1 histórico.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 75.9% bate >=4 em W3.',
      p0: 'Rebote: 61.5% bate Quina/Sena em W3.'
    }
  },
  mais_quentes: {
    name: 'Mais Quentes (Hot)',
    dbAliases: ['Mais Quentes', 'Hot Numbers'],
    totoloto: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia quente: 14.6% repete 5 na janela W3 (#2 do Totoloto).',
      p0: 'Rebote: 40.5% bate 4 ou 5 em W3.'
    },
    euromillions: {
      actionPostMax: 'MIRROR',
      actionPost0: 'DIRECT',
      pMax: 'Pêndulo: 44.4% vira para o Anti-Sistema em W3.',
      p0: 'Rebote: 48.1% bate 4 ou 5 em W3.'
    },
    eurodreams: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 94.1% mantém >=4 em W3.',
      p0: 'Rebote: 0 ocorrências históricas de zero.'
    },
    megasena: {
      actionPostMax: 'DIRECT',
      actionPost0: 'DIRECT',
      pMax: 'Inércia: 80.2% bate >=4 em W3.',
      p0: 'Rebote: 77.8% dispara Quina/Sena em W3 (#3 Mega-Sena).'
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
