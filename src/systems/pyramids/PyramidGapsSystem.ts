
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { ensure25 } from '../utils/helpers';

export class PyramidGapsSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'PyramidGaps',
        description: 'Pirâmide de Dados (Análise de Intervalos)',
        type: 'NUMBERS_STATISTICAL',
        version: '1.0.0',
        isActiveByDefault: true
    };

    async predict(history: Draw[]): Promise<IPredictionResult> {
        if (history.length === 0) return { numbers: ensure25([], history) };

        // 1. Analyze History
        const startingNumFreq: Record<number, number> = {};
        const gap1Freq: Record<number, number> = {};
        const gap2Freq: Record<number, number> = {};
        const gap3Freq: Record<number, number> = {};
        const gap4Freq: Record<number, number> = {};

        history.forEach(draw => {
            let numbers: number[] = [];
            if (typeof draw.numbers === 'string') {
                numbers = JSON.parse(draw.numbers);
            } else {
                numbers = draw.numbers as unknown as number[];
            }

            // Ensure sorted
            numbers.sort((a, b) => a - b);

            if (numbers.length >= 5) {
                // Starting number
                startingNumFreq[numbers[0]] = (startingNumFreq[numbers[0]] || 0) + 1;

                // Gaps
                const g1 = numbers[1] - numbers[0];
                const g2 = numbers[2] - numbers[1];
                const g3 = numbers[3] - numbers[2];
                const g4 = numbers[4] - numbers[3];

                gap1Freq[g1] = (gap1Freq[g1] || 0) + 1;
                gap2Freq[g2] = (gap2Freq[g2] || 0) + 1;
                gap3Freq[g3] = (gap3Freq[g3] || 0) + 1;
                gap4Freq[g4] = (gap4Freq[g4] || 0) + 1;
            }
        });

        const getTopK = (freq: Record<number, number>, k: number) =>
            Object.entries(freq).sort(([, a], [, b]) => b - a).slice(0, k).map(([n]) => parseInt(n));

        const topStarts = getTopK(startingNumFreq, 5);
        const topG1 = getTopK(gap1Freq, 5);
        const topG2 = getTopK(gap2Freq, 5);
        const topG3 = getTopK(gap3Freq, 5);
        const topG4 = getTopK(gap4Freq, 5);

        const candidates = new Set<number>();

        // Generate combinations
        for (const start of topStarts) {
            for (const g1 of topG1) {
                for (const g2 of topG2) {
                    for (const g3 of topG3) {
                        for (const g4 of topG4) {
                            const n1 = start;
                            const n2 = n1 + g1;
                            const n3 = n2 + g2;
                            const n4 = n3 + g3;
                            const n5 = n4 + g4;

                            // Validate
                            if (n5 <= 50) {
                                candidates.add(n1);
                                candidates.add(n2);
                                candidates.add(n3);
                                candidates.add(n4);
                                candidates.add(n5);
                            }
                        }
                    }
                }
            }
        }

        // Let ensure25 handle the correct count (15 for EM/TL, 18 for ED)
        const result = Array.from(candidates);

        return {
            numbers: ensure25(result, history)
        };
    }
}
