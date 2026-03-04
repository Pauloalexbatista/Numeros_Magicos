import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function getLastDrawNumberSystems(game: string = 'EUROMILLIONS') {
    const lastDraw = await prisma.draw.findFirst({
        where: { game },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    if (!lastDraw) return { date: null, systems: [] };

    const performances = await prisma.systemPerformance.findMany({
        where: { drawId: lastDraw.id, system: { domain: 'NUMBERS' } },
        orderBy: { hits: 'desc' }
    });

    const drawDate = lastDraw.date.toLocaleDateString('pt-PT');

    return {
        date: drawDate,
        systems: performances.map(p => ({ systemName: p.systemName, hits: p.hits })).filter(s => s.hits > 0)
    };
}

async function getLastDrawStarSystems(game: string = 'EUROMILLIONS') {
    const lastDraw = await prisma.draw.findFirst({
        where: { game },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, stars: true }
    });

    if (!lastDraw) return { date: null, systems: [] };

    const performances = await prisma.starSystemPerformance.findMany({
        where: { drawId: lastDraw.id },
        orderBy: { hits: 'desc' }
    });

    const drawDate = lastDraw.date.toLocaleDateString('pt-PT');

    return {
        date: drawDate,
        systems: performances.map(p => ({ systemName: p.systemName, hits: p.hits })).filter(s => s.hits > 0)
    };
}

async function main() {
    console.log("=== ACTUAL ACTION OUTPUT ===");
    console.log("EUROMILLIONS NUMBERS:", await getLastDrawNumberSystems('EUROMILLIONS'));
    console.log("EUROMILLIONS STARS:", await getLastDrawStarSystems('EUROMILLIONS'));
}

main().finally(() => prisma.$disconnect());
