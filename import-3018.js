const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Import concurso 3018 - 2026-06-14 - numbers: 5,6,17,27,57,58
    const drawDate = new Date(2026, 5, 14, 12, 0, 0); // June 14 2026 noon

    const result = await prisma.draw.upsert({
        where: { game_date: { game: 'MEGASENA', date: drawDate } },
        update: {
            numbers: JSON.stringify([5,6,17,27,57,58]),
            stars: JSON.stringify([]),
            sequenceNumber: 3018,
            hasWinner: false
        },
        create: {
            game: 'MEGASENA',
            date: drawDate,
            numbers: JSON.stringify([5,6,17,27,57,58]),
            stars: JSON.stringify([]),
            sequenceNumber: 3018,
            hasWinner: false
        }
    });

    console.log("Importado:", result.id, result.date.toISOString().split('T')[0], result.numbers);

    // Also update ALL existing MEGASENA draws with correct sequenceNumber
    // We know the total is 3018 concursos. Let's verify final count.
    const total = await prisma.draw.count({ where: { game: 'MEGASENA' } });
    const withSeq = await prisma.draw.count({ where: { game: 'MEGASENA', sequenceNumber: { not: null } } });
    console.log("\nTotal na BD apos importacao:", total);
    console.log("Com sequenceNumber preenchido:", withSeq);
    
    // Show last 5 to confirm
    const last5 = await prisma.draw.findMany({ where: { game: 'MEGASENA' }, orderBy: { date: 'desc' }, take: 5 });
    const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
    console.log("\nUltimos 5 sorteios:");
    last5.forEach(d => {
        const dt = new Date(d.date);
        console.log("  " + dt.toISOString().split('T')[0] + " (" + days[dt.getDay()] + "): " + d.numbers + " | seq:" + d.sequenceNumber);
    });

    await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); });
