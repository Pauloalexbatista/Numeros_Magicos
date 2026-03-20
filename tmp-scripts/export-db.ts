import { prisma } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function exportToCSV() {
    console.log('Extraindo todos os sorteios da base de dados...');
    
    const draws = await prisma.draw.findMany({
        orderBy: [
            { game: 'asc' },
            { date: 'asc' }
        ]
    });

    console.log(`Foram encontrados ${draws.length} sorteios no total.`);

    let csvContent = '\uFEFF'; // BOM para o Excel ler acentos PT-PT corretamente
    csvContent += 'JOGO;DATA;N1;N2;N3;N4;N5;N6;ESTRELA_1;ESTRELA_2\n';

    for (const draw of draws) {
        const dateStr = draw.date.toISOString().split('T')[0];
        
        let numbers = [];
        let stars = [];
        
        try {
            numbers = JSON.parse(draw.numbers);
        } catch(e) {}
        
        try {
            stars = JSON.parse(draw.stars);
        } catch(e) {}

        // Pad arrays
        const n1 = numbers[0] || '';
        const n2 = numbers[1] || '';
        const n3 = numbers[2] || '';
        const n4 = numbers[3] || '';
        const n5 = numbers[4] || '';
        const n6 = numbers[5] || ''; // Only EuroDreams uses N6
        const s1 = stars[0] || '';
        const s2 = stars[1] || ''; // EuroMillions uses S2

        const row = [draw.game, dateStr, n1, n2, n3, n4, n5, n6, s1, s2];
        csvContent += row.join(';') + '\n';
    }

    const filePath = path.join(process.cwd(), 'Exportacao_Completa_Sorteios.csv');
    fs.writeFileSync(filePath, csvContent, 'utf8');

    console.log(`\n✅ Sucesso! Ficheiro guardado em:\n${filePath}`);
}

exportToCSV()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
