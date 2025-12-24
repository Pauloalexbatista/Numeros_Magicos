/**
 * API ROUTE: Export Predictions to Excel
 * POST /api/admin/export-predictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        // Verificar autenticação
        const session = await auth();

        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Buscar todas as previsões
        const predictions = await prisma.cachedPrediction.findMany({
            include: {
                system: true
            },
            orderBy: {
                systemName: 'asc'
            }
        });

        // Data do próximo sorteio (sexta-feira)
        const today = new Date();
        const nextFriday = new Date(today);
        nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));

        const dateStr = `${String(nextFriday.getDate()).padStart(2, '0')}${String(nextFriday.getMonth() + 1).padStart(2, '0')}${nextFriday.getFullYear()}`;
        const fileName = `previsao_${dateStr}.xlsx`;

        // Preparar dados
        const data = predictions.map(pred => {
            const numbers = typeof pred.numbers === 'string'
                ? JSON.parse(pred.numbers)
                : pred.numbers;

            const antiNumbers = pred.worstNumbers
                ? (typeof pred.worstNumbers === 'string' ? JSON.parse(pred.worstNumbers) : pred.worstNumbers)
                : [];

            return {
                'Sistema': pred.systemName,
                'Descrição': pred.system?.description || '',
                'Previsão (25 números)': numbers.join(', '),
                'Anti-Previsão (25 números)': antiNumbers.length > 0 ? antiNumbers.join(', ') : 'N/A',
                'Data Previsão': new Date().toLocaleDateString('pt-PT'),
                'Sorteio Previsto': nextFriday.toLocaleDateString('pt-PT')
            };
        });

        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        ws['!cols'] = [
            { wch: 40 },
            { wch: 50 },
            { wch: 60 },
            { wch: 60 },
            { wch: 15 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Previsões');

        // Converter para buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Retornar ficheiro
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`
            }
        });

    } catch (error) {
        console.error('Erro ao exportar previsões:', error);
        return NextResponse.json(
            { error: 'Erro ao exportar previsões' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
