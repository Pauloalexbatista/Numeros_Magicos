import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

function readExcelInfo(filePath: string) {
    if (!fs.existsSync(filePath)) {
        console.log(`[X] Arquivo não encontrado: ${filePath}`);
        return;
    }
    try {
        console.log(`\n\n=== A LER O FICHEIRO: ${filePath} ===`);
        const workbook = XLSX.readFile(filePath);
        console.log(`Folhas disponíveis: ${workbook.SheetNames.join(', ')}`);
        
        for (const sheetName of workbook.SheetNames) {
            console.log(`\n-- Folha: ${sheetName} --`);
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            console.log(`Total de Linhas: ${data.length}`);
            if (data.length > 0) {
                console.log(`Cabeçalhos (1ª Linha):`, data[0]);
                console.log(`Exemplo (2ª Linha):`, data[1]);
            }
        }
    } catch (e) {
        console.error(`Status de erro ao ler ${filePath}:`, e.message);
    }
}

const file1 = path.join(process.cwd(), '1-TOOLS/BD com todos os sorteios.xlsx');
const file2 = path.join(process.cwd(), 'Exportacao_Completa_Sorteios.xlsm');

readExcelInfo(file1);
readExcelInfo(file2);
