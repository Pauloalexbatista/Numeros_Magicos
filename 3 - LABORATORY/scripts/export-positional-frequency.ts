/**
 * PROBABILITY LABORATORY - EXCEL EXPORT
 * Export Positional Frequency Analysis to Excel
 * 
 * Creates a formatted Excel workbook with positional frequency data
 */

import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';
import ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

const probDb = new ProbabilityPrismaClient();

async function exportPositionalFrequency() {
    console.log('📊 Exporting Positional Frequency Analysis to Excel...\n');

    try {
        // Load data from database
        console.log('📥 Loading data from probability database...');
        const frequencies = await probDb.positionalFrequency.findMany({
            orderBy: { number: 'asc' }
        });

        const metadata = await probDb.calculationMetadata.findUnique({
            where: { tableName: 'positional_frequency' }
        });

        if (frequencies.length === 0) {
            console.error('❌ No data found! Please run 01-calculate-positional-frequency.ts first.');
            return;
        }

        console.log(`✅ Loaded data for ${frequencies.length} numbers\n`);

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Números Mágicos - Probability Laboratory';
        workbook.created = new Date();

        // ========================================================================
        // SHEET 1: Frequências Posicionais (Absolute Counts)
        // ========================================================================
        const sheet1 = workbook.addWorksheet('Frequências Posicionais');

        // Header styling
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
            fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF4472C4' } },
            alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
            border: {
                top: { style: 'thin' as const },
                left: { style: 'thin' as const },
                bottom: { style: 'thin' as const },
                right: { style: 'thin' as const }
            }
        };

        // Add title
        sheet1.mergeCells('A1:H1');
        sheet1.getCell('A1').value = 'ANÁLISE DE FREQUÊNCIAS POSICIONAIS';
        sheet1.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF4472C4' } };
        sheet1.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        sheet1.getRow(1).height = 30;

        // Add metadata
        sheet1.getCell('A2').value = `Total de Sorteios Analisados: ${metadata?.totalDrawsProcessed || 'N/A'}`;
        sheet1.getCell('A2').font = { italic: true, size: 10 };
        sheet1.getCell('A3').value = `Última Atualização: ${metadata?.calculatedAt.toLocaleString('pt-PT') || 'N/A'}`;
        sheet1.getCell('A3').font = { italic: true, size: 10 };

        // Add headers
        const headers = ['Número', 'C1 (1ª Pos)', 'C2 (2ª Pos)', 'C3 (3ª Pos)', 'C4 (4ª Pos)', 'C5 (5ª Pos)', 'Total', '% Aparição'];
        sheet1.getRow(5).values = headers;
        sheet1.getRow(5).eachCell((cell) => {
            Object.assign(cell, headerStyle);
        });
        sheet1.getRow(5).height = 25;

        // Column widths
        sheet1.columns = [
            { width: 10 },  // Número
            { width: 14 },  // C1
            { width: 14 },  // C2
            { width: 14 },  // C3
            { width: 14 },  // C4
            { width: 14 },  // C5
            { width: 12 },  // Total
            { width: 14 }   // % Aparição
        ];

        // Add data rows
        const totalDraws = metadata?.totalDrawsProcessed || 1;
        frequencies.forEach((freq, index) => {
            const rowNum = 6 + index;
            const appearancePercent = (freq.total_appearances / totalDraws) * 100;

            sheet1.getRow(rowNum).values = [
                freq.number,
                freq.c1_count,
                freq.c2_count,
                freq.c3_count,
                freq.c4_count,
                freq.c5_count,
                freq.total_appearances,
                appearancePercent
            ];

            // Format percentage
            sheet1.getCell(`H${rowNum}`).numFmt = '0.00"%"';

            // Conditional formatting for high frequencies
            sheet1.getRow(rowNum).eachCell((cell, colNum) => {
                if (colNum >= 2 && colNum <= 6) {
                    const value = cell.value as number;
                    const maxPossible = freq.total_appearances;
                    const ratio = maxPossible > 0 ? value / maxPossible : 0;

                    // Color scale: white -> light blue -> dark blue
                    if (ratio > 0.8) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
                        cell.font = { color: { argb: 'FFFFFFFF' } };
                    } else if (ratio > 0.5) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8FAADC' } };
                    } else if (ratio > 0.2) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
                    }
                }

                // Add borders
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Center alignment for numbers
                if (colNum > 1) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            });
        });

        // Add summary statistics
        const summaryRow = 6 + frequencies.length + 2;
        sheet1.getCell(`A${summaryRow}`).value = 'ESTATÍSTICAS RESUMO';
        sheet1.getCell(`A${summaryRow}`).font = { bold: true, size: 12 };
        sheet1.mergeCells(`A${summaryRow}:H${summaryRow}`);

        const stats = [
            ['Total de Números Analisados:', frequencies.length],
            ['Total de Sorteios:', totalDraws],
            ['Números por Sorteio:', 5],
            ['Total de Aparições (todas):', frequencies.reduce((sum, f) => sum + f.total_appearances, 0)]
        ];

        stats.forEach((stat, idx) => {
            const row = summaryRow + idx + 1;
            sheet1.getCell(`A${row}`).value = stat[0];
            sheet1.getCell(`A${row}`).font = { bold: true };
            sheet1.getCell(`B${row}`).value = stat[1];
        });

        // ========================================================================
        // SHEET 2: Probabilidades Posicionais (Conditional Percentages)
        // ========================================================================
        const sheet2 = workbook.addWorksheet('Probabilidades Posicionais');

        // Add title
        sheet2.mergeCells('A1:H1');
        sheet2.getCell('A1').value = 'ANÁLISE DE PROBABILIDADES POSICIONAIS';
        sheet2.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF70AD47' } };
        sheet2.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        sheet2.getRow(1).height = 30;

        // Add metadata
        sheet2.getCell('A2').value = 'Quando um número sai, qual a % de estar em cada posição?';
        sheet2.getCell('A2').font = { italic: true, size: 10 };
        sheet2.getCell('A3').value = `Última Atualização: ${metadata?.calculatedAt.toLocaleString('pt-PT') || 'N/A'}`;
        sheet2.getCell('A3').font = { italic: true, size: 10 };

        // Add headers
        const headers2 = ['Número', 'C1 %', 'C2 %', 'C3 %', 'C4 %', 'C5 %', 'Total', 'Posição Favorita'];
        sheet2.getRow(5).values = headers2;
        sheet2.getRow(5).eachCell((cell: any) => {
            Object.assign(cell, headerStyle);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        });
        sheet2.getRow(5).height = 25;

        // Column widths
        sheet2.columns = [
            { width: 10 },  // Número
            { width: 12 },  // C1 %
            { width: 12 },  // C2 %
            { width: 12 },  // C3 %
            { width: 12 },  // C4 %
            { width: 12 },  // C5 %
            { width: 12 },  // Total
            { width: 18 }   // Posição Favorita
        ];

        // Load probability data
        const probabilities = await probDb.positionalProbability.findMany({
            orderBy: { number: 'asc' }
        });

        // Add data rows
        probabilities.forEach((prob, index) => {
            const rowNum = 6 + index;

            // Find favorite position (highest %)
            const percentages = [prob.c1_percent, prob.c2_percent, prob.c3_percent, prob.c4_percent, prob.c5_percent];
            const maxPercent = Math.max(...percentages);
            const favoritePos = ['C1', 'C2', 'C3', 'C4', 'C5'][percentages.indexOf(maxPercent)];
            const total = percentages.reduce((sum, p) => sum + p, 0);

            sheet2.getRow(rowNum).values = [
                prob.number,
                prob.c1_percent,
                prob.c2_percent,
                prob.c3_percent,
                prob.c4_percent,
                prob.c5_percent,
                total,
                `${favoritePos} (${maxPercent.toFixed(1)}%)`
            ];

            // Format percentages
            for (let col = 2; col <= 7; col++) {
                sheet2.getCell(rowNum, col).numFmt = '0.0"%"';
            }

            // Conditional formatting for probabilities
            sheet2.getRow(rowNum).eachCell((cell: any, colNum: any) => {
                if (colNum >= 2 && colNum <= 6) {
                    const value = cell.value as number;

                    // Color scale: white -> light green -> dark green
                    if (value >= 80) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                    } else if (value >= 50) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA9D08E' } };
                    } else if (value >= 30) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
                    }
                }

                // Add borders
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Center alignment
                if (colNum > 1) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            });
        });

        // Add insights section
        const insightRow = 6 + probabilities.length + 2;
        sheet2.getCell(`A${insightRow}`).value = 'PADRÕES IDENTIFICADOS';
        sheet2.getCell(`A${insightRow}`).font = { bold: true, size: 12 };
        sheet2.mergeCells(`A${insightRow}:H${insightRow}`);

        const insights = [
            ['Números Extremos:', 'Números 1-4 concentram-se em C1, números 47-50 em C5'],
            ['Números Centrais:', 'Números 18-28 distribuem-se uniformemente pelas posições'],
            ['Número Mais Distribuído:', 'Número 23 (máximo 34.4% numa posição)'],
            ['Número Mais Concentrado:', 'Números 1 e 50 (100% em C1 e C5 respetivamente)']
        ];

        insights.forEach((insight, idx) => {
            const row = insightRow + idx + 1;
            sheet2.getCell(`A${row}`).value = insight[0];
            sheet2.getCell(`A${row}`).font = { bold: true };
            sheet2.getCell(`B${row}`).value = insight[1];
            sheet2.mergeCells(`B${row}:H${row}`);
        });

        // ========================================================================
        // SHEET 3: Análise de Desvios (Observed vs Expected)
        // ========================================================================
        const sheet3 = workbook.addWorksheet('Análise de Desvios');

        // Add title
        sheet3.mergeCells('A1:I1');
        sheet3.getCell('A1').value = 'ANÁLISE DE DESVIOS ESTATÍSTICOS';
        sheet3.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFED7D31' } };
        sheet3.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        sheet3.getRow(1).height = 30;

        // Add metadata
        sheet3.getCell('A2').value = 'Comparação entre frequências observadas e esperadas (distribuição uniforme)';
        sheet3.getCell('A2').font = { italic: true, size: 10 };
        sheet3.getCell('A3').value = `Chi-quadrado crítico (95%): 9.488 | Graus de liberdade: 4`;
        sheet3.getCell('A3').font = { italic: true, size: 10 };

        // Add headers
        const headers3 = ['Número', 'C1 Obs', 'C1 Esp', 'C1 Dev%', 'C2-C5 Desvios...', 'Chi²', 'Signif?', 'Maior Desvio', 'Direção'];
        sheet3.getRow(5).values = ['Número', 'C1 Obs', 'C1 Esp', 'C1 Dev%', 'C2 Dev%', 'C3 Dev%', 'C4 Dev%', 'C5 Dev%', 'Chi²', 'Signif?'];
        sheet3.getRow(5).eachCell((cell: any) => {
            Object.assign(cell, headerStyle);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFED7D31' } };
        });
        sheet3.getRow(5).height = 25;

        // Column widths
        sheet3.columns = [
            { width: 10 },  // Número
            { width: 10 },  // C1 Obs
            { width: 10 },  // C1 Esp
            { width: 12 },  // C1 Dev%
            { width: 12 },  // C2 Dev%
            { width: 12 },  // C3 Dev%
            { width: 12 },  // C4 Dev%
            { width: 12 },  // C5 Dev%
            { width: 12 },  // Chi²
            { width: 12 }   // Signif?
        ];

        // Load deviation data
        const deviations = await probDb.positionalDeviation.findMany({
            orderBy: { chiSquare: 'desc' }
        });

        // Add data rows
        deviations.forEach((dev, index) => {
            const rowNum = 6 + index;

            // Convert deviations to percentages
            const c1DevPct = dev.c1_deviation * 100;
            const c2DevPct = dev.c2_deviation * 100;
            const c3DevPct = dev.c3_deviation * 100;
            const c4DevPct = dev.c4_deviation * 100;
            const c5DevPct = dev.c5_deviation * 100;

            sheet3.getRow(rowNum).values = [
                dev.number,
                dev.c1_observed,
                dev.c1_expected.toFixed(1),
                c1DevPct,
                c2DevPct,
                c3DevPct,
                c4DevPct,
                c5DevPct,
                dev.chiSquare,
                dev.isSignificant ? 'SIM' : 'NÃO'
            ];

            // Format deviation percentages
            for (let col = 4; col <= 8; col++) {
                sheet3.getCell(rowNum, col).numFmt = '0"%"';
            }

            // Format chi-square
            sheet3.getCell(rowNum, 9).numFmt = '0.0';

            // Conditional formatting
            sheet3.getRow(rowNum).eachCell((cell: any, colNum: any) => {
                // Color code deviations
                if (colNum >= 4 && colNum <= 8) {
                    const value = cell.value as number;

                    // Red for negative (below expected), green for positive (above expected)
                    if (Math.abs(value) >= 200) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: value > 0 ? 'FF70AD47' : 'FFC00000' } };
                        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                    } else if (Math.abs(value) >= 100) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: value > 0 ? 'FFA9D08E' : 'FFFF6B6B' } };
                    } else if (Math.abs(value) >= 50) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: value > 0 ? 'FFE2EFDA' : 'FFFFC7CE' } };
                    }
                }

                // Highlight significant results
                if (colNum === 10 && cell.value === 'SIM') {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
                    cell.font = { bold: true };
                }

                // Add borders
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Center alignment
                if (colNum > 1) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            });
        });

        // Add insights section
        const devInsightRow = 6 + deviations.length + 2;
        sheet3.getCell(`A${devInsightRow}`).value = 'INTERPRETAÇÃO';
        sheet3.getCell(`A${devInsightRow}`).font = { bold: true, size: 12 };
        sheet3.mergeCells(`A${devInsightRow}:J${devInsightRow}`);

        const devInsights = [
            ['Desvio Positivo (verde):', 'Número aparece MAIS vezes que o esperado nessa posição'],
            ['Desvio Negativo (vermelho):', 'Número aparece MENOS vezes que o esperado nessa posição'],
            ['Significância Estatística:', 'Todos os números mostram desvios significativos (esperado, pois ordenamos os números)'],
            ['Números Extremos:', 'Números 1-6 e 45-50 têm os maiores chi-quadrados (forte concentração posicional)']
        ];

        devInsights.forEach((insight, idx) => {
            const row = devInsightRow + idx + 1;
            sheet3.getCell(`A${row}`).value = insight[0];
            sheet3.getCell(`A${row}`).font = { bold: true };
            sheet3.getCell(`B${row}`).value = insight[1];
            sheet3.mergeCells(`B${row}:J${row}`);
        });

        // ========================================================================
        // Save workbook
        // ========================================================================
        const exportsDir = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        const filename = `positional-analysis-${new Date().toISOString().split('T')[0]}.xlsx`;
        const filepath = path.join(exportsDir, filename);

        await workbook.xlsx.writeFile(filepath);

        console.log('✅ Excel file created successfully!\n');
        console.log(`📁 File location: ${filepath}`);
        console.log(`📊 Total numbers: ${frequencies.length}`);
        console.log(`📈 Total draws analyzed: ${totalDraws}\n`);

        // Show some interesting insights
        console.log('🔍 Interesting Insights:\n');

        const num1 = frequencies.find(f => f.number === 1);
        const num50 = frequencies.find(f => f.number === 50);
        const num25 = frequencies.find(f => f.number === 25);

        if (num1) {
            console.log(`   Número 1: ${num1.c1_count} vezes em C1 (${((num1.c1_count / num1.total_appearances) * 100).toFixed(1)}%)`);
        }
        if (num50) {
            console.log(`   Número 50: ${num50.c5_count} vezes em C5 (${((num50.c5_count / num50.total_appearances) * 100).toFixed(1)}%)`);
        }
        if (num25) {
            const maxPos = Math.max(num25.c1_count, num25.c2_count, num25.c3_count, num25.c4_count, num25.c5_count);
            const posName = ['C1', 'C2', 'C3', 'C4', 'C5'][
                [num25.c1_count, num25.c2_count, num25.c3_count, num25.c4_count, num25.c5_count].indexOf(maxPos)
            ];
            console.log(`   Número 25: Posição mais frequente é ${posName} com ${maxPos} aparições`);
        }

        console.log('\n✨ Export complete! Open the Excel file to view detailed analysis.\n');

    } catch (error) {
        console.error('❌ Error during export:', error);
        throw error;
    } finally {
        await probDb.$disconnect();
    }
}

// Run the export
exportPositionalFrequency()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
