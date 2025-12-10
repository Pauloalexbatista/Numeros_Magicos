import { getStarTrendAnalysis } from '@/services/trend-analysis';
import TrendAnalysisClient from '@/components/TrendAnalysisClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const metadata = {
    title: 'Análise de Tendências - Estrelas | Números Mágicos',
    description: 'Análise de tendências das estrelas do EuroMilhões'
};

export const dynamic = 'force-dynamic';

export default async function StarTrendsPage() {
    const trends = await getStarTrendAnalysis(50);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="space-y-6">
                    <Link
                        href="/analysis/stars"
                        className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar a Análise de Estrelas</span>
                    </Link>

                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-yellow-600 dark:text-yellow-400">
                            📈 Análise de Tendências - Estrelas
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-2">
                            Evolução temporal das estrelas 1-12
                        </p>
                    </div>
                </header>

                {/* Content */}
                <TrendAnalysisClient trends={trends} windowSize={50} type="stars" />
            </div>

            <ResponsibleGamingFooter />
        </div>
    );
}
