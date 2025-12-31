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

        // Buscar top 10 sistemas
        const topSystems = await prisma.systemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
            take: 10,
            select: { systemName: true }
        });

        const validationData: any[] = [];

        for (const draw of draws) {
            const numbers = typeof draw.numbers === 'string'
                ? JSON.parse(draw.numbers)
                : draw.numbers as number[];

            const stars = typeof draw.stars === 'string'
                ? JSON.parse(draw.stars)
                : draw.stars as number[];

            for (const system of topSystems) {
                const prediction = await prisma.systemPrediction.findFirst({
                    where: {
                        drawId: draw.id,
                        systemName: system.systemName
                    }
                });

                const performance = await prisma.systemPerformance.findFirst({
                    where: {
                        drawId: draw.id,
                        systemName: system.systemName
                    }
                });

                const nextPrediction = await prisma.cachedPrediction.findFirst({
                    where: { systemName: system.systemName },
                    orderBy: { updatedAt: 'desc' }
                });

                if (!prediction || !performance) continue;

                const predictedNumbers = typeof prediction.prediction === 'string'
                    ? JSON.parse(prediction.prediction)
                    : prediction.prediction as number[];

                const nextNumbers = nextPrediction?.numbers
                    ? (typeof nextPrediction.numbers === 'string'
                        ? JSON.parse(nextPrediction.numbers)
                        : nextPrediction.numbers as number[])
                    : [];

                validationData.push({
                    'Data': draw.date.toLocaleDateString('pt-PT'),
                    'Sorteio #': draw.id,
                    'Números Sorteados': numbers.join(', '),
                    'Estrelas Sorteadas': stars.join(', '),
                    'Sistema': system.systemName,
                    'Previsão Feita (Top 10)': predictedNumbers.slice(0, 10).join(', '),
                    'Previsão Feita Em': prediction.calculatedAt?.toLocaleString('pt-PT') || 'N/A',
                    'Acertos': performance.hits,
                    'Accuracy': `${performance.accuracy.toFixed(1)}%`,
                    'Próxima Previsão (Top 10)': nextNumbers.slice(0, 10).join(', '),
                    'Próxima Previsão Em': nextPrediction?.updatedAt?.toLocaleString('pt-PT') || 'N/A'
                });
            }
        }

        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(validationData);

        ws['!cols'] = [
            { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 15 },
            { wch: 40 }, { wch: 35 }, { wch: 20 },
            { wch: 10 }, { wch: 10 }, { wch: 35 }, { wch: 20 }
        ];

        ws['!autofilter'] = { ref: 'A1:K1' };

        XLSX.utils.book_append_sheet(wb, ws, 'Validação Temporal');

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
