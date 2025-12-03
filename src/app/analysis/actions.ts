'use server';

import { prisma } from '@/lib/prisma';
import { getSystemByName } from '@/services/ranked-systems';

export async function getSystemPrediction(systemName: string): Promise<number[]> {
    try {
        const system = getSystemByName(systemName);
        if (!system) {
            throw new Error(`System '${systemName}' not found.`);
        }

        // 1. Try to get from Cache first (Zero CPU)
        const cached = await prisma.cachedPrediction.findUnique({
            where: { systemName }
        });

        if (cached && cached.numbers) {
            // console.log(`⚡ Cache Hit for ${systemName}`);
            return JSON.parse(cached.numbers);
        }

        // 2. If not in cache, calculate (High CPU)
        console.warn(`⚠️ Cache Miss for ${systemName}. Calculating...`);

        const history = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        const prediction = await system.generateTop10(history);

        // 3. Save to Cache for next time
        // Calculate "Worst 25" for completeness
        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const worstNumbers = allNumbers.filter(n => !prediction.includes(n));

        await prisma.cachedPrediction.upsert({
            where: { systemName },
            update: {
                numbers: JSON.stringify(prediction),
                worstNumbers: JSON.stringify(worstNumbers),
                updatedAt: new Date()
            },
            create: {
                systemName,
                numbers: JSON.stringify(prediction),
                worstNumbers: JSON.stringify(worstNumbers)
            }
        });

        return prediction;
    } catch (error) {
        console.error(`Error generating prediction for ${systemName}:`, error);
        return [];
    }
}
