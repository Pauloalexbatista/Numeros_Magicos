import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowLeft, Star, Sparkles } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import ExclusionStarsCard from '@/components/analysis/ExclusionStarsCard';
import { getExclusionPrediction } from '@/services/exclusion-lstm';

// Import existing analysis components
import { getStarSystemsYearlyAnalysis, getStarFrequency, getStarPairs, getStarProperties, getStarSuggestions } from './actions';
import { TopStarSystemsAnalysis } from '@/components/TopStarSystemsAnalysis';
import { StarFrequencyClient } from '@/components/StarFrequencyClient';
import { StarPairsClient } from '@/components/StarPairsClient';
import { StarPropertiesClient } from '@/components/StarPropertiesClient';
import { StarSuggestionsClient } from '@/components/StarSuggestionsClient';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import LastDrawStarSystems from '@/components/dashboard/LastDrawStarSystems';

export const metadata = {
    title: 'Análise de Estrelas | Números Mágicos',
    description: 'Análises completas de estrelas do EuroMilhões'
};

export const dynamic = 'force-dynamic';

export default async function StarsAnalysisPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'USER';

    // Fetch star analysis data
    const yearlyAnalysis = await getStarSystemsYearlyAnalysis();
    const freqData = await getStarFrequency();
    const pairsData = await getStarPairs();
    const propsData = await getStarProperties();
    const suggestionsData = await getStarSuggestions();

    const rankings = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    // Get LSTM exclusion prediction for stars
    let exclusionPrediction;
    let exclusionLoading = false;
    try {
        exclusionPrediction = await getExclusionPrediction('STARS');
    } catch (error) {
        console.error('[Stars Page] LSTM prediction failed:', error);
        exclusionLoading = false;
    }

    // Define star analysis cards
    const analysisCards = [
        {
            title: 'Frequência de Estrelas',
            description: 'Análise de frequência histórica das estrelas',
            href: '#frequency',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'Gráfico'
        },
        {
            title: 'Pares de Estrelas',
            description: 'Pares mais comuns de estrelas',
            href: '#pairs',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'Gráfico'
        },
        {
            title: 'Propriedades',
            description: 'Análise de pares e ímpares',
            href: '#properties',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'Gráfico'
        }
    ];

    const systemsCards = [
        {
            title: 'Padrões Estrelas',
            description: 'Análise de padrões de estrelas',
            href: '/analysis/star-patterns',
            icon: Sparkles,
            variant: 'pro' as const,
            gridSpan: 2 as const
        },
        {
            title: 'Ranking de Sistemas',
            description: 'Performance dos sistemas de estrelas',
            href: '#ranking',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 3 as const,
            badge: 'Top Systems'
        },
        {
            title: 'Sugestões',
            description: 'Melhores estrelas recomendadas',
            href: '#suggestions',
            icon: Sparkles,
            variant: 'free' as const,
            gridSpan: 3 as const,
            badge: 'Recomendado'
        },
        {
            title: 'Análise de Tendências',
            description: 'Evolução temporal e padrões de subida/descida',
            href: '/analysis/star-trends',
            icon: Star,
            variant: 'pro' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-6">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar ao Dashboard</span>
                    </Link>

                    {/* Title */}
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-yellow-100 dark:bg-yellow-900">
                            <Star className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight text-yellow-600 dark:text-yellow-400">
                                Análise de Estrelas
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-2">
                                Explorando padrões e estatísticas das estrelas 1-12
                            </p>
                        </div>
                    </div>
                </header>

                {/* Top Widgets Row - Star Systems Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TopStarSystemsWidget />
                    <LastDrawStarSystems />
                </div>

                {/* Analysis Cards Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                        <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            ✨ Análises de Estrelas
                        </h2>
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                        {analysisCards.map((card) => (
                            <UnifiedCard
                                key={card.href}
                                title={card.title}
                                description={card.description}
                                href={card.href}
                                icon={card.icon}
                                category="stars"
                                variant={card.variant}
                                gridSpan={card.gridSpan}
                                badge={card.badge}
                            />
                        ))}
                    </div>
                </section>

                {/* Systems Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                        <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            🤖 Sistemas de Estrelas
                        </h2>
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                    </div>

                    {/* LSTM Exclusion Card - Featured */}
                    <div className="mb-8 space-y-4">
                        <ExclusionStarsCard
                            excluded={exclusionPrediction?.excluded || []}
                            confidence={exclusionPrediction?.confidence || 0}
                            lastUpdate={exclusionPrediction ? new Date() : undefined}
                            isLoading={exclusionLoading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                        {systemsCards.map((card) => (
                            <UnifiedCard
                                key={card.href}
                                title={card.title}
                                description={card.description}
                                href={card.href}
                                icon={card.icon}
                                category="stars"
                                variant={card.variant}
                                gridSpan={card.gridSpan}
                                badge={card.badge}
                            />
                        ))}
                    </div>
                </section>

                {/* Analysis Grids - Full Width */}
                <section className="space-y-6">
                    <div id="properties" className="scroll-mt-8">
                        <StarPropertiesClient stats={propsData} />
                    </div>
                    <div id="frequency" className="scroll-mt-8">
                        <StarFrequencyClient frequency={freqData.frequency} totalDraws={freqData.totalDraws} />
                    </div>
                    <div id="pairs" className="scroll-mt-8">
                        <StarPairsClient pairs={pairsData} />
                    </div>
                </section>

                {/* Removed: Suggestions, Liga yearly table and Ranking table - now accessible via CTA card */}
                <section id="ranking" className="scroll-mt-8 space-y-4" style={{ display: 'none' }}>
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                        <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            🏆 Ranking de Performance
                        </h2>
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                    </div>

                    <div className="grid gap-4">
                        {rankings.map((rank, index) => (
                            <div
                                key={rank.id}
                                className="rounded-2xl border-2 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`
                      flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shadow-lg
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black' :
                                                index === 1 ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-black' :
                                                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' :
                                                        'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'}
                    `}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {rank.systemName}
                                            </h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {rank.systemName === 'Hot Stars' && 'Baseado na frequência (Quentes)'}
                                                {rank.systemName === 'Late Stars' && 'Baseado no atraso (Frias)'}
                                                {rank.systemName === 'Markov Stars' && 'Baseado em transições'}
                                                {rank.systemName === 'Star Platinum' && 'Ensemble (Combinação)'}
                                                {!['Hot Stars', 'Late Stars', 'Markov Stars', 'Star Platinum'].includes(rank.systemName) && 'Sistema de previsão de estrelas'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                            Precisão (Top 6)
                                        </div>
                                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {rank.avgAccuracy.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            Prevê 6 estrelas para acertar nas 2 vencedoras
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            <ResponsibleGamingFooter />
        </div>
    );
}
