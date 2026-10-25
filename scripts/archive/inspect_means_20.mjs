import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function inspect() {
  const draws = await p.draw.findMany({
    where: { game: "TOTOLOTO" },
    orderBy: { date: "desc" },
    take: 30
  });
  for (let i = 0; i < 6; i++) {
    const subset = draws.slice(i, i + 20);
    const recent = subset.map(d => (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers).sort((a,b)=>a-b));
    const means = [];
    for (let c = 0; c < 5; c++) {
      const vals = recent.map(r => r[c]);
      const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
      means.push(avg.toFixed(2));
    }
    const rounded = means.map(m => Math.round(Number(m)));
    console.log(`Draw T-${i} [${draws[i].date.toISOString().split("T")[0]}]: Means(20): [${means.join(", ")}] -> Rounded: [${rounded.join(", ")}]`);
  }
}
inspect().finally(() => p.$disconnect());
