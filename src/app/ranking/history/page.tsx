

import { BackButton } from '@/components/ui';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getTopSystemsYearlyAnalysis, getAllTimeRankingMetrics } from '../actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';
import AllTimeRankingTable from '@/components/AllTimeRankingTable';

export const dynamic = 'force-dynamic';

export default async function HistoricalAnalysisPage() {
    const yearlyAnalysis = await getTopSystemsYearlyAnalysis();
    const allTimeMetrics = await getAllTimeRankingMetrics();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-6xl">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">
                            Análise Histórica
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Performance detalhada de todos os sorteios (Desde 2004).
                        </p>
                    </div>
                </div>

                {/* Yearly Analysis */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                        📅 Análise Ano a Ano
                    </h2>
                    <TopSystemsAnalysis data={yearlyAnalysis} />
                </div>

                {/* All-Time Ranking (New) */}
                <div className="space-y-4 pt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                            🌎 Ranking Global <span className="text-base font-normal text-slate-500">(Desde 2004)</span>
                        </h2>
                    </div>
                    <AllTimeRankingTable data={allTimeMetrics} />
                    <p className="text-center text-slate-500 text-sm mt-4">
                        * Esta lista considera a performance acumulada desde a fundação do jogo (2004).
                    </p>
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
