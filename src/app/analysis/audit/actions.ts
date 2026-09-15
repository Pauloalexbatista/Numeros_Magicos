'use server';

import { prisma } from '@/lib/prisma';
import { getSystemByName } from '@/services/ranked-systems';
import { Draw } from '@prisma/client';
import { getGameConfig } from '@/services/game-config';

export interface AuditRecord {
    id: number;
    drawId: number;
    drawDate: string;
    game: string;
    systemName: string;
    predictedNumbers: number[];
    actualNumbers: number[];
    hits: number;
    accuracy: number;
}

export interface VerificationResult {
    match: boolean;
    stored: number[];
    recalculated: number[];
    drawDate: string;
    game: string;
    systemName: string;
    executionTimeMs: number;
    error?: string;
}

/**
 * Get available systems for the dropdown
 */
export async function getActiveSystems() {
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true, domain: 'NUMBERS' },
        select: { name: true },
        distinct: ['name']
    });
    return systems.map(s => s.name).sort();
}

/**
 * Get audit history for a specific system from SystemPrediction
 */
export async function getAuditHistory(systemName: string, gameFilter?: string): Promise<AuditRecord[]> {
    const whereClause: any = {
        systemName,
        domain: 'NUMBERS'
    };
    if (gameFilter) {
        whereClause.game = gameFilter;
    }

    const history = await prisma.systemPrediction.findMany({
        where: whereClause,
        orderBy: { draw: { date: 'desc' } },
        take: 50,
        include: {
            draw: {
                select: { date: true, numbers: true }
            }
        }
    });

    return history.map(record => {
        const config = getGameConfig([{ game: record.game } as any]);
        const predCount = config.predCount;
        const predArr = typeof record.prediction === 'string' ? JSON.parse(record.prediction) : (record.prediction || []);
        const actArr = typeof record.draw.numbers === 'string' ? JSON.parse(record.draw.numbers) : (record.draw.numbers || []);
        
        const topPred = predArr.slice(0, predCount);
        const hits = topPred.filter((n: number) => actArr.includes(n)).length;
        const accuracy = predCount > 0 ? (hits / predCount) * 100 : 0;

        return {
            id: record.id,
            drawId: record.drawId,
            drawDate: record.draw.date.toISOString().split('T')[0],
            game: record.game,
            systemName: record.systemName,
            predictedNumbers: predArr,
            actualNumbers: actArr,
            hits,
            accuracy: Math.round(accuracy * 10) / 10
        };
    });
}

/**
 * Verify a specific prediction by re-calculating it from scratch
 */
export async function verifyPrediction(predictionId: number): Promise<VerificationResult> {
    const start = performance.now();

    try {
        // 1. Fetch the prediction record
        const record = await prisma.systemPrediction.findUnique({
            where: { id: predictionId },
            include: { draw: true }
        });

        if (!record || !record.draw) {
            throw new Error('Registo de previsão não encontrado');
        }

        // 2. Fetch history strictly BEFORE this draw, for the SAME game, descending
        const history = await prisma.draw.findMany({
            where: {
                game: record.game,
                date: {
                    lt: record.draw.date
                }
            },
            orderBy: { date: 'desc' }
        });

        // 3. Instantiate the system
        const system = getSystemByName(record.systemName);
        if (!system) {
            throw new Error(`Sistema '${record.systemName}' não encontrado no registo`);
        }

        // 4. Re-calculate prediction
        const recalculated = await system.generateTop10(history as unknown as Draw[], true);

        // Stored prediction
        const storedNumbers = typeof record.prediction === 'string'
            ? JSON.parse(record.prediction)
            : (record.prediction as number[]);

        // Check match on full pool
        const isMatch = JSON.stringify(recalculated) === JSON.stringify(storedNumbers);
        const end = performance.now();

        return {
            match: isMatch,
            stored: storedNumbers,
            recalculated,
            drawDate: record.draw.date.toISOString().split('T')[0],
            game: record.game,
            systemName: record.systemName,
            executionTimeMs: Math.round(end - start)
        };

    } catch (error) {
        console.error('Audit failed:', error);
        return {
            match: false,
            stored: [],
            recalculated: [],
            drawDate: '',
            game: '',
            systemName: '',
            executionTimeMs: 0,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
    }
}
