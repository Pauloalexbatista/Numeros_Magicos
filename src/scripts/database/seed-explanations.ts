
import { prisma } from '../../lib/prisma';

async function seed() {
    console.log('🔮 Semeando Explicações de Sistemas...');

    const explanations = [
        {
            name: 'Clustering Stars',
            concept: 'Agrupamento inteligente de números em 3 clusters (Baixos, Médios e Altos).',
            logic: 'O algoritmo divide o pool de números em três zonas de probabilidade. Analisa qual zona (cluster) tem tido mais atividade nos últimos sorteios e seleciona os números com maior frequência dentro dessa zona específica.'
        },
        {
            name: 'Clustering Números',
            concept: 'Divisão do volante em 3 grupos de densidade baseados na posição e frequência.',
            logic: 'Identifica padrões de agrupamento (aglomerados) onde os números costumam sair juntos. Seleciona a combinação mais provável baseada na ressonância entre clusters ativos.'
        },
        {
            name: 'Monte Carlo Stars',
            concept: 'Simulações probabilísticas avançadas baseadas em força bruta computacional.',
            logic: 'Executa 10.000 sorteios virtuais baseados na "roda da fortuna" ponderada (onde números que saem mais têm áreas maiores). Os números que mais aparecem nestas 10.000 simulações são os sugeridos.'
        },
        {
            name: 'Markov Stars',
            concept: 'Cadeias de Markov para prever a probabilidade de transição entre estados.',
            logic: 'Analisa o "estado" do último sorteio e calcula qual a probabilidade de transição para o próximo. Se saiu a Estrela 1, qual a probabilidade de sair a 5 no próximo? O sistema escolhe as transições com maior peso estatístico.'
        },
        {
            name: 'Hot Stars',
            concept: 'Sistema de persistência baseado na "Lei dos Números Quentes".',
            logic: 'Baseia-se na tendência de que números que estão a sair frequentemente têm maior probabilidade de manter o "momentum" e sair novamente no curto prazo.'
        },
        {
            name: 'Late Stars',
            concept: 'Sistema de compensação baseado na "Lei da Média".',
            logic: 'Foca-se nos números que estão em atraso (frios). A lógica dita que, estatisticamente, quanto mais tempo um número está sem sair, mais perto está de ser sorteado para equilibrar a média histórica.'
        },
        {
            name: 'PyramidPascal Stars',
            concept: 'Cálculo piramidal baseado na sequência de Pascal.',
            logic: 'Cria uma pirâmide numérica somando os dígitos do último sorteio sucessivamente até chegar a um número base. Este método esotérico/matemático tenta encontrar a "raiz" vibracional do próximo sorteio.'
        },
        {
            name: 'Vortex Stars',
            concept: 'Matemática de Base 9 baseada nas teorias de Nikola Tesla (3, 6, 9).',
            logic: 'Aplica a redução teosófica aos números e projeta-os num diagrama circular (Vortex). Os números são escolhidos seguindo o fluxo de energia toroidal 1-2-4-8-7-5.'
        },
        {
            name: 'Random Forest (Sorte)',
            concept: 'Inteligência Artificial baseada em Florestas de Decisão Aleatórias.',
            logic: 'O modelo treina centenas de "árvores de decisão" com 20 anos de histórico. Cada árvore vota num resultado e a floresta decide a previsão final baseada no consenso estatístico mais robusto.'
        },
        {
            name: 'LSTM Estrelas',
            concept: 'Rede Neuronal de Memória de Longo Prazo (Deep Learning).',
            logic: 'Uma IA avançada que consegue "lembrar-se" de sequências longas. Deteta padrões cíclicos que humanos não conseguem ver, ajustando pesos em tempo real para prever a próxima sequência lógica.'
        },
        {
            name: 'Sist Média +3 Otimizado',
            concept: 'Algoritmo de compensação de vizinhança.',
            logic: 'Calcula a média aritmética dos últimos sorteios e aplica um desvio de +3 posições para capturar a tendência de "salto" comum nos sorteios de lotaria.'
        }
    ];

    for (const exp of explanations) {
        console.log(`- A atualizar: ${exp.name}`);
        const data = {
            concept: exp.concept,
            logic: exp.logic
        };

        await prisma.rankedSystem.updateMany({
            where: { name: { contains: exp.name } },
            data
        });

        await prisma.starSystemRanking.updateMany({
            where: { systemName: { contains: exp.name } },
            data
        });

        await prisma.systemRanking.updateMany({
            where: { systemName: { contains: exp.name } },
            data
        });
    }

    console.log('✅ Explicações atualizadas com sucesso!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
