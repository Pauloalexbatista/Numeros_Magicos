const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.systemPerformance.findFirst({ where: { systemName: 'Diagonais da Matriz', game: 'EUROMILLIONS' } })
    .then(r => console.log(r))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
