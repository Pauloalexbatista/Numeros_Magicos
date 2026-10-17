import fs from 'fs';
import path from 'path';

export interface SystemFamily {
  id: string;
  name: string;
  icon: string;
  description: string;
  systems: string[];
}

export const SYSTEM_FAMILIES: SystemFamily[] = [
  {
    id: 'inercia_calor',
    name: 'Família 1 — Inércia & Calor Recente',
    icon: '🔥',
    description: 'Sistemas que captam a persistência térmica, recência de saída e streaks contínuos.',
    systems: ['mais_quentes', 'ultimos_a_sair', 'mais_sorteadas_sempre']
  },
  {
    id: 'geometria_matricial',
    name: 'Família 2 — Geometria & Espaço Matricial',
    icon: '📐',
    description: 'Sistemas estruturados na grelha 2D/3D e triângulos de Pascal e intervalos.',
    systems: ['diagonais_matriz', 'diagonais_matriz_3d', 'piramide_pascal', 'piramide_intervalos']
  },
  {
    id: 'ciclos_tesla',
    name: 'Família 3 — Ciclos, Transições & Vórtice (Tesla)',
    icon: '🌀',
    description: 'Sistemas de oscilação harmónica, matrizes de transição estocástica e simulação probabilística.',
    systems: ['oscilacao_universal', 'markov', 'monte_carlo', 'media_3_otimizado']
  },
  {
    id: 'inteligencia_coletiva',
    name: 'Família 4 — Inteligência Coletiva & Via Negativa',
    icon: '🧠',
    description: 'Meta-sistemas de elite, corte por limites históricos, clustering e inteligência artificial.',
    systems: ['tiro_certeiro', 'matriz_corte', 'clustering', 'random_forest', 'separacao_aguas', 'supersistema_neuronal']
  }
];

// Conjunto de números primos até 60
const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);

// Números de Fibonacci até 60
const FIBONACCI_NUMS = new Set([1, 2, 3, 5, 8, 13, 21, 34, 55]);

// Redução teosófica a um dígito (1-9)
export function digitalRoot(num: number): number {
  if (num === 0) return 0;
  return 1 + ((num - 1) % 9);
}

export interface SurgicalKeyAnalysis {
  numbers: number[];
  signature: string; // Ex: '1-1-1-1-1'
  primeCount: number;
  primes: number[];
  digitalRoots: number[];
  sumDigitalRoots: number;
  keyRoot: number; // Raiz digital da soma total
  teslaAxisCount: number; // Quantidade de bolas com raiz 3, 6 ou 9
  vortexCount: number; // Quantidade de bolas com raiz 1, 2, 4, 8, 7, 5
  rodinPairsCount: number; // Pares cujas raízes somam 9 (1+8, 2+7, 3+6, 4+5)
  fibonacciGapsCount: number; // Gaps entre bolas ordenadas pertencentes a Fibonacci
  harmonicScore: number; // Score de 0 a 100%
  isValidHarmonic: boolean;
}

/**
 * Avalia a harmonia sagrada de uma chave de 5 números (Tesla, Fibonacci, Primos)
 */
export function analyzeKeyHarmonics(numbers: number[]): SurgicalKeyAnalysis {
  const sorted = [...numbers].sort((a, b) => a - b);
  const n = sorted.length;

  // 1. Quota de Primos
  const primes = sorted.filter(num => PRIMES.has(num));
  const primeCount = primes.length;

  // 2. Raízes Digitais (Teosóficas)
  const digitalRoots = sorted.map(num => digitalRoot(num));
  const sumDigitalRoots = digitalRoots.reduce((a, b) => a + b, 0);
  const sumNumbers = sorted.reduce((a, b) => a + b, 0);
  const keyRoot = digitalRoot(sumNumbers);

  // 3. Eixo Tesla (3-6-9) vs Circuito Vortex (1-2-4-8-7-5)
  const teslaAxisCount = digitalRoots.filter(r => r === 3 || r === 6 || r === 9).length;
  const vortexCount = digitalRoots.filter(r => r === 1 || r === 2 || r === 4 || r === 8 || r === 7 || r === 5).length;

  // 4. Pares de Rodin (soma das raízes = 9)
  let rodinPairsCount = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (digitalRoots[i] + digitalRoots[j] === 9) {
        rodinPairsCount++;
      }
    }
  }

  // 5. Gaps de Fibonacci
  let fibonacciGapsCount = 0;
  for (let i = 0; i < n - 1; i++) {
    const gap = sorted[i + 1] - sorted[i];
    if (FIBONACCI_NUMS.has(gap)) {
      fibonacciGapsCount++;
    }
  }

  // Pontuação Harmónica Sagrada (0 a 100)
  let score = 50;

  // Critério Primos: Ideal é ter 1 ou 2 primos (taxa histórica > 72%)
  if (primeCount === 1 || primeCount === 2) score += 20;
  else if (primeCount === 0 || primeCount === 3) score += 5;
  else score -= 15; // 4 ou 5 primos é raríssimo

  // Critério Tesla 3-6-9: Ideal é ter 1 ou 2 números no eixo energético
  if (teslaAxisCount >= 1 && teslaAxisCount <= 2) score += 15;
  else if (teslaAxisCount === 0) score += 5;
  else score -= 10;

  // Critério Rodin: Ter pelo menos um par convergente para 9
  if (rodinPairsCount >= 1) score += 10;

  // Critério Fibonacci: Ter pelo menos 1 ou 2 saltos harmónicos
  if (fibonacciGapsCount >= 1) score += 10;

  const harmonicScore = Math.max(0, Math.min(100, score));
  const isValidHarmonic = primeCount >= 1 && primeCount <= 3 && teslaAxisCount <= 3;

  return {
    numbers: sorted,
    signature: '',
    primeCount,
    primes,
    digitalRoots,
    sumDigitalRoots,
    keyRoot,
    teslaAxisCount,
    vortexCount,
    rodinPairsCount,
    fibonacciGapsCount,
    harmonicScore,
    isValidHarmonic
  };
}

/**
 * Gera chaves cirúrgicas a partir das 25 bolas sugeridas por um sistema
 * respeitando as partições em 5 blocos (1-1-1-1-1 ou 2-1-1-1-0)
 */
export function generateSurgicalKeys(
  pool25: number[],
  signatureType: '1-1-1-1-1' | '2-1-1-1-0' = '1-1-1-1-1',
  requestedCount: number = 10,
  minHarmonicScore: number = 70
): SurgicalKeyAnalysis[] {
  if (pool25.length < 25) {
    throw new Error('A pool de entrada deve conter pelo menos 25 bolas ordenadas por peso.');
  }

  // Partição em 5 blocos de 5 bolas
  const blocks = [
    pool25.slice(0, 5),   // Bloco 1 (Top 1-5)
    pool25.slice(5, 10),  // Bloco 2 (Top 6-10)
    pool25.slice(10, 15), // Bloco 3 (Top 11-15)
    pool25.slice(15, 20), // Bloco 4 (Top 16-20)
    pool25.slice(20, 25)  // Bloco 5 (Top 21-25)
  ];

  const generatedKeys: SurgicalKeyAnalysis[] = [];
  const seenKeys = new Set<string>();

  // Tentativas máximas para evitar loop infinito
  const maxAttempts = 1500;
  let attempts = 0;

  while (generatedKeys.length < requestedCount && attempts < maxAttempts) {
    attempts++;
    let candidateNumbers: number[] = [];
    let signature = '';

    if (signatureType === '1-1-1-1-1') {
      // 1 bola de cada um dos 5 blocos
      candidateNumbers = blocks.map(b => b[Math.floor(Math.random() * b.length)]);
      signature = '1-1-1-1-1';
    } else {
      // 2-1-1-1-0: escolhe um bloco para fornecer 2 bolas, 3 blocos para fornecer 1 bola, e 1 bloco descartado
      const blockIndices = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
      const pairBlockIdx = blockIndices[0];
      const singleBlocks = [blockIndices[1], blockIndices[2], blockIndices[3]];

      // 2 bolas do bloco duplo
      const bPair = blocks[pairBlockIdx];
      const idx1 = Math.floor(Math.random() * bPair.length);
      let idx2 = Math.floor(Math.random() * bPair.length);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * bPair.length);
      }
      candidateNumbers.push(bPair[idx1], bPair[idx2]);

      // 1 bola de cada um dos 3 blocos singulares
      for (const sIdx of singleBlocks) {
        const bSingle = blocks[sIdx];
        candidateNumbers.push(bSingle[Math.floor(Math.random() * bSingle.length)]);
      }

      signature = '2-1-1-1-0';
    }

    // Ordenar e verificar duplicado
    candidateNumbers.sort((a, b) => a - b);
    const keyStr = candidateNumbers.join('-');

    if (seenKeys.has(keyStr)) continue;

    // Análise Harmónica (Tesla, Fibonacci, Primos)
    const analysis = analyzeKeyHarmonics(candidateNumbers);
    analysis.signature = signature;

    if (analysis.harmonicScore >= minHarmonicScore && analysis.isValidHarmonic) {
      seenKeys.add(keyStr);
      generatedKeys.push(analysis);
    }
  }

  // Ordenar por score harmónico descrescente
  generatedKeys.sort((a, b) => b.harmonicScore - a.harmonicScore);
  return generatedKeys;
}

/**
 * Lê a predição atual (ou mais recente) de um sistema para alimentar o gerador cirúrgico
 */
export function getSystemTop25(gameKey: string, systemId: string): number[] {
  const fileName = `${systemId}_${gameKey}.json`;
  const filePath = path.resolve(process.cwd(), 'data/consolidated', fileName);

  if (!fs.existsSync(filePath)) {
    // Fallback: array ordenado padrão 1 a 25
    return Array.from({ length: 25 }, (_, i) => i + 1);
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) {
      return Array.from({ length: 25 }, (_, i) => i + 1);
    }

    const latest = data[data.length - 1];
    const pred = typeof latest.prediction === 'string' ? JSON.parse(latest.prediction) : latest.prediction;
    if (Array.isArray(pred) && pred.length >= 25) {
      return pred.slice(0, 25);
    }
    return Array.from({ length: 25 }, (_, i) => i + 1);
  } catch (e) {
    return Array.from({ length: 25 }, (_, i) => i + 1);
  }
}
