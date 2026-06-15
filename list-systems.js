const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    // All systems for all games
    const all = await prisma.rankedSystem.findMany({
        select: { name:true, game:true, systemType:true, domain:true, isActive:true },
        orderBy: [{ game: 'asc' }, { name: 'asc' }]
    });
    
    const byGame = {};
    all.forEach(s => {
        if (!byGame[s.game]) byGame[s.game] = [];
        byGame[s.game].push(s);
    });
    
    Object.keys(byGame).sort().forEach(game => {
        console.log("\n=== " + game + " (" + byGame[game].length + " sistemas) ===");
        byGame[game].forEach(s => {
            console.log("  [" + s.domain + "] " + s.name + " (" + s.systemType + ") active=" + s.isActive);
        });
    });

    await prisma.$disconnect();
}
main().catch(e => console.error(e.message));
