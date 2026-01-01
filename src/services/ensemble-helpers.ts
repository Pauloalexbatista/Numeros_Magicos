import { prisma } from '@/lib/prisma';

/**
 * Busca previsão de um sistema específico do cache
 * Funciona tanto para números como para estrelas
 */
export async function getPrediction(systemName: string): Promise<number[]> {
    const cached = await prisma.cachedPrediction.findFirst({
        where: { systemName },
        orderBy: { updatedAt: 'desc' }
    });

    if (!cached || !cached.numbers) return [];

    const numbers = typeof cached.numbers === 'string'
        ? JSON.parse(cached.numbers)
        : cached.numbers as number[];

    return numbers;
}

/**
 * Calcula consenso (interseção) entre múltiplas previsões
 * Retorna números ordenados por frequência (mais frequente primeiro)
 * 
 * @param predictions Array de previsões de diferentes sistemas
 * @returns Array de números ordenados por frequência
 */
export function calculateConsensus(predictions: number[][]): number[] {
    // Contar frequência de cada número
    const frequency = new Map<number, number>();

    for (const pred of predictions) {
        for (const num of pred) {
            frequency.set(num, (frequency.get(num) || 0) + 1);
        }
    }

    // Ordenar por frequência (mais frequente primeiro)
    const sorted = Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([num]) => num);

    return sorted;
}

/**
 * Calcula votação ponderada entre sistemas
 * Números em posições mais altas (mais importantes) recebem mais pontos
 * 
 * @param predictions Array de previsões de diferentes sistemas
 * @param weights Array de pesos para cada sistema (mesmo tamanho que predictions)
 * @returns Array de números ordenados por pontuação total
 */
export function calculateWeightedVote(
    predictions: number[][],
    weights: number[]
): number[] {
    if (predictions.length !== weights.length) {
        throw new Error('predictions and weights must have the same length');
    }

    const scores = new Map<number, number>();

    for (let i = 0; i < predictions.length; i++) {
        const pred = predictions[i];
        const weight = weights[i];

        for (let j = 0; j < pred.length; j++) {
            const num = pred[j];
            // Posição mais importante = mais pontos
            // Primeiro número (j=0) recebe pred.length pontos
            // Último número recebe 1 ponto
            const positionScore = pred.length - j;
            const totalScore = positionScore * weight;

            scores.set(num, (scores.get(num) || 0) + totalScore);
        }
    }

    return Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([num]) => num);
}

/**
 * Calcula união de múltiplas previsões
 * Retorna todos os números únicos que aparecem em pelo menos uma previsão
 * 
 * @param predictions Array de previsões
 * @returns Array de números únicos
 */
export function calculateUnion(predictions: number[][]): number[] {
    const unique = new Set<number>();

    for (const pred of predictions) {
        for (const num of pred) {
            unique.add(num);
        }
    }

    return Array.from(unique);
}

/**
 * Calcula interseção estrita de múltiplas previsões
 * Retorna apenas números que aparecem em TODAS as previsões
 * 
 * @param predictions Array de previsões
 * @returns Array de números que aparecem em todas as previsões
 */
export function calculateIntersection(predictions: number[][]): number[] {
    if (predictions.length === 0) return [];
    if (predictions.length === 1) return predictions[0];

    // Começar com a primeira previsão
    const result = new Set(predictions[0]);

    // Intersetar com as restantes
    for (let i = 1; i < predictions.length; i++) {
        const predSet = new Set(predictions[i]);
        for (const num of result) {
            if (!predSet.has(num)) {
                result.delete(num);
            }
        }
    }

    return Array.from(result);
}
