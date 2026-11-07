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
    family: 'INERTIA' | 'GEOMETRY' | 'CYCLES' | 'INTELLIGENCE';
    familyName: string;
    familyIcon: string;
    description: string;
    howItCalculates: string;
    defaultTopCount: number;
    advice: SystemAdvice;
}

export const SYSTEM_CATALOG: SystemCatalogItem[] = [
    {
        slug: 'mais_quentes',
        name: 'Mais Quentes (Hot Numbers)',
        dbName: 'Mais Quentes',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '🔥',
        description: 'Mede as bolas com maior calor e frequência nos últimos 20 sorteios.',
        howItCalculates: 'Conta o número de saídas em janela rolante de 20 sorteios e ordena por calor decrescente.',
        defaultTopCount: 5,
        advice: {
            headline: 'Radar de Ressaca Térmica & Rebote',
            rule: 'Se o sistema atingiu um pico de 4 ou 5 acertos no sorteio anterior, a probabilidade de queda para ≤ 1 acerto no seguinte é de 76%. Prefira desdobramentos de menor custo.',
            warning: 'Evite jogar chaves com mais de 3 bolas quentes após um concurso de acerto alto.',
            opportunity: 'Após 2 sorteios consecutivos com apenas 0 ou 1 acerto, a taxa de subida para ≥ 3 acertos nos 2 sorteios seguintes sobe para 68.4%.'
        }
    },
    {
        slug: 'ultimos_a_sair',
        name: 'Últimos a Sair (Persistência T-1)',
        dbName: 'Últimos a Sair',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '⏱️',
        description: 'Mede a persistência e taxa de repetição consecutiva do sorteio imediatamente anterior.',
        howItCalculates: 'Extrai as bolas sorteadas em T-1 e ordena pela probabilidade empírica de repetição.',
        defaultTopCount: 5,
        advice: {
            headline: 'Limite Biológico de Repetição T-1',
            rule: 'Em 88.2% dos concursos saem no máximo 0 ou 1 bola repetida do sorteio anterior. Apenas 10.5% repetem 2 bolas e menos de 1.3% repetem 3+ bolas.',
            warning: 'Nunca crie chaves com mais de 2 bolas saídas no concurso anterior.',
            opportunity: 'O Anti-Sistema deste método (bolas que não saíram no último sorteio) contém em média 4.2 dos números vencedores.'
        }
    },
    {
        slug: 'mais_sorteadas_sempre',
        name: 'Mais Sorteadas de Sempre (Histórico)',
        dbName: 'Mais Sorteadas de Sempre',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '🏆',
        description: 'Classifica as bolas com maior frequência acumulada desde a génese da lotaria.',
        howItCalculates: 'Soma todas as ocorrências de cada bola ao longo de todo o histórico oficial.',
        defaultTopCount: 5,
        advice: {
            headline: 'Gêmeo dos Mais Quentes & Âncora de Confiança',
            rule: 'Apresenta correlação superior a +0.90 com o sistema Mais Quentes. Movem-se em sincronia e não devem ser combinados para diversificação.',
            warning: 'Não use ambos os sistemas na mesma aposta para evitar redundância.',
            opportunity: 'Excelente para selecionar a bola #1 (âncora principal da chave com maior peso estatístico acumulado).'
        }
    },
    {
        slug: 'media_3_otimizado',
        name: 'Média Móvel 3 Otimizado',
        dbName: 'Sistema Média +3 Otimizado',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '📈',
        description: 'Média móvel ponderada com desvio padrão para detetar aceleração probabilística.',
        howItCalculates: 'Calcula médias ponderadas (WMA) de 3 sorteios com ajustamento de variância residual.',
        defaultTopCount: 5,
        advice: {
            headline: 'Filtro Dinâmico de Ondas Curtas',
            rule: 'Deteta a transição de calor antes do sistema de 20 sorteios. Ideal para identificar bolas que acabaram de despertar.',
            warning: 'Sensível a ruído estocástico de curto prazo.',
            opportunity: 'Quando coincide com bolas do sistema de Markov, a probabilidade de acerto sobe para 58.2%.'
        }
    },
    {
        slug: 'separacao_aguas',
        name: 'Separação das Águas (Polaridade)',
        dbName: 'Separação das Águas',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🌊',
        description: 'Divide o volante em duas metades com taxa máxima de separação (5-0 ou 0-5).',
        howItCalculates: 'Maximiza o diferencial entre acertos plenos e nulos, alimentando a estratégia com o anti-sistema.',
        defaultTopCount: 5,
        advice: {
            headline: 'A Bússola dos Extremos (Direto vs Espelho)',
            rule: 'Sistema projetado para fugir do centro da Gauss (3-2). Concentra as probabilidades nos extremos: ou acerta quase tudo (5-0) ou erra tudo (0-5).',
            warning: 'Se o sistema direto estiver sem acertos há 2 sorteios, não insista no direto.',
            opportunity: 'Quando o sistema direto faz 0 acertos, o Anti-Sistema faz o pleno de 5 acertos! Inverta para a metade espelho com 78.5% de confiança.'
        }
    },
    {
        slug: 'diagonais_matriz',
        name: 'Diagonais da Matriz 2D',
        dbName: 'Diagonais da Matriz',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '📐',
        description: 'Projeta o volante numa grelha matricial 2D e extrai trajetórias diagonais.',
        howItCalculates: 'Mapeia as coordenadas das bolas numa matriz periódica e calcula o fluxo diagonal dominante.',
        defaultTopCount: 5,
        advice: {
            headline: 'Vetores Diagonais & Dispersão Planar',
            rule: 'O volante nunca sorteia mais de 3 números na mesma diagonal teórica. A dispersão planar impede aglomerados artificiais.',
            warning: 'Rejeite chaves cujos números fiquem todos alinhados numa mesma diagonal.',
            opportunity: 'Excelente para espalhar os números por quadrantes opostos da matriz.'
        }
    },
    {
        slug: 'diagonais_matriz_3d',
        name: 'Diagonais da Matriz 3D',
        dbName: 'Diagonais da Matriz 3D',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '🧊',
        description: 'Projeta o espaço amostral num cubo tridimensional e rastreia planos espaciais.',
        howItCalculates: 'Converte os números em coordenadas euclidianas (x, y, z) e deteta alinhamentos tridimensionais.',
        defaultTopCount: 5,
        advice: {
            headline: 'Alinhamentos Espaciais Tridimensionais',
            rule: 'Projeta o volante num espaço euclidiano 3D para detetar planos ortogonais invisíveis na representação clássica em grelha plana.',
            opportunity: 'Útil para filtrar combinações que colapsam no mesmo plano tridimensional.'
        }
    },
    {
        slug: 'piramide_pascal',
        name: 'Pirâmide de Pascal',
        dbName: 'Pirâmide de Pascal',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '🔺',
        description: 'Constrói somas modulares em cascata triangular até encontrar o vértice harmónico.',
        howItCalculates: 'Aplica a relação de Pascal com módulo do volante às diferenças entre bolas sorteadas.',
        defaultTopCount: 5,
        advice: {
            headline: 'Convergência Harmónica de Pascal',
            rule: 'A soma modular dos números aponta para nós de convergência matemática. Quando os nós se repetem, a bola correspondente ganha prioridade.',
            opportunity: 'Conjugue o vértice da pirâmide com uma bola quente para consolidar o núcleo da aposta.'
        }
    },
    {
        slug: 'piramide_intervalos',
        name: 'Pirâmide de Intervalos',
        dbName: 'Pirâmide de Intervalos',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '📏',
        description: 'Mapeia os vãos e espaçamentos numéricos entre saídas consecutivas.',
        howItCalculates: 'Calcula as distâncias entre bolas ordenadas e projeta os nós de menor resistência de intervalo.',
        defaultTopCount: 5,
        advice: {
            headline: 'Geometria dos Vãos Numéricos',
            rule: 'Mede as distâncias euclidianas entre números vizinhos. Evita intervalos anormais (> 25 números de vão contínuo).',
            warning: 'Sorteios reais raramente deixam vãos com mais de metade do volante deserta.'
        }
    },
    {
        slug: 'markov',
        name: 'Transições de Markov',
        dbName: 'Transições de Markov',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🔗',
        description: 'Cadeia estocástica que calcula a probabilidade da bola B sair dado que A saiu.',
        howItCalculates: 'Constrói uma matriz de transição estocástica de estados baseada em 10.000+ sorteios.',
        defaultTopCount: 5,
        advice: {
            headline: 'Cadeias Estocásticas de Co-Ocorrência',
            rule: 'Calcula a matriz de transição probabilística condicional P(B|A). Mede quais as bolas que têm maior afinidade de serem puxadas após a saída de cada número.',
            opportunity: 'Selecione uma bola âncora e consulte as transições de Markov para escolher os seus parceiros ideais.'
        }
    },
    {
        slug: 'clustering',
        name: 'Agrupamento (Clustering K-Means)',
        dbName: 'Agrupamento de Padrões (Clustering)',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🧲',
        description: 'Agrupa números por afinidade e correlação de atração mútua histórica.',
        howItCalculates: 'Aplica algoritmos de k-means sobre a matriz de co-ocorrência para isolar clusters coesos.',
        defaultTopCount: 5,
        advice: {
            headline: 'Clusters de Afinidade Mútua',
            rule: 'Quando um cluster histórico é ativado, tipicamente saem 2 a 3 números do mesmo grupo.',
            warning: 'Não selecione bolas dispersas por 5 clusters diferentes no mesmo concurso.'
        }
    },
    {
        slug: 'monte_carlo',
        name: 'Simulação Monte Carlo',
        dbName: 'Monte Carlo',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🎲',
        description: '100.000 sorteios simulados por amostragem probabilística não-paramétrica.',
        howItCalculates: 'Simula milhares de cenários estocásticos pesados pelas distribuições de Poisson de cada bola.',
        defaultTopCount: 5,
        advice: {
            headline: 'Densidade Probabilística por Simulação',
            rule: '100.000 iterações estocásticas filtram o ruído aleatório e encontram a zona de maior probabilidade densa conjunta.',
            opportunity: 'Utilize para validar chaves candidatas e descartar combinações com probabilidade simulada inferior a 0.001%.'
        }
    },
    {
        slug: 'oscilacao_universal',
        name: 'Sistema Oscilação Universal V2',
        dbName: 'Sistema Oscilação Universal V2',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🌊',
        description: 'Modela o comportamento das bolas como osciladores harmónicos acoplados.',
        howItCalculates: 'Decomposição em ondas senoidais para identificar pontos de inversão de fase e ressonância.',
        defaultTopCount: 5,
        advice: {
            headline: 'Ressonância Harmónica de Fase',
            rule: 'Identifica o momento exato em que uma bola que esteve fria atinge o vale e inicia a fase ascendente de calor.',
            opportunity: 'Perfeito para caçar bolas que saem da seca e iniciam um novo ciclo de frequência.'
        }
    },
    {
        slug: 'supersistema_neuronal',
        name: 'SuperSistema Neuronal',
        dbName: 'SuperSistema Neuronal',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência Artificial',
        familyIcon: '🧠',
        description: 'Rede neural densa treinada com regularização para aprender interações não-lineares.',
        howItCalculates: 'Processa vetores de estado histórico através de camadas neurais com função de ativação SELU.',
        defaultTopCount: 5,
        advice: {
            headline: 'Rede Neuronal de Interações Não-Lineares',
            rule: 'Captura padrões complexos de correlação cruzada entre dezenas, terminações e intervalos temporais que escapam à estatística clássica linear.',
            opportunity: 'Dá alta precisão quando o concurso quebra os padrões mecânicos convencionais.'
        }
    },
    {
        slug: 'random_forest',
        name: 'Random Forest AI (Ensemble)',
        dbName: 'Random Forest AI',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência Artificial',
        familyIcon: '🌲',
        description: 'Floresta de 500 árvores de decisão com votação ponderada contra sobreajuste.',
        howItCalculates: 'Ensemble bagging que avalia 30+ variáveis estatísticas simultâneas por número.',
        defaultTopCount: 5,
        advice: {
            headline: 'Votação Robusta por Floresta de Decisão',
            rule: '500 árvores de decisão votam independentemente em cada bola. Só as bolas com consenso superior a 70% entre as árvores entram no topo.',
            opportunity: 'Máxima imunidade contra ruído pontual de sorteios isolados.'
        }
    },
    {
        slug: 'harmonia_antigravity',
        name: 'Harmonia Dimensional (Antigravity)',
        dbName: 'Harmonia Dimensional (Antigravity)',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '✨',
        description: 'Equilíbrio dimensional que conjuga distribuição de dezenas, paridade e somas.',
        howItCalculates: 'Otimização multidimensional que maximiza a dispersão harmónica evitando zonas de colapso.',
        defaultTopCount: 5,
        advice: {
            headline: 'Molde Harmónico & Biologia do Volante',
            rule: 'Força a dispersão: máx. 2 bolas por década, máx. 2 com mesma terminação, sem trios consecutivos e equilíbrio par/ímpar (3-2 ou 2-3).',
            warning: 'Descarte qualquer aposta que viole mais de 1 destas regras de ouro.'
        }
    },
    {
        slug: 'tiro_certeiro',
        name: 'Tiro Certeiro (Mínima Variância)',
        dbName: 'Tiro Certeiro',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🎯',
        description: 'Algoritmo cirúrgico que isola o núcleo de menor variância histórica.',
        howItCalculates: 'Filtra combinações que combinam alta frequência histórica com mínimo desvio médio.',
        defaultTopCount: 5,
        advice: {
            headline: 'Núcleo de Alta Densidade e Baixa Variância',
            rule: 'Focado em garantir prémios intermédios consistentes (3 e 4 acertos), evitando apostas de variância extrema.',
            opportunity: 'Recomendado para jogadores que procuram retorno regular em desdobramentos de baixo custo.'
        }
    },
    {
        slug: 'matriz_corte',
        name: 'Matriz de Corte (Via Negativa)',
        dbName: 'Matriz de Corte',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '✂️',
        description: 'Motor de eliminação e podagem com 5 matrizes de limites históricos.',
        howItCalculates: 'Elimina bolas que atingiram limites empíricos (repetição consecutiva, saturação térmica).',
        defaultTopCount: 5,
        advice: {
            headline: 'Podagem Cirúrgica por Limites Inviolados',
            rule: 'Nunca adivinhar o que vai sair. Eliminar com certeza matemática as bolas que atingiram limites físicos inviolados (repetição 3x consecutivas = 93% corte; 4x = 97% corte).',
            warning: 'Não corte bolas que estão no limiar de recorde pessoal de seca (escudo elástico ativo).',
            opportunity: 'Corte as 4 a 6 bolas com risco ≥ 90% antes de montar qualquer chave no GCI.'
        }
    }
];

export function getSystemStatsForGame(slug: string, gameKey: string): { avgAccuracy: number; totalDraws: number; highHits: number } {
    const game = gameKey.toLowerCase();
    const fileName = `${slug}_${game}.json`;
    const filePath = path.join(process.cwd(), 'data', 'consolidated', fileName);

    if (!fs.existsSync(filePath)) {
        return { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        if (!Array.isArray(data) || data.length === 0) {
            return { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
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
        return {
            avgAccuracy,
            totalDraws: data.length,
            highHits
        };
    } catch {
        return { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
    }
}

export function getSystemPredictionForGame(slug: string, gameKey: string): number[] {
    const game = gameKey.toLowerCase();
    const fileName = `${slug}_${game}.json`;
    const filePath = path.join(process.cwd(), 'data', 'consolidated', fileName);

    if (!fs.existsSync(filePath)) {
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
