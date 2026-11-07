import fs from 'fs';
import path from 'path';

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
}

export const SYSTEM_CATALOG: SystemCatalogItem[] = [
    {
        slug: 'mais_quentes',
        name: 'Mais Quentes (Hot)',
        dbName: 'Mais Quentes',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '🔥',
        description: 'Mede as bolas com maior calor e frequência nos últimos 20 sorteios.',
        howItCalculates: 'Conta o número de saídas em janela rolante de 20 sorteios e ordena por calor decrescente.',
        defaultTopCount: 5
    },
    {
        slug: 'ultimos_a_sair',
        name: 'Últimos a Sair',
        dbName: 'Últimos a Sair',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '⏱️',
        description: 'Mede a persistência e taxa de repetição consecutiva do sorteio imediatamente anterior.',
        howItCalculates: 'Extrai as bolas sorteadas em T-1 e ordena pela probabilidade empírica de repetição.',
        defaultTopCount: 5
    },
    {
        slug: 'mais_sorteadas_sempre',
        name: 'Mais Sorteadas de Sempre',
        dbName: 'Mais Sorteadas de Sempre',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '🏆',
        description: 'Classifica as bolas com maior frequência acumulada desde a génese da lotaria.',
        howItCalculates: 'Soma todas as ocorrências de cada bola ao longo de todo o histórico oficial.',
        defaultTopCount: 5
    },
    {
        slug: 'media_3_otimizado',
        name: 'Média 3 Otimizado',
        dbName: 'Sistema Média +3 Otimizado',
        family: 'INERTIA',
        familyName: 'Inércia Térmica',
        familyIcon: '📈',
        description: 'Média móvel ponderada com desvio padrão para detetar aceleração probabilística.',
        howItCalculates: 'Calcula médias ponderadas (WMA) de 3 sorteios com ajustamento de variância residual.',
        defaultTopCount: 5
    },
    {
        slug: 'separacao_aguas',
        name: 'Separação das Águas',
        dbName: 'Separação das Águas',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🌊',
        description: 'Divide o volante em duas metades com taxa máxima de separação (5-0 ou 0-5).',
        howItCalculates: 'Maximiza o diferencial entre acertos plenos e nulos, alimentando a estratégia com o anti-sistema.',
        defaultTopCount: 5
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
        defaultTopCount: 5
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
        defaultTopCount: 5
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
        defaultTopCount: 5
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
        defaultTopCount: 5
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
        defaultTopCount: 5
    },
    {
        slug: 'clustering',
        name: 'Agrupamento (Clustering)',
        dbName: 'Agrupamento de Padrões (Clustering)',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🧲',
        description: 'Agrupa números por afinidade e correlação de atração mútua histórica.',
        howItCalculates: 'Aplica algoritmos de k-means sobre a matriz de co-ocorrência para isolar clusters coesos.',
        defaultTopCount: 5
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
        defaultTopCount: 5
    },
    {
        slug: 'oscilacao_universal',
        name: 'Oscilação Universal V2',
        dbName: 'Sistema Oscilação Universal V2',
        family: 'CYCLES',
        familyName: 'Ciclos & Ressonância',
        familyIcon: '🌊',
        description: 'Modela o comportamento das bolas como osciladores harmónicos acoplados.',
        howItCalculates: 'Decomposição em ondas senoidais para identificar pontos de inversão de fase e ressonância.',
        defaultTopCount: 5
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
        defaultTopCount: 5
    },
    {
        slug: 'random_forest',
        name: 'Random Forest AI',
        dbName: 'Random Forest AI',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência Artificial',
        familyIcon: '🌲',
        description: 'Floresta de 500 árvores de decisão com votação ponderada contra sobreajuste.',
        howItCalculates: 'Ensemble bagging que avalia 30+ variáveis estatísticas simultâneas por número.',
        defaultTopCount: 5
    },
    {
        slug: 'harmonia_antigravity',
        name: 'Harmonia Dimensional',
        dbName: 'Harmonia Dimensional (Antigravity)',
        family: 'GEOMETRY',
        familyName: 'Geometria Matricial',
        familyIcon: '✨',
        description: 'Equilíbrio dimensional que conjuga distribuição de dezenas, paridade e somas.',
        howItCalculates: 'Otimização multidimensional que maximiza a dispersão harmónica evitando zonas de colapso.',
        defaultTopCount: 5
    },
    {
        slug: 'tiro_certeiro',
        name: 'Tiro Certeiro',
        dbName: 'Tiro Certeiro',
        family: 'INTELLIGENCE',
        familyName: 'Inteligência & Extremos',
        familyIcon: '🎯',
        description: 'Algoritmo cirúrgico que isola o núcleo de menor variância histórica.',
        howItCalculates: 'Filtra combinações que combinam alta frequência histórica com mínimo desvio médio.',
        defaultTopCount: 5
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
        defaultTopCount: 5
    }
];

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
