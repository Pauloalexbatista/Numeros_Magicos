const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    console.log("=== AUDITORIA MEGA SENA ===\n");

    const total = await prisma.draw.count({ where: { game: 'MEGASENA' } });
    console.log("Total sorteios Mega Sena na BD:", total);

    const first = await prisma.draw.findFirst({ where: { game: 'MEGASENA' }, orderBy: { date: 'asc' } });
    const last  = await prisma.draw.findFirst({ where: { game: 'MEGASENA' }, orderBy: { date: 'desc' } });
    console.log("Primeiro:", first ? first.date.toISOString().split('T')[0] + " nums:" + first.numbers : 'N/A');
    console.log("Ultimo:  ", last  ? last.date.toISOString().split('T')[0]  + " nums:" + last.numbers  : 'N/A');

    const all = await prisma.draw.findMany({ where: { game: 'MEGASENA' }, select: { date: true }, orderBy: { date: 'asc' } });
    const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
    const dayCounts = [0,0,0,0,0,0,0];
    all.forEach(d => { dayCounts[new Date(d.date).getDay()]++; });
    console.log("\nSorteios por dia da semana:");
    days.forEach((d, i) => { if(dayCounts[i] > 0) console.log("  " + d + ": " + dayCounts[i]); });

    const dates = all.map(d => d.date.toISOString().split('T')[0]);
    const dups = dates.filter((d, i) => dates.indexOf(d) !== i);
    console.log("\nDuplicados:", dups.length > 0 ? dups.join(', ') : 'Nenhum');

    const allDraws = await prisma.draw.findMany({ where: { game: 'MEGASENA' }, select: { date: true, numbers: true } });
    let outOfRange = [];
    allDraws.forEach(d => {
        const nums = d.numbers.split(',').map(Number);
        const bad = nums.filter(n => n < 1 || n > 60);
        if(bad.length > 0) outOfRange.push({ date: d.date.toISOString().split('T')[0], bad: bad });
    });
    console.log("\nNumeros fora de 1-60:", outOfRange.length > 0 ? JSON.stringify(outOfRange.slice(0,5)) : 'Nenhum');

    const last5 = await prisma.draw.findMany({ where: { game: 'MEGASENA' }, orderBy: { date: 'desc' }, take: 5 });
    console.log("\nUltimos 5 sorteios:");
    last5.forEach(d => { console.log("  " + d.date.toISOString().split('T')[0] + " (" + days[new Date(d.date).getDay()] + "): [" + d.numbers + "] seq:" + d.sequenceNumber); });

    await prisma.disconnect();
}
audit().catch(e => { console.error(e.message); process.exit(1); });
