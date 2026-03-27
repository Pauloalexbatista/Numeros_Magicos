import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST() {
    try {
        // Verificar autenticação
        const session = await auth();
        const userRole = (session?.user as any)?.role;

        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar últimos 20 sorteios
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: 20
        });

        // Buscar top 10 sistemas de números
        const topNumberSystems = await prisma.systemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
            take: 10,
            select: { systemName: true }
        });

        // Buscar top 5 sistemas de estrelas
        const topStarSystems = await prisma.starSystemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
            take: 5,
            select: { systemName: true }
        });

        const validationDataNumbers: any[] = [];
        const validationDataStars: any[] = [];

        // Combine systems to validate
        const systemsToValidate = [
            ...topNumberSystems.map(s => ({ ...s, type: 'NUMBER' })),
            ...topStarSystems.map(s => ({ ...s, type: 'STAR' }))
        ];

        for (const draw of draws) {
            const numbers = typeof draw.numbers === 'string'
                ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                : draw.numbers as number[];

            const stars = typeof draw.stars === 'string'
                ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars)
                : draw.stars as number[];

            for (const system of systemsToValidate) {
                let prediction: any = null;
                let performance: any = null;
                let nextPrediction: any = null;
                let predictedValues: number[] = [];

                if (system.type === 'NUMBER') {
                    // Number System Validation
                    performance = await prisma.systemPerformance.findFirst({
                        where: { drawId: draw.id, systemName: system.systemName, game: draw.game }
                    });

                    if (performance && performance.predictedNumbers) {
                        predictedValues = typeof performance.predictedNumbers === 'string'
                            ? (typeof performance.predictedNumbers === "string" ? JSON.parse(performance.predictedNumbers) : performance.predictedNumbers)
                            : performance.predictedNumbers as number[];
                    } else {
                        prediction = await prisma.systemPrediction.findFirst({
                            where: { drawId: draw.id, systemName: system.systemName, game: draw.game }
                        });

                        if (prediction) {
                            predictedValues = typeof prediction.prediction === 'string'
                                ? (typeof prediction.prediction === "string" ? JSON.parse(prediction.prediction) : prediction.prediction)
                                : prediction.prediction as number[];
                        }
                    }

                } else {
                    // Star System Validation
                    performance = await prisma.starSystemPerformance.findFirst({
                        where: { drawId: draw.id, systemName: system.systemName, game: draw.game }
                    });

                    // Note: Star systems might not have SystemPrediction records historically
                    // So we rely on performance record which contains 'predictedStars'
                    if (performance) {
                        predictedValues = typeof performance.predictedStars === 'string'
                            ? (typeof performance.predictedStars === "string" ? JSON.parse(performance.predictedStars) : performance.predictedStars)
                            : performance.predictedStars as number[];
                    }
                }

                // Get Prediction for the NEXT draw (Historical chain)
                // We find the chronologically next draw to ensure accuracy even if IDs are not sequential
                const nextDraw = await prisma.draw.findFirst({
                    where: { date: { gt: draw.date }, game: draw.game },
                    orderBy: { date: 'asc' }
                });

                let nextPredictionValues: number[] = [];
                let nextPredictionDate: Date | null = null;

                if (nextDraw) {
                    const nextDrawId = nextDraw.id;

                    // 1. Try to find the performance record for the NEXT draw (Best for historical accuracy)
                    if (system.type === 'NUMBER') {
                        const nextPerf = await prisma.systemPerformance.findFirst({
                            where: { drawId: nextDrawId, systemName: system.systemName, game: draw.game }
                        });
                        if (nextPerf && nextPerf.predictedNumbers) {
                            nextPredictionValues = typeof nextPerf.predictedNumbers === 'string'
                                ? (typeof nextPerf.predictedNumbers === "string" ? JSON.parse(nextPerf.predictedNumbers) : nextPerf.predictedNumbers)
                                : nextPerf.predictedNumbers as number[];
                            nextPredictionDate = nextPerf.createdAt;
                        }
                        // 2. Fallback to SystemPrediction if performance not found (e.g. latest draw)
                        else {
                            const nextPred = await prisma.systemPrediction.findFirst({
                                where: { drawId: nextDrawId, systemName: system.systemName, game: draw.game }
                            });
                            if (nextPred) {
                                nextPredictionValues = typeof nextPred.prediction === 'string'
                                    ? (typeof nextPred.prediction === "string" ? JSON.parse(nextPred.prediction) : nextPred.prediction)
                                    : nextPred.prediction as number[];
                                nextPredictionDate = nextPred.calculatedAt;
                            }
                        }
                    } else {
                        // Star System Next Prediction
                        const nextPerf = await prisma.starSystemPerformance.findFirst({
                            where: { drawId: nextDrawId, systemName: system.systemName, game: draw.game }
                        });
                        if (nextPerf && nextPerf.predictedStars) {
                            nextPredictionValues = typeof nextPerf.predictedStars === 'string'
                                ? (typeof nextPerf.predictedStars === "string" ? JSON.parse(nextPerf.predictedStars) : nextPerf.predictedStars)
                                : nextPerf.predictedStars as number[];
                            nextPredictionDate = nextPerf.createdAt;
                        }
                    }
                }

                // 3. Fallback for the absolute latest draw (where next draw hasn't happened yet)
                // Use Cache
                if (nextPredictionValues.length === 0) {
                    const cached = await prisma.cachedPrediction.findUnique({
                        where: {
                            systemName_game: {
                                systemName: system.systemName,
                                game: draw.game
                            }
                        }
                    });
                    if (cached?.numbers) {
                        nextPredictionValues = typeof cached.numbers === 'string'
                            ? (typeof cached.numbers === "string" ? JSON.parse(cached.numbers) : cached.numbers)
                            : cached.numbers as number[];
                        nextPredictionDate = cached.updatedAt;
                    }
                }

                if (!performance) continue;

                const perf = performance as any;

                const rowData = {
                    'Data': draw.date.toLocaleDateString('pt-PT'),
                    'Sorteio #': (draw as any).sequenceNumber ?? draw.id,
                    'Números Sorteados': numbers.join(', '),
                    'Estrelas Sorteadas': stars.join(', '),
                    'Sistema': system.systemName,
                    // 'Tipo': system.type === 'STAR' ? 'Estrelas' : 'Números', // Removed type column as it is split by sheet
                    'Previsão Feita (Top 25)': predictedValues.slice(0, 25).join(', '),
                    'Acertos': perf.hits,
                    'Accuracy': (system.type === 'STAR' ? (perf.hits === 2 ? 100 : perf.hits * 50) : perf.accuracy).toFixed(1) + '%',
                    'Previsão Próximo Sorteio (Top 25)': nextPredictionValues.slice(0, 25).join(', '),
                    'Data Próxima Previsão': nextPredictionDate ? new Date(nextPredictionDate).toLocaleString('pt-PT') : 'N/A'
                };

                if (system.type === 'NUMBER') {
                    validationDataNumbers.push(rowData);
                } else {
                    validationDataStars.push(rowData);
                }
            }
        }

        // Criar workbook
        const wb = XLSX.utils.book_new();

        // Sheet Números
        const wsNumbers = XLSX.utils.json_to_sheet(validationDataNumbers);
        wsNumbers['!cols'] = [
            { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 15 },
            { wch: 40 }, { wch: 60 }, { wch: 10 }, { wch: 10 }, { wch: 60 }, { wch: 20 }
        ];
        wsNumbers['!autofilter'] = { ref: 'A1:J1' };
        XLSX.utils.book_append_sheet(wb, wsNumbers, 'Validação Números');

        // Sheet Estrelas
        const wsStars = XLSX.utils.json_to_sheet(validationDataStars);
        wsStars['!cols'] = [
            { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 15 },
            { wch: 40 }, { wch: 60 }, { wch: 10 }, { wch: 10 }, { wch: 60 }, { wch: 20 }
        ];
        wsStars['!autofilter'] = { ref: 'A1:J1' };
        XLSX.utils.book_append_sheet(wb, wsStars, 'Validação Estrelas');


        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        await prisma.$disconnect();

        // Retornar ficheiro
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=validacao_temporal_${new Date().toISOString().split('T')[0]}.xlsx`
            }
        });

    } catch (error) {
        console.error('Error exporting validation:', error);
        await prisma.$disconnect();
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
