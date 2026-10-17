import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export type SeismicPhase = 'RESSACA' | 'ACUMULACAO' | 'ABALOS_PREMONITORIOS' | 'RUTURA_IMINENTE';

export interface SeismicPoint {
  drawId: number;
  date: string;
  hits: number; // 0 a 5 (ou 6)
  isJackpot: boolean;
  isForeshock: boolean; // magnitude 4
  windowForeshocks: number; // quantidade de 4s na janela de 25 sorteios
  delaySinceLastJackpot: number;
  tensionPercentage: number; // 0% a 100%
  phase: SeismicPhase;
}

export interface SeismicAnalysisResult {
  game: string;
  systemId: string;
  systemName: string;
  totalDraws: number;
  averageJackpotCycle: number;
  currentStatus: {
    drawId: number;
    date: string;
    delaySinceLastJackpot: number;
    windowForeshocks: number; // abalos nos ultimos 25
    tensionPercentage: number;
    phase: SeismicPhase;
    phaseLabel: string;
    phaseColor: string;
    advice: string;
  };
  stats: {
    totalJackpots: number;
    totalForeshocks: number;
    foreshockToJackpotRatio: number; // media de 4s entre cada 5
    maxTensionReached: number;
  };
  timeline: SeismicPoint[];
}

const CONSOLIDATED_DIR = path.resolve(process.cwd(), 'data/consolidated');

const GAME_SPECS: Record<string, { totalBalls: number; winCount: number; maxHits: number; windowSize: number }> = {
  euromillions: { totalBalls: 50, winCount: 5, maxHits: 5, windowSize: 25 },
  totoloto: { totalBalls: 49, winCount: 5, maxHits: 5, windowSize: 25 },
  eurodreams: { totalBalls: 40, winCount: 6, maxHits: 6, windowSize: 25 },
  megasena: { totalBalls: 60, winCount: 6, maxHits: 6, windowSize: 25 }
};

const SYSTEM_ALIASES: Record<string, string[]> = {
  clustering: ["agrupamentodepadroesclustering", "agrupamento", "clustering", "agrupamentodepadroes"],
  oscilacao_universal: ["sistemaoscilacaouniversalv2", "sistemaoscilacaouniversal", "oscilacaouniversal"],
  markov: ["transicoesdemarkov", "cadeiademarkov", "markov"],
  media_3_otimizado: ["sistemamedia3otimizado", "media3otimizado"],
  diagonais_matriz: ["diagonaisdamatriz"],
  diagonais_matriz_3d: ["diagonaisdamatriz3d"],
  random_forest: ["randomforest", "randomforestai"],
  supersistema_neuronal: ["supersistemaneuronal", "supersistema"],
  separacao_aguas: ["separacaodasaguas"],
  tiro_certeiro: ["tirocerteiro"],
  mais_quentes: ["maisquentes", "maisquentescalorinercia", "hot"],
  mais_sorteadas_sempre: ["maissorteadasdesempre"],
  ultimos_a_sair: ["ultimosasair", "ultimasasair"],
  piramide_pascal: ["piramidedepascal"],
  piramide_intervalos: ["piramidedeintervalos"],
  monte_carlo: ["montecarlo"],
  matriz_corte: ["matrizdecorte"]
};

function normalizeText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function matchesSystem(slug: string, dbSystemName: string): boolean {
  const sNorm = normalizeText(slug);
  const dbNorm = normalizeText(dbSystemName);
  if (slug === "diagonais_matriz" && dbNorm.includes("3d")) return false;
  if (dbNorm === sNorm) return true;
  const list = SYSTEM_ALIASES[slug];
  if (list && list.some(a => dbNorm === a || dbNorm.startsWith(a))) return true;
  return false;
}

export async function analyzeSeismicHistory(
  gameKey: string = 'euromillions',
  systemId: string = 'mais_quentes',
  maxTimelinePoints: number = 100
): Promise<SeismicAnalysisResult | null> {
  const specs = GAME_SPECS[gameKey] || GAME_SPECS['euromillions'];
  const fileName = `${systemId}_${gameKey}.json`;
  const filePath = path.join(CONSOLIDATED_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const rawData = JSON.parse(raw);
    if (!Array.isArray(rawData) || rawData.length === 0) return null;

    // Ordenar do mais antigo ao mais recente
    const draws = [...rawData].sort((a, b) => a.drawId - b.drawId);

    // Carregar novos sorteios em tempo real da base de dados Prisma (se existirem)
    try {
      const lastDrawDate = draws.length > 0 && draws[draws.length - 1].draw?.date
        ? new Date(draws[draws.length - 1].draw.date)
        : new Date(0);

      const dbNewDraws = await prisma.draw.findMany({
        where: {
          game: gameKey.toUpperCase(),
          date: { gt: lastDrawDate }
        },
        orderBy: { date: 'asc' },
        include: {
          systemPredictions: {
            where: { domain: 'NUMBERS' }
          }
        }
      });

      if (dbNewDraws && dbNewDraws.length > 0) {
        const predCutKey = gameKey === 'eurodreams' ? 'num_hits_20' : gameKey === 'megasena' ? 'num_hits_30' : 'num_hits_25';

        for (const nd of dbNewDraws) {
          const predRecord = nd.systemPredictions.find(sp => matchesSystem(systemId, sp.systemName));
          let hits = -1;

          if (predRecord) {
            hits = (predRecord as any)[predCutKey] ?? predRecord.num_hits_25 ?? -1;
            if (hits === -1 && predRecord.prediction && nd.numbers) {
              try {
                const p = typeof predRecord.prediction === 'string' ? JSON.parse(predRecord.prediction) : predRecord.prediction;
                const actual = typeof nd.numbers === 'string' ? JSON.parse(nd.numbers) : nd.numbers;
                if (Array.isArray(p) && Array.isArray(actual)) {
                  const pool = new Set(p.slice(0, Math.floor(specs.totalBalls / 2)));
                  hits = actual.filter((num: number) => pool.has(num)).length;
                }
              } catch {}
            }
          }

          if (hits >= 0) {
            draws.push({
              drawId: nd.id,
              prediction: predRecord?.prediction || null,
              cutoff: specs.totalBalls,
              num_hits_25: hits,
              num_hits_20: hits,
              num_hits_30: hits,
              draw: {
                date: nd.date.toISOString(),
                numbers: nd.numbers
              }
            });
          }
        }
      }
    } catch (dbErr) {
      console.warn('[Sismologia] Could not load live draws from Prisma, relying on consolidated file:', dbErr);
    }

    const timeline: SeismicPoint[] = [];
    const jackpotIndices: number[] = [];
    let foreshocksBetweenJackpots: number[] = [];
    let currentForeshockCount = 0;

    let delaySinceLastJackpot = 0;

    for (let i = 0; i < draws.length; i++) {
      const d = draws[i];
      // Obter os acertos para 25 bolas (ou 20 no Eurodreams, 30 na Megasena)
      let hits = d.num_hits_25 !== undefined ? d.num_hits_25 : (d.num_hits_20 !== undefined ? d.num_hits_20 : (d.num_hits_30 !== undefined ? d.num_hits_30 : -1));
      if (hits === -1 && d.prediction && d.draw?.numbers) {
        let p = typeof d.prediction === 'string' ? JSON.parse(d.prediction) : d.prediction;
        let n = typeof d.draw.numbers === 'string' ? JSON.parse(d.draw.numbers) : d.draw.numbers;
        if (Array.isArray(p) && Array.isArray(n)) {
          const pool = new Set(p.slice(0, Math.floor(specs.totalBalls / 2)));
          hits = n.filter((num: number) => pool.has(num)).length;
        }
      }
      if (hits < 0) hits = 0;

      const isJackpot = hits === specs.maxHits;
      const isForeshock = hits === (specs.maxHits - 1); // 4 acertos

      if (isJackpot) {
        jackpotIndices.push(i);
        foreshocksBetweenJackpots.push(currentForeshockCount);
        currentForeshockCount = 0;
        delaySinceLastJackpot = 0;
      } else {
        delaySinceLastJackpot++;
        if (isForeshock) {
          currentForeshockCount++;
        }
      }

      // Janela rolante de 25 sorteios: [max(0, i - 24) ... i]
      const windowStart = Math.max(0, i - (specs.windowSize - 1));
      let windowForeshocks = 0;
      for (let w = windowStart; w <= i; w++) {
        let wHits = draws[w].num_hits_25 !== undefined ? draws[w].num_hits_25 : (draws[w].num_hits_20 !== undefined ? draws[w].num_hits_20 : (draws[w].num_hits_30 !== undefined ? draws[w].num_hits_30 : -1));
        if (wHits === -1 && draws[w].prediction && draws[w].draw?.numbers) {
          let p = typeof draws[w].prediction === 'string' ? JSON.parse(draws[w].prediction) : draws[w].prediction;
          let n = typeof draws[w].draw.numbers === 'string' ? JSON.parse(draws[w].draw.numbers) : draws[w].draw.numbers;
          if (Array.isArray(p) && Array.isArray(n)) {
            const pool = new Set(p.slice(0, Math.floor(specs.totalBalls / 2)));
            wHits = n.filter((num: number) => pool.has(num)).length;
          }
        }
        if (wHits === (specs.maxHits - 1)) {
          windowForeshocks++;
        }
      }

      // Média esperada de ciclo
      const avgCycle = jackpotIndices.length > 1 
        ? Math.round(i / jackpotIndices.length) 
        : specs.windowSize;

      // Cálculo da Tensão Tectónica (% de 0 a 100)
      // Tensão sobe com atraso e saturação de abalos de magnitude 4
      const delayFactor = Math.min(1.5, delaySinceLastJackpot / avgCycle);
      const foreshockFactor = Math.min(1.5, windowForeshocks / 4); // 4 abalos é a quota crítica da Nazaré
      let tension = Math.min(100, Math.round((delayFactor * 50) + (foreshockFactor * 50)));

      // Determinação da Fase Sísmica
      let phase: SeismicPhase = 'ACUMULACAO';
      if (delaySinceLastJackpot <= 3) {
        phase = 'RESSACA';
        tension = Math.max(5, Math.round(tension * 0.25)); // pós-sismo liberta tensão
      } else if (windowForeshocks >= 3 && delaySinceLastJackpot >= Math.round(avgCycle * 0.75)) {
        phase = 'RUTURA_IMINENTE';
        tension = Math.max(85, tension);
      } else if (windowForeshocks >= 3) {
        phase = 'ABALOS_PREMONITORIOS';
        tension = Math.max(65, tension);
      } else {
        phase = 'ACUMULACAO';
      }

      timeline.push({
        drawId: d.drawId,
        date: d.draw?.date || '',
        hits,
        isJackpot,
        isForeshock,
        windowForeshocks,
        delaySinceLastJackpot,
        tensionPercentage: tension,
        phase
      });
    }

    // Médias globais
    const totalJackpots = jackpotIndices.length;
    const averageJackpotCycle = totalJackpots > 0 ? parseFloat((draws.length / totalJackpots).toFixed(1)) : specs.windowSize;
    const avgForeshockRatio = foreshocksBetweenJackpots.length > 0
      ? parseFloat((foreshocksBetweenJackpots.reduce((a, b) => a + b, 0) / foreshocksBetweenJackpots.length).toFixed(2))
      : 3.8;

    const totalForeshocks = timeline.filter(t => t.isForeshock).length;
    const maxTension = Math.max(...timeline.map(t => t.tensionPercentage));

    // Estado atual (último sorteio)
    const current = timeline[timeline.length - 1];

    let phaseLabel = 'Acumulação Tectónica';
    let phaseColor = '#3b82f6'; // azul
    let advice = 'A energia da falha está em fase inicial de carga. Siga a rotina normal.';

    if (current.phase === 'RUTURA_IMINENTE') {
      phaseLabel = '⚡ RUTURA IMINENTE (PONTO DE REBUÇADO)';
      phaseColor = '#ef4444'; // vermelho pulsante
      advice = 'ALERTA MÁXIMO: A janela de 25 sorteios acumulou os 4 abalos críticos e o atraso atingiu a zona de rutura. Probabilidade máxima de Jackpot iminente!';
    } else if (current.phase === 'ABALOS_PREMONITORIOS') {
      phaseLabel = '⚠️ Abalos Premonitórios Ativos';
      phaseColor = '#f59e0b'; // laranja
      advice = 'Atenção: A falha começou a libertar tremores de magnitude 4. A aproximação do pico da onda da Nazaré está em curso.';
    } else if (current.phase === 'RESSACA') {
      phaseLabel = '🌊 Ressaca Pós-Sismo';
      phaseColor = '#10b981'; // verde
      advice = 'O Jackpot saiu recentemente. A tensão tectónica desabou e o sistema entrou no vale da onda.';
    }

    // Limitar os pontos de timeline para o player temporal na UI (default: últimos 100 sorteios)
    const visibleTimeline = timeline.slice(-maxTimelinePoints);

    return {
      game: gameKey,
      systemId,
      systemName: systemId.replace(/_/g, ' ').toUpperCase(),
      totalDraws: draws.length,
      averageJackpotCycle,
      currentStatus: {
        drawId: current.drawId,
        date: current.date,
        delaySinceLastJackpot: current.delaySinceLastJackpot,
        windowForeshocks: current.windowForeshocks,
        tensionPercentage: current.tensionPercentage,
        phase: current.phase,
        phaseLabel,
        phaseColor,
        advice
      },
      stats: {
        totalJackpots,
        totalForeshocks,
        foreshockToJackpotRatio: avgForeshockRatio,
        maxTensionReached: maxTension
      },
      timeline: visibleTimeline
    };
  } catch (err) {
    console.error('Erro na análise sísmica:', err);
    return null;
  }
}
