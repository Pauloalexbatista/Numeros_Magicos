import { getNumberTrendAnalysis } from '@/services/trend-analysis';
import TrendAnalysisClient from '@/components/TrendAnalysisClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const metadata = {
    title: 'Análise de Tendências - Números | Números Mágicos',
    description: 'Análise de tendências dos números do EuroMilhões'
};

export const dynamic = 'force-dynamic';

export default async function NumberTrendsPage() {
    const trends = await getNumberTrendAnalysis(50);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="space-y-6">
                    <Link
                        href="/analysis/numbers"
                        className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar a Análise de Números</span>
                    </Link>

                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-green-600 dark:text-green-400">
                            📈 Análise de Tendências - Números
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium mt-2">
                            Evolução temporal dos números 1-50
                        </p>
                    </div>
                </header>

                {/* Content */}
                <TrendAnalysisClient trends={trends} windowSize={50} type="numbers" />
            </div>

            <ResponsibleGamingFooter />
        </div>
    );
}
