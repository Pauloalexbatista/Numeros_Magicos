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
        description: 'Mede as bolas com maior frequência e aceleração térmica nos últimos 20 sorteios.',
        howItCalculates: 'Executa uma janela rolante estrita de 20 concursos. Cada saída soma 1 ponto com ponderação linear decrescente para sorteios mais recentes. Ordena o volante por calor acumulado, identificando as bolas em fase ascendente.',
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
        description: 'Mede a taxa biológica de repetição consecutiva entre o sorteio anterior e o próximo.',
        howItCalculates: 'Isola o vetor exato de números sorteados no concurso T-1. Cruza cada bola com a sua taxa histórica pessoal de repetição consecutiva (aversão ou atração de repetição) para ordenar as mais propensas a repetir.',
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
        description: 'Classifica as bolas com maior densidade de ocorrência acumulada desde a génese da lotaria.',
        howItCalculates: 'Processa a totalidade dos concursos históricos da lotaria (desde 2004 no Euromilhões, 1985 no Totoloto). Calcula a média de frequência de longo prazo e desvio padrão acumulado para classificar as bolas estruturalmente mais sorteadas.',
        characteristics: 'Identifica o viés mecânico e gravitacional histórico do volante. Apresenta correlação superior a +0.90 com o sistema Mais Quentes, funcionando como um alicerce robusto e estável que raramente muda de uma semana para a outra.',
        defaultTopCount: 5,
    },
    {
        slug: 'media_3_otimizado',
        name: 'Média Móvel 3 Otimizado',
        dbName: 'Sistema Média +3 Otimizado',
        family: 'MOMENTUM',
        familyName: 'Frequência & Momento',
        familyIcon: '📈',
        description: 'Média móvel ponderada de curtíssimo prazo com ajustamento de aceleração residual.',
        howItCalculates: 'Calcula a média móvel ponderada (WMA) com pesos 3 (T-1), 2 (T-2) e 1 (T-3), adicionando uma derivada de aceleração (+3 delta) baseada no desvio padrão local. Filtra números que iniciaram um surto recente de aparições.',
        characteristics: 'Antecipa as curvas de calor muito mais depressa do que a média de 20 sorteios. Ideal para apanhar bolas logo na 2ª saída antes de se tornarem evidentes para todo o mercado.',
        defaultTopCount: 5,
    },
    {
        slug: 'separacao_aguas',
        name: 'Separação das Águas (Polaridade Extrema)',
        dbName: 'Separação das Águas',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🌊',
        description: 'Meta-sistema que conjuga 4 sistemas complementares para forçar o sorteio aos extremos (5-0 ou 0-5).',
        howItCalculates: 'Combina algoritmicamente os vetores de 4 sistemas independentes: Mais Quentes (inércia térmica), Últimos a Sair (persistência T-1), Sistema Média +3 Otimizado (aceleração) e a Matriz de Corte (podagem negativa). Pondera os pesos para polarizar o volante: maximiza a separação matemática entre a metade superior e a metade inferior, fugindo do centro ruídoso (3-2).',
        characteristics: 'É um dos sistemas com maior taxa de Jackpots Diretos (5-0) e Jackpots Espelho (0-5). A sua beleza matemática reside na dualidade: se o grupo sugerido falhar redondamente, o Anti-Sistema faz o pleno absoluto.',
        components: ['Mais Quentes (Calor)', 'Últimos a Sair (Persistência T-1)', 'Média 3 Otimizado (Aceleração)', 'Matriz de Corte (Via Negativa)'],
        defaultTopCount: 5,
    },
    {
        slug: 'diagonais_matriz',
        name: 'Diagonais da Matriz 2D',
        dbName: 'Diagonais da Matriz',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '📐',
        description: 'Mapeia o volante numa grelha retangular periódica e rastreia vetores de alinhamento diagonal.',
        howItCalculates: 'Modela o volante oficial numa matriz bidimensional periódica (ex: 5x10 no Euromilhões, 7x7 no Totoloto). Extrai os fluxos diagonais principais (noroeste-sudeste e nordeste-sudoeste) e pontua as células que formam trajetórias harmónicas contínuas.',
        characteristics: 'Impede a acumulação artificial de apostas em grelhas lineares. As bolas sorteadas na vida real raramente coincidem em mais de 2 posições na mesma diagonal teórica.',
        defaultTopCount: 5,
    },
    {
        slug: 'diagonais_matriz_3d',
        name: 'Diagonais da Matriz 3D',
        dbName: 'Diagonais da Matriz 3D',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '🧊',
        description: 'Projeta o espaço amostral num hipercubo tridimensional e rastreia planos espaciais.',
        howItCalculates: 'Mapeia cada bola em três eixos ortogonais euclidianos (x, y, z) de acordo com a sua dezena, terminação e ordem modular. Rastreia diagonais espaciais que intersetam o centro de gravidade do cubo numérico.',
        characteristics: 'Identifica nós geométricos invisíveis na representação plana convencional do volante, detetando compensações espaciais.',
        defaultTopCount: 5,
    },
    {
        slug: 'piramide_pascal',
        name: 'Pirâmide de Pascal',
        dbName: 'Pirâmide de Pascal',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '🔺',
        description: 'Constrói somas modulares em cascata triangular até isolar o vértice harmónico.',
        howItCalculates: 'Organiza as diferenças entre as bolas sorteadas no último concurso na base de um triângulo aritmético. Aplica a adição modular de Pascal sucessiva (mod N) de camada em camada até atingir o número apical do vértice.',
        characteristics: 'Identifica o ponto focal de convergência aritmética da última chave sorteada. O vértice resultante atua frequentemente como polo de atração para a próxima extração.',
        defaultTopCount: 5,
    },
    {
        slug: 'piramide_intervalos',
        name: 'Pirâmide de Intervalos',
        dbName: 'Pirâmide de Intervalos',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '📏',
        description: 'Mapeia os vãos e espaçamentos numéricos entre bolas vizinhas para projetar zonas de preenchimento.',
        howItCalculates: 'Analisa o tamanho dos vazios (gaps) deixados entre as bolas sorteadas em ordem crescente. Constrói uma árvore de probabilidades para as zonas onde o intervalo entre números excedeu a média esperada Poisson.',
        characteristics: 'Identifica zonas de "vácuo" numérico no volante. A natureza estocástica tende a preencher buracos excessivamente grandes em concursos subsequentes.',
        defaultTopCount: 5,
    },
    {
        slug: 'markov',
        name: 'Transições de Markov',
        dbName: 'Transições de Markov',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🔗',
        description: 'Cadeia estocástica de primeira ordem que calcula a probabilidade condicional P(B|A).',
        howItCalculates: 'Constrói uma matriz quadrada de transição estocástica baseada em mais de 10.000 sorteios reais. Para cada número que saiu no sorteio anterior, calcula a distribuição de probabilidade das bolas que têm maior frequência de transição direta a seguir.',
        characteristics: 'Modela o sorteio como um processo markoviano sem memória estrita, mas com atração condicional estatisticamente mensurável entre estados consecutivos.',
        defaultTopCount: 5,
    },
    {
        slug: 'clustering',
        name: 'Agrupamento (Clustering K-Means)',
        dbName: 'Agrupamento de Padrões (Clustering)',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🧲',
        description: 'Agrupa números por co-ocorrência em clusters compactos com algoritmo k-means.',
        howItCalculates: 'Calcula a matriz de distância Euclidiana sobre os pares e trios históricos. Aplica o algoritmo de partição k-means com 5 centróides para isolar blocos de números que apresentam tendência persistente de saída conjunta.',
        characteristics: 'Identifica coligações naturais de números. Quando um determinado cluster é ativado pelo volante, saem frequentemente 2 a 3 números pertencentes ao mesmo bloco.',
        defaultTopCount: 5,
    },
    {
        slug: 'monte_carlo',
        name: 'Simulação Monte Carlo',
        dbName: 'Monte Carlo',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🎲',
        description: 'Executa 100.000 sorteios simulados para encontrar a nuvem de maior densidade probabilística.',
        howItCalculates: 'Utiliza amostragem estocástica com 100.000 iterações aleatórias ponderadas pela distribuição empírica de probabilidade de cada bola. Identifica a região do espaço amostral com maior convergência de densidade de probabilidade conjunta.',
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
        description: 'Decomposição em ondas senoidais para identificar pontos de inversão de fase e ressonância.',
        howItCalculates: 'Modela cada número como um oscilador harmónico acoplado, decompondo os seus ciclos de aparição em componentes de Fourier. Mede a fase da onda para antecipar o momento exato em que a bola sai do vale de ausência e inicia a crista de onda.',
        characteristics: 'Especialista em detetar bolas em fim de ciclo de seca e que estão prestes a entrar em fase de ressonância rápida.',
        defaultTopCount: 5,
    },
    {
        slug: 'supersistema_neuronal',
        name: 'SuperSistema Neuronal (Rede Densa)',
        dbName: 'SuperSistema Neuronal',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência Artificial',
        familyIcon: '🧠',
        description: 'Rede neural artificial de camadas densas com regularização para aprender interações não-lineares.',
        howItCalculates: 'Alimenta uma rede neural com 128 neurónios na camada oculta, função de ativação SELU e regularização L2. O modelo aprende pesos sinápticos entre mais de 40 variáveis de contexto (histórico recente, somas, paridade, ciclos e atrasos).',
        characteristics: 'Capaz de capturar relações não-lineares complexas que escapam à modelação estatística clássica linear. Apresenta alta estabilidade perante mudanças abruptas de padrão.',
        defaultTopCount: 5,
    },
    {
        slug: 'random_forest',
        name: 'Random Forest AI (Ensemble)',
        dbName: 'Random Forest AI',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência Artificial',
        familyIcon: '🌲',
        description: 'Ensemble de 500 árvores de decisão independentes com votação ponderada contra ruído.',
        howItCalculates: 'Treina 500 árvores de decisão em subconjuntos aleatórios de dados com bagging. Cada árvore avalia o estado de cada bola perante 30 variáveis estatísticas simultâneas. O resultado final corresponde à votação por consenso ponderado.',
        characteristics: 'Máxima imunidade contra sobreajuste (overfitting). Ao contrário de modelos únicos, a floresta dissipa o ruído pontual de sorteios atípicos e elege apenas os números com suporte multidimensional robusto.',
        defaultTopCount: 5,
    },
    {
        slug: 'harmonia_antigravity',
        name: 'Harmonia Dimensional (Antigravity)',
        dbName: 'Harmonia Dimensional (Antigravity)',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '✨',
        description: 'Otimização quântica de equilíbrio entre dezenas, terminações, paridade e simetria.',
        howItCalculates: 'Calcula o vetor de entropia de Shannon de cada combinação candidata. Maximiza o equilíbrio harmónico: balanceamento rigoroso entre pares e ímpares (3-2 ou 2-3), dispersão uniforme de dezenas e proibição de acumulação na mesma terminação.',
        characteristics: 'Representa o "Molde Biológico" dos sorteios reais. Praticamente 95% de todos os jackpots da história obedecem a estes limites harmónicos de dispersão.',
        defaultTopCount: 5,
    },
    {
        slug: 'tiro_certeiro',
        name: 'Tiro Certeiro (Mínima Variância)',
        dbName: 'Tiro Certeiro',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🎯',
        description: 'Algoritmo cirúrgico de alta precisão focado no núcleo de menor variância histórica.',
        howItCalculates: 'Avalia a matriz de covariância histórica para isolar combinações de bolas com coeficiente de variação mínimo. Prioriza números com cadência de saída regular e previsível em detrimento de bolas erráticas.',
        characteristics: 'Ideal para apostadores que valorizam a estabilidade e o retorno de prémios intermédios regulares (3 e 4 acertos), reduzindo a volatilidade de apostas a longo prazo.',
        defaultTopCount: 5,
    },
    {
        slug: 'matriz_corte',
        name: 'Matriz de Corte (Via Negativa)',
        dbName: 'Matriz de Corte',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '✂️',
        description: 'Motor de eliminação por via negativa calibrado com 5 matrizes de limites físicos inviolados.',
        howItCalculates: 'Calcula a proximidade matemática de cada bola relativamente aos seus recordes e tetos históricos inviolados: a) Aversão T-1 (< 7% repetição = 94% corte); b) Sequências consecutivas (3x = 93% corte; 4x = 97% corte); c) Desaceleração térmica (≥ 3 em W=20 e 0 em W=5 = 89.8% corte); d) Saturação de janelas; e) Escudo elástico anti-corte.',
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
