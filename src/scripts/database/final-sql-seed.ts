import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const explanations = [
    { name: 'Clustering', concept: 'Agrupamento inteligente em 3 clusters (Baixos, Médios e Altos).', logic: 'O algoritmo divide o pool de números em três zonas de probabilidade. Analisa qual zona tem tido mais atividade e seleciona os números com maior frequência nessa zona.' },
    { name: 'Monte Carlo', concept: 'Simulações probabilísticas avançadas baseadas em força bruta computacional.', logic: 'Executa 10.000 sorteios virtuais ponderados. Os resultados que mais aparecem nestas simulações massivas são os sugeridos.' },
    { name: 'Markov', concept: 'Cadeias de Markov para prever a probabilidade de transição entre estados.', logic: 'Analisa o estado do último sorteio e calcula a probabilidade de transição para o próximo, escolhendo as transições com maior peso estatístico.' },
    { name: 'Hot', concept: 'Sistema de persistência baseado na Lei dos Números Quentes.', logic: 'Baseia-se na tendência de que números frequentes mantêm o momentum e têm maior probabilidade de sair novamente no curto prazo.' },
    { name: 'Late', concept: 'Sistema de compensação baseado na Lei da Média.', logic: 'Foca-se nos números em atraso (frios), partindo do princípio estatístico de que a média histórica tende a equilibrar-se.' },
    { name: 'Pyramid', concept: 'Cálculo piramidal baseado na sequência de Pascal.', logic: 'Cria uma pirâmide numérica somando os dígitos do último sorteio sucessivamente até encontrar a raiz vibracional do próximo sorteio.' },
    { name: 'Vortex', concept: 'Matemática de Base 9 baseada nas teorias de Nikola Tesla.', logic: 'Aplica a redução teosófica aos números e projeta-os num diagrama circular seguindo o fluxo de energia toroidal.' },
    { name: 'Random Forest', concept: 'IA baseada em Florestas de Decisão Aleatórias.', logic: 'Treina centenas de árvores de decisão com o histórico total. O consenso entre as árvores gera a previsão final mais robusta.' },
    { name: 'LSTM', concept: 'Rede Neuronal de Memória de Longo Prazo (Deep Learning).', logic: 'IA avançada que deteta padrões cíclicos complexos em sequências longas, ajustando pesos em tempo real.' },
    { name: 'Média + 3', concept: 'Algoritmo de compensação de vizinhança.', logic: 'Calcula a média aritmética dos últimos sorteios e aplica um desvio posicional para capturar a tendência de vizinhança.' }
  ];

  const tables = ['ranked_systems', 'system_ranking', 'star_system_ranking'];
  
  for (const exp of explanations) {
    for (const table of tables) {
      const nameField = table === 'ranked_systems' ? 'name' : 'systemName';
      console.log(`Updating ${table} for ${exp.name}...`);
      try {
        if (table === 'ranked_systems') {
            await prisma.$executeRaw`UPDATE ranked_systems SET concept = ${exp.concept}, logic = ${exp.logic} WHERE name ILIKE ${'%' + exp.name + '%'}`;
        } else if (table === 'system_ranking') {
            await prisma.$executeRaw`UPDATE system_ranking SET concept = ${exp.concept}, logic = ${exp.logic} WHERE "systemName" ILIKE ${'%' + exp.name + '%'}`;
        } else if (table === 'star_system_ranking') {
            await prisma.$executeRaw`UPDATE star_system_ranking SET concept = ${exp.concept}, logic = ${exp.logic} WHERE "systemName" ILIKE ${'%' + exp.name + '%'}`;
        }
      } catch (e) {
        console.error(`Failed to update ${table}:`, e);
      }
    }
  }
  console.log('✅ ALL DONE VIA RAW SQL');
  await prisma.$disconnect();
}

main();
