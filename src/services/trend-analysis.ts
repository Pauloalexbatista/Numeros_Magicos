import { prisma } from '@/lib/prisma';

export interface TrendData {
    number: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number; // slope da regressão
    volatility: 'stable' | 'moderate' | 'erratic';
    volatilityValue: number; // desvio padrão
    compensation: number; // dívida estatística
    compensationProbability: {
        short: number; // 10 sorteios
        medium: number; // 20 sorteios
        long: number; // 50 sorteios
    };
    frequencies: Array<{ period: number; frequency: number; count: number }>;
    currentFrequency: number;
    expectedFrequency: number;
}

/**
 * Calcula frequências em janelas de tempo
 */
function calculateFrequencies(
    itemNumber: number,
    draws: any[],
    windowSize: number,
    type: 'numbers' | 'stars'
): Array<{ period: number; frequency: number; count: number }> {
    const frequencies: Array<{ period: number; frequency: number; count: number }> = [];
    const totalWindows = Math.floor(draws.length / windowSize);

    for (let i = 0; i < totalWindows; i++) {
        const windowDraws = draws.slice(i * windowSize, (i + 1) * windowSize);
        const appearances = windowDraws.filter(draw => {
            const items = (typeof (type === "numbers" ? draw.numbers : draw.stars) === "string" ? JSON.parse(type === "numbers" ? draw.numbers : draw.stars) : (type === "numbers" ? draw.numbers : draw.stars));
            return items.includes(itemNumber);
        }).length;

        const frequency = (appearances / windowSize) * 100;
        frequencies.push({ period: i + 1, frequency, count: appearances });
    }

    return frequencies;
}

/**
 * Calcula tendência focando nos períodos mais recentes
 */
function calculateTrend(frequencies: Array<{ period: number; frequency: number; count: number }>) {
    const n = frequencies.length;
    if (n < 2) return { direction: 'stable' as const, value: 0 };

    // Comparar os últimos 2 períodos com os 2 anteriores
    // Isso dá mais peso ao comportamento recente
    const recent = frequencies.slice(-2); // Últimos 2
    const previous = frequencies.slice(-4, -2); // 2 anteriores

    if (recent.length < 2 || previous.length < 2) {
        // Fallback: comparar último com primeiro
        const lastCount = frequencies[n - 1].count;
        const firstCount = frequencies[0].count;
        const diff = lastCount - firstCount;

        let direction: 'up' | 'down' | 'stable';
        if (diff > 0.5) direction = 'up';
        else if (diff < -0.5) direction = 'down';
        else direction = 'stable';

        return { direction, value: diff };
    }

    // Média dos períodos recentes vs anteriores
    const recentAvg = recent.reduce((sum, f) => sum + f.count, 0) / recent.length;
    const previousAvg = previous.reduce((sum, f) => sum + f.count, 0) / previous.length;

    const diff = recentAvg - previousAvg;

    let direction: 'up' | 'down' | 'stable';
    // Thresholds mais conservadores para evitar falsos positivos
    if (diff > 0.7) direction = 'up';
    else if (diff < -0.7) direction = 'down';
    else direction = 'stable';

    return { direction, value: diff };
}

/**
 * Calcula volatilidade (desvio padrão)
 */
function calculateVolatility(frequencies: Array<{ period: number; frequency: number }>) {
    const values = frequencies.map(f => f.frequency);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    let classification: 'stable' | 'moderate' | 'erratic';
    if (stdDev < 2) classification = 'stable';
    else if (stdDev < 4) classification = 'moderate';
    else classification = 'erratic';

    return { classification, value: stdDev };
}

/**
 * Calcula compensação estatística
 */
function calculateCompensation(
    itemNumber: number,
    draws: any[],
    type: 'numbers' | 'stars'
) {
    const totalDraws = draws.length;
    const appearances = draws.filter(draw => {
        const items = (typeof (type === "numbers" ? draw.numbers : draw.stars) === "string" ? JSON.parse(type === "numbers" ? draw.numbers : draw.stars) : (type === "numbers" ? draw.numbers : draw.stars));
        return items.includes(itemNumber);
    }).length;

    // Probabilidade esperada: 5/50 = 10% para números, 2/12 = 16.67% para estrelas
    const expectedProb = type === 'numbers' ? 0.1 : 0.1667;
    const expected = totalDraws * expectedProb;
    const debt = expected - appearances;

    // Probabilidades de compensação (simplificadas)
    const absDebt = Math.abs(debt);
    const probability = {
        short: Math.min(absDebt * 0.05, 0.5),
        medium: Math.min(absDebt * 0.08, 0.7),
        long: Math.min(absDebt * 0.12, 0.9),
    };

    return { debt, probability, expected, actual: appearances };
}

/**
 * Análise de tendências para números
 */
export async function getNumberTrendAnalysis(windowSize: number = 50): Promise<TrendData[]> {
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: windowSize,
        select: { numbers: true },
    });

    const trends: TrendData[] = [];

    for (let num = 1; num <= 50; num++) {
        const frequencies = calculateFrequencies(num, draws, 10, 'numbers');
        const trend = calculateTrend(frequencies);
        const volatility = calculateVolatility(frequencies);
        const compensation = calculateCompensation(num, draws, 'numbers');

        const currentFreq = frequencies.length > 0 ? frequencies[frequencies.length - 1].frequency : 0;

        trends.push({
            number: num,
            trend: trend.direction,
            trendValue: trend.value,
            volatility: volatility.classification,
            volatilityValue: volatility.value,
            compensation: compensation.debt,
            compensationProbability: compensation.probability,
            frequencies,
            currentFrequency: currentFreq,
            expectedFrequency: (compensation.expected / draws.length) * 100,
        });
    }

    return trends;
}

/**
 * Análise de tendências para estrelas
 */
export async function getStarTrendAnalysis(windowSize: number = 50): Promise<TrendData[]> {
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: windowSize,
        select: { stars: true },
    });

    const trends: TrendData[] = [];

    for (let star = 1; star <= 12; star++) {
        const frequencies = calculateFrequencies(star, draws, 10, 'stars');
        const trend = calculateTrend(frequencies);
        const volatility = calculateVolatility(frequencies);
        const compensation = calculateCompensation(star, draws, 'stars');

        const currentFreq = frequencies.length > 0 ? frequencies[frequencies.length - 1].frequency : 0;

        trends.push({
            number: star,
            trend: trend.direction,
            trendValue: trend.value,
            volatility: volatility.classification,
            volatilityValue: volatility.value,
            compensation: compensation.debt,
            compensationProbability: compensation.probability,
            frequencies,
            currentFrequency: currentFreq,
            expectedFrequency: (compensation.expected / draws.length) * 100,
        });
    }

    return trends;
}
