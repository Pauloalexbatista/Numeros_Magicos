import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const explanations = [
    { name: 'Markov', concept: 'Análise de probabilidades de transição entre números.', logic: 'O sistema analisa qual a probabilidade de um número sair logo a seguir a outro, baseando-se em cadeias de probabilidade estatística (Markov).' },
    { name: 'Monte Carlo', concept: 'Simulações probabilísticas baseadas em força bruta computacional.', logic: 'Executa milhares de sorteios virtuais para identificar quais os números que têm maior tendência matemática de aparecer.' }
  ];

  for (const exp of explanations) {
    console.log(`Force updating: ${exp.name}`);
    
    // SQL PURO SEM INTERPRETAÇÃO DO PRISMA
    const query1 = `UPDATE ranked_systems SET concept = '${exp.concept}', logic = '${exp.logic}' WHERE name ILIKE '%${exp.name}%'`;
    const query2 = `UPDATE system_ranking SET concept = '${exp.concept}', logic = '${exp.logic}' WHERE "systemName" ILIKE '%${exp.name}%'`;
    const query3 = `UPDATE star_system_ranking SET concept = '${exp.concept}', logic = '${exp.logic}' WHERE "systemName" ILIKE '%${exp.name}%'`;

    try { await prisma.$executeRawUnsafe(query1); console.log('OK 1'); } catch(e) { console.log('ERR 1'); }
    try { await prisma.$executeRawUnsafe(query2); console.log('OK 2'); } catch(e) { console.log('ERR 2'); }
    try { await prisma.$executeRawUnsafe(query3); console.log('OK 3'); } catch(e) { console.log('ERR 3'); }
  }

  await prisma.$disconnect();
}

main();
