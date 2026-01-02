
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// Force dynamic to avoid Vercel caching simple GET requests
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for heavy export

export async function GET() {
    try {
        console.log("Iniciando Exportação de Auditoria Completa...");

        // 1. Fetch All Systems
        // We need both Number and Star systems
        const numberSystems = await prisma.rankedSystem.findMany({
            select: { name: true }
        });

        // Check for star systems - they might be in RankedSystem or just known by code?
        // In the current DB schema, Star Systems map to RankedSystem too via 'name'?
        // Wait, schema has 'RankedSystem' and 'StarSystemRanking'.
        // Let's rely on 'StarSystemRanking' to get the list of active star systems.
        const starSystems = await prisma.starSystemRanking.findMany({
            select: { systemName: true }
        });

        // 2. Create Workbook
        const wb = XLSX.utils.book_new();

        // 3. Process Number Systems
        console.log(`Processando ${numberSystems.length} Sistemas de Números...`);
        for (const sys of numberSystems) {
            const performances = await prisma.systemPerformance.findMany({
                where: { systemName: sys.name },
                orderBy: { draw: { date: 'asc' } },
                include: { draw: true }
            });

            if (performances.length === 0) continue;

            const rows: any[] = [];
            for (let i = 0; i < performances.length; i++) {
                const perf = performances[i];
                const draw = perf.draw;

                let predicted = 'Erro Parse';
                try {
                    predicted = JSON.parse(perf.predictedNumbers).join(', ');
                } catch (e) { predicted = perf.predictedNumbers; }

                let actual = 'Erro Parse';
                try {
                    actual = JSON.parse(perf.actualNumbers).join(', ');
                } catch (e) { actual = perf.actualNumbers; }

                // Next Prediction Logic (Chain of Custody)
                // We use the same Date-based logic to be robust
                let nextPredicted = 'N/A';

                // Optimized: Since we have the ordered array 'performances', we can try to inspect the next element
                // IF the next element corresponds to the next chronological draw.
                // However, 'performances' list *might* have gaps if the system didn't run for a specific draw.
                // To be 100% safe and match the robust validation logic, we should query or check dates.
                // BUT querying inside a loop of 2000 items is slow (N+1 problem).
                // Let's rely on the in-memory list if possible, but fallback to logic if needed.
                // Actually, for "Audit", gaps are important to show.

                // Let's try to find the next performance in our array that has a date > current date
                const nextPerf = performances.find(p => p.draw.date > draw.date);
                if (nextPerf) {
                    try {
                        nextPredicted = JSON.parse(nextPerf.predictedNumbers).join(', ');
                    } catch (e) { nextPredicted = nextPerf.predictedNumbers; }
                }

                rows.push({
                    'Sorteio Seq': (draw as any).sequenceNumber ?? perf.drawId,
                    'Data': perf.draw.date.toLocaleDateString('pt-PT'),
                    'Sistema': perf.systemName,
                    'Previsão (Feita para este Sorteio)': predicted,
                    'Resultado (Saiu neste Sorteio)': actual,
                    'Acertos': perf.hits,
                    'Precisão': perf.accuracy.toFixed(1) + '%',
                    'Previsão P/ Próximo (Validar Cadeia)': nextPredicted
                });
            }

            const ws = XLSX.utils.json_to_sheet(rows);
            // Auto-width
            ws['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 40 }, { wch: 40 }, { wch: 8 }, { wch: 10 }, { wch: 40 }];

            // Excel sheet name limit is 31 chars. Truncate if needed.
            let sheetName = sys.name.replace(/[\[\]\*\/\\\?]/g, ''); // Remove invalid chars
            if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);

            // Ensure unique sheet names (unlikely intersection but safe)
            if (wb.SheetNames.includes(sheetName)) sheetName = sheetName.substring(0, 28) + ' (2)';

            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }

        // 4. Process Star Systems
        console.log(`Processando ${starSystems.length} Sistemas de Estrelas...`);
        for (const sys of starSystems) {
            const performances = await prisma.starSystemPerformance.findMany({
                where: { systemName: sys.systemName },
                orderBy: { draw: { date: 'asc' } },
                include: { draw: true }
            });

            if (performances.length === 0) continue;

            const rows: any[] = [];
            for (let i = 0; i < performances.length; i++) {
                const perf = performances[i];
                const draw = perf.draw;

                let predicted = 'Erro Parse';
                try {
                    predicted = JSON.parse(perf.predictedStars).join(', ');
                } catch (e) { predicted = perf.predictedStars; }

                let actual = 'Erro Parse';
                try {
                    actual = JSON.parse(perf.actualStars).join(', ');
                } catch (e) { actual = perf.actualStars; }

                let nextPredicted = 'N/A';
                const nextPerf = performances.find(p => p.draw.date > draw.date);
                if (nextPerf) {
                    try {
                        nextPredicted = JSON.parse(nextPerf.predictedStars).join(', ');
                    } catch (e) { nextPredicted = nextPerf.predictedStars; }
                }

                rows.push({
                    'Sorteio Seq': (draw as any).sequenceNumber ?? perf.drawId,
                    'Data': perf.draw.date.toLocaleDateString('pt-PT'),
                    'Sistema': perf.systemName,
                    'Previsão Estrelas': predicted,
                    'Resultado Estrelas': actual,
                    'Acertos': perf.hits,
                    'Precisão': (perf.hits === 2 ? '100%' : (perf.hits * 50) + '%'),
                    'Previsão P/ Próximo (Validar Cadeia)': nextPredicted
                });
            }

            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 30 }, { wch: 8 }, { wch: 10 }, { wch: 30 }];

            let sheetName = sys.systemName.replace(/[\[\]\*\/\\\?]/g, '');
            if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
            if (wb.SheetNames.includes(sheetName)) sheetName = sheetName.substring(0, 28) + ' (S)'; // S for Star

            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }

        // 5. Generate Buffer
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="auditoria_completa_sistemas.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }
        });

    } catch (error) {
        console.error("Erro na Auditoria:", error);
        return NextResponse.json({ error: 'Erro ao gerar auditoria' }, { status: 500 });
    }
}
