const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    const all = await prisma.draw.findMany({ 
        where: { game: 'MEGASENA' }, 
        select: { date: true, numbers: true, stars: true },
        orderBy: { date: 'asc' } 
    });

    const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];

    // Days distribution - full history
    const dayCounts = [0,0,0,0,0,0,0];
    all.forEach(d => { dayCounts[new Date(d.date).getDay()]++; });
    console.log("=== DISTRIBUIÇÃO DIAS - HISTÓRICO COMPLETO ===");
    days.forEach((d, i) => { if(dayCounts[i] > 0) console.log("  " + d + ": " + dayCounts[i]); });

    // Stars field check
    const starsEmpty = all.filter(d => !d.stars || d.stars === '' || d.stars === '[]').length;
    const starsNotEmpty = all.filter(d => d.stars && d.stars !== '' && d.stars !== '[]').length;
    console.log("\n=== CAMPO STARS ===");
    console.log("  Vazios/[]: " + starsEmpty);
    console.log("  Com conteúdo: " + starsNotEmpty);
    if(starsNotEmpty > 0) {
        const sample = all.filter(d => d.stars && d.stars !== '' && d.stars !== '[]').slice(0,3);
        sample.forEach(s => console.log("    ex: date=" + s.date.toISOString().split('T')[0] + " stars=" + s.stars));
    }

    // Number of numbers per draw
    const numCounts = {};
    all.forEach(d => {
        const n = d.numbers ? d.numbers.replace(/[\[\]]/g, '').split(',').filter(x => x.trim()).length : 0;
        numCounts[n] = (numCounts[n] || 0) + 1;
    });
    console.log("\n=== QTD NÚMEROS POR SORTEIO ===");
    Object.keys(numCounts).sort().forEach(k => console.log("  " + k + " números: " + numCounts[k] + " sorteios"));

    // Gaps analysis per era
    console.log("\n=== LACUNAS POR PERÍODO ===");
    let gaps = [];
    for(let i = 1; i < all.length; i++) {
        const prev = new Date(all[i-1].date);
        const curr = new Date(all[i].date);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if(diff > 7) {
            gaps.push({ from: prev.toISOString().split('T')[0], to: curr.toISOString().split('T')[0], days: diff });
        }
    }
    console.log("  Total lacunas > 7 dias: " + gaps.length);
    gaps.forEach(g => console.log("  " + g.from + " -> " + g.to + " (" + g.days + " dias)"));

    // Draws per year
    console.log("\n=== SORTEIOS POR ANO ===");
    const byYear = {};
    all.forEach(d => {
        const y = new Date(d.date).getFullYear();
        byYear[y] = (byYear[y] || 0) + 1;
    });
    Object.keys(byYear).sort().forEach(y => {
        const expected = y < 2001 ? '~52' : y < 2013 ? '~100-104' : y < 2015 ? '105' : y < 2023 ? '110-115' : '120+';
        const flag = parseInt(byYear[y]) < 90 && parseInt(y) > 2000 && parseInt(y) < 2026 ? ' ⚠️' : '';
        console.log("  " + y + ": " + byYear[y] + " (esperado: " + expected + ")" + flag);
    });

    await prisma.$disconnect();
}
audit().catch(e => { console.error(e.message); });
