import { prisma } from './src/lib/prisma';

async function main() {
    console.log('--- A analisar sorteios do TOTOLOTO ---');
    const draws = await prisma.draw.findMany({ where: { game: 'TOTOLOTO' }, orderBy: { date: 'asc' } });
    const dateCounts = new Map<string, number>();
    
    for (const d of draws) {
        const dStr = d.date.toISOString().split('T')[0];
        dateCounts.set(dStr, (dateCounts.get(dStr) || 0) + 1);
    }
    
    let duplicates = 0;
    let redundantRecords = 0;
    
    for (const [date, count] of dateCounts.entries()) {
        if (count > 1) {
            duplicates++;
            redundantRecords += (count - 1);
            if (duplicates <= 10) {
                console.log(`Duplicado: ${date} tem ${count} registos.`);
            }
        }
    }
    
    if (duplicates > 10) console.log(`... e mais ${duplicates - 10} datas ocultadas.`);
    console.log(`Total de datas com duplicações: ${duplicates}`);
    console.log(`Total de registos redundantes (a apagar): ${redundantRecords}`);
    console.log(`Total atual de registos Totoloto: ${draws.length}`);
    console.log(`Total esperado (únicos): ${draws.length - redundantRecords}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
