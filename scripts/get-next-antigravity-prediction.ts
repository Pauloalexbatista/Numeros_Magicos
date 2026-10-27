import { PrismaClient } from '@prisma/client';
import { predictAntigravityV2 } from './test-antigravity-v2';

const prisma = new PrismaClient();

async function main() {
  const rawDraws = await prisma.draw.findMany({
    where: { game: 'TOTOLOTO' },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, numbers: true }
  });

  const parsedDraws = rawDraws.map(d => {
    let nums: number[] = [];
    if (typeof d.numbers === 'string') {
      try { nums = JSON.parse(d.numbers); } catch { nums = []; }
    } else if (Array.isArray(d.numbers)) {
      nums = d.numbers as unknown as number[];
    }
    return { id: d.id, date: d.date, numbers: nums };
  }).filter(d => d.numbers.length === 5);

  const fullHistory = [...parsedDraws].reverse(); // newest first
  const pred25 = predictAntigravityV2(fullHistory, 49, 25);
  const pred21 = predictAntigravityV2(fullHistory, 49, 21);

  console.log('Previsão do Sistema Antigravity para o Próximo Totoloto (4ª Feira):');
  console.log('Top 21 (Crescente):', [...pred21].sort((a,b) => a-b));
  console.log('Top 21 (Ordem de Seleção):', pred21);
  console.log('Top 25 (Crescente):', [...pred25].sort((a,b) => a-b));
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
});
