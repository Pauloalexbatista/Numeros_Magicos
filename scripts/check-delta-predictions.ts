import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deltaDrawIds = [7009, 6990, 6994, 6999, 18479, 18483, 7013, 7017, 7021, 7025, 18504, 18609];
  const systems = [
    'Agrupamento de Padrões (Clustering)',
    'Últimos a Sair',
    'Mais Quentes',
    'Pirâmide de Pascal',
    'Tiro Certeiro'
  ];

  const preds = await prisma.systemPrediction.findMany({
    where: {
      drawId: { in: deltaDrawIds },
      systemName: { in: systems },
      domain: 'NUMBERS'
    },
    select: { drawId: true, systemName: true, prediction: true }
  });

  console.log(`Encontradas ${preds.length} predições para os 12 sorteios delta (esperado: ${deltaDrawIds.length * systems.length} = 60).`);
}

main().finally(() => prisma.$disconnect());
