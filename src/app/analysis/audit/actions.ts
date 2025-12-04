'use server';

import { prisma } from '@/lib/prisma';
import { getSystemByName } from '@/services/ranked-systems';
import { Draw } from '@prisma/client';

export interface AuditRecord {
    id: number;
    drawId: number;
    drawDate: string;
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
    systemName: string;
    executionTimeMs: number;
    error?: string;
}

/**
 * Get available systems for the dropdown
 */
export async function getActiveSystems() {
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        select: { name: true }
    });
    return systems.map(s => s.name).sort();
}

/**
 * Get audit history for a specific system
 */
export async function getAuditHistory(systemName: string): Promise<AuditRecord[]> {
    const history = await prisma.systemPerformance.findMany({
        where: { systemName },
        orderBy: { draw: { date: 'desc' } },
        take: 50,
        include: {
            draw: {
                select: { date: true }
            }
        }
    });

    return history.map(record => ({
        id: record.id,
        drawId: record.drawId,
        drawDate: record.draw.date.toISOString().split('T')[0],
        systemName: record.systemName,
        predictedNumbers: typeof record.predictedNumbers === 'string'
            ? JSON.parse(record.predictedNumbers)
            : record.predictedNumbers as number[],
        actualNumbers: typeof record.actualNumbers === 'string'
            ? JSON.parse(record.actualNumbers)
            : record.actualNumbers as number[],
        hits: record.hits,
        accuracy: Number(record.accuracy)
    }));
}

/**
 * Verify a specific prediction by re-calculating it
 */
export async function verifyPrediction(performanceId: number): Promise<VerificationResult> {
    const start = performance.now();

    try {
        // 1. Fetch the performance record
        const record = await prisma.systemPerformance.findUnique({
            where: { id: performanceId },
            include: { draw: true }
        });

        if (!record) {
            throw new Error('Record not found');
        }

        // 2. Fetch history UP TO this draw (exclusive)
        // We need the state of the world exactly as it was before this draw happened
        const history = await prisma.draw.findMany({
            where: {
                date: {
                    lt: record.draw.date
                }
            },
            orderBy: { date: 'asc' } // Oldest to newest
        });

        // 3. Instantiate the system
        const system = getSystemByName(record.systemName);
        if (!system) {
            throw new Error(`System '${record.systemName}' not found in registry`);
        }

        // 4. Re-calculate prediction
        // Note: We cast history to any[] because Prisma Draw type might slightly differ from internal type
        // but they are compatible for our needs (numbers/stars/date)
        const recalculated = await system.generateTop10(history as unknown as Draw[]);

        // Ensure recalculated is sorted for comparison
        const sortedRecalculated = [...recalculated].sort((a, b) => a - b);

        // Parse stored numbers
        const storedNumbers = typeof record.predictedNumbers === 'string'
            ? JSON.parse(record.predictedNumbers)
            : record.predictedNumbers as number[];
        const sortedStored = [...storedNumbers].sort((a, b) => a - b);

        // 5. Compare
        const isMatch = JSON.stringify(sortedRecalculated) === JSON.stringify(sortedStored);
        const end = performance.now();

        return {
            match: isMatch,
            stored: sortedStored,
            recalculated: sortedRecalculated,
            drawDate: record.draw.date.toISOString().split('T')[0],
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
            systemName: '',
            executionTimeMs: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
