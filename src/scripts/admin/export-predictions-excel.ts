/**
 * EXPORT PREDICTIONS TO EXCEL
 * Exporta todas as previsões atuais para Excel com data
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportPredictionsToExcel() {
    console.log('📊 EXPORTANDO PREVISÕES PARA EXCEL\n');

    // Data para nome do ficheiro (próximo sorteio: sexta 27/12/2024)
    const nextDrawDate = new Date('2024-12-27');
    const dateStr = `${String(nextDrawDate.getDate()).padStart(2, '0')}${String(nextDrawDate.getMonth() + 1).padStart(2, '0')}${nextDrawDate.getFullYear()}`;
    const fileName = `previsao_${dateStr}.xlsx`;
    const outputDir = path.join(process.cwd(), 'exports', 'predictions');
    const outputPath = path.join(outputDir, fileName);

    // Criar diretório se não existir
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📁 Ficheiro: ${fileName}\n`);

    // Buscar todas as previsões em cache
    const predictions = await prisma.cachedPrediction.findMany({
        include: {
            system: true
        },
        orderBy: {
            systemName: 'asc'
        }
    });

    console.log(`✅ ${predictions.length} sistemas com previsões\n`);

    // Preparar dados para Excel
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
            'Sorteio Previsto': nextDrawDate.toLocaleDateString('pt-PT'),
            'Números Individuais': numbers.join(' | ')
        };
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Previsões Completas
    const ws1 = XLSX.utils.json_to_sheet(data);

    // Ajustar largura das colunas
    ws1['!cols'] = [
        { wch: 40 },  // Sistema
        { wch: 50 },  // Descrição
        { wch: 60 },  // Previsão
        { wch: 60 },  // Anti-Previsão
        { wch: 15 },  // Data Previsão
        { wch: 15 },  // Sorteio Previsto
        { wch: 80 }   // Números Individuais
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Previsões Completas');

    // Sheet 2: Apenas Números (para fácil comparação)
    const numbersOnly = predictions.map(pred => {
        const numbers = typeof pred.numbers === 'string'
            ? JSON.parse(pred.numbers)
            : pred.numbers;

        const row: any = {
            'Sistema': pred.systemName
        };

        // Adicionar cada número como coluna separada
        numbers.forEach((num: number, idx: number) => {
            row[`Nº${idx + 1}`] = num;
        });

        return row;
    });

    const ws2 = XLSX.utils.json_to_sheet(numbersOnly);
    XLSX.utils.book_append_sheet(wb, ws2, 'Números Separados');

    // Sheet 3: Resumo
    const summary = [{
        'Total Sistemas': predictions.length,
        'Data Exportação': new Date().toLocaleString('pt-PT'),
        'Próximo Sorteio': nextDrawDate.toLocaleDateString('pt-PT'),
        'Ficheiro': fileName
    }];

    const ws3 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws3, 'Resumo');

    // Guardar ficheiro
    XLSX.writeFile(wb, outputPath);

    console.log(`✅ Ficheiro criado: ${outputPath}\n`);
    console.log(`📊 ${predictions.length} sistemas exportados\n`);

    await prisma.$disconnect();

    return {
        fileName,
        filePath: outputPath,
        systemsCount: predictions.length,
        nextDrawDate: nextDrawDate.toLocaleDateString('pt-PT')
    };
}

// Executar se chamado diretamente
if (require.main === module) {
    exportPredictionsToExcel()
        .then(result => {
            console.log('🎉 EXPORT CONCLUÍDO!\n');
            console.log(`📁 Ficheiro: ${result.fileName}`);
            console.log(`📊 Sistemas: ${result.systemsCount}`);
            console.log(`📅 Sorteio: ${result.nextDrawDate}`);
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            process.exit(1);
        });
}

export { exportPredictionsToExcel };
