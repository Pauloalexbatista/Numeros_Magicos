import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowLeft, Star, Sparkles } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import ExclusionStarsCard from '@/components/analysis/ExclusionStarsCard';
import { getExclusionPrediction } from '@/services/exclusion-lstm';
import ExplanationCard from '@/components/ExplanationCard';

// Import existing analysis components
import { getStarFrequency, getStarPairs, getStarProperties } from './actions';
import { StarFrequencyClient } from '@/components/StarFrequencyClient';
import { StarPairsClient } from '@/components/StarPairsClient';
import { StarPropertiesClient } from '@/components/StarPropertiesClient';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import LastDrawStarSystems from '@/components/dashboard/LastDrawStarSystems';
import ClusteringStarsCard from '@/components/analysis/ClusteringStarsCard';
import MonteCarloStarsCard from '@/components/analysis/MonteCarloStarsCard';
import MediaPlusOneStarsCard from '@/components/analysis/MediaPlusOneStarsCard';
import VortexStarsCard from '@/components/analysis/VortexStarsCard';

export const metadata = {
    title: 'Análise de Estrelas | Números Mágicos',
    description: 'Análises completas de estrelas do EuroMilhões'
};

export const dynamic = 'force-dynamic';

export default async function StarsAnalysisPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'USER';

    // Fetch star analysis data
    const freqData = await getStarFrequency();
    const pairsData = await getStarPairs();
    const propsData = await getStarProperties();

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
    const basicAnalysisCards = [
        {
            title: 'Quentes e Frios',
            description: 'Análise de frequência das estrelas mais e menos frequentes',
            href: '#frequency',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'Gráfico'
        },
        {
            title: 'Pares de Estrelas',
            description: 'Associação entre estrelas que saem juntas',
            href: '#pairs',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'Gráfico'
        },
        {
            title: 'Propriedades',
            description: 'Paridade, ímpares e números primos',
            href: '#properties',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'Gráfico'
        }
    ];

    const advancedSystemsCards = [
        {
            title: 'Padrões Estrelas',
            description: 'Análise de padrões sequenciais e cíclicos',
            href: '/analysis/star-patterns',
            icon: Sparkles,
            variant: 'pro' as const,
            gridSpan: 2 as const
        },
        {
            title: 'Ranking de Sistemas',
            description: 'Performance detalhada dos algoritmos',
            href: '#ranking',
            icon: Star,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'Top Systems'
        },
        {
            title: 'Sugestões IA',
            description: 'Recomendações dos melhores sistemas',
            href: '#suggestions',
            icon: Sparkles,
            variant: 'free' as const,
            gridSpan: 2 as const,
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
        },
        // New Systems
        {
            title: 'Clustering Stars',
            description: 'Agrupamento de estrelas em 3 clusters (1-4, 5-8, 9-12)',
            href: '/analysis/stars/ranking/Clustering%20Stars',
            icon: Sparkles,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        },
        {
            title: 'Monte Carlo Stars',
            description: 'Simulações probabilísticas para prever estrelas',
            href: '/analysis/stars/ranking/Monte%20Carlo%20Stars',
            icon: Sparkles,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        },
        {
            title: 'Vortex Stars',
            description: 'Sistema Vortex adaptado (Ressonância Toroidal)',
            href: '/analysis/stars/ranking/Vortex%20Stars',
            icon: Sparkles,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        },
        {
            title: 'Média +1 Stars',
            description: 'Média dos últimos 50 sorteios + vizinhos (±1) por casa',
            href: '/analysis/stars/ranking/M%C3%A9dia%20%2B1%20Stars',
            icon: Sparkles,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'NOVO'
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-6 text-center">
                    {/* Back Button */}
                    <div className="flex justify-start">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar à Visão Geral</span>
                        </Link>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-2xl bg-yellow-100 dark:bg-yellow-900 mx-auto">
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

                {/* Explanation Card */}
                <ExplanationCard
                    title="ℹ️ O Que São Análises de Estrelas?"
                    description="Análises focadas nas 12 estrelas do EuroMilhões. Descubra padrões de frequência, pares comuns e sistemas preditivos específicos."
                    points={[
                        { title: "⭐ Frequência:", text: "Identifique as estrelas mais sorteadas historicamente" },
                        { title: "🔄 Pares:", text: "Descubra quais estrelas costumam sair juntas" },
                        { title: "🤖 Sistemas:", text: "Algoritmos especializados (Markov, Hot/Cold) para prever estrelas" }
                    ]}
                    icon={<Star className="w-6 h-6" />}
                    color="yellow"
                />

                {/* Basic Analysis Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                        <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            📊 Análises Básicas
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
                            isAdmin={userRole === 'ADMIN'}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                        {basicAnalysisCards.map((card) => (
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
                            🤖 Sistemas Avançados
                        </h2>
                        <div className="h-px flex-grow bg-yellow-200 dark:bg-yellow-800" />
                    </div>

                    {/* Interactive Cards for New Systems */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ClusteringStarsCard />
                        <MonteCarloStarsCard />
                        <MediaPlusOneStarsCard />
                        <VortexStarsCard />
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



            </div>

            <ResponsibleGamingFooter />
        </div>
    );
}
