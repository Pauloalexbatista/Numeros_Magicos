import { prisma } from './prisma';

export interface RegimeStatus {
    regime: 'STABLE' | 'CHAOTIC' | 'TRANSITION';
    entropyScore: number;
    confidence: number;
    description: string;
    recommendedWeight: {
        statistical: number;
        ai: number;
    };
}

export class RegimeService {
    static getDigitalRoot(n: number): number {
        return (n - 1) % 9 + 1;
    }

    static async analyzeRegime(): Promise<RegimeStatus> {
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: 20 // Analyze last 20 draws for current regime
        });

        if (draws.length < 10) {
            return {
                regime: 'TRANSITION',
                entropyScore: 50,
                confidence: 0.5,
                description: 'Dados insuficientes para análise de regime.',
                recommendedWeight: { statistical: 0.5, ai: 0.5 }
            };
        }

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

        // Determine Dominant Regime
        let regime: 'STABLE' | 'CHAOTIC' | 'TRANSITION' = 'TRANSITION';
        let description = '';
        let statisticalWeight = 0.5;
        let aiWeight = 0.5;

        // Winning Logic matching History Timeline
        if (statPct >= structPct && statPct >= neuroPct) {
            regime = 'STABLE';
            description = `Regime Estatístico Dominante (${Math.round(statPct)}%). As médias e tendências normais estão a funcionar bem.`;
            statisticalWeight = 0.8;
            aiWeight = 0.2;
        } else if (structPct >= statPct && structPct >= neuroPct) {
            regime = 'TRANSITION'; // Structural is often a bridge or specific mode
            description = `Regime Estrutural / Vortex (${Math.round(structPct)}%). O mercado obedece a padrões geométricos (3-6-9).`;
            statisticalWeight = 0.4;
            aiWeight = 0.6; // AI adapts better to structure than pure stats
        } else {
            regime = 'CHAOTIC';
            description = `Regime Caótico / Neuronal (${Math.round(neuroPct)}%). Anomalias frequentes. Prioridade total para IA e Não-Lineares.`;
            statisticalWeight = 0.2;
            aiWeight = 0.8;
        }

        // Calculate Spectrum Score for Consistency (0 = Stat, 50 = Struct, 100 = Neuro)
        const entropyScore = ((statWins * 10) + (structWins * 50) + (neuroWins * 90)) / total;

        return {
            regime,
            entropyScore,
            confidence: 0.9,
            description,
            recommendedWeight: { statistical: statisticalWeight, ai: aiWeight }
        };
    }
}
