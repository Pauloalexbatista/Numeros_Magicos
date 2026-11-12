import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export type SupportedGame = 'EUROMILLIONS' | 'TOTOLOTO' | 'EURODREAMS' | 'MEGASENA' | 'LOTOFACIL';
export type FusionMethod = 'INTERCALADO' | 'BORDA';
export type Polarity = 'D' | 'E';

export interface SystemComponent {
  systemId: string;
  polarity: Polarity;
}

export interface PresetFormula {
  id: string;
  game: SupportedGame;
  title: string;
  subtitle: string;
  targetPool: number;
  focus: 'JACKPOT_5' | 'HIGH_45' | 'HOT_20';
  method: FusionMethod;
  components: SystemComponent[];
  badge: string;
}

export interface GameSpec {
  game: SupportedGame;
  label: string;
  flag: string;
  totalBalls: number;
  winBalls: number;
  jackpotLabel: string;
  secondPrizeLabel: string;
  pools: number[];
  defaultPool: number;
}

export const GAME_SPECS: Record<SupportedGame, GameSpec> = {
  EUROMILLIONS: {
    game: 'EUROMILLIONS',
    label: 'Euromilhões',
    flag: '🇪🇺',
    totalBalls: 50,
    winBalls: 5,
    jackpotLabel: 'Jackpot (5/5)',
    secondPrizeLabel: '2.º Prémio (4/5)',
    pools: [10, 15, 20, 25, 30],
    defaultPool: 20
  },
  TOTOLOTO: {
    game: 'TOTOLOTO',
    label: 'Totoloto',
    flag: '🇵🇹',
    totalBalls: 49,
    winBalls: 5,
    jackpotLabel: 'Jackpot (5/5)',
    secondPrizeLabel: '2.º Prémio (4/5)',
    pools: [10, 15, 20, 25, 30],
    defaultPool: 20
  },
  EURODREAMS: {
    game: 'EURODREAMS',
    label: 'EuroDreams',
    flag: '💶',
    totalBalls: 40,
    winBalls: 6,
    jackpotLabel: '1.º Prémio (6/6)',
    secondPrizeLabel: '2.º Prémio (5/6)',
    pools: [10, 15, 20, 25],
    defaultPool: 15
  },
  MEGASENA: {
    game: 'MEGASENA',
    label: 'Mega-Sena',
    flag: '🇧🇷',
    totalBalls: 60,
    winBalls: 6,
    jackpotLabel: 'Sena (6/6)',
    secondPrizeLabel: 'Quina (5/6)',
    pools: [10, 15, 20, 25, 30],
    defaultPool: 20
  },
  LOTOFACIL: {
    game: 'LOTOFACIL',
    label: 'Lotofácil',
    flag: '🇧🇷',
    totalBalls: 25,
    winBalls: 15,
    jackpotLabel: '15 Acertos (15/15)',
    secondPrizeLabel: '14 Acertos (14/15)',
    pools: [16, 17, 18, 19, 20],
    defaultPool: 18
  }
};

export const SYSTEM_LABELS: Record<string, string> = {
  clustering: 'Agrupamento (Clustering)',
  diagonais_matriz: 'Diagonais da Matriz 2D',
  diagonais_matriz_3d: 'Diagonais da Matriz 3D',
  geometria_ciclos: 'Geometria & Ciclos',
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
  geometria_ciclos: 'Geometria & Ciclos',
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

export const CHAMPION_FORMULAS_BY_GAME: Record<SupportedGame, PresetFormula[]> = {
  EUROMILLIONS: [
    {
      id: 'euro_10b_jackpot',
      game: 'EUROMILLIONS',
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
      id: 'euro_15b_jackpot',
      game: 'EUROMILLIONS',
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
      id: 'euro_15b_hot',
      game: 'EUROMILLIONS',
      title: 'Trio Quente 15 Bolas (Forma Últimos 20)',
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
    {
      id: 'euro_20b_jackpot',
      game: 'EUROMILLIONS',
      title: 'O Ponto Doce — Campeão 20 Bolas (5/5 + Forma Quente)',
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
      id: 'euro_25b_jackpot',
      game: 'EUROMILLIONS',
      title: 'Campeão Absoluto 25 Bolas (81 Jackpots 5/5)',
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
      id: 'euro_25b_45',
      game: 'EUROMILLIONS',
      title: 'Campeão 25 Bolas (409 Vezes 4+5 Acertos)',
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
      id: 'euro_30b_45',
      game: 'EUROMILLIONS',
      title: 'Campeão 30 Bolas (731 Vezes 4+5 + 170 Jackpots)',
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
  ],

  TOTOLOTO: [
    {
      id: 'toto_10b_jackpot',
      game: 'TOTOLOTO',
      title: 'Campeão 10 Bolas (Totoloto Jackpots 5/5)',
      subtitle: 'Quarteto intercalado recordista de 5 acertos em apenas 10 números',
      targetPool: 10,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '4 JACKPOTS EM 10B',
      components: [
        { systemId: 'diagonais_matriz', polarity: 'D' },
        { systemId: 'diagonais_matriz_3d', polarity: 'D' },
        { systemId: 'monte_carlo', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'E' },
      ],
    },
    {
      id: 'toto_15b_jackpot',
      game: 'TOTOLOTO',
      title: 'Campeão 15 Bolas (12 Jackpots 5/5)',
      subtitle: 'Quinteto intercalado com 12 Jackpots e 46 prémios de 4+5 em 15 bolas',
      targetPool: 15,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '12 JACKPOTS EM 15B',
      components: [
        { systemId: 'markov', polarity: 'D' },
        { systemId: 'oscilacao_universal', polarity: 'D' },
        { systemId: 'piramide_intervalos', polarity: 'E' },
        { systemId: 'piramide_pascal', polarity: 'E' },
        { systemId: 'separacao_aguas_v2', polarity: 'D' },
      ],
    },
    {
      id: 'toto_20b_jackpot',
      game: 'TOTOLOTO',
      title: 'Ponto Doce 20 Bolas (34 Jackpots 5/5)',
      subtitle: 'Consenso Borda de 5 especialistas com 34 Jackpots e 141 vezes 4+5',
      targetPool: 20,
      focus: 'JACKPOT_5',
      method: 'BORDA',
      badge: '34 JACKPOTS EM 20B',
      components: [
        { systemId: 'clustering', polarity: 'D' },
        { systemId: 'harmonia_antigravity', polarity: 'E' },
        { systemId: 'markov', polarity: 'D' },
        { systemId: 'media_3_otimizado', polarity: 'D' },
        { systemId: 'piramide_pascal', polarity: 'E' },
      ],
    },
    {
      id: 'toto_25b_jackpot',
      game: 'TOTOLOTO',
      title: 'Campeão Absoluto 25 Bolas (75 Jackpots 5/5)',
      subtitle: 'Quarteto intercalado recordista absoluto do Totoloto em 25 bolas',
      targetPool: 25,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '75 JACKPOTS EM 25B',
      components: [
        { systemId: 'diagonais_matriz', polarity: 'E' },
        { systemId: 'markov', polarity: 'D' },
        { systemId: 'piramide_intervalos', polarity: 'D' },
        { systemId: 'separacao_aguas_v2', polarity: 'D' },
      ],
    },
    {
      id: 'toto_30b_sum',
      game: 'TOTOLOTO',
      title: 'Cobertura Máxima 30 Bolas (147 Jackpots + 610 vezes 4+5)',
      subtitle: 'Atinge 4 ou 5 números em quase 40% de todos os sorteios do Totoloto',
      targetPool: 30,
      focus: 'HIGH_45',
      method: 'INTERCALADO',
      badge: '610 VEZES 4+5 EM 30B',
      components: [
        { systemId: 'clustering', polarity: 'D' },
        { systemId: 'media_3_otimizado', polarity: 'D' },
        { systemId: 'piramide_pascal', polarity: 'D' },
        { systemId: 'supersistema_neuronal', polarity: 'E' },
        { systemId: 'tiro_certeiro', polarity: 'E' },
      ],
    },
  ],

  EURODREAMS: [
    {
      id: 'dreams_15b_jackpot',
      game: 'EURODREAMS',
      title: 'Trio Cirúrgico 15 Bolas (6 Primeiros Prémios 6/6)',
      subtitle: 'Atinge o prémio máximo (6 números) em apenas 15 bolas',
      targetPool: 15,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '6 SENAS EM 15B',
      components: [
        { systemId: 'supersistema_neuronal', polarity: 'D' },
        { systemId: 'tiro_certeiro', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'D' },
      ],
    },
    {
      id: 'dreams_20b_jackpot',
      game: 'EURODREAMS',
      title: 'Campeão Absoluto 20 Bolas (14 Primeiros Prémios 6/6)',
      subtitle: 'Fusão de 5 sistemas com 14 acertos de 6 e 2 nos últimos 20 sorteios',
      targetPool: 20,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '14 VEZES 6/6 EM 20B',
      components: [
        { systemId: 'harmonia_antigravity', polarity: 'D' },
        { systemId: 'separacao_aguas', polarity: 'D' },
        { systemId: 'supersistema_neuronal', polarity: 'D' },
        { systemId: 'tiro_certeiro', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'D' },
      ],
    },
    {
      id: 'dreams_20b_sum',
      game: 'EURODREAMS',
      title: 'Máximo 5+6 Acertos 20 Bolas (55 Vezes)',
      subtitle: 'Atinge 5 ou 6 números em 18,4% de todos os sorteios do EuroDreams',
      targetPool: 20,
      focus: 'HIGH_45',
      method: 'INTERCALADO',
      badge: '55 VEZES 5+6 EM 20B',
      components: [
        { systemId: 'harmonia_antigravity', polarity: 'D' },
        { systemId: 'piramide_pascal', polarity: 'D' },
        { systemId: 'separacao_aguas', polarity: 'E' },
        { systemId: 'supersistema_neuronal', polarity: 'D' },
        { systemId: 'tiro_certeiro', polarity: 'D' },
      ],
    },
    {
      id: 'dreams_25b_jackpot',
      game: 'EURODREAMS',
      title: 'Campeão 25 Bolas (32 Primeiros Prémios 6/6)',
      subtitle: '32 acertos de 6 números em 299 sorteios (mais de 1 a cada 10 sorteios)',
      targetPool: 25,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '32 VEZES 6/6 EM 25B',
      components: [
        { systemId: 'harmonia_antigravity', polarity: 'E' },
        { systemId: 'mais_sorteadas_sempre', polarity: 'D' },
        { systemId: 'supersistema_neuronal', polarity: 'D' },
        { systemId: 'tiro_certeiro', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'D' },
      ],
    },
  ],

  MEGASENA: [
    {
      id: 'mega_15b_jackpot',
      game: 'MEGASENA',
      title: 'Campeão 15 Bolas (4 Senas em 15 Números)',
      subtitle: 'Quarteto cirúrgico intercalado: acertou a Sena em apenas 15 bolas',
      targetPool: 15,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '4 SENAS EM 15B',
      components: [
        { systemId: 'diagonais_matriz', polarity: 'D' },
        { systemId: 'piramide_pascal', polarity: 'E' },
        { systemId: 'tiro_certeiro', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'E' },
      ],
    },
    {
      id: 'mega_20b_jackpot',
      game: 'MEGASENA',
      title: 'Campeão 20 Bolas (11 Senas em 20 Números)',
      subtitle: 'Quarteto com 11 Senas e 50 prémios de Quina/Sena em 20 números',
      targetPool: 20,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '11 SENAS EM 20B',
      components: [
        { systemId: 'diagonais_matriz_3d', polarity: 'E' },
        { systemId: 'harmonia_antigravity', polarity: 'D' },
        { systemId: 'supersistema_neuronal', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'D' },
      ],
    },
    {
      id: 'mega_25b_jackpot',
      game: 'MEGASENA',
      title: 'Campeão 25 Bolas (29 Senas e 137 Quinas/Senas)',
      subtitle: 'Quinteto intercalado de máxima precisão na Mega-Sena',
      targetPool: 25,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '29 SENAS EM 25B',
      components: [
        { systemId: 'diagonais_matriz_3d', polarity: 'E' },
        { systemId: 'harmonia_antigravity', polarity: 'D' },
        { systemId: 'piramide_pascal', polarity: 'E' },
        { systemId: 'supersistema_neuronal', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'D' },
      ],
    },
    {
      id: 'mega_30b_jackpot',
      game: 'MEGASENA',
      title: 'Campeão Absoluto 30 Bolas (72 Senas e 350 Quinas/Senas)',
      subtitle: 'Consenso Borda com 72 Senas atingidas em metade do volante',
      targetPool: 30,
      focus: 'JACKPOT_5',
      method: 'BORDA',
      badge: '72 SENAS EM 30B',
      components: [
        { systemId: 'piramide_pascal', polarity: 'E' },
        { systemId: 'separacao_aguas', polarity: 'D' },
        { systemId: 'separacao_aguas_v2', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'D' },
      ],
    },
  ],

  LOTOFACIL: [
    {
      id: 'loto_17b_jackpot',
      game: 'LOTOFACIL',
      title: 'Trio Cirúrgico 17 Bolas (3 Vezes 15 Acertos)',
      subtitle: 'Atinge os 15 acertos máximos jogando apenas 17 números (volante tem 25)',
      targetPool: 17,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '3 VEZES 15 EM 17B',
      components: [
        { systemId: 'diagonais_matriz', polarity: 'E' },
        { systemId: 'markov', polarity: 'D' },
        { systemId: 'piramide_pascal', polarity: 'E' },
      ],
    },
    {
      id: 'loto_18b_jackpot',
      game: 'LOTOFACIL',
      title: 'Campeão 18 Bolas (7 Vezes 15 e 34 Vezes 14+15)',
      subtitle: 'Consenso Borda de 5 sistemas com 7 prémios máximos em 18 números',
      targetPool: 18,
      focus: 'JACKPOT_5',
      method: 'BORDA',
      badge: '7 VEZES 15 EM 18B',
      components: [
        { systemId: 'diagonais_matriz_3d', polarity: 'E' },
        { systemId: 'mais_quentes', polarity: 'E' },
        { systemId: 'mais_sorteadas_sempre', polarity: 'D' },
        { systemId: 'piramide_pascal', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'E' },
      ],
    },
    {
      id: 'loto_19b_jackpot',
      game: 'LOTOFACIL',
      title: 'Campeão 19 Bolas (16 Vezes 15 e 115 Vezes 14+15)',
      subtitle: 'Quarteto Borda com 16 prémios de 15 acertos em 19 números',
      targetPool: 19,
      focus: 'JACKPOT_5',
      method: 'BORDA',
      badge: '16 VEZES 15 EM 19B',
      components: [
        { systemId: 'diagonais_matriz', polarity: 'E' },
        { systemId: 'mais_quentes', polarity: 'E' },
        { systemId: 'mais_sorteadas_sempre', polarity: 'D' },
        { systemId: 'monte_carlo', polarity: 'D' },
      ],
    },
    {
      id: 'loto_20b_jackpot',
      game: 'LOTOFACIL',
      title: 'Campeão Absoluto 20 Bolas (44 Vezes 15 e 296 Vezes 14+15)',
      subtitle: 'Intercalação de 5 sistemas: 44 prémios de 15 e 296 prémios de 14 ou 15 acertos',
      targetPool: 20,
      focus: 'JACKPOT_5',
      method: 'INTERCALADO',
      badge: '44 VEZES 15 EM 20B',
      components: [
        { systemId: 'diagonais_matriz', polarity: 'D' },
        { systemId: 'diagonais_matriz_3d', polarity: 'D' },
        { systemId: 'markov', polarity: 'D' },
        { systemId: 'media_3_otimizado', polarity: 'E' },
        { systemId: 'ultimos_a_sair', polarity: 'E' },
      ],
    },
  ],
};

// In-memory cache for aligned draws per game
const cachedAlignedDrawsByGame: Partial<Record<SupportedGame, Array<{
  drawId: number;
  date: string;
  win: number[];
  preds: Record<string, number[]>;
}>>> = {};
const cacheTimestamps: Partial<Record<SupportedGame, number>> = {};

function ensureFullPool(pred: number[], totalBalls: number): number[] {
  const seen = new Uint8Array(totalBalls + 1);
  const res: number[] = [];
  for (const b of pred) {
    if (b >= 1 && b <= totalBalls && !seen[b]) {
      seen[b] = 1;
      res.push(b);
    }
  }
  for (let b = 1; b <= totalBalls; b++) {
    if (!seen[b]) res.push(b);
  }
  return res;
}

export async function getAlignedHistoricalDraws(game: SupportedGame = 'EUROMILLIONS') {
  const now = Date.now();
  if (cachedAlignedDrawsByGame[game] && now - (cacheTimestamps[game] || 0) < 120_000) {
    return cachedAlignedDrawsByGame[game]!;
  }

  const spec = GAME_SPECS[game];
  const fileSuffix = game.toLowerCase();
  const dir = path.resolve(process.cwd(), 'data/consolidated');
  const drawMap = new Map<number, { drawId: number; date: string; win: number[]; preds: Record<string, number[]> }>();
  const sysKeys = Object.keys(SYSTEM_LABELS);

  for (const sysId of sysKeys) {
    const filePath = path.join(dir, `${sysId}_${fileSuffix}.json`);
    if (!fs.existsSync(filePath)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const arr = Array.isArray(raw) ? raw : [];
      for (const row of arr) {
        const pred = typeof row.prediction === 'string' ? JSON.parse(row.prediction) : row.prediction;
        const win = typeof row.draw?.numbers === 'string' ? JSON.parse(row.draw.numbers) : row.draw?.numbers;
        if (!pred || pred.length < spec.totalBalls || !win || win.length !== spec.winBalls) continue;
        if (!drawMap.has(row.drawId)) {
          drawMap.set(row.drawId, {
            drawId: row.drawId,
            date: (row.draw?.date || '').slice(0, 10),
            win,
            preds: {},
          });
        }
        drawMap.get(row.drawId)!.preds[sysId] = ensureFullPool(pred, spec.totalBalls);
      }
    } catch (e) {}
  }

  // Supplement with any newer draws from Prisma SystemPrediction
  let maxJsonDrawId = 0;
  for (const k of drawMap.keys()) {
    if (k > maxJsonDrawId) maxJsonDrawId = k;
  }

  try {
    const dbNewRows = await prisma.systemPrediction.findMany({
      where: {
        game,
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
      if (!Array.isArray(pred) || pred.length < spec.winBalls || !Array.isArray(win) || win.length !== spec.winBalls) continue;
      if (!drawMap.has(r.drawId)) {
        drawMap.set(r.drawId, {
          drawId: r.drawId,
          date: r.draw.date.toISOString().slice(0, 10),
          win,
          preds: {},
        });
      }
      drawMap.get(r.drawId)!.preds[slug] = ensureFullPool(pred, spec.totalBalls);
    }
  } catch (e) {
    console.error(`Aviso ao suplementar sorteios recentes da BD para ${game}:`, e);
  }

  const aligned = [...drawMap.values()]
    .filter((d) => Object.keys(d.preds).length >= 10)
    .sort((a, b) => a.drawId - b.drawId);

  cachedAlignedDrawsByGame[game] = aligned;
  cacheTimestamps[game] = now;
  return aligned;
}

export function combinePredictions(
  lists: number[][],
  method: FusionMethod,
  totalBalls: number
): number[] {
  const k = lists.length;
  if (k === 0) return [];

  if (method === 'INTERCALADO') {
    const seen = new Uint8Array(totalBalls + 1);
    const result: number[] = [];
    for (let pos = 0; pos < totalBalls; pos++) {
      for (let i = 0; i < k; i++) {
        if (!lists[i] || pos >= lists[i].length) continue;
        const ball = lists[i][pos];
        if (ball >= 1 && ball <= totalBalls && !seen[ball]) {
          seen[ball] = 1;
          result.push(ball);
        }
      }
    }
    for (let b = 1; b <= totalBalls; b++) {
      if (!seen[b]) result.push(b);
    }
    return result;
  } else {
    // BORDA (Rank sum across all systems)
    const rankSums = new Int32Array(totalBalls + 1);
    const firstRank = new Int32Array(totalBalls + 1);
    for (let i = 0; i < k; i++) {
      const arr = lists[i] || [];
      for (let r = 0; r < arr.length; r++) {
        const b = arr[r];
        if (b >= 1 && b <= totalBalls) {
          rankSums[b] += r;
          if (i === 0) firstRank[b] = r;
        }
      }
    }
    const balls = Array.from({ length: totalBalls }, (_, idx) => idx + 1);
    balls.sort((a, b) => rankSums[a] - rankSums[b] || firstRank[a] - firstRank[b]);
    return balls;
  }
}

function combMath(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let res = 1;
  for (let i = 1; i <= r; i++) res = (res * (n - i + 1)) / i;
  return res;
}

export async function evaluateSuperCombination(
  components: SystemComponent[],
  method: FusionMethod,
  game: SupportedGame = 'EUROMILLIONS'
) {
  const spec = GAME_SPECS[game];
  const draws = await getAlignedHistoricalDraws(game);
  const poolSizes = spec.pools;
  const totalComb = combMath(spec.totalBalls, spec.winBalls);

  const statsByPool: Record<
    number,
    {
      hitsTop: number;
      hitsSec: number;
      hitsSum: number;
      last20_top: number;
      last20_sec: number;
      last20_sum: number;
      expectedTop: number;
      expectedSum: number;
    }
  > = {};

  for (const p of poolSizes) {
    const pTop = combMath(p, spec.winBalls) / totalComb;
    const pSec = (combMath(p, spec.winBalls - 1) * combMath(spec.totalBalls - p, 1)) / totalComb;
    statsByPool[p] = {
      hitsTop: 0,
      hitsSec: 0,
      hitsSum: 0,
      last20_top: 0,
      last20_sec: 0,
      last20_sum: 0,
      expectedTop: Number((pTop * draws.length).toFixed(2)),
      expectedSum: Number(((pTop + pSec) * draws.length).toFixed(2)),
    };
  }

  const recent20Draws: Array<{
    drawId: number;
    date: string;
    winningNumbers: number[];
    rankedPool: number[];
    hitsByPool: Record<number, number>;
  }> = [];

  const startRecentIdx = Math.max(0, draws.length - 20);

  for (let i = 0; i < draws.length; i++) {
    const d = draws[i];
    const isLast20 = i >= startRecentIdx;

    const validLists: number[][] = [];
    for (const c of components) {
      const base = d.preds[c.systemId];
      if (base && base.length >= spec.totalBalls) {
        validLists.push(c.polarity === 'D' ? base : base.slice().reverse());
      }
    }

    if (validLists.length === 0) continue;

    const combinedAll = combinePredictions(validLists, method, spec.totalBalls);
    const winSet = new Set(d.win);

    const hitsByPool: Record<number, number> = {};
    let currentHits = 0;
    const maxP = poolSizes[poolSizes.length - 1];

    for (let idx = 0; idx < maxP; idx++) {
      if (winSet.has(combinedAll[idx])) currentHits++;
      const count = idx + 1;
      if (poolSizes.includes(count)) {
        hitsByPool[count] = currentHits;
        const st = statsByPool[count];
        if (currentHits === spec.winBalls) {
          st.hitsTop++;
          if (isLast20) st.last20_top++;
        } else if (currentHits === spec.winBalls - 1) {
          st.hitsSec++;
          if (isLast20) st.last20_sec++;
        }
        if (currentHits >= spec.winBalls - 1) {
          st.hitsSum++;
          if (isLast20) st.last20_sum++;
        }
      }
    }

    if (isLast20) {
      recent20Draws.push({
        drawId: d.drawId,
        date: d.date,
        winningNumbers: d.win,
        rankedPool: combinedAll.slice(0, maxP),
        hitsByPool,
      });
    }
  }

  // Next Draw Prediction via live CachedPrediction or fallback
  const nextDrawLists: number[][] = [];
  for (const c of components) {
    const dbName = DB_SYSTEM_NAMES[c.systemId];
    let fullList: number[] | null = null;
    if (dbName) {
      try {
        const cached = await prisma.cachedPrediction.findUnique({
          where: {
            systemName_game: {
              systemName: dbName,
              game,
            },
          },
        });
        if (cached && cached.numbers) {
          const direct = JSON.parse(cached.numbers);
          const worst = cached.worstNumbers ? JSON.parse(cached.worstNumbers) : [];
          fullList = ensureFullPool([...direct, ...worst], spec.totalBalls);
        }
      } catch (e) {}
    }
    if (!fullList && draws.length > 0) {
      fullList = draws[draws.length - 1].preds[c.systemId];
    }
    if (fullList) {
      nextDrawLists.push(c.polarity === 'D' ? fullList : fullList.slice().reverse());
    }
  }

  const nextDrawRanked = combinePredictions(nextDrawLists, method, spec.totalBalls);
  const nextDrawPools: Record<number, number[]> = {};
  for (const p of poolSizes) {
    nextDrawPools[p] = nextDrawRanked.slice(0, p);
  }

  return {
    game,
    spec,
    totalDraws: draws.length,
    latestDrawDate: draws.length > 0 ? draws[draws.length - 1].date : '',
    statsByPool,
    recent20Draws: recent20Draws.reverse(),
    nextDrawPools,
  };
}
