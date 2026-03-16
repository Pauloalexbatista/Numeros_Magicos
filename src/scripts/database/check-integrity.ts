import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration of expected draw days for each game
// 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
const expectedDays: Record<string, number[]> = {
    EUROMILLIONS: [2, 5], // Tuesday, Friday
    EURODREAMS: [1, 4],   // Monday, Thursday
    TOTOLOTO: [3, 6],     // Wednesday, Saturday
};

async function checkGameIntegrity(game: string) {
    console.log(`\n🔍 Verificando Integridade: ${game} ...`);

    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' },
    });

    if (draws.length === 0) {
        console.log(`❌ Nenhum sorteio encontrado para ${game}.`);
        return;
    }

    const firstDrawDate = draws[0].date;
    const lastDrawDate = draws[draws.length - 1].date;

    console.log(`📅 Intervalo: ${firstDrawDate.toISOString().split('T')[0]} a ${lastDrawDate.toISOString().split('T')[0]}`);
    console.log(`🔢 Total na Base de Dados: ${draws.length} sorteios`);

    const missingDates: string[] = [];
    const duplicateDates: string[] = [];

    // Create a Set of dates present in the DB for quick lookup
    const drawDates = new Set<string>();
    
    // Check for duplicates
    for (const draw of draws) {
        const dateStr = draw.date.toISOString().split('T')[0];
        if (drawDates.has(dateStr)) {
            duplicateDates.push(dateStr);
        }
        drawDates.add(dateStr);
    }

    // Check for missing draws
    let currentDate = new Date(firstDrawDate);
    const targetDays = expectedDays[game];

    // Iterar dia por dia até à data do último sorteio
    while (currentDate <= lastDrawDate) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];

        // Se for um dia esperado de sorteio para este jogo
        if (targetDays.includes(dayOfWeek)) {
            if (!drawDates.has(dateStr)) {
                missingDates.push(dateStr);
            }
        }

        // Avançar um dia
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (missingDates.length === 0 && duplicateDates.length === 0) {
        console.log(`✅ ${game}: Base de dados perfeita e sem falhas! 100% de Integridade.`);
    } else {
        if (missingDates.length > 0) {
            console.log(`⚠️  ${game}: Faltam ${missingDates.length} sorteios esperados.`);
            if (missingDates.length <= 15) {
                console.log(`   Datas ausentes: ${missingDates.join(', ')}`);
            } else {
                console.log(`   Exemplos de ausentes: ${missingDates.slice(0, 10).join(', ')} ... e mais ${missingDates.length - 10}`);
            }
        }
        if (duplicateDates.length > 0) {
            console.log(`🚨 ${game}: Encontrados ${duplicateDates.length} sorteios duplicados!`);
            console.log(`   Datas duplicadas: ${duplicateDates.join(', ')}`);
        }
    }
}

async function main() {
    console.log('--- INICIANDO VERIFICAÇÃO DE INTEGRIDADE DA BASE DE DADOS ---');
    try {
        await checkGameIntegrity('EUROMILLIONS');
        await checkGameIntegrity('EURODREAMS');
        await checkGameIntegrity('TOTOLOTO');
    } catch (error) {
        console.error('Erro durante a verificação:', error);
    } finally {
        await prisma.$disconnect();
        console.log('\n--- VERIFICAÇÃO CONCLUÍDA ---');
    }
}

main();
