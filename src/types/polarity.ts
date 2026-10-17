export interface PolarityMetrics {
    game: string;
    systemSlug: string;
    systemName: string;
    family: string;
    totalDraws: number;
    pickSize: number;
    halfSize: number;
    
    // Contagens Globais
    directJackpots: number;     // 5-0 (ou 6-0)
    mirrorJackpots: number;     // 0-5 (ou 0-6)
    totalExtremeJackpots: number;
    directTraves: number;       // 4-1 (ou 5-1)
    mirrorTraves: number;       // 1-4 (ou 1-5)
    totalExtremeTraves: number;
    centralNoiseCount: number;  // 3-2 / 2-3 (ou 4-2/3-3/2-4)
    
    // Percentagens Estruturais
    extremeSeparationRate: number; // % de sorteios nos extremos (5-0, 0-5, 4-1, 1-4)
    centralNoiseRate: number;      // % de sorteios desperdiçados no meio da Gauss
    
    // Ciclos e Atrasos (Dual JPI)
    directMeanCycle: number;
    mirrorMeanCycle: number;
    directDelay: number;
    mirrorDelay: number;
    directJpi: number;
    mirrorJpi: number;
    
    // Pressão Recente (Últimos 5 e 10 sorteios)
    directTravesLast5: number;
    mirrorTravesLast5: number;
    directTravesLast10: number;
    mirrorTravesLast10: number;
    recentTrend: 'DIRECT_HOT' | 'MIRROR_HOT' | 'NEUTRAL';
    
    // Bússola de Polaridade
    recommendation: 'DIRECT' | 'MIRROR' | 'NEUTRAL';
    confidence: number;
    headline: string;
    explanation: string;
    
    // Chaves Atuais para o Próximo Sorteio
    lastUpdatedDate?: string;
    fullPoolPrediction: number[];
    directNumbers: number[];
    mirrorNumbers: number[];
    suggestedStars?: number[];
}

export interface PolarityRankingItem {
    systemSlug: string;
    systemName: string;
    family: string;
    directJackpots: number;
    mirrorJackpots: number;
    totalExtremeJackpots: number;
    extremeSeparationRate: number;
    centralNoiseRate: number;
    directDelay: number;
    mirrorDelay: number;
    directMeanCycle: number;
    mirrorMeanCycle: number;
    recommendation: 'DIRECT' | 'MIRROR' | 'NEUTRAL';
    confidence: number;
}

export interface SystemFamilyConfig {
    name: string;
    icon: string;
    description: string;
}

export const SYSTEM_FAMILIES: Record<string, SystemFamilyConfig> = {
    INERTIA: {
        name: 'Inércia & Calor Recente',
        icon: '🔥',
        description: 'Sistemas que capturam ondas de calor e persistência temporal recente'
    },
    GEOMETRY: {
        name: 'Geometria & Espaço Matricial',
        icon: '📐',
        description: 'Estruturas matriciais 2D/3D, diagonais e pirâmides numéricas'
    },
    CYCLES: {
        name: 'Ciclos & Vórtice Harmónico',
        icon: '🌀',
        description: 'Transições markovianas, agrupamento dinâmico e oscilações universais'
    },
    INTELLIGENCE: {
        name: 'Inteligência Coletiva & Extremos',
        icon: '🧠',
        description: 'Meta-sistemas de polarização extrema, redes neuronais e via negativa'
    }
};

export interface NextDrawSuggestionItem {
    systemSlug: string;
    systemName: string;
    family: string;
    top5: number[];
    top10: number[];
    topHalf: number[];
    mirrorHalf: number[];
    recommendation: 'DIRECT' | 'MIRROR' | 'NEUTRAL';
}
