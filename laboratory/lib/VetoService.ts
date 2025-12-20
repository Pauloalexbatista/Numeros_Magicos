import { prisma } from './prisma';

export class VetoService {
    private static ELITE_SYSTEMS = ['LSTM Neural Net', 'Random Forest AI', 'SistMediaCamadas'];

    static async applyIntelligenceVeto(candidates: number[], regime: any) {
        const elitePredictions = await prisma.cachedPrediction.findMany({
            where: { systemName: { in: this.ELITE_SYSTEMS } }
        });

        const eliteCombinedSuggestions = new Set<number>();
        elitePredictions.forEach(p => {
            const nums = JSON.parse(p.numbers);
            nums.forEach((n: number) => eliteCombinedSuggestions.add(n));
        });

        const vetoedNumbers: number[] = [];
        const finalNumbers: number[] = [];
        const reasons = new Map<number, string>();

        candidates.forEach(num => {
            const isSupportedByElite = eliteCombinedSuggestions.has(num);
            if (!isSupportedByElite && regime.regime === 'CHAOTIC') {
                vetoedNumbers.push(num);
                reasons.set(num, 'AusÃªncia de suporte IA elite em Caos');
            } else {
                finalNumbers.push(num);
            }
        });

        return { originalNumbers: candidates, vetoedNumbers, finalNumbers: finalNumbers.sort((a, b) => a - b), reasons };
    }
}
