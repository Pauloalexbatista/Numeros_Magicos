import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const draws = await prisma.draw.findMany({
      orderBy: { date: 'desc' },
      take: 1
    });
    console.log("SUCCESS");
    console.log("LATEST DRAW:", draws[0]?.date);
  } catch (e) {
    console.log("ERROR OUTPUT:");
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
