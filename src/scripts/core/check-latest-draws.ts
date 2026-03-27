import { prisma } from '@/lib/prisma';

async function checkLatestDraws() {
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 5,
        select: { id: true, date: true, numbers: true }
    });

    console.log('📅 Últimos 5 sorteios na BD:\n');
    draws.forEach((d, i) => {
        const nums = typeof d.numbers === 'string' ? (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) : d.numbers;
        console.log(`${i + 1}. ID: ${d.id} | Data: ${new Date(d.date).toLocaleDateString('pt-PT')} | Números: ${nums.join(', ')}`);
    });

    await prisma.$disconnect();
}

checkLatestDraws();
