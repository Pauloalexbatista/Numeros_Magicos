
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { ensure25 } from '../utils/helpers';

interface DigitFrequency {
    [digit: number]: number;
}

const sumMod10 = (a: number, b: number) => (a + b) % 10;

const getDigits = (n: number): number[] => {
    if (n < 10) return [n];
    return [Math.floor(n / 10), n % 10];
};

const scoreNumberByDigits = (num: number, digitWeights: DigitFrequency): number => {
    const digits = getDigits(num);
    return digits.reduce((sum, d) => sum + (digitWeights[d] || 0), 0);
};

export class PyramidPascalSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'PyramidPascal',
        description: 'Pirâmide de Pascal (Soma Mod 10)',
        type: 'NUMBERS_STATISTICAL',
        version: '1.0.0',
        isActiveByDefault: true
    };

    async predict(history: Draw[]): Promise<IPredictionResult> {
        if (history.length === 0) return { numbers: ensure25([], history) };

        const lastDraw = history[0];
        let numbers: number[] = [];
        if (typeof lastDraw.numbers === 'string') {
            numbers = JSON.parse(lastDraw.numbers);
        } else {
            numbers = lastDraw.numbers as unknown as number[];
        }

        let currentRow = numbers.flatMap(n => getDigits(n));
        const pyramidDigits: number[] = [...currentRow];

        while (currentRow.length > 1) {
            const nextRow: number[] = [];
            for (let i = 0; i < currentRow.length - 1; i++) {
                const sum = sumMod10(currentRow[i], currentRow[i + 1]);
                nextRow.push(sum);
                pyramidDigits.push(sum);
            }
            currentRow = nextRow;
        }

        const digitCounts: DigitFrequency = {};
        pyramidDigits.forEach(d => {
            digitCounts[d] = (digitCounts[d] || 0) + 1;
        });

        const candidates: { num: number, score: number }[] = [];

        for (let i = 1; i <= 50; i++) {
            let score = scoreNumberByDigits(i, digitCounts);
            candidates.push({ num: i, score });
        }

        candidates.sort((a, b) => b.score - a.score);

        // Let ensure25 handle the correct count (15 for EM/TL, 18 for ED)
        const result = candidates.map(c => c.num);

        return {
            numbers: ensure25(result, history)
        };
    }
}
