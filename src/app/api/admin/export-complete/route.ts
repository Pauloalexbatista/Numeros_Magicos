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

        // Buscar último sorteio para pegar previsões mais recentes
        const lastDraw = await prisma.draw.findFirst({
            orderBy: { date: 'desc' }
        });

        if (!lastDraw) {
            throw new Error('No draws found');
        }

        // Buscar previsões do último sorteio (têm ordem correta!)
        const systemPredictions = await prisma.systemPrediction.findMany({
            where: { drawId: lastDraw.id },
            orderBy: { systemName: 'asc' }
        });

        const numberPredictions: any[] = [];
        const starPredictions: any[] = [];

        for (const pred of systemPredictions) {
            const numbers = typeof pred.prediction === 'string'
                ? JSON.parse(pred.prediction)
                : pred.prediction as number[];

            const ranking = await prisma.systemRanking.findFirst({
                where: { systemName: pred.systemName }
            });


            // Determinar se é sistema de números ou estrelas
            // Estrelas: nome contém 'star'/'estrela' E prevê ~6 números (1-12)
            // Números: prevê ~25 números (1-50)
            const hasStarInName = pred.systemName.toLowerCase().includes('star') ||
                pred.systemName.toLowerCase().includes('estrela');
            const isStarSystem = hasStarInName || (numbers.length > 0 && numbers.length <= 12);

            const predData = {
                'Sistema': pred.systemName,
                'Top 5 (Melhores)': numbers.slice(0, 5).join(', '),
                'Top 10': numbers.slice(0, 10).join(', '),
                'Top 15': numbers.slice(0, 15).join(', '),
                'Top 20': numbers.slice(0, 20).join(', '),
                'Top 25 (Completo)': numbers.slice(0, 25).join(', '),
                'Accuracy Média': ranking ? `${ranking.avgAccuracy.toFixed(1)}%` : 'N/A',
                'Total Previsões': ranking?.totalPredictions || 0,
                'Última Atualização': pred.calculatedAt?.toLocaleString('pt-PT') || 'N/A'
            };

            if (isStarSystem) {
                starPredictions.push(predData);
            } else {
                numberPredictions.push(predData);
            }
        }

        // Criar workbook
        const wb = XLSX.utils.book_new();

        // Sheet 1: Previsões de Números (1-50)
        const ws1 = XLSX.utils.json_to_sheet(numberPredictions);
        ws1['!cols'] = [
            { wch: 45 },  // Sistema
            { wch: 20 },  // Top 5
            { wch: 30 },  // Top 10
            { wch: 40 },  // Top 15
            { wch: 50 },  // Top 20
            { wch: 60 },  // Top 25
            { wch: 15 },  // Accuracy
            { wch: 15 },  // Total
            { wch: 20 }   // Última Atualização
        ];
        ws1['!autofilter'] = { ref: 'A1:J1' };
        XLSX.utils.book_append_sheet(wb, ws1, 'Previsões Números');

        // Sheet 2: Previsões de Estrelas (1-12)
        const ws2 = XLSX.utils.json_to_sheet(starPredictions);
        ws2['!cols'] = [
            { wch: 45 },  // Sistema
            { wch: 15 },  // Top 5
            { wch: 20 },  // Top 10
            { wch: 25 },  // Top 15 (não aplicável para estrelas, mas manter estrutura)
            { wch: 25 },  // Top 20
            { wch: 25 },  // Top 25
            { wch: 15 },  // Accuracy
            { wch: 15 },  // Total
            { wch: 20 }   // Última Atualização
        ];
        ws2['!autofilter'] = { ref: 'A1:J1' };
        XLSX.utils.book_append_sheet(wb, ws2, 'Previsões Estrelas');

        // Sheet 3: Ranking
        const rankings = await prisma.systemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' }
        });

        const rankingData = rankings.map((r, index) => ({
            'Posição': index + 1,
            'Sistema': r.systemName,
            'Accuracy Média': `${r.avgAccuracy.toFixed(2)}%`,
            'Total Previsões': r.totalPredictions,
            'Última Atualização': r.lastUpdated?.toLocaleString('pt-PT') || 'N/A'
        }));

        const ws3 = XLSX.utils.json_to_sheet(rankingData);
        ws3['!cols'] = [{ wch: 10 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
        ws3['!autofilter'] = { ref: 'A1:E1' };
        XLSX.utils.book_append_sheet(wb, ws3, 'Ranking Performance');

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        await prisma.$disconnect();

        // Retornar ficheiro
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=previsoes_completas_${new Date().toISOString().split('T')[0]}.xlsx`
            }
        });

    } catch (error) {
        console.error('Error exporting complete predictions:', error);
        await prisma.$disconnect();
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
