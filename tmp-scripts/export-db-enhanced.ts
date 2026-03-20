import { prisma } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

const DAYS_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

async function exportEnhancedDB() {
    console.log('Extraindo todos os sorteios com colunas de validação avançadas...');

    const draws = await prisma.draw.findMany({
        orderBy: [
            { game: 'asc' },
            { date: 'asc' }
        ]
    });

    const lines = [];
    // Cabeçalho compatível com o do utilizador
    lines.push('JOGO;DATA;N1;N2;N3;N4;N5;N6;ESTRELA_1;ESTRELA_2;Dia Num;Dia da Semana;Diferenca dias');

    let prevDates: { [game: string]: Date } = {};

    for (const draw of draws) {
        // Garantir Noon UTC para evitar saltos locais
        const drawDate = new Date(draw.date.toISOString().split('T')[0] + "T12:00:00Z");
        
        // Formatar DATA (PT Format: DD/MM/YYYY para Excel ler perfeitamente)
        const day = String(drawDate.getUTCDate()).padStart(2, '0');
        const month = String(drawDate.getUTCMonth() + 1).padStart(2, '0');
        const year = drawDate.getUTCFullYear();
        const dateStr = `${day}/${month}/${year}`;

        const numbers = JSON.parse(draw.numbers);
        const stars = JSON.parse(draw.stars);

        const n1 = numbers[0] || '';
        const n2 = numbers[1] || '';
        const n3 = numbers[2] || '';
        const n4 = numbers[3] || '';
        const n5 = numbers[4] || '';
        const n6 = numbers[5] || '';
        const s1 = stars[0] || '';
        const s2 = stars[1] || '';

        // Validações do Utilizador
        const dayNum = drawDate.getUTCDay(); // 0 a 6
        const dayText = DAYS_PT[dayNum];

        // Calcular Diferença de Dias para o sorteio anterior do mesmo jogo
        let diffDays = '';
        if (prevDates[draw.game]) {
            const diffMs = drawDate.getTime() - prevDates[draw.game].getTime();
            diffDays = String(Math.round(diffMs / (1000 * 60 * 60 * 24)));
        }
        prevDates[draw.game] = drawDate;

        const row = [
            draw.game, dateStr, n1, n2, n3, n4, n5, n6, s1, s2,
            dayNum, dayText, diffDays
        ];
        lines.push(row.join(';'));
    }

    const filepath = path.join(process.cwd(), 'Exportacao_DB_Validada.csv');
    // Save with UTF-8 BOM so Excel opens it with correct encoding
    fs.writeFileSync(filepath, '\ufeff' + lines.join('\n'), 'utf8');

    console.log(`Foram exportados ${draws.length} sorteios.`);
    console.log(`✅ Sucesso! Ficheiro guardado em: ${filepath}`);
}

exportEnhancedDB()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
