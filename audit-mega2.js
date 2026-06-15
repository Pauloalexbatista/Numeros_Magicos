const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    // Check gaps - find missing expected draw dates
    const all = await prisma.draw.findMany({ 
        where: { game: 'MEGASENA' }, 
        select: { date: true, sequenceNumber: true },
        orderBy: { date: 'asc' } 
    });

    // Find gaps between draws (normally 2-3 days apart, Ter/Qui/Sab since 2013)
    const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
    let bigGaps = [];
    for(let i = 1; i < all.length; i++) {
        const prev = new Date(all[i-1].date);
        const curr = new Date(all[i].date);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if(diff > 7) {
            bigGaps.push({
                from: prev.toISOString().split('T')[0] + ' (' + days[prev.getDay()] + ')',
                to:   curr.toISOString().split('T')[0] + ' (' + days[curr.getDay()] + ')',
                days: diff
            });
        }
    }
    console.log("Lacunas > 7 dias:", bigGaps.length);
    bigGaps.slice(0,10).forEach(g => console.log("  " + g.from + " -> " + g.to + " (" + g.days + " dias)"));

    // Check sequence numbers
    const withSeq = all.filter(d => d.sequenceNumber !== null);
    const withoutSeq = all.filter(d => d.sequenceNumber === null);
    console.log("\nCom numero de sequencia:", withSeq.length);
    console.log("Sem numero de sequencia:", withoutSeq.length);

    // Check draws per year
    console.log("\nSorteios por ano:");
    const byYear = {};
    all.forEach(d => {
        const y = new Date(d.date).getFullYear();
        byYear[y] = (byYear[y] || 0) + 1;
    });
    Object.keys(byYear).sort().forEach(y => console.log("  " + y + ": " + byYear[y]));

    await prisma.$disconnect();
}
audit().catch(e => { console.error(e.message); process.exit(1); });
