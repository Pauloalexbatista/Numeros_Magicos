
import { Draw as PrismaDraw, GameType } from '@prisma/client';

export interface Draw extends Omit<PrismaDraw, 'numbers' | 'stars' | 'numbersDrawOrder' | 'starsDrawOrder'> {
    numbers: number[];
    stars: number[];
    numbersDrawOrder?: number[];
    starsDrawOrder?: number[];
}

export interface BacktestResult {
    hitRate: number;
    hits: number;
    totalDraws: number;
    roi: number;
    distribution: { [key: number]: number };
    expectedDistribution: { [key: number]: number };
    details: {
        drawDate: string | Date;
        matches: number;
        predicted: number[];
        actual: number[];
        reasoning?: string;
    }[];
}

export type GameType = 'EUROMILLIONS' | 'TOTOLOTO' | 'EURODREAMS';
