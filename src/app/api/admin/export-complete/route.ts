import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { numberBaseSystems, numberEnsembleSystems } from '@/services/ranked-systems';
import { starBaseSystems, starEnsembleSystems } from '@/services/star-systems';

export async function POST() {
    try {
        // Verificar autenticação
        const session = await auth();
        const userRole = (session?.user as any)?.role;

        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar previsões em cache (PRÓXIMO SORTEIO)
        // Isso inclui Number Systems e Star Systems
        const cachedPredictions = await prisma.cachedPrediction.findMany({
            orderBy: { systemName: 'asc' }
        });

        const numberBaseData: any[] = [];
        const numberEnsembleData: any[] = [];
        const starBaseData: any[] = [];
        const starEnsembleData: any[] = [];

        for (const pred of cachedPredictions) {
            const numbers = typeof pred.numbers === 'string'
                ? JSON.parse(pred.numbers)
                : pred.numbers as number[];

            // Tentar buscar performance/ranking baseados no nome e jogo
            const ranking = await prisma.systemRanking.findUnique({
                where: {
                    systemName_game: {
                        systemName: pred.systemName,
                        game: pred.game
                    }
                }
            });

            // Se não achar ranking de números, tenta de estrelas
            const starRanking = !ranking ? await prisma.starSystemRanking.findUnique({
                where: {
                    systemName_game: {
                        systemName: pred.systemName,
                        game: pred.game
                    }
                }
            }) : null;

            const accuracy = ranking
                ? `${ranking.avgAccuracy.toFixed(1)}%`
                : (starRanking ? `${starRanking.avgAccuracy.toFixed(1)}%` : 'N/A');

            const totalPreds = ranking
                ? ranking.totalPredictions
                : (starRanking ? starRanking.totalPredictions : 0);

            const predData = {
                'Sistema': pred.systemName,
                'Top 5 (Melhores)': numbers.slice(0, 5).join(', '),
                'Top 10': numbers.slice(0, 10).join(', '),
                'Top 15': numbers.slice(0, 15).join(', '),
                'Top 20': numbers.slice(0, 20).join(', '),
                'Top 25 (Completo)': numbers.slice(0, 25).join(', '),
                'Accuracy Média': accuracy,
                'Total Previsões': totalPreds,
                'Última Atualização': pred.updatedAt?.toLocaleString('pt-PT') || 'N/A'
            };

            // Determinar categoria
            const isNumberBase = numberBaseSystems.some(s => s.name === pred.systemName);
            const isNumberEnsemble = numberEnsembleSystems.some(s => s.name === pred.systemName);
            const isStarBase = starBaseSystems.some(s => s.name === pred.systemName);
            const isStarEnsemble = starEnsembleSystems.some(s => s.name === pred.systemName);

            if (isNumberBase) {
                numberBaseData.push(predData);
            } else if (isNumberEnsemble) {
                numberEnsembleData.push(predData);
            } else if (isStarBase) {
                starBaseData.push(predData);
            } else if (isStarEnsemble) {
                starEnsembleData.push(predData);
            } else {
                // Fallback: Tentar adivinhar pelo nome se não estiver nos registos
                const nameLower = pred.systemName.toLowerCase();
                if (nameLower.includes('star') || nameLower.includes('estrela')) {
                    starBaseData.push(predData); // Assume base se não conhecido
                } else {
                    numberBaseData.push(predData); // Assume número base se não conhecido
                }
            }
        }

        // Criar workbook
        const wb = XLSX.utils.book_new();

        // Helper para criar sheet com colunas configuradas
        const createSheet = (data: any[], sheetName: string) => {
            const ws = XLSX.utils.json_to_sheet(data);
            ws['!cols'] = [
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
            ws['!autofilter'] = { ref: 'A1:J1' };
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        };

        createSheet(numberBaseData, 'Números - Base');
        createSheet(numberEnsembleData, 'Números - Ensemble');
        createSheet(starBaseData, 'Estrelas - Base');
        createSheet(starEnsembleData, 'Estrelas - Ensemble');

        // Sheet Ranking (Mantido)
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

        const wsRank = XLSX.utils.json_to_sheet(rankingData);
        wsRank['!cols'] = [{ wch: 10 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
        wsRank['!autofilter'] = { ref: 'A1:E1' };
        XLSX.utils.book_append_sheet(wb, wsRank, 'Ranking Performance');

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Retornar ficheiro
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=previsoes_completas_${new Date().toISOString().split('T')[0]}.xlsx`
            }
        });

    } catch (error) {
        console.error('Error exporting complete predictions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
