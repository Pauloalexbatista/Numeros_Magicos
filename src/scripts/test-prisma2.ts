import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const d = await prisma.draw.findFirst();
    console.log("SUCCESS:");
    console.log(d);
  } catch (e) {
    console.log("ERROR:");
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
