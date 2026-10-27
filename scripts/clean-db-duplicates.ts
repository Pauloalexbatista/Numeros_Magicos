import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];

  console.log('--- 1. Limpeza de predições em SystemPrediction ---');
  // Eliminar predições de SuperSistema Neuronal nas 4 lotarias (pois Supersistema Neuronal já tem as oficiais consolidadas)
  const delPreds1 = await prisma.systemPrediction.deleteMany({
    where: {
      game: { in: games },
      systemName: 'SuperSistema Neuronal'
    }
  });
  console.log(`Eliminadas ${delPreds1.count} predições de SuperSistema Neuronal.`);

  const delPreds2 = await prisma.systemPrediction.deleteMany({
    where: {
      game: { in: games },
      systemName: 'Random Forest AI'
    }
  });
  console.log(`Eliminadas ${delPreds2.count} predições de Random Forest AI.`);

  console.log('--- 2. Limpeza de sistemas duplicados em RankedSystem ---');
  const delSys1 = await prisma.rankedSystem.deleteMany({
    where: {
      game: { in: games },
      name: 'SuperSistema Neuronal'
    }
  });
  console.log(`Eliminados ${delSys1.count} registos de SuperSistema Neuronal em RankedSystem.`);

  const delSys2 = await prisma.rankedSystem.deleteMany({
    where: {
      game: { in: games },
      name: 'Random Forest AI'
    }
  });
  console.log(`Eliminados ${delSys2.count} registos de Random Forest AI em RankedSystem.`);

  console.log('✅ Base de dados perfeitamente limpa!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
