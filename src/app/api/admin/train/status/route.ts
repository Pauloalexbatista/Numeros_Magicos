import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
    try {
        const session = await auth();
        const user = session?.user as any;
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trainings = await prisma.mLModelTraining.findMany({
            orderBy: { updatedAt: 'desc' }
        });

        // Get live progress if any
        const progressKeys = ['RF_PROGRESS', 'LSTM_PROGRESS', 'TITAN_PROGRESS'];
        const progressData = await prisma.statisticsCache.findMany({
            where: { key: { in: progressKeys } }
        });

        const progressMap: any = {};
        progressData.forEach(p => {
            progressMap[p.key] = JSON.parse(p.data);
        });

        const models = trainings.map(t => {
            const data = JSON.parse(t.modelData || '{}');
            return {
                modelType: t.modelType,
                lastTrained: t.lastTrained,
                accuracy: data.accuracy,
                version: data.version,
                isStars: t.modelType.includes('_STARS'),
                game: t.modelType.split('_')[1]
            };
        });

        return NextResponse.json({
            success: true,
            models,
            progress: progressMap
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
