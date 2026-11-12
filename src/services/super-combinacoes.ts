import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export type FusionMethod = 'INTERCALADO' | 'BORDA';
export type Polarity = 'D' | 'E';

export interface SystemComponent {
  systemId: string;
  polarity: Polarity;
}

export interface PresetFormula {
  id: string;
  title: string;
  subtitle: string;
  targetPool: 10 | 15 | 20 | 25 | 30;
  focus: 'JACKPOT_5' | 'HIGH_45' | 'HOT_20';
  method: FusionMethod;
  components: SystemComponent[];
  badge: string;
}

export const SYSTEM_LABELS: Record<string, string> = {
  clustering: 'Agrupamento (Clustering)',
  diagonais_matriz: 'Diagonais da Matriz 2D',
  diagonais_matriz_3d: 'Diagonais da Matriz 3D',
  harmonia_antigravity: 'Harmonia Dimensional',
  mais_quentes: 'Mais Quentes',
  mais_sorteadas_sempre: 'Mais Sorteadas de Sempre',
  markov: 'Transições de Markov',
  media_3_otimizado: 'Média +3 Otimizado',
  monte_carlo: 'Simulação Monte Carlo',
  oscilacao_universal: 'Oscilação Universal V2',
  piramide_intervalos: 'Pirâmide de Intervalos',
  piramide_pascal: 'Pirâmide de Pascal',
  separacao_aguas: 'Separação das Águas 1.0',
  separacao_aguas_v2: 'Separação das Águas 2.0',
  supersistema_neuronal: 'SuperSistema Neuronal',
  tiro_certeiro: 'Tiro Certeiro',
  ultimos_a_sair: 'Últimos a Sair',
};

const DB_SYSTEM_NAMES: Record<string, string> = {
  clustering: 'Agrupamento de Padrões (Clustering)',
  diagonais_matriz: 'Diagonais da Matriz',
  diagonais_matriz_3d: 'Diagonais da Matriz 3D',
  harmonia_antigravity: 'Harmonia Dimensional (Antigravity)',
  mais_quentes: 'Mais Quentes',
  mais_sorteadas_sempre: 'Mais Sorteadas de Sempre',
  markov: 'Transições de Markov',
  media_3_otimizado: 'Sistema Média +3 Otimizado',
  monte_carlo: 'Monte Carlo',
  oscilacao_universal: 'Sistema Oscilação Universal V2',
  piramide_intervalos: 'Pirâmide de Intervalos',
  piramide_pascal: 'Pirâmide de Pascal',
  separacao_aguas: 'Separação das Águas',
  separacao_aguas_v2: 'Separação das Águas 2.0',
  supersistema_neuronal: 'SuperSistema Neuronal',
  tiro_certeiro: 'Tiro Certeiro',
  ultimos_a_sair: 'Últimos a Sair',
};

export const CHAMPION_FORMULAS: PresetFormula[] = [
  // === 10 BOLAS ===
  {
    id: '10b_jackpot_5s',
    title: 'Campeão Absoluto 10 Bolas (Jackpots 5/5)',
    subtitle: 'Top 2 bolas de 5 especialistas intercaladas — 5 Jackpots em 10 bolas (20,8x acima do acaso!)',
    targetPool: 10,
    focus: 'JACKPOT_5',
    method: 'INTERCALADO',
    badge: '5 JACKPOTS EM 10B',
    components: [
      { systemId: 'diagonais_matriz_3d', polarity: 'E' },
      { systemId: 'piramide_intervalos', polarity: 'E' },
      { systemId: 'separacao_aguas', polarity: 'D' },
      { systemId: 'separacao_aguas_v2', polarity: 'D' },
      { systemId: 'supersistema_neuronal', polarity: 'D' },
    ],
  },
  {
    id: '10b_45_5s',
    title: 'Campeão 10 Bolas (Máximo 4+5 Acertos)',
    subtitle: 'Recordista de prémios altos (4 e 5 acertos) jogando apenas 10 números',
    targetPool: 10,
    focus: 'HIGH_45',
    method: 'INTERCALADO',
    badge: '23 VEZES 4+5 EM 10B',
    components: [
      { systemId: 'clustering', polarity: 'D' },
      { systemId: 'oscilacao_universal', polarity: 'D' },
      { systemId: 'piramide_intervalos', polarity: 'E' },
      { systemId: 'separacao_aguas', polarity: 'D' },
      { systemId: 'separacao_aguas_v2', polarity: 'D' },
    ],
  },

  // === 15 BOLAS ===
  {
    id: '15b_jackpot_5s',
    title: 'Campeão Absoluto 15 Bolas (Jackpots 5/5)',
    subtitle: 'Top 3 cirúrgico de 5 especialistas — 12 Jackpots em 15 bolas (o dobro do melhor sistema isolado!)',
    targetPool: 15,
    focus: 'JACKPOT_5',
    method: 'INTERCALADO',
    badge: '12 JACKPOTS EM 15B',
    components: [
      { systemId: 'clustering', polarity: 'D' },
      { systemId: 'diagonais_matriz', polarity: 'E' },
      { systemId: 'harmonia_antigravity', polarity: 'D' },
      { systemId: 'monte_carlo', polarity: 'E' },
      { systemId: 'tiro_certeiro', polarity: 'E' },
    ],
  },
  {
    id: '15b_45_5s',
    title: 'Campeão 15 Bolas (Máximo 4+5 Acertos)',
    subtitle: 'Consenso Borda de 5 sistemas — 78 vezes 4 ou 5 acertos em apenas 15 bolas',
    targetPool: 15,
    focus: 'HIGH_45',
    method: 'BORDA',
    badge: '78 VEZES 4+5 EM 15B',
    components: [
      { systemId: 'harmonia_antigravity', polarity: 'D' },
      { systemId: 'monte_carlo', polarity: 'E' },
      { systemId: 'oscilacao_universal', polarity: 'E' },
      { systemId: 'separacao_aguas_v2', polarity: 'E' },
      { systemId: 'supersistema_neuronal', polarity: 'D' },
    ],
  },
  {
    id: '15b_hot20_3s',
    title: 'Trio Quente 15 Bolas (Especialista Últimos 20 Sorteios)',
    subtitle: '4 prémios de 4+5 nos últimos 20 sorteios em apenas 15 bolas (20% de acerto recente!)',
    targetPool: 15,
    focus: 'HOT_20',
    method: 'INTERCALADO',
    badge: 'QUENTE ÚLT. 20',
    components: [
      { systemId: 'monte_carlo', polarity: 'E' },
      { systemId: 'piramide_intervalos', polarity: 'D' },
      { systemId: 'separacao_aguas', polarity: 'D' },
    ],
  },

  // === 20 BOLAS ===
  {
    id: '20b_jackpot_5s',
    title: 'O Ponto Doce — Campeão Absoluto 20 Bolas (5/5 + Forma Quente)',
    subtitle: 'Top 4 de 5 sistemas: 35 Jackpots e 174 vezes 4+5 em 20 bolas (2 Jackpots nos últimos 20 sorteios!)',
    targetPool: 20,
    focus: 'JACKPOT_5',
    method: 'INTERCALADO',
    badge: '35 JACKPOTS • 2 NOS ÚLT 20',
    components: [
      { systemId: 'diagonais_matriz', polarity: 'D' },
      { systemId: 'mais_sorteadas_sempre', polarity: 'D' },
      { systemId: 'media_3_otimizado', polarity: 'D' },
      { systemId: 'separacao_aguas_v2', polarity: 'D' },
      { systemId: 'supersistema_neuronal', polarity: 'D' },
    ],
  },
  {
    id: '20b_45_5s',
    title: 'Campeão 20 Bolas (Recorde de 200 Prémios 4+5)',
    subtitle: 'Atinge 4 ou 5 números em 1 a cada 10 sorteios jogando 20 bolas',
    targetPool: 20,
    focus: 'HIGH_45',
    method: 'INTERCALADO',
    badge: '200 VEZES 4+5 EM 20B',
    components: [
      { systemId: 'harmonia_antigravity', polarity: 'D' },
      { systemId: 'mais_sorteadas_sempre', polarity: 'D' },
      { systemId: 'piramide_intervalos', polarity: 'D' },
      { systemId: 'piramide_pascal', polarity: 'D' },
      { systemId: 'tiro_certeiro', polarity: 'D' },
    ],
  },

  // === 25 BOLAS ===
  {
    id: '25b_jackpot_5s',
    title: 'Campeão Absoluto 25 Bolas — #1 Acima do Tiro Certeiro (81 Jackpots)',
    subtitle: 'Supera o Tiro Certeiro (78) e a Separação das Águas 1.0 (66) em 25 bolas!',
    targetPool: 25,
    focus: 'JACKPOT_5',
    method: 'BORDA',
    badge: '81 JACKPOTS (#1 GERAL)',
    components: [
      { systemId: 'diagonais_matriz_3d', polarity: 'E' },
      { systemId: 'mais_sorteadas_sempre', polarity: 'D' },
      { systemId: 'markov', polarity: 'D' },
      { systemId: 'piramide_intervalos', polarity: 'E' },
      { systemId: 'supersistema_neuronal', polarity: 'D' },
    ],
  },
  {
    id: '25b_45_5s',
    title: 'Campeão Absoluto 25 Bolas — #1 em 4 Acertos e 4+5 (409 Vezes)',
    subtitle: '357 prémios de 4 + 52 Jackpots = 409 vezes 4+5 em 25 bolas (mais de 1 em cada 5 sorteios!)',
    targetPool: 25,
    focus: 'HIGH_45',
    method: 'BORDA',
    badge: '409 VEZES 4+5 (#1 GERAL)',
    components: [
      { systemId: 'diagonais_matriz', polarity: 'E' },
      { systemId: 'mais_quentes', polarity: 'D' },
      { systemId: 'monte_carlo', polarity: 'D' },
      { systemId: 'oscilacao_universal', polarity: 'D' },
      { systemId: 'supersistema_neuronal', polarity: 'D' },
    ],
  },
  {
    id: '25b_balanced_5s',
    title: 'Super-Híbrido 25 Bolas (67 Jackpots + 341 de 4 = 408 Vezes 4+5)',
    subtitle: 'Equilíbrio de elite entre 5/5 (67) e 4/5 (341), com 2 Jackpots nos últimos 20 sorteios!',
    targetPool: 25,
    focus: 'HOT_20',
    method: 'BORDA',
    badge: '67 JACKS + 408 (4+5)',
    components: [
      { systemId: 'clustering', polarity: 'E' },
      { systemId: 'diagonais_matriz', polarity: 'D' },
      { systemId: 'mais_quentes', polarity: 'D' },
      { systemId: 'mais_sorteadas_sempre', polarity: 'D' },
      { systemId: 'media_3_otimizado', polarity: 'D' },
    ],
  },

  // === 30 BOLAS ===
  {
    id: '30b_jackpot_4s',
    title: 'Campeão Absoluto 30 Bolas (184 Jackpots 5/5)',
    subtitle: 'Quarteto intercalado recordista absoluto de 5/5 em 30 bolas',
    targetPool: 30,
    focus: 'JACKPOT_5',
    method: 'INTERCALADO',
    badge: '184 JACKPOTS EM 30B',
    components: [
      { systemId: 'diagonais_matriz', polarity: 'E' },
      { systemId: 'markov', polarity: 'D' },
      { systemId: 'media_3_otimizado', polarity: 'D' },
      { systemId: 'supersistema_neuronal', polarity: 'D' },
    ],
  },
  {
    id: '30b_45_5s',
    title: 'Campeão Absoluto 30 Bolas (731 Vezes 4+5 + 170 Jackpots)',
    subtitle: 'Acerta 4 ou 5 números em 36,9% de todos os sorteios (e 11 vezes nos últimos 20 sorteios!)',
    targetPool: 30,
    focus: 'HIGH_45',
    method: 'INTERCALADO',
    badge: '731 VEZES 4+5 (55% ÚLT 20)',
    components: [
      { systemId: 'diagonais_matriz', polarity: 'E' },
      { systemId: 'media_3_otimizado', polarity: 'D' },
      { systemId: 'monte_carlo', polarity: 'D' },
      { systemId: 'separacao_aguas_v2', polarity: 'D' },
      { systemId: 'supersistema_neuronal', polarity: 'D' },
    ],
  },
];

// Cache in memory for fast response
let cachedAlignedDraws: Array<{
  drawId: number;
  date: string;
  win: number[];
  preds: Record<string, number[]>;
}> | null = null;
let cachedAt = 0;

function ensureFull50(pred: number[]): number[] {
  const seen = new Uint8Array(51);
  const res: number[] = [];
  for (const b of pred) {
    if (b >= 1 && b <= 50 && !seen[b]) {
      seen[b] = 1;
      res.push(b);
    }
  }
  for (let b = 1; b <= 50; b++) {
    if (!seen[b]) res.push(b);
  }
  return res;
}

export async function getAlignedHistoricalDraws() {
  if (cachedAlignedDraws && Date.now() - cachedAt < 120_000) {
    return cachedAlignedDraws;
  }

  const dir = path.resolve(process.cwd(), 'data/consolidated');
  const drawMap = new Map<number, { drawId: number; date: string; win: number[]; preds: Record<string, number[]> }>();
  const sysKeys = Object.keys(SYSTEM_LABELS);

  for (const sysId of sysKeys) {
    const filePath = path.join(dir, `${sysId}_euromillions.json`);
    if (!fs.existsSync(filePath)) continue;
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const arr = Array.isArray(raw) ? raw : [];
    for (const row of arr) {
      const pred = typeof row.prediction === 'string' ? JSON.parse(row.prediction) : row.prediction;
      const win = typeof row.draw?.numbers === 'string' ? JSON.parse(row.draw.numbers) : row.draw?.numbers;
      if (!pred || pred.length < 50 || !win || win.length !== 5) continue;
      if (!drawMap.has(row.drawId)) {
        drawMap.set(row.drawId, {
          drawId: row.drawId,
          date: (row.draw?.date || '').slice(0, 10),
          win,
          preds: {},
        });
      }
      drawMap.get(row.drawId)!.preds[sysId] = ensureFull50(pred);
    }
  }

  // Supplement with any newer draws from Prisma SystemPrediction (e.g. synced from VPS after JSON export)
  let maxJsonDrawId = 0;
  for (const k of drawMap.keys()) {
    if (k > maxJsonDrawId) maxJsonDrawId = k;
  }

  try {
    const dbNewRows = await prisma.systemPrediction.findMany({
      where: {
        game: 'EUROMILLIONS',
        domain: 'NUMBERS',
        drawId: { gt: maxJsonDrawId },
      },
      include: { draw: true },
      orderBy: { drawId: 'asc' },
    });

    const reverseDbMap: Record<string, string> = {};
    for (const [slug, dbName] of Object.entries(DB_SYSTEM_NAMES)) {
      reverseDbMap[dbName] = slug;
    }

    for (const r of dbNewRows) {
      const slug = reverseDbMap[r.systemName];
      if (!slug || !r.draw) continue;
      const pred = typeof r.prediction === 'string' ? JSON.parse(r.prediction) : r.prediction;
      const win = typeof r.draw.numbers === 'string' ? JSON.parse(r.draw.numbers) : r.draw.numbers;
      if (!Array.isArray(pred) || pred.length < 25 || !Array.isArray(win) || win.length !== 5) continue;
      if (!drawMap.has(r.drawId)) {
        drawMap.set(r.drawId, {
          drawId: r.drawId,
          date: r.draw.date.toISOString().slice(0, 10),
          win,
          preds: {},
        });
      }
      drawMap.get(r.drawId)!.preds[slug] = ensureFull50(pred);
    }
  } catch (e) {
    console.error('Aviso ao suplementar sorteios recentes da BD:', e);
  }

  const aligned = [...drawMap.values()]
    .filter((d) => sysKeys.every((s) => Boolean(d.preds[s])))
    .sort((a, b) => a.drawId - b.drawId);

  cachedAlignedDraws = aligned;
  cachedAt = Date.now();
  return aligned;
}

export function combinePredictions(
  lists: number[][],
  method: FusionMethod
): number[] {
  const k = lists.length;
  if (k === 0) return [];

  if (method === 'INTERCALADO') {
    const seen = new Uint8Array(51);
    const result: number[] = [];
    for (let pos = 0; pos < 50; pos++) {
      for (let i = 0; i < k; i++) {
        const ball = lists[i][pos];
        if (ball >= 1 && ball <= 50 && !seen[ball]) {
          seen[ball] = 1;
          result.push(ball);
        }
      }
    }
    return result;
  } else {
    // BORDA (Rank sum across all systems)
    const rankSums = new Int32Array(51);
    const firstRank = new Int32Array(51);
    for (let i = 0; i < k; i++) {
      const arr = lists[i];
      for (let r = 0; r < arr.length; r++) {
        const b = arr[r];
        rankSums[b] += r;
        if (i === 0) firstRank[b] = r;
      }
    }
    const balls = Array.from({ length: 50 }, (_, idx) => idx + 1);
    balls.sort((a, b) => rankSums[a] - rankSums[b] || firstRank[a] - firstRank[b]);
    return balls;
  }
}

export async function evaluateSuperCombination(
  components: SystemComponent[],
  method: FusionMethod
) {
  const draws = await getAlignedHistoricalDraws();
  const poolSizes = [10, 15, 20, 25, 30] as const;

  const statsByPool: Record<
    number,
    {
      hits5: number;
      hits4: number;
      hits45: number;
      hits3: number;
      last20_5: number;
      last20_4: number;
      last20_45: number;
      expected5: number;
      expected45: number;
    }
  > = {};

  function comb(n: number, r: number): number {
    if (r < 0 || r > n) return 0;
    let res = 1;
    for (let i = 1; i <= r; i++) res = (res * (n - i + 1)) / i;
    return res;
  }
  const totalC = comb(50, 5);

  for (const p of poolSizes) {
    const p5 = comb(p, 5) / totalC;
    const p4 = (comb(p, 4) * comb(50 - p, 1)) / totalC;
    statsByPool[p] = {
      hits5: 0,
      hits4: 0,
      hits45: 0,
      hits3: 0,
      last20_5: 0,
      last20_4: 0,
      last20_45: 0,
      expected5: Number((p5 * draws.length).toFixed(2)),
      expected45: Number(((p5 + p4) * draws.length).toFixed(2)),
    };
  }

  const recent20Draws: Array<{
    drawId: number;
    date: string;
    winningNumbers: number[];
    rankedPool30: number[];
    hitsByPool: Record<number, number>;
  }> = [];

  const startRecentIdx = Math.max(0, draws.length - 20);

  for (let i = 0; i < draws.length; i++) {
    const d = draws[i];
    const isLast20 = i >= startRecentIdx;

    const lists: number[][] = components.map((c) => {
      const base = d.preds[c.systemId];
      return c.polarity === 'D' ? base : base.slice().reverse();
    });

    const combined50 = combinePredictions(lists, method);
    const winSet = new Set(d.win);

    const hitsByPool: Record<number, number> = {};
    let currentHits = 0;
    for (let idx = 0; idx < 30; idx++) {
      if (winSet.has(combined50[idx])) currentHits++;
      const count = idx + 1;
      if (count === 10 || count === 15 || count === 20 || count === 25 || count === 30) {
        hitsByPool[count] = currentHits;
        const st = statsByPool[count];
        if (currentHits === 5) {
          st.hits5++;
          if (isLast20) st.last20_5++;
        } else if (currentHits === 4) {
          st.hits4++;
          if (isLast20) st.last20_4++;
        } else if (currentHits === 3) {
          st.hits3++;
        }
        if (currentHits >= 4) {
          st.hits45++;
          if (isLast20) st.last20_45++;
        }
      }
    }

    if (isLast20) {
      recent20Draws.push({
        drawId: d.drawId,
        date: d.date,
        winningNumbers: d.win,
        rankedPool30: combined50.slice(0, 30),
        hitsByPool,
      });
    }
  }

  // Calculate Next Draw Prediction from CachedPrediction (live) or fallback to latest draw
  const nextDrawLists: number[][] = [];
  for (const c of components) {
    const dbName = DB_SYSTEM_NAMES[c.systemId];
    let full50: number[] | null = null;
    if (dbName) {
      const cached = await prisma.cachedPrediction.findUnique({
        where: {
          systemName_game: {
            systemName: dbName,
            game: 'EUROMILLIONS',
          },
        },
      });
      if (cached && cached.numbers) {
        const direct25 = JSON.parse(cached.numbers);
        const worst25 = cached.worstNumbers ? JSON.parse(cached.worstNumbers) : [];
        full50 = ensureFull50([...direct25, ...worst25]);
      }
    }
    if (!full50 && draws.length > 0) {
      full50 = draws[draws.length - 1].preds[c.systemId];
    }
    if (full50) {
      nextDrawLists.push(c.polarity === 'D' ? full50 : full50.slice().reverse());
    }
  }

  const nextDrawRanked50 = combinePredictions(nextDrawLists, method);

  return {
    totalDraws: draws.length,
    latestDrawDate: draws.length > 0 ? draws[draws.length - 1].date : '',
    statsByPool,
    recent20Draws: recent20Draws.reverse(), // newest first
    nextDrawPools: {
      10: nextDrawRanked50.slice(0, 10),
      15: nextDrawRanked50.slice(0, 15),
      20: nextDrawRanked50.slice(0, 20),
      25: nextDrawRanked50.slice(0, 25),
      30: nextDrawRanked50.slice(0, 30),
      ordered30: nextDrawRanked50.slice(0, 30),
    },
  };
}
