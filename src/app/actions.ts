'use server';

import { EuroMillionsService } from '@/services/euroMillionsService';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

const service = new EuroMillionsService();

export async function updateData() {
    await service.updateDatabase();
    revalidatePath('/');
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
