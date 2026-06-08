
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowLeft, Wrench, Dices, BarChart, TrendingUp, Hash, Beaker, Settings } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const metadata = {
    title: 'Ferramentas | Números Mágicos',
    description: 'Utilitários e simuladores para o EuroMilhões'
};

export default async function ToolsPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'USER';

    const toolsCards = [
        {
            title: 'Desdobramentos de Números',
            description: 'Jogue com mais números por menos',
            href: '/wheeling',
            icon: Dices,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'ESSENCIAL'
        },
        {
            title: 'Desdobramentos de Estrelas',
            description: 'Jogue com mais estrelas por menos',
            href: '/wheeling/stars',
            icon: Dices,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        },
        {
            title: 'Simulador de Apostas',
            description: 'Simule chaves e teste a sua sorte',
            href: '/simulator',
            icon: Dices,
            variant: 'free' as const,
            gridSpan: 2 as const
        },

        {
            title: 'Simulador ROI',
            description: 'Calculadora de Retorno de Investimento',
            href: '/simulator/investment',
            icon: TrendingUp,
            variant: 'premium' as const,
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

    // Admin-only card
    const adminCard = {
        title: 'Painel de Administração',
        description: 'Gestão de sistemas, utilizadores e backend',
        href: '/admin',
        icon: Settings,
        variant: 'premium' as const,
        gridSpan: 2 as const,
        badge: 'ADMIN'
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-tool-600 dark:text-tool-400 hover:text-tool-700 dark:hover:text-tool-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar à Visão Geral</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-tool-100 dark:bg-tool-900">
                            <Wrench className="w-12 h-12 text-tool-600 dark:text-tool-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight text-tool-600 dark:text-tool-400 text-center">
                                Ferramentas
                            </h1>
                            <p className="text-muted-foreground text-lg font-medium mt-2">
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
                        />
                    ))}

                    {/* Admin Card - Only visible to admins */}
                    {userRole === 'ADMIN' && (
                        <UnifiedCard
                            key={adminCard.href}
                            title={adminCard.title}
                            description={adminCard.description}
                            href={adminCard.href}
                            icon={adminCard.icon}
                            category="dashboard"
                            variant={adminCard.variant}
                            gridSpan={adminCard.gridSpan}
                            badge={adminCard.badge}
                        />
                    )}
                </div>

            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
