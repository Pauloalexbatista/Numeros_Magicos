import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = ['ranked_systems', 'system_ranking', 'star_system_ranking'];
  
  // Garantir colunas (Safety first)
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS concept TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS logic TEXT;`);
    } catch (e) {}
  }

  // LISTA COMPLETA DE EXPLICAÇÕES
  const explanations = [
    { name: 'Clustering', concept: 'Agrupamento inteligente em 3 clusters (Baixos, Médios e Altos).', logic: 'O algoritmo divide o pool de números em três zonas de probabilidade. Analisa qual zona (cluster) tem tido mais atividade nos últimos sorteios e seleciona os números com maior frequência dentro dessa zona específica.' },
    { name: 'Monte Carlo', concept: 'Simulações probabilísticas avançadas baseadas em força bruta computacional.', logic: 'Executa 10.000 sorteios virtuais baseados na "roda da fortuna" ponderada (onde números que saem mais têm áreas maiores). Os resultados que mais aparecem nestas simulações massivas são os sugeridos.' },
    { name: 'Markov', concept: 'Cadeias de Markov para prever a probabilidade de transição entre estados.', logic: 'Analisa o "estado" do último sorteio e calcula qual a probabilidade de transição para o próximo. O sistema escolhe as transições com maior peso estatístico na vizinhança dos últimos resultados.' },
    { name: 'Hot', concept: 'Sistema de persistência baseado na "Lei dos Números Quentes".', logic: 'Baseia-se na tendência de que números que estão a sair frequentemente têm maior probabilidade de manter o "momentum" e sair novamente no curto prazo.' },
    { name: 'Late', concept: 'Sistema de compensação baseado na "Lei da Média".', logic: 'Foca-se nos números que estão em atraso (frios). A lógica dita que, estatisticamente, quanto mais tempo um número está sem sair, mais perto está de ser sorteado para equilibrar a média histórica.' },
    { name: 'Pyramid', concept: 'Cálculo piramidal baseado na sequência de Pascal.', logic: 'Cria uma pirâmide numérica somando os dígitos do último sorteio sucessivamente até chegar a um número base. Este método tenta encontrar a "raiz" vibracional do próximo sorteio.' },
    { name: 'Vortex', concept: 'Matemática de Base 9 baseada nas teorias de Nikola Tesla (3, 6, 9).', logic: 'Aplica a redução teosófica aos números e projeta-os num diagrama circular (Vortex). Os números são escolhidos seguindo o fluxo de energia toroidal.' },
    { name: 'Random Forest', concept: 'Inteligência Artificial baseada em Florestas de Decisão Aleatórias.', logic: 'O modelo treina centenas de "árvores de decisão" com o histórico total do jogo. Cada árvore vota num resultado e a floresta decide a previsão final baseada no consenso estatístico mais robusto.' },
    { name: 'LSTM', concept: 'Rede Neuronal de Memória de Longo Prazo (Deep Learning).', logic: 'Uma IA avançada que consegue "lembrar-se" de sequências longas. Deteta padrões cíclicos complexos, ajustando pesos em tempo real para prever a próxima sequência lógica.' },
    { name: 'Sist Média', concept: 'Algoritmo de compensação de vizinhança com ajuste de desvio.', logic: 'Calcula a média aritmética dos últimos 10 sorteios e aplica um desvio posicional de 3 unidades para capturar a tendência de "salto" e vizinhança comum nos sorteios.' }
  ];

  for (const exp of explanations) {
    console.log(`Updating all tables for: ${exp.name}`);
    for (const table of tables) {
      const nameField = (table === 'ranked_systems') ? 'name' : '"systemName"';
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE ${table} SET concept = $1, logic = $2 WHERE ${nameField} ILIKE $3`,
          exp.concept, exp.logic, `%${exp.name}%`
        );
      } catch (e) {}
    }
  }

  console.log('✅ DATABASE FULLY SEEDED');
  await prisma.$disconnect();
}

main();
