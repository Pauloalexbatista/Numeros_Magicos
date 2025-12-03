'use server';

import { runStagingBackfill, commitStagingToProduction, clearStaging } from '@/services/staging-backfill';
import { revalidatePath } from 'next/cache';

export async function runStagingBackfillAction(systemName: string, limit?: number) {
    try {
        const result = await runStagingBackfill(systemName, limit);
        revalidatePath('/admin/staging');
        return { success: true, message: `Backfill completed for ${systemName}. Processed ${result.processed} draws.` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function commitStagingAction(systemName: string) {
    try {
        await commitStagingToProduction(systemName);
        revalidatePath('/admin/staging');
        revalidatePath('/ranking');
        return { success: true, message: `System ${systemName} committed to production successfully.` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function clearStagingAction(systemName: string) {
    try {
        await clearStaging(systemName);
        revalidatePath('/admin/staging');
        return { success: true, message: `Staging cleared for ${systemName}.` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function exportStagingToCSV(systemName: string) {
    try {
        const { prisma } = await import('@/lib/prisma');

        // Fetch data
        const data = await prisma.systemPerformanceStaging.findMany({
            where: { systemName: { in: [systemName, `Anti-${systemName}`] } },
            orderBy: { drawId: 'desc' }
        });

        if (data.length === 0) {
            return { success: false, message: 'No data to export.' };
        }

        // Create CSV Header
        const header = ['Draw ID', 'System Name', 'Predicted Numbers', 'Actual Numbers', 'Hits', 'Accuracy', 'Date'];
        const rows = data.map(row => [
            row.drawId,
            row.systemName,
            `"${row.predictedNumbers.replace(/"/g, '""')}"`, // Escape quotes
            `"${row.actualNumbers.replace(/"/g, '""')}"`,
            row.hits,
            `${row.accuracy}%`,
            row.createdAt.toISOString()
        ]);

        // Combine
        const csvContent = [
            header.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        return { success: true, csv: csvContent, filename: `${systemName}_staging_export.csv` };

    } catch (error: any) {
        console.error('Export error:', error);
        return { success: false, message: error.message };
    }
}
