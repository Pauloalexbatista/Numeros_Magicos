import { prisma } from './prisma';

export interface HistoricalPoint {
    period: string;
    entropy: number;
    regime: string;
    topSystemType: 'ESTATISTICO' | 'ML_NEURONAL' | 'ESTRUTURAL' | 'MIXED';
}

export class HistoryService {
    static getDigitalRoot(n: number): number {
        return (n - 1) % 9 + 1;
    }

    static async getYearlyTimeline(): Promise<HistoricalPoint[]> {
        const startYear = 2004;
        const endYear = new Date().getFullYear();
        const years: number[] = [];
        for (let y = startYear; y <= endYear; y++) years.push(y);

        const timeline: HistoricalPoint[] = [];

        for (const year of years) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);

            const draws = await prisma.draw.findMany({
                where: { date: { gte: startDate, lte: endDate } },
                orderBy: { date: 'asc' }
            });

            if (draws.length > 0) {
                let statWins = 0;
                let structWins = 0;
                let neuroWins = 0;

                draws.forEach(d => {
                    const nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers;
                    if (!Array.isArray(nums)) return;

                    let statScore = 0;
                    let structScore = 0;

                    // 1. Statistical Fit (Bell Curve & Balance)
                    const sum = nums.reduce((a, b) => a + b, 0);
                    const odds = nums.filter(n => n % 2 !== 0).length;
                    if (sum >= 100 && sum <= 200) statScore += 50;
                    if (odds === 2 || odds === 3) statScore += 50;

                    // 2. Structural Fit (Vortex patterns 3-6-9)
                    const rootSum = this.getDigitalRoot(sum);
                    if (rootSum === 3 || rootSum === 6 || rootSum === 9) structScore += 100;

                    // Determine Winner for this draw
                    if (structScore >= 100) structWins++;
                    else if (statScore >= 100) statWins++;
                    else neuroWins++;
                });

                const total = draws.length;
                const statPct = (statWins / total) * 100;
                const structPct = (structWins / total) * 100;
                const neuroPct = (neuroWins / total) * 100;

                let topParams = { type: 'MIXED', val: 0 };
                if (statPct > topParams.val) topParams = { type: 'ESTATISTICO', val: statPct };
                if (structPct > topParams.val) topParams = { type: 'ESTRUTURAL', val: structPct };
                if (neuroPct > topParams.val) topParams = { type: 'ML_NEURONAL', val: neuroPct };

                // Spectrum Position (0 = Stat, 50 = Struct, 100 = Neuro)
                const spectrumScore = ((statWins * 10) + (structWins * 50) + (neuroWins * 90)) / total;

                timeline.push({
                    period: year.toString(),
                    entropy: spectrumScore,
                    regime: topParams.type === 'ML_NEURONAL' ? 'CHAOTIC' : topParams.type === 'ESTATISTICO' ? 'STABLE' : 'TRANSITION',
                    topSystemType: topParams.type as any
                });
            }
        }
        return timeline;
    }

    static async getRecentMonthlyTimeline(): Promise<HistoricalPoint[]> {
        // Last 12 months
        const points: HistoricalPoint[] = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = targetDate.toLocaleString('pt-PT', { month: 'short' });
            const yearLabel = targetDate.getFullYear();

            const start = new Date(yearLabel, targetDate.getMonth(), 1);
            const end = new Date(yearLabel, targetDate.getMonth() + 1, 0);

            const draws = await prisma.draw.findMany({
                where: { date: { gte: start, lte: end } },
                orderBy: { date: 'asc' }
            });

            if (draws.length > 0) {
                let statWins = 0;
                let structWins = 0;
                let neuroWins = 0;

                draws.forEach(d => {
                    const nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers;
                    if (!Array.isArray(nums)) return;

                    let statScore = 0;
                    let structScore = 0;

                    const sum = nums.reduce((a, b) => a + b, 0);
                    const odds = nums.filter(n => n % 2 !== 0).length;
                    if (sum >= 100 && sum <= 200) statScore += 50;
                    if (odds === 2 || odds === 3) statScore += 50;

                    const rootSum = this.getDigitalRoot(sum);
                    if (rootSum === 3 || rootSum === 6 || rootSum === 9) structScore += 100;

                    if (structScore >= 100) structWins++;
                    else if (statScore >= 100) statWins++;
                    else neuroWins++;
                });

                const total = draws.length;
                const statPct = (statWins / total) * 100;
                const structPct = (structWins / total) * 100;
                const neuroPct = (neuroWins / total) * 100;

                let topParams = { type: 'MIXED', val: 0 };
                if (statPct > topParams.val) topParams = { type: 'ESTATISTICO', val: statPct };
                if (structPct > topParams.val) topParams = { type: 'ESTRUTURAL', val: structPct };
                if (neuroPct > topParams.val) topParams = { type: 'ML_NEURONAL', val: neuroPct };

                const spectrumScore = ((statWins * 10) + (structWins * 50) + (neuroWins * 90)) / total;

                points.push({
                    period: `${monthLabel} ${yearLabel}`,
                    entropy: spectrumScore,
                    regime: topParams.type === 'ML_NEURONAL' ? 'CHAOTIC' : topParams.type === 'ESTATISTICO' ? 'STABLE' : 'TRANSITION',
                    topSystemType: topParams.type as any
                });
            } else {
                points.push({
                    period: `${monthLabel} ${yearLabel}`,
                    entropy: 50,
                    regime: 'TRANSITION',
                    topSystemType: 'MIXED'
                });
            }
        }
        return points;
    }
}
