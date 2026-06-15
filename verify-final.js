const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.draw.count({ where: { game: 'MEGASENA' } });
    const withSeq = await prisma.draw.count({ where: { game: 'MEGASENA', sequenceNumber: { not: null } } });

    // Verify sequence numbers are correct (no gaps, no duplicates)
    const all = await prisma.draw.findMany({
        where: { game: 'MEGASENA' },
        select: { sequenceNumber: true, date: true, numbers: true },
        orderBy: { sequenceNumber: 'asc' }
    });

    // Check for gaps in sequence numbers
    let seqGaps = [];
    for (let i = 1; i < all.length; i++) {
        const prev = all[i-1].sequenceNumber;
        const curr = all[i].sequenceNumber;
        if (curr - prev > 1) seqGaps.push({ from: prev, to: curr, gap: curr - prev - 1 });
    }

    // Check for duplicate sequence numbers
    const seqs = all.map(d => d.sequenceNumber);
    const dupSeqs = seqs.filter((s, i) => seqs.indexOf(s) !== i);

    const first = all[0];
    const last = all[all.length - 1];

    console.log("=== VERIFICAÇÃO FINAL MEGA SENA ===");
    console.log("Total sorteios: " + total);
    console.log("Com sequenceNumber: " + withSeq + " / " + total);
    console.log("Seq Mínima: " + first.sequenceNumber + " | Data: " + new Date(first.date).toISOString().split('T')[0]);
    console.log("Seq Máxima: " + last.sequenceNumber + " | Data: " + new Date(last.date).toISOString().split('T')[0]);
    console.log("Lacunas na sequência: " + (seqGaps.length === 0 ? "Nenhuma ✅" : JSON.stringify(seqGaps)));
    console.log("Sequências duplicadas: " + (dupSeqs.length === 0 ? "Nenhuma ✅" : dupSeqs.join(',')));

    console.log("\nÚltimos 5 sorteios:");
    const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
    all.slice(-5).reverse().forEach(d => {
        const dt = new Date(d.date);
        console.log("  Concurso " + d.sequenceNumber + " | " + dt.toISOString().split('T')[0] + " (" + days[dt.getDay()] + "): " + d.numbers);
    });

    await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); });
