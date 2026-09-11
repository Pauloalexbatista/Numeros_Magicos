
import { Draw as PrismaDraw } from '@prisma/client';

export interface Draw extends Omit<PrismaDraw, 'numbers' | 'stars' | 'numbersDrawOrder' | 'starsDrawOrder' | 'date'> {
    date: string | Date;
    numbers: number[];
    stars: number[];
    numbersDrawOrder?: number[] | string | null;
    starsDrawOrder?: number[] | string | null;
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
