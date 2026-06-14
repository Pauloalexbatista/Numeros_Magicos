import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = ['ranked_systems', 'system_ranking', 'star_system_ranking'];
  
  // 1. Garantir colunas
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS concept TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS logic TEXT;`);
    } catch (e) {}
  }

  // 2. Explicações Oficiais
  const explanations = [
    { name: 'Markov', concept: 'Análise de probabilidades de transição entre números.', logic: 'O sistema analisa qual a probabilidade de um número sair logo a seguir a outro, baseando-se em cadeias de probabilidade estatística (Markov).' },
    { name: 'Monte Carlo', concept: 'Simulações probabilísticas avançadas baseadas em força bruta computacional.', logic: 'Executa milhares de sorteios virtuais para identificar quais os números que têm maior tendência matemática de aparecer.' },
    { name: 'Clustering', concept: 'Agrupamento inteligente de números.', logic: 'O algoritmo divide o pool de números em três zonas de probabilidade (Baixos, Médios e Altos) e analisa qual a zona mais ativa.' },
    { name: 'Sist Média', concept: 'Algoritmo de compensação de vizinhança com ajuste de desvio.', logic: 'Calcula a média aritmética dos últimos sorteios e aplica um desvio posicional para capturar a tendência de salto comum nas lotarias.' }
  ];

  // 3. Gravar dados com segurança de maiúsculas
  for (const exp of explanations) {
    for (const table of tables) {
      const nameField = (table === 'ranked_systems') ? 'name' : '"systemName"';
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE ${table} SET concept = $1, logic = $2 WHERE ${nameField} ILIKE $3`,
          exp.concept, exp.logic, `%${exp.name}%`
        );
      } catch (e) {
        console.error(`Erro em ${table}:`, e);
      }
    }
  }

  console.log('✅ PROCESSO CONCLUÍDO EM SEGURANÇA');
  await prisma.$disconnect();
}

main();
