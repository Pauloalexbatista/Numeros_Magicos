/**
 * PROBABILITY LABORATORY - MASTER EXCEL EXPORT
 * Export ALL 6 Analysis Tables to Single Excel Workbook
 * 
 * Sheets:
 * 1. Frequências Posicionais (50 rows)
 * 2. Probabilidades Posicionais (50 rows)
 * 3. Análise de Desvios (50 rows)
 * 4. Saídas Acumuladas (1892 rows × 52 cols)
 * 5. Ausências Consecutivas (1892 rows × 52 cols)
 * 6. Momentum Score (1892 rows × 52 cols)
 */

import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';
import ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

const probDb = new ProbabilityPrismaClient();

async function exportAllTables() {
    console.log('📊 Creating Master Excel Export with ALL 6 Tables...\n');

    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Números Mágicos - Probability Laboratory';
        workbook.created = new Date();

        // ========================================================================
        // SHEET 1-3: Already implemented in export-positional-frequency.ts
        // We'll reuse that logic here
        // ========================================================================

        console.log('📥 Loading positional analysis data...');
        const frequencies = await probDb.positionalFrequency.findMany({ orderBy: { number: 'asc' } });
        const probabilities = await probDb.positionalProbability.findMany({ orderBy: { number: 'asc' } });
        const deviations = await probDb.positionalDeviation.findMany({ orderBy: { chiSquare: 'desc' } });
        console.log('✅ Loaded positional data\n');

        // Add sheets 1-3 (simplified versions - just data tables)
        addFrequencySheet(workbook, frequencies);
        addProbabilitySheet(workbook, probabilities);
        addDeviationSheet(workbook, deviations);

        // ========================================================================
        // SHEET 4: Cumulative Exits (1892 rows)
        // ========================================================================
        console.log('📥 Loading cumulative exits data...');
        const cumulativeExits = await probDb.cumulativeExits.findMany({
            orderBy: { drawNumber: 'asc' },
            take: 1892 // All records
        });
        console.log(`✅ Loaded ${cumulativeExits.length} cumulative exit records\n`);

        console.log('📝 Creating Cumulative Exits sheet...');
        const sheet4 = workbook.addWorksheet('Saídas Acumuladas');

        // Headers
        const headers4 = ['Sorteio', 'Data', 'N1', 'N2', 'N3', 'N4', 'N5'];
        for (let num = 1; num <= 50; num++) {
            headers4.push(`#${num}`);
        }
        sheet4.getRow(1).values = headers4;
        sheet4.getRow(1).font = { bold: true };
        sheet4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

        // Data rows
        cumulativeExits.forEach((record, idx) => {
            const drawnNumbers = JSON.parse(record.drawnNumbers);
            const counts = JSON.parse(record.cumulativeCounts);

            const rowData = [
                record.drawNumber,
                record.drawDate.toISOString().split('T')[0],
                ...drawnNumbers
            ];

            for (let num = 1; num <= 50; num++) {
                rowData.push(counts[num] || 0);
            }

            sheet4.getRow(idx + 2).values = rowData;
        });

        sheet4.columns.forEach(col => col.width = 10);
        console.log('✅ Cumulative Exits sheet created\n');

        // ========================================================================
        // SHEET 5: Consecutive Absences (1892 rows)
        // ========================================================================
        console.log('📥 Loading consecutive absences data...');
        const absences = await probDb.consecutiveAbsences.findMany({
            orderBy: { drawNumber: 'asc' },
            take: 1892
        });
        console.log(`✅ Loaded ${absences.length} absence records\n`);

        console.log('📝 Creating Consecutive Absences sheet...');
        const sheet5 = workbook.addWorksheet('Ausências Consecutivas');

        sheet5.getRow(1).values = headers4; // Same headers
        sheet5.getRow(1).font = { bold: true };
        sheet5.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };

        absences.forEach((record, idx) => {
            const drawnNumbers = JSON.parse(record.drawnNumbers);
            const counts = JSON.parse(record.absenceCounts);

            const rowData = [
                record.drawNumber,
                record.drawDate.toISOString().split('T')[0],
                ...drawnNumbers
            ];

            for (let num = 1; num <= 50; num++) {
                rowData.push(counts[num] || 0);
            }

            sheet5.getRow(idx + 2).values = rowData;
        });

        sheet5.columns.forEach(col => col.width = 10);
        console.log('✅ Consecutive Absences sheet created\n');

        // ========================================================================
        // SHEET 6: Momentum Score (1892 rows)
        // ========================================================================
        console.log('📥 Loading momentum score data...');
        const momentum = await probDb.momentumScore.findMany({
            orderBy: { drawNumber: 'asc' },
            take: 1892
        });
        console.log(`✅ Loaded ${momentum.length} momentum records\n`);

        console.log('📝 Creating Momentum Score sheet...');
        const sheet6 = workbook.addWorksheet('Momentum Score');

        sheet6.getRow(1).values = headers4; // Same headers
        sheet6.getRow(1).font = { bold: true };
        sheet6.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFED7D31' } };

        momentum.forEach((record, idx) => {
            const drawnNumbers = JSON.parse(record.drawnNumbers);
            const scores = JSON.parse(record.momentumScores);

            const rowData = [
                record.drawNumber,
                record.drawDate.toISOString().split('T')[0],
                ...drawnNumbers
            ];

            for (let num = 1; num <= 50; num++) {
                rowData.push(scores[num] || 0);
            }

            sheet6.getRow(idx + 2).values = rowData;
        });

        sheet6.columns.forEach(col => col.width = 10);
        console.log('✅ Momentum Score sheet created\n');

        // ========================================================================
        // Save workbook
        // ========================================================================
        const exportsDir = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        const filename = `probability-analysis-complete-${new Date().toISOString().split('T')[0]}.xlsx`;
        const filepath = path.join(exportsDir, filename);

        console.log('💾 Saving Excel file (this may take a moment for large file)...');
        await workbook.xlsx.writeFile(filepath);

        console.log('\n✅ Master Excel file created successfully!\n');
        console.log(`📁 File location: ${filepath}`);
        console.log(`📊 Total sheets: 6`);
        console.log(`📈 Total rows: ~${50 + 50 + 50 + 1892 + 1892 + 1892} across all sheets`);
        console.log(`💾 File size: Check exports folder\n`);

        console.log('✨ Export complete! All 6 probability analysis tables in one file.\n');

    } catch (error) {
        console.error('❌ Error during export:', error);
        throw error;
    } finally {
        await probDb.$disconnect();
    }
}

// Helper functions for sheets 1-3
function addFrequencySheet(workbook: ExcelJS.Workbook, frequencies: any[]) {
    const sheet = workbook.addWorksheet('Frequências Posicionais');
    sheet.getRow(1).values = ['Número', 'C1', 'C2', 'C3', 'C4', 'C5', 'Total'];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    frequencies.forEach((freq, idx) => {
        sheet.getRow(idx + 2).values = [
            freq.number,
            freq.c1_count,
            freq.c2_count,
            freq.c3_count,
            freq.c4_count,
            freq.c5_count,
            freq.total_appearances
        ];
    });

    sheet.columns.forEach(col => col.width = 12);
}

function addProbabilitySheet(workbook: ExcelJS.Workbook, probabilities: any[]) {
    const sheet = workbook.addWorksheet('Probabilidades Posicionais');
    sheet.getRow(1).values = ['Número', 'C1 %', 'C2 %', 'C3 %', 'C4 %', 'C5 %'];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };

    probabilities.forEach((prob, idx) => {
        sheet.getRow(idx + 2).values = [
            prob.number,
            prob.c1_percent,
            prob.c2_percent,
            prob.c3_percent,
            prob.c4_percent,
            prob.c5_percent
        ];

        // Format as percentages
        for (let col = 2; col <= 6; col++) {
            sheet.getCell(idx + 2, col).numFmt = '0.0"%"';
        }
    });

    sheet.columns.forEach(col => col.width = 12);
}

function addDeviationSheet(workbook: ExcelJS.Workbook, deviations: any[]) {
    const sheet = workbook.addWorksheet('Análise de Desvios');
    sheet.getRow(1).values = ['Número', 'C1 Dev%', 'C2 Dev%', 'C3 Dev%', 'C4 Dev%', 'C5 Dev%', 'Chi²', 'Signif?'];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFED7D31' } };

    deviations.forEach((dev, idx) => {
        sheet.getRow(idx + 2).values = [
            dev.number,
            dev.c1_deviation * 100,
            dev.c2_deviation * 100,
            dev.c3_deviation * 100,
            dev.c4_deviation * 100,
            dev.c5_deviation * 100,
            dev.chiSquare,
            dev.isSignificant ? 'SIM' : 'NÃO'
        ];

        // Format deviations as percentages
        for (let col = 2; col <= 6; col++) {
            sheet.getCell(idx + 2, col).numFmt = '0"%"';
        }

        // Format chi-square
        sheet.getCell(idx + 2, 7).numFmt = '0.0';
    });

    sheet.columns.forEach(col => col.width = 12);
}

// Run the export
exportAllTables()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
