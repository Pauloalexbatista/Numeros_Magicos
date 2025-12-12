
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowLeft, Wrench, Dices, BarChart, TrendingUp, Archive, Hash } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const metadata = {
    title: 'Ferramentas | Números Mágicos',
    description: 'Utilitários e simuladores para o EuroMilhões'
};

export default async function ToolsPage() {
    const session = await auth();

    const toolsCards = [
        {
            title: 'Simulador de Apostas',
            description: 'Simule chaves e teste a sua sorte',
            href: '/simulator',
            icon: Dices,
            variant: 'free' as const,
            gridSpan: 2 as const
        },
        {
            title: 'Desdobramentos',
            description: 'Gerador de apostas combinadas (Wheeling)',
            href: '/wheeling',
            icon: BarChart,
            variant: 'premium' as const,
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
            title: 'Histórico Completo',
            description: 'Consultar todos os sorteios de 2004 até hoje',
            href: '/history',
            icon: Archive,
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar à Visão Geral</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900">
                            <Wrench className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                                Ferramentas
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-2">
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
                </div>

            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
