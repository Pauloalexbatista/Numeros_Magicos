'use server';

import { EuroMillionsService } from '@/services/euroMillionsService';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const service = new EuroMillionsService();

export async function updateData() {
    console.log('[UPDATE] Starting data update...');

    // 1. Fetch new draws from Santa Casa
    console.log('[UPDATE] Fetching new draws from Santa Casa...');
    const result = await service.updateDatabase();

    // 2. Run performance calculations automatically
    console.log('[UPDATE] Running performance calculations...');

    let successCount = 0;
    let failCount = 0;

    // Run turbo-backfill (number systems)
    try {
        console.log('[UPDATE] 📊 Calculating number systems performance...');
        const { stdout, stderr } = await execAsync('npx tsx src/scripts/turbo-backfill.ts', {
            cwd: process.cwd(),
            timeout: 180000 // 3 minutes timeout
        });
        console.log('[UPDATE] ✅ Number systems complete!');
        if (stderr) console.error('[UPDATE] Stderr:', stderr);
        successCount++;
    } catch (error: any) {
        console.error('[UPDATE] ❌ Error in turbo-backfill:', error.message);
        failCount++;
    }

    // Run turbo-medals (medal systems)
    try {
        console.log('[UPDATE] 🏅 Calculating medal systems performance...');
        const { stdout, stderr } = await execAsync('npx tsx src/scripts/turbo-medals.ts', {
            cwd: process.cwd(),
            timeout: 90000 // 1.5 minutes timeout
        });
        console.log('[UPDATE] ✅ Medal systems complete!');
        if (stderr) console.error('[UPDATE] Stderr:', stderr);
        successCount++;
    } catch (error: any) {
        console.error('[UPDATE] ❌ Error in turbo-medals:', error.message);
        failCount++;
    }

    // Run turbo-stars (star systems)
    try {
        console.log('[UPDATE] ⭐ Calculating star systems performance...');
        const { stdout, stderr } = await execAsync('npx tsx src/scripts/turbo-stars.ts', {
            cwd: process.cwd(),
            timeout: 90000 // 1.5 minutes timeout
        });
        console.log('[UPDATE] ✅ Star systems complete!');
        if (stderr) console.error('[UPDATE] Stderr:', stderr);
        successCount++;
    } catch (error: any) {
        console.error('[UPDATE] ❌ Error in turbo-stars:', error.message);
        failCount++;
    }

    console.log(`[UPDATE] Performance calculations finished: ${successCount} succeeded, ${failCount} failed`);

    revalidatePath('/');
    console.log('[UPDATE] Data update complete!');
}

export async function getHistory() {
    return await service.getHistory();
}

export async function getSystemPerformancesForDraw(drawId: number) {
    const performances = await prisma.systemPerformance.findMany({
        where: { drawId },
        orderBy: [
            { hits: 'desc' },
            { accuracy: 'desc' }
        ],
        take: 5
    });
    return performances;
}
