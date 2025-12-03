'use server';

import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

export interface DiagnosticResult {
    systemName: string;
    status: 'OK' | 'ERROR' | 'WARNING';
    executionTimeMs: number;
    predictionCount: number;
    notes: string[];
}

export async function runSystemDiagnostics(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    try {
        // 1. Fetch History (Last 100 draws for context)
        const history = await prisma.draw.findMany({
            orderBy: { date: 'asc' },
            take: 100
        });

        if (history.length === 0) {
            throw new Error('No history found in database');
        }

        // 2. Test Each System
        for (const system of rankedSystems) {
            const start = performance.now();
            const notes: string[] = [];
            let status: 'OK' | 'ERROR' | 'WARNING' = 'OK';
            let prediction: number[] = [];

            try {
                prediction = await system.generateTop10(history);
            } catch (err) {
                status = 'ERROR';
                notes.push(`Execution Failed: ${err instanceof Error ? err.message : String(err)}`);
            }

            const end = performance.now();
            const executionTimeMs = Math.round(end - start);

            // 3. Validate Output (if no crash)
            if (status !== 'ERROR') {
                // Check Count
                if (prediction.length !== 25) {
                    status = 'WARNING';
                    notes.push(`Invalid count: ${prediction.length} (Expected 25)`);
                }

                // Check Range
                const outOfRange = prediction.filter(n => n < 1 || n > 50);
                if (outOfRange.length > 0) {
                    status = 'ERROR';
                    notes.push(`Numbers out of range: ${outOfRange.join(', ')}`);
                }

                // Check Duplicates
                const unique = new Set(prediction);
                if (unique.size !== prediction.length) {
                    status = 'WARNING';
                    notes.push(`Duplicates detected: ${prediction.length - unique.size}`);
                }

                // Check NaNs
                if (prediction.some(n => isNaN(n))) {
                    status = 'ERROR';
                    notes.push('NaN values detected');
                }
            }

            results.push({
                systemName: system.name,
                status,
                executionTimeMs,
                predictionCount: prediction.length,
                notes
            });
        }

    } catch (error) {
        console.error('Diagnostics failed:', error);
        // Return a generic error result if the whole process crashes
        return [{
            systemName: 'SYSTEM CRITICAL',
            status: 'ERROR',
            executionTimeMs: 0,
            predictionCount: 0,
            notes: [`Critical Failure: ${error instanceof Error ? error.message : String(error)}`]
        }];
    }

    return results;
}
