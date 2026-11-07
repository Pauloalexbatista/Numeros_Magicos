import { auth } from '@/auth';
import Link from 'next/link';
import { Scissors, Trophy, Dices, BarChart, TrendingUp, Hash, Settings, Shield } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const metadata = {
    title: 'Ferramentas | Números Mágicos',
    description: 'Utilitários e simuladores para lotarias'
};

export default async function ToolsPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'USER';

    const toolsCards = [
        {
            title: 'Matriz de Corte (Via Negativa)',
            description: 'Motor de eliminação de números com 8 matrizes de limites históricos e potenciómetro ajustável',
            href: '/tools/matriz-corte',
            icon: Scissors,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'NOVO DESTAQUE'
        },
        {
            title: 'Gerador de Chaves Inteligente (GCI)',
            description: 'Gere apostas através de Cubo Mágico, Chave Tipo, Coberturas Combinatórias e Métodos Cirúrgicos',
            href: '/wheeling',
            icon: Dices,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'ESSENCIAL'
        },
        {
            title: 'Radar de Maturação (JPI)',
            description: 'Descubra os sistemas algorítmicos em ponto óptimo de convergência para o próximo Jackpot',
            href: '/tools/radar',
            icon: TrendingUp,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'DESTAQUE'
        },
        {
            title: 'Análise de Pools Completas',
            description: 'Validação de acertos por blocos de 5 em 5 para toda a pool de números',
            href: '/tools/full-pool-viewer',
            icon: BarChart,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        },
        {
            title: 'Otimizador de Intervalos',
            description: 'Descubra o melhor intervalo de números (Sweet Spot)',
            href: '/analysis/optimizer',
            icon: TrendingUp,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        },
        {
            title: 'Histórico de Jackpots',
            description: 'Lista de todos os jogos com Jackpots até ao momento',
            href: '/tools/jackpots',
            icon: Trophy,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        },
        {
            title: 'Simulador de Chaves da Sorte',
            description: 'Simule as suas chaves e confira os acertos históricos em todos os sorteios',
            href: '/simulator',
            icon: Dices,
            variant: 'free' as const,
            gridSpan: 2 as const
        },
        {
            title: 'Tabela de Probabilidades',
            description: 'Análise posicional e probabilidades hipergeométricas',
            href: '/probabilities',
            icon: Hash,
            variant: 'premium' as const,
            gridSpan: 2 as const
        }
    ];

    // Backoffice Card (contém as 5 ferramentas em quarentena/análise e diagnósticos)
    const backofficeCard = {
        title: 'Backoffice & Laboratório',
        description: 'Área reservada: ferramentas em quarentena/análise algorítmica e saúde do sistema',
        href: '/admin',
        icon: Shield,
        variant: 'premium' as const,
        gridSpan: 2 as const,
        badge: 'BACKOFFICE'
    };

    return (
        <div className="min-h-screen bg-surface-1 text-foreground p-4 md:p-8 font-sans">
            <div className="mx-auto max-w-7xl space-y-12">
                <header className="space-y-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <span className="font-medium">← Voltar à Visão Geral</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-surface-2 p-4">
                            <span className="text-4xl">🛠️</span>
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight text-foreground">
                                Ferramentas
                            </h1>
                            <p className="mt-2 text-lg font-medium text-muted-foreground">
                                Simuladores, calculadoras e utilitários
                            </p>
                        </div>
                    </div>
                </header>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                    {toolsCards.map((card) => (
                        <UnifiedCard
                            key={card.href}
                            title={card.title}
                            description={card.description}
                            href={card.href}
                            icon={card.icon}
                            category="dashboard"
                            variant={card.variant}
                            gridSpan={card.gridSpan}
                            badge={card.badge}
                        />
                    ))}

                    {/* Backoffice Card: Acesso às 5 ferramentas em quarentena/análise técnica */}
                    <UnifiedCard
                        key={backofficeCard.href}
                        title={backofficeCard.title}
                        description={backofficeCard.description}
                        href={backofficeCard.href}
                        icon={backofficeCard.icon}
                        category="dashboard"
                        variant={backofficeCard.variant}
                        gridSpan={backofficeCard.gridSpan}
                        badge={backofficeCard.badge}
                    />
                </div>

                <ResponsibleGamingFooter />
            </div>
        </div>
    );
}
