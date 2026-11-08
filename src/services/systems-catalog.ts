import fs from 'fs';
import path from 'path';

export interface SystemAdvice {
    headline: string;
    rule: string;
    warning?: string;
    opportunity?: string;
}

export interface SystemCatalogItem {
    slug: string;
    name: string;
    dbName: string;
    family: 'MOMENTUM' | 'GEOMETRY' | 'CYCLES' | 'INTELLIGENCE';
    familyName: string;
    familyIcon: string;
    description: string;
    howItCalculates: string;
    characteristics: string;
    components?: string[];
    defaultTopCount: number;
    advice?: SystemAdvice;
}

export const SYSTEM_CATALOG: SystemCatalogItem[] = [
    {
        slug: 'mais_quentes',
        name: 'Mais Quentes (Hot Numbers)',
        dbName: 'Mais Quentes',
        family: 'MOMENTUM',
        familyName: 'Frequência & Momento',
        familyIcon: '🔥',
        description: 'Mede o momento de forma e a energia térmica recente através da contagem estrita de saídas nos últimos 20 sorteios.',
        howItCalculates: 'Avalia a janela rolante de 20 concursos com a Regra da Inviolabilidade do Escalão: uma bola com 4 saídas está estritamente acima de qualquer bola com 3 saídas. O desempate entre bolas com o mesmo número de saídas é feito pela recência temporal (quem saiu mais recentemente desempata à frente).',
        characteristics: 'Captura rajadas temporais de alta energia. O seu comportamento clássico alterna entre sequências de 4 a 5 acertos e períodos de descanso pós-pico (ressaca térmica).',
        defaultTopCount: 5,
        advice: {
            headline: 'Ressaca Térmica Pós-Pico & Rotação para o Anti-Sistema',
            rule: 'Se o sistema atingiu um pico de 4 ou 5 acertos no sorteio anterior, a probabilidade empírica de queda para ≤ 1 acerto no concurso seguinte é de 70% a 77% (comprovado no Euromilhões, Totoloto e Mega-Sena). Nessa semana, inverta a estratégia e jogue o Anti-Sistema (as restantes bolas), onde estarão 4 a 5 das bolas sorteadas.',
            warning: 'Corte imediatamente qualquer bola sugerida que já tenha 3 saídas consecutivas: a taxa empírica de exaustão e não-repetição é superior a 85%.',
            opportunity: 'Após um pico de calor, o Anti-Sistema capta 4 ou 5 acertos com mais de 70% de probabilidade favorável, aproveitando a quebra de inércia e o retorno ao polo frio.'
        }
    },
    {
        slug: 'ultimos_a_sair',
        name: 'Últimos a Sair (Persistência T-1)',
        dbName: 'Últimos a Sair',
        family: 'MOMENTUM',
        familyName: 'Frequência & Momento',
        familyIcon: '⏱️',
        description: 'Classificação por recência cronológica pura a partir do sorteio anterior.',
        howItCalculates: 'Executa uma varredura cronológica reversa partindo do concurso T-1 para trás. As bolas sorteadas no último concurso entram nas primeiras posições, seguidas pelas bolas do penúltimo concurso (ainda não listadas), e assim sucessivamente até cobrir todas as bolas do jogo na ordem exata inversa em que foram sendo sorteadas.',
        characteristics: 'Funciona como um travão biológico. O volante estatístico recusa quase sempre a repetição em bloco, tornando este método numa das ferramentas mais poderosas para separar bolas prováveis do seu espelho.',
        defaultTopCount: 5,
    },
    {
        slug: 'mais_sorteadas_sempre',
        name: 'Mais Sorteadas de Sempre (Histórico)',
        dbName: 'Mais Sorteadas de Sempre',
        family: 'MOMENTUM',
        familyName: 'Frequência & Momento',
        familyIcon: '🏆',
        description: 'Mede a gravidade histórica acumulada desde o concurso nº 1 da lotaria.',
        howItCalculates: 'Contabiliza o total acumulado de saídas de cada número ao longo de todo o histórico oficial do jogo (desde 2004 no Euromilhões, 1985 no Totoloto). Ordena por frequência total decrescente, utilizando a frequência recente nos últimos 20 sorteios como primeiro critério canónico de desempate.',
        characteristics: 'Identifica o viés mecânico e gravitacional histórico do volante. Apresenta alta estabilidade estrutural, funcionando como um alicerce robusto que raramente muda de uma semana para a outra.',
        defaultTopCount: 5,
    },
    {
        slug: 'media_3_otimizado',
        name: 'Sistema Média +3 Otimizado',
        dbName: 'Sistema Média +3 Otimizado',
        family: 'MOMENTUM',
        familyName: 'Frequência & Momento',
        familyIcon: '📈',
        description: 'Tendência Central Posicional por Casas (Casa 1 à Casa 5/6 em ordem crescente).',
        howItCalculates: 'Avalia os últimos 50 sorteios e calcula a média decimal e o centro de gravidade inteiro M_C para cada Casa posicional da chave. Cada Casa gera o seu trio gravitacional: o Centro M_C, o vizinho inferior (M_C - 1) e o vizinho superior (M_C + 1). O volante é preenchido por varredura de Tiers concêntricos de proximidade (±2, ±3, etc.) até cobrir 100% dos números.',
        characteristics: 'Reconhece que uma chave de lotaria não é uma massa homogénea, mas sim composta por posições ordenadas independentes. Excelente para capturar a dispersão real de cada zona da chave.',
        defaultTopCount: 5,
    },
    {
        slug: 'separacao_aguas',
        name: 'Separação das Águas (Meta-Especialista de Simetria Perfeita)',
        dbName: 'Separação das Águas',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🌊',
        description: 'Meta-sistema de polarização bivalente extrema, forçando a chave para as pontas da tabela (5-0 no Direto ou 0-5 no Anti-Sistema) para erradicar o centro neutro de ruído.',
        howItCalculates: 'Combina a equipa oficial de 5 especialistas calibrada para balancear perfeitamente motores diretos com motores inversos através do operador de polaridade ±1000 e Quintetos de Ouro. O objetivo não é apenas acertar no Top 25, mas garantir que se o grupo sugerido falhar, o Anti-Sistema captura o prémio com estrondo.',
        characteristics: 'Campeão histórico de simetria e cobertura bivalente (131 Jackpots combinados no Euromilhões — 66 no Direto e 65 no Anti-Sistema; 104 no Totoloto; 88 na Mega-Sena; 15 no EuroDreams). Em cada 15 sorteios do Euromilhões, um deles tem os 5 números inteiramente contidos num dos dois blocos de 25.',
        components: ['Equipa Bipolar de 5 Especialistas', 'Operador de Polaridade ±1000', 'Balanço Simétrico Direto/Anti-Sistema'],
        defaultTopCount: 5,
    },
    {
        slug: 'diagonais_matriz',
        name: 'Diagonais da Matriz 2D',
        dbName: 'Diagonais da Matriz',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '📐',
        description: 'Sistema fundador do projeto Números Mágicos, criado em Excel por Paulo Alexandre Batista. Modela os sorteios numa matriz temporal (sorteios cronológicos nas linhas vs números 1 a N nas colunas).',
        howItCalculates: 'A partir de cada número candidato no sorteio T-1, projeta trajetórias diagonais em V subindo no tempo (noroeste e nordeste) até 50 sorteios de profundidade. Soma as ocorrências históricas intersetadas pelos vetores a 45º, identificando fluxos harmónicos de ressonância diagonal.',
        characteristics: 'Filtro geométrico pioneiro comprovado na célebre Semana 11 original do Euromilhões (4 acertos diretos com força >= 7). Rastreia ondas de propagação diagonal que ligam sorteios ao longo de semanas sucessivas.',
        defaultTopCount: 5,
    },
    {
        slug: 'diagonais_matriz_3d',
        name: 'Diagonais da Matriz 3D (Cilíndrico / Wrap-Around)',
        dbName: 'Diagonais da Matriz 3D',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '🧊',
        description: 'Evolução geométrica cilíndrica contínua do sistema Diagonais 2D, concebida por Paulo Alexandre Batista.',
        howItCalculates: 'Dobra a matriz temporal de sorteios num cilindro contínuo (unindo a última coluna à primeira: 50 a 1 no Euromilhões, 49 a 1 no Totoloto, 40 a 1 no EuroDreams). As diagonais sobem em espiral sem paredes nem barreiras através de TODO o histórico acumulado desde o concurso 1, com bónus de repetição imediata (2x) e decaimento temporal.',
        characteristics: 'Identifica ressonâncias espaciais invisíveis no plano 2D. Inicia a sua avaliação formal a partir do sorteio 50 de maturação da lotaria.',
        defaultTopCount: 5,
    },
    {
        slug: 'piramide_pascal',
        name: 'Pirâmide de Pascal',
        dbName: 'Pirâmide de Pascal',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '🔺',
        description: 'Funil de Convergência Temporal e Vórtice 3-6-9 (Pascal / Tesla), concebido por Paulo Alexandre Batista.',
        howItCalculates: 'Constrói um funil de convergência de 5 andares centrado em cada número candidato: Base 9 no sorteio T-5 (Nó Tesla 9), Base 7 no sorteio T-4, Nó Tesla 6 no sorteio T-3, Nó Tesla 3 no sorteio T-2, até ao Vértice Único central no sorteio T-1 com wrap-around cilíndrico nas extremidades. Pontua as saídas históricas apanhadas na boca do funil.',
        characteristics: 'Identifica o ponto focal de convergência aritmética da última chave sorteada, capturando o fluxo de afunilamento que atua como polo de atração para o próximo concurso.',
        defaultTopCount: 5,
    },
    {
        slug: 'piramide_intervalos',
        name: 'Pirâmide de Intervalos',
        dbName: 'Pirâmide de Intervalos',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '📏',
        description: 'Pirâmide de Diferenças Absolutas e Projeção Harmónica de Saltos, concebido por Paulo Alexandre Batista.',
        howItCalculates: 'A partir das bolas ordenadas de T-1, calcula camadas sucessivas de diferenças absolutas (Gaps de 1ª ordem, 2ª ordem, etc.) até isolar o Intervalo Primordial do Vértice. Dispara projeções de salto à frente (+g) e salto atrás (-g) com wrap-around cilíndrico, ponderadas pelo nível da pirâmide (Vértice peso 5.0, 3ª ordem 3.5, 2ª ordem 2.5, 1ª ordem 1.5).',
        characteristics: 'Modela a chave como uma corda vibrante de tensões elásticas. Quando múltiplos saltos convergem no mesmo número, a sua pontuação dispara cumulativamente para o topo.',
        defaultTopCount: 5,
    },
    {
        slug: 'markov',
        name: 'Transições de Markov',
        dbName: 'Transições de Markov',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🔗',
        description: 'Cadeias Estocásticas de Markov de 1ª Ordem e Matriz de Transição Condicional P(B | A).',
        howItCalculates: 'Constrói uma matriz quadrada de co-transição histórica entre todos os sorteios consecutivos. Para prever o próximo concurso, soma a força de transição condicional disparada pelas bolas saídas em T-1 para cada número candidato.',
        characteristics: 'Mede a atração estocástica real entre concursos vizinhos. Se uma bola X precede frequentemente uma bola Y no histórico real, a transição X -> Y eleva o score de Y.',
        defaultTopCount: 5,
    },
    {
        slug: 'clustering',
        name: 'Agrupamento de Padrões (Clustering)',
        dbName: 'Agrupamento de Padrões (Clustering)',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🧲',
        description: 'Análise de Densidade Espacial por Dezenas / Bairros Espaciais nos últimos 50 sorteios.',
        howItCalculates: 'Modela o volante em bairros espaciais de 10 números (1-10, 11-20, 21-30, 31-40, 41-50, etc.). Nos últimos 50 sorteios, mede a atividade acumulada de cada cluster. Ordena primeiro todos os números do cluster mais ativo (por frequência interna), depois o segundo cluster mais ativo, e assim sucessivamente.',
        characteristics: 'Identifica coligações naturais de números e faixas quentes do volante. Evita apostas dispersas quando certas zonas entram em fase de alta concentração.',
        defaultTopCount: 5,
    },
    {
        slug: 'monte_carlo',
        name: 'Simulação Monte Carlo',
        dbName: 'Monte Carlo',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🎲',
        description: 'Simulação estocástica massiva de 10.000 sorteios virtuais com Semente Determinística (Seeded RNG) ancorada em T-1.',
        howItCalculates: 'Executa 10.000 extrações virtuais ponderadas pela distribuição empírica acumulada de cada bola até T-1. Utiliza gerador pseudo-aleatório com semente criptográfica fixa ancorada nos dados do concurso anterior, garantindo determinismo perfeito e reprodutibilidade de 100%. Ordena os números pelo total de vitórias nas simulações.',
        characteristics: 'Filtra o ruído estocástico através da força bruta estatística. Elimina combinações anómalas cuja probabilidade simulada seja virtualmente nula.',
        defaultTopCount: 5,
    },
    {
        slug: 'oscilacao_universal',
        name: 'Sistema Oscilação Universal V2',
        dbName: 'Sistema Oscilação Universal V2',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🌊',
        description: 'Matemática do Vórtice, Raízes Digitais (Tesla 1 a 9) e Princípio de Alternância de Fases, por Paulo Alexandre Batista.',
        howItCalculates: 'Reduz cada número à sua Raiz Digital ((N-1) mod 9) + 1. Identifica a Raiz Dominante do sorteio T-1 (a família que concentrou mais saídas). Sabendo que em 74% dos sorteios a energia oscila para longe da família saturada, aplica uma penalização de -50% à raiz dominante e um boost de +50% às famílias complementares oscilatórias sobre a base de 1000 sorteios.',
        characteristics: 'Especialista em capturar o movimento pendular dos sorteios, evitando apostas viciadas na mesma família que acabou de esgotar o seu potencial no sorteio anterior.',
        defaultTopCount: 5,
    },
    {
        slug: 'supersistema_neuronal',
        name: 'SuperSistema Neuronal (Meta-Ensemble AI)',
        dbName: 'SuperSistema Neuronal',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência Artificial',
        familyIcon: '🧠',
        description: 'Meta-Ensemble de Quintetos de Ouro com Muralha de Corte dos 25 números, concebido por Paulo Alexandre Batista para resolver a "Armadilha do Comitê".',
        howItCalculates: 'Combina os 5 especialistas com melhor histórico individual de cada jogo, pontuando por Quintetos de Ouro: 1ª Quina (1º ao 5º): 100 pts; 2ª Quina: 75 pts; 3ª Quina: 50 pts; 4ª Quina: 30 pts; 5ª Quina: 15 pts. Aplica uma Muralha de Aço de Zero Pontos a partir do 26º lugar para impedir que números rejeitados diluam as bolas de ouro dos especialistas.',
        characteristics: 'Bateu o recorde de sempre do site com 151 Jackpots Máximos e 1.033 Prémios Nobres somando os 4 jogos (57 Jackpots no Euromilhões, 49 no Totoloto, 40 na Mega-Sena e 5 no EuroDreams).',
        components: ['Conselho Notável de 5 Especialistas', 'Quintetos de Ouro (Diamante a Bronze)', 'Muralha de Aço (Zero Pontos pós-25)'],
        defaultTopCount: 5,
    },
    {
        slug: 'random_forest',
        name: 'Random Forest AI (Ensemble)',
        dbName: 'Random Forest AI',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência Artificial',
        familyIcon: '🌲',
        description: 'Ensemble de 500 árvores de decisão estatísticas treinado sobre múltiplos indicadores multidimensionais.',
        howItCalculates: 'Treina 500 árvores de decisão com bagging sobre múltiplos fatores: frequências de curto, médio e longo prazo, atrasos elásticos, paridade, amplitude e simetria. O resultado final corresponde à votação por consenso ponderado entre todas as árvores.',
        characteristics: 'Máxima imunidade contra sobreajuste (overfitting). Dissipa o ruído pontual de sorteios atípicos e elege apenas os números com suporte estatístico multidimensional robusto.',
        defaultTopCount: 5,
    },
    {
        slug: 'harmonia_antigravity',
        name: 'Harmonia Dimensional (Antigravity)',
        dbName: 'Harmonia Dimensional (Antigravity)',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '✨',
        description: 'Otimização Dimensional Determinística em 3 Pilares com Zero Lookahead Bias (Co-ocorrência Hiperbólica, Tensão Elástica e Quotas por Década).',
        howItCalculates: 'Calcula: 1) Co-ocorrência de pares com decaimento hiperbólico 1/sqrt(t) nos últimos 100 sorteios face às bolas saídas em T-1; 2) Tensão Elástica de Atraso (penalização x0.60 para delay 0, sweet spot x1.35 para delay 3-18, e filtro de frio x0.75 para delay > 35); 3) Quotas Dimensionais por Décadas: chão obrigatório de pelo menos 3 números por década e teto de contenção de no máximo 6 números por década no pool de 25.',
        characteristics: 'Elimina as falhas de cobertura espacial sem deixar zonas mortas no volante. Obedece estritamente ao determinismo matemático puro sem aleatoriedade oculta.',
        components: ['Co-ocorrência com Decaimento Hiperbólico', 'Tensão Elástica de Atraso (Sweet Spot)', 'Quotas Dimensionais por Décadas'],
        defaultTopCount: 5,
    },
    {
        slug: 'tiro_certeiro',
        name: 'Tiro Certeiro (Meta-Especialista de Pico Absoluto de Jackpots)',
        dbName: 'Tiro Certeiro',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🎯',
        description: 'Meta-sistema de elite concebido por Paulo Alexandre Batista para quebrar todos os recordes históricos de Jackpots (5/5 e 6/6) concentrados num único bloco prioritário.',
        howItCalculates: 'Combina a equipa oficial de 5 especialistas selecionada por busca exaustiva em 1.287 combinações. Aplica o operador de polaridade ±1000 no Top Half / Anti-Sistema com bónus decrescente por Quintetos de Ouro (+100, +75, +50, +30, +15 pts). No Euromilhões, aplica a Inversão Positiva Estratégica, trazendo os 25 números rejeitados para o topo onde caíram 76 Jackpots históricos!',
        characteristics: 'Recordista absoluto de Jackpots da plataforma: 76 Jackpots no Euromilhões, 64 no Totoloto, 55 na Mega-Sena e 10 no EuroDreams. Concebido expressamente para maximizar a densidade de prémios de 1º escalão.',
        components: ['Quinteto de Especialistas Exaustivo', 'Operador de Polaridade ±1000', 'Escala de Quintetos de Ouro', 'Inversão Positiva Estratégica'],
        defaultTopCount: 5,
    },
    {
        slug: 'matriz_corte',
        name: 'Matriz de Corte (Via Negativa)',
        dbName: 'Matriz de Corte',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '✂️',
        description: 'Fase 1 da Arquitetura do Molde: Peneira Individual por Via Negativa. Em vez de adivinhar o que vai sair, avalia o estado intrínseco de cada bola para eliminar com alta certeza estatística (≥90%) as bolas exaustas.',
        howItCalculates: 'Calcula a proximidade matemática de cada bola relativamente aos seus recordes e tetos históricos inviolados: a) Aversão T-1 (< 7% repetição = 94% corte); b) Sequências consecutivas (2x = 90% corte, 3x = 99% corte); c) Desaceleração térmica (>= 3 em W=20 e 0 em W=5 = 89.8% corte); d) Saturação de janelas; e) Escudo elástico anti-corte.',
        characteristics: 'Não tenta adivinhar o que vai sair. Elimina com certeza matemática as bolas que atingiram o esgotamento probabilístico. Em mais de 63% dos concursos, preserva 100% dos números premiados nas bolas restantes após o corte de 4 a 6 números.',
        components: ['Aversão a Repetição T-1', 'Tetos de Sequência Consecutiva', 'Gradiente de Desaceleração Térmica', 'Saturação de Janelas W=3..100', 'Escudo Elástico Anti-Corte'],
        defaultTopCount: 5,
        advice: {
            headline: 'Regras de Corte com Certeza Estatística ≥ 90%',
            rule: 'Bolas com 2 saídas consecutivas NÃO repetem na 3ª vez em 90.0% dos sorteios (Euromilhões, Totoloto e Mega-Sena). Se já tiverem 3 saídas consecutivas, a probabilidade de falhar no próximo sorteio sobe para 99% (aconteceu menos de 1 vez a cada 200 sorteios na história). Cortar com segurança.',
            warning: 'Proibir chaves com 3 ou mais números saídos nos últimos 2 concursos: em 95% de toda a história oficial, o sorteio tem no máximo 0, 1 ou 2 repetentes desse grupo.',
            opportunity: 'Evitar concentrar 3 ou mais bolas com atraso > 15 sorteios: em 95.3% dos concursos, a máquina sorteia no máximo 0 a 2 bolas frias.'
        }
    }
];

export interface JackBand {
    level: number;
    name: string;
    rangeLabel: string;
    min: number;
    max: number;
    tier: 'FREQUÊNCIA ALTA' | 'ZONA MEDIANA' | 'ZONA MÉDIA' | 'MATURAÇÃO TARDIA' | 'OS TEIMOSOS';
    tierColor: 'emerald' | 'blue' | 'amber' | 'purple';
    tierDescription: string;
    count: number;
    pct: number;
    cumCount: number;
    cumPct: number;
    isCurrent: boolean;
}

export interface SystemJackCycles {
    totalJacks: number;
    intervalsCount: number;
    currentDrought: number;
    exactCumCount: number;
    exactCumPct: number;
    avgCycle: number;
    medianCycle: number;
    minCycle: number;
    maxCycle: number;
    bands: JackBand[];
}

/**
 * RÉGUA UNIVERSAL PADRONIZADA EM BLOCOS DE 25 SORTEIOS:
 * - N1 (1 a 25 sorteios): Frequência Alta (concentração inicial)
 * - N2 (26 a 50 sorteios): Zona Mediana (onde cai a mediana histórica, 50% dos casos)
 * - N3 (51 a 75 sorteios): Zona da Média (onde cai a média histórica global de 62)
 * - N4 (76 a 100 sorteios): Maturação Tardia (zona de seca)
 * - N5 (101+ sorteios): Os Teimosos (cauda longa extrema)
 */
export const UNIFIED_CYCLE_BANDS_TEMPLATE: Omit<JackBand, 'count' | 'pct' | 'cumCount' | 'cumPct' | 'isCurrent'>[] = [
    {
        level: 1,
        name: 'Nível 1 • Frequência Alta',
        rangeLabel: '1 a 25 sorteios',
        min: 1,
        max: 25,
        tier: 'FREQUÊNCIA ALTA',
        tierColor: 'emerald',
        tierDescription: 'Zona de maior densidade de saída inicial'
    },
    {
        level: 2,
        name: 'Nível 2 • Zona Mediana',
        rangeLabel: '26 a 50 sorteios',
        min: 26,
        max: 50,
        tier: 'ZONA MEDIANA',
        tierColor: 'blue',
        tierDescription: 'Onde se situa a mediana histórica (50% dos Jacks)'
    },
    {
        level: 3,
        name: 'Nível 3 • Zona da Média',
        rangeLabel: '51 a 75 sorteios',
        min: 51,
        max: 75,
        tier: 'ZONA MÉDIA',
        tierColor: 'blue',
        tierDescription: 'Onde se situa a média histórica (~62 sorteios)'
    },
    {
        level: 4,
        name: 'Nível 4 • Maturação Tardia',
        rangeLabel: '76 a 100 sorteios',
        min: 76,
        max: 100,
        tier: 'MATURAÇÃO TARDIA',
        tierColor: 'amber',
        tierDescription: 'Entrada na fase de atraso prolongado'
    },
    {
        level: 5,
        name: 'Nível 5 • Os Teimosos',
        rangeLabel: '101+ sorteios',
        min: 101,
        max: Infinity,
        tier: 'OS TEIMOSOS',
        tierColor: 'purple',
        tierDescription: 'Atraso extremo / anomalia estatística histórica'
    }
];

// In-memory cache for fast responsive requests
const cyclesCache = new Map<string, { timestamp: number; data: SystemJackCycles | null }>();
const statsCache = new Map<string, { timestamp: number; data: { avgAccuracy: number; totalDraws: number; highHits: number } }>();

function getConsolidatedFilePath(fileName: string): string | null {
    const candidates = [
        path.join(process.cwd(), 'data', 'consolidated', fileName),
        path.resolve(process.cwd(), '.next', 'server', 'data', 'consolidated', fileName),
        path.resolve(__dirname, '../../data/consolidated', fileName),
        path.resolve(__dirname, '../../../data/consolidated', fileName),
        path.join('/app', 'data', 'consolidated', fileName)
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

export function getSystemStatsForGame(slug: string, gameKey: string): { avgAccuracy: number; totalDraws: number; highHits: number } {
    const game = gameKey.toLowerCase();
    const cacheKey = `${slug}_${game}`;
    const now = Date.now();
    const cached = statsCache.get(cacheKey);
    if (cached && now - cached.timestamp < 30000) {
        return cached.data;
    }

    const fileName = `${slug}_${game}.json`;
    const filePath = getConsolidatedFilePath(fileName);

    if (!filePath) {
        const fallback = { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
        statsCache.set(cacheKey, { timestamp: now, data: fallback });
        return fallback;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        if (!Array.isArray(data) || data.length === 0) {
            const fallback = { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
            statsCache.set(cacheKey, { timestamp: now, data: fallback });
            return fallback;
        }

        const pick = (game === 'lotofacil') ? 15 : (game === 'eurodreams' || game === 'megasena') ? 6 : 5;
        const hitKey = (game === 'eurodreams' || game === 'lotofacil') ? 'num_hits_20' : (game === 'megasena') ? 'num_hits_30' : 'num_hits_25';

        let totalHits = 0;
        let highHits = 0;
        for (const d of data) {
            const h = d[hitKey] ?? d.num_hits_25 ?? 0;
            totalHits += h;
            if (h >= (pick === 15 ? 14 : pick === 6 ? 5 : 4)) {
                highHits++;
            }
        }

        const avgAccuracy = Number(((totalHits / (data.length * pick)) * 100).toFixed(1));
        const res = {
            avgAccuracy,
            totalDraws: data.length,
            highHits
        };
        statsCache.set(cacheKey, { timestamp: now, data: res });
        return res;
    } catch {
        const fallback = { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
        statsCache.set(cacheKey, { timestamp: now, data: fallback });
        return fallback;
    }
}

export function getSystemPredictionForGame(slug: string, gameKey: string): number[] {
    const game = gameKey.toLowerCase();
    const fileName = `${slug}_${game}.json`;
    const filePath = getConsolidatedFilePath(fileName);

    if (!filePath) {
        return [];
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
            const latest = data[data.length - 1];
            if (!latest || !latest.prediction) return [];
            const parsed = typeof latest.prediction === 'string' 
                ? JSON.parse(latest.prediction) 
                : latest.prediction;
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch {
        return [];
    }
    return [];
}

export function getSystemJackCyclesForGame(slug: string, gameKey: string): SystemJackCycles | null {
    const game = gameKey.toLowerCase();
    const cacheKey = `${slug}_${game}`;
    const now = Date.now();
    const cached = cyclesCache.get(cacheKey);
    if (cached && now - cached.timestamp < 30000) {
        return cached.data;
    }

    const fileName = `${slug}_${game}.json`;
    const filePath = getConsolidatedFilePath(fileName);

    if (!filePath) {
        cyclesCache.set(cacheKey, { timestamp: now, data: null });
        return null;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        if (!Array.isArray(data) || data.length === 0) {
            cyclesCache.set(cacheKey, { timestamp: now, data: null });
            return null;
        }

        const pick = (game === 'lotofacil') ? 15 : (game === 'eurodreams' || game === 'megasena') ? 6 : 5;
        const hitKey = (game === 'eurodreams' || game === 'lotofacil') ? 'num_hits_20' : (game === 'megasena') ? 'num_hits_30' : 'num_hits_25';

        const jackIndices: number[] = [];
        data.forEach((r: any, idx: number) => {
            const hits = r[hitKey] ?? r.num_hits_25 ?? 0;
            if (hits >= pick) {
                jackIndices.push(idx);
            }
        });

        const totalDraws = data.length;

        if (jackIndices.length === 0) {
            const fallback: SystemJackCycles = {
                totalJacks: 0,
                intervalsCount: 0,
                currentDrought: totalDraws,
                exactCumCount: 0,
                exactCumPct: 0,
                avgCycle: 0,
                medianCycle: 0,
                minCycle: 0,
                maxCycle: 0,
                bands: []
            };
            cyclesCache.set(cacheKey, { timestamp: now, data: fallback });
            return fallback;
        }

        const currentDrought = (totalDraws - 1) - jackIndices[jackIndices.length - 1];

        // Mapear o ciclo de maturação de TODOS os Jacks ocorridos no histórico:
        // O 1.º Jack demorou (jackIndices[0] + 1) sorteios desde o início do jogo;
        // Os Jacks seguintes demoraram (jackIndices[i] - jackIndices[i - 1]) sorteios após o Jack anterior.
        const intervals: number[] = [];
        intervals.push(jackIndices[0] + 1);
        for (let i = 1; i < jackIndices.length; i++) {
            intervals.push(jackIndices[i] - jackIndices[i - 1]);
        }
        intervals.sort((a, b) => a - b);

        const n = intervals.length;
        const sum = intervals.reduce((acc, v) => acc + v, 0);
        const avgCycle = Number((sum / n).toFixed(1));
        const medianCycle = n % 2 === 0 
            ? Math.round((intervals[n / 2 - 1] + intervals[n / 2]) / 2) 
            : intervals[Math.floor(n / 2)];
        const minCycle = intervals[0];
        const maxCycle = intervals[n - 1];

        // Construir os 5 níveis usando a RÉGUA UNIVERSAL PADRONIZADA EM BLOCOS DE 25 SORTEIOS
        let runningCumCount = 0;
        const bands: JackBand[] = UNIFIED_CYCLE_BANDS_TEMPLATE.map(template => {
            const count = intervals.filter(v => v >= template.min && (template.max === Infinity ? true : v <= template.max)).length;
            runningCumCount += count;
            const pct = n > 0 ? Number(((count / n) * 100).toFixed(1)) : 0;
            const cumPct = n > 0 ? Number(((runningCumCount / n) * 100).toFixed(1)) : 0;
            const isCurrent = currentDrought >= template.min && (template.max === Infinity ? true : currentDrought <= template.max);

            return {
                ...template,
                count,
                pct,
                cumCount: runningCumCount,
                cumPct,
                isCurrent
            };
        });

        // Caso o atraso atual seja 0 (Jack acabou de sair no último sorteio), marca o Nível 1
        if (currentDrought === 0 && bands.length > 0) {
            bands[0].isCurrent = true;
        }

        // Percentagem e contagem exata acumulada até ao sorteio atual
        const exactCumCount = intervals.filter(v => v <= currentDrought).length;
        const exactCumPct = n > 0 ? Number(((exactCumCount / n) * 100).toFixed(1)) : 0;

        const result: SystemJackCycles = {
            totalJacks: jackIndices.length,
            intervalsCount: n,
            currentDrought,
            exactCumCount,
            exactCumPct,
            avgCycle,
            medianCycle,
            minCycle,
            maxCycle,
            bands
        };

        cyclesCache.set(cacheKey, { timestamp: now, data: result });
        return result;
    } catch {
        cyclesCache.set(cacheKey, { timestamp: now, data: null });
        return null;
    }
}
