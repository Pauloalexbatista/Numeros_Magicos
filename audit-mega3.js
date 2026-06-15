const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    // Verify: what days do draws happen in recent years (2024-2026)?
    const recent = await prisma.draw.findMany({ 
        where: { game: 'MEGASENA', date: { gte: new Date('2024-01-01') } },
        select: { date: true, numbers: true },
        orderBy: { date: 'desc' },
        take: 30
    });

    const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
    console.log("Ultimos 30 sorteios (2024-2026):");
    recent.forEach(d => {
        const dt = new Date(d.date);
        console.log("  " + dt.toISOString().split('T')[0] + " (" + days[dt.getDay()] + "): " + d.numbers);
    });

    // Count by day for 2024+
    const dayCounts = [0,0,0,0,0,0,0];
    recent.forEach(d => { dayCounts[new Date(d.date).getDay()]++; });
    console.log("\nDias (2024-2026):");
    days.forEach((d, i) => { if(dayCounts[i] > 0) console.log("  " + d + ": " + dayCounts[i]); });

    // Latest draw vs today
    const latest = await prisma.draw.findFirst({ where: { game: 'MEGASENA' }, orderBy: { date: 'desc' } });
    const today = new Date();
    const diff = Math.floor((today - new Date(latest.date)) / (1000 * 60 * 60 * 24));
    console.log("\nUltimo sorteio: " + latest.date.toISOString().split('T')[0]);
    console.log("Hoje: " + today.toISOString().split('T')[0]);
    console.log("Diferenca: " + diff + " dias");

    await prisma.$disconnect();
}
audit().catch(e => { console.error(e.message); });
