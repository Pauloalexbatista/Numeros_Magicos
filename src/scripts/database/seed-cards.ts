import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Dashboard Cards...');

    const cards = [
        // --- WIDGETS ---
        {
            componentKey: 'LatestDrawWidget',
            title: 'Última Chave',
            description: 'Resultado Recente',
            icon: '🎱',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 4,
            order: 1,
            props: {
                variant: 'light',
                isCustomizable: false
            }
        },
        {
            componentKey: 'RankingSummaryWidget',
            title: 'Top Sistemas',
            description: 'Melhores Previsões',
            icon: '🏆',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 2,
            order: 2,
            props: {
                variant: 'light',
                isCustomizable: false
            }
        },

        // --- MEDAL SYSTEMS (ENSEMBLE) - 100% FREE ---
        {
            componentKey: 'LinkCard',
            title: 'Sistema Ouro',
            description: 'Elite Ensemble (Top 3)',
            icon: '🥇',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 3,
            props: {
                href: '/analysis/gold',
                variant: 'light',
                colorTheme: 'amber',
                badgeText: 'TOP 3',
                badgeColor: 'bg-amber-500 text-white'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Sistema Prata',
            description: 'Balanced Ensemble (Top 6)',
            icon: '🥈',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 4,
            props: {
                href: '/analysis/silver',
                variant: 'light',
                colorTheme: 'zinc',
                badgeText: 'TOP 6',
                badgeColor: 'bg-slate-500 text-white'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Sistema Bronze',
            description: 'Diverse Ensemble (Top 9)',
            icon: '🥉',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 5,
            props: {
                href: '/analysis/bronze',
                variant: 'light',
                colorTheme: 'orange',
                badgeText: 'TOP 9',
                badgeColor: 'bg-orange-600 text-white'
            }
        },

        // --- FREE TOOLS ---
        {
            componentKey: 'LinkCard',
            title: 'Quentes e Frios',
            description: 'Frequência',
            icon: '🔥',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 10,
            props: {
                href: '/analysis',
                variant: 'light',
                colorTheme: 'red'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Probabilidades',
            description: 'Matemática',
            icon: '📊',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 20,
            props: {
                href: '/probabilities',
                variant: 'light',
                colorTheme: 'emerald'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Simulador',
            description: 'Verificar Chaves',
            icon: '🎰',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 30,
            props: {
                href: '/simulator',
                variant: 'light',
                colorTheme: 'green'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Histórico',
            description: 'Todos os Sorteios',
            icon: '📜',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 40,
            props: {
                href: '/history',
                variant: 'light',
                colorTheme: 'zinc'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Média',
            description: 'Números & Estrelas',
            icon: '📈',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 50,
            props: {
                href: '/statistics/mean',
                variant: 'light',
                colorTheme: 'blue'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Sequências',
            description: 'Continuidade',
            icon: '🔄',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 60,
            props: {
                href: '/sequences',
                variant: 'light',
                colorTheme: 'cyan'
            }
        },

        // --- ADVANCED TOOLS (100% FREE) ---
        {
            componentKey: 'LinkCard',
            title: 'Desdobramentos',
            description: 'Jogue mais, pague menos',
            icon: '🎟️',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 100,
            props: {
                href: '/wheeling',
                variant: 'light',
                colorTheme: 'purple',
                badgeText: 'ESSENCIAL'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Simulador ROI',
            description: 'Backtest Financeiro',
            icon: '💸',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 110,
            props: {
                href: '/simulator/investment',
                variant: 'light',
                colorTheme: 'blue',
                badgeText: 'FINANÇAS'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Laboratório ML',
            description: 'Backtesting & IA',
            icon: '🧪',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 120,
            props: {
                href: '/models',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Análise Posicional',
            description: 'Desvio Padrão',
            icon: '📏',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 130,
            props: {
                href: '/analysis/positional',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Monte Carlo',
            description: 'Simulação Futura',
            icon: '🎲',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 140,
            props: {
                href: '/analysis/monte-carlo',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Cadeias Markov',
            description: 'Previsão IA',
            icon: '🔗',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 150,
            props: {
                href: '/analysis/markov',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Clustering',
            description: 'Agrupamento IA',
            icon: '🧩',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 160,
            props: {
                href: '/analysis/clustering',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Detecção Padrões',
            description: 'Análise Profunda',
            icon: '🔎',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 170,
            props: {
                href: '/patterns',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Matrix Binária',
            description: 'Visão Global',
            icon: '🧬',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 180,
            props: {
                href: '/matrix',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Padrões Estrelas',
            description: 'Par/Ímpar & Alto/Baixo',
            icon: '⭐',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 190,
            props: {
                href: '/analysis/star-patterns',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Números Primos',
            description: 'Análise Primalidade',
            icon: '🔢',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 200,
            props: {
                href: '/analysis/primes',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Dezenas',
            description: 'Distribuição',
            icon: '📊',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 210,
            props: {
                href: '/analysis/decades',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Quadrantes',
            description: 'Análise Espacial',
            icon: '🎯',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 220,
            props: {
                href: '/analysis/quadrants',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Múltiplos',
            description: '3, 4, 5 e 7',
            icon: '🔢',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 230,
            props: {
                href: '/analysis/multiples',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Propriedades',
            description: 'Pares, Ímpares...',
            icon: '🔢',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 240,
            props: {
                href: '/analysis/number-properties',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Vortex Pyramid',
            description: 'Cálculo Toroidal',
            icon: '🌪️',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 245,
            props: {
                href: '/analysis/vortex-pyramid',
                variant: 'light',
                colorTheme: 'blue',
                badgeText: 'NOVO'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'LSTM Neural Net',
            description: 'Rede Neural',
            icon: '🧠',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 246,
            props: {
                href: '/analysis/lstm',
                variant: 'light',
                colorTheme: 'blue',
                badgeText: 'AI'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Random Forest',
            description: 'Árvores Decisão',
            icon: '🌲',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 247,
            props: {
                href: '/analysis/random-forest',
                variant: 'light',
                colorTheme: 'blue',
                badgeText: 'AI'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'ML Classifier',
            description: 'Regressão Logística',
            icon: '📈',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 248,
            props: {
                href: '/analysis/ml-classifier',
                variant: 'light',
                colorTheme: 'blue',
                badgeText: 'ML'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Root Sum',
            description: 'Raiz Digital',
            icon: '🔢',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 249,
            props: {
                href: '/analysis/root-sum',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Standard Deviation',
            description: 'Variação',
            icon: '📊',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 250,
            props: {
                href: '/analysis/standard-deviation',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Pattern Based',
            description: 'Amplitude',
            icon: '🎯',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 1,
            order: 251,
            props: {
                href: '/analysis/pattern-based',
                variant: 'light',
                colorTheme: 'indigo'
            }
        },

        // --- ADMIN TOOLS ---
        {
            componentKey: 'LinkCard',
            title: 'Debug Database',
            description: 'Verificar Sorteios',
            icon: '🔍',
            type: 'ADMIN',
            minRole: 'ADMIN',
            gridSpan: 1,
            order: 300,
            props: {
                href: '/debug-db',
                variant: 'admin'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Gestão de Cartões',
            description: 'Configurar Dashboard',
            icon: '⚙️',
            type: 'ADMIN',
            minRole: 'ADMIN',
            gridSpan: 1,
            order: 310,
            props: {
                href: '/admin/cards',
                variant: 'admin'
            }
        },
        {
            componentKey: 'LinkCard',
            title: 'Admin Dashboard',
            description: 'Painel Principal',
            icon: '🛡️',
            type: 'ADMIN',
            minRole: 'ADMIN',
            gridSpan: 1,
            order: 320,
            props: {
                href: '/admin',
                variant: 'admin'
            }
        }
    ];

    // Delete existing cards to avoid duplicates during development
    await prisma.dashboardCard.deleteMany({});

    for (const card of cards) {
        await prisma.dashboardCard.create({
            data: {
                componentKey: card.componentKey,
                title: card.title,
                description: card.description,
                icon: card.icon,
                type: card.type,
                minRole: card.minRole,
                gridSpan: card.gridSpan,
                order: card.order,
                config: JSON.stringify(card.props)
            }
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
