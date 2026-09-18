import { prisma } from '@/lib/prisma';
import { Draw } from '@prisma/client';

export interface BallLimitsState {
    curStreak: number;
    maxStreak: number;
    curDrought: number;
    maxDrought: number;
    curInWindows: Record<number, number>;
    maxInWindows: Record<number, number>;
}

export interface EliminationVerdict {
    drawId: number;
    game: string;
    domain: string;
    sequenceNumber: number | null;
    drawDate: Date;
    totalEliminated: number;
    eliminatedNumbers: number[];
    eliminationReasons: Record<number, string[]>;
    failedNumbers: number[];
    recordsBroken: string[];
    wasSuccess: boolean;
}

export const ELIMINATION_WINDOWS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export class EliminationService {
    /**
     * Retorna o número máximo de bolas consoante o jogo e domínio
     */
    getMaxNumber(game: string, domain: 'NUMBERS' | 'STARS' = 'NUMBERS'): number {
        if (domain === 'STARS') {
            if (game === 'EURODREAMS') return 5;
            return 12; // Euromilhões
        }
        switch (game) {
            case 'TOTOLOTO': return 49;
            case 'EURODREAMS': return 40;
            case 'MEGASENA': return 60;
            case 'EUROMILLIONS':
            default:
                return 50;
        }
    }

    /**
     * Avalia as bolas a eliminar para um determinado sorteio com base nos limites históricos da BD
     */
    evaluateElimination(
        maxNum: number,
        curStreak: Record<number, number>,
        maxStreak: Record<number, number>,
        currentInW: Record<number, Record<number, number>>,
        maxInW: Record<number, Record<number, number>>
    ): { eliminated: number[]; reasons: Record<number, string[]> } {
        const eliminated: number[] = [];
        const reasons: Record<number, string[]> = {};

        for (let n = 1; n <= maxNum; n++) {
            const ballReasons: string[] = [];

            // Regra 1: Atingiu o Max Streak histórico pessoal (mínimo de 2 saídas seguidas)
            if (curStreak[n] >= maxStreak[n] && curStreak[n] >= 2) {
                ballReasons.push(`STREAK_MAX(${curStreak[n]})`);
            }

            // Regras de Janelas (10, 20, 30): Saturação máxima
            for (const w of [10, 20, 30]) {
                const minThresh = w === 10 ? 4 : (w === 20 ? 6 : 8);
                if (currentInW[w]?.[n] >= maxInW[w]?.[n] && maxInW[w]?.[n] >= minThresh) {
                    ballReasons.push(`MAX_W${w}(${currentInW[w][n]})`);
                }
            }

            if (ballReasons.length > 0) {
                eliminated.push(n);
                reasons[n] = ballReasons;
            }
        }

        return { eliminated, reasons };
    }
}

export const eliminationService = new EliminationService();
