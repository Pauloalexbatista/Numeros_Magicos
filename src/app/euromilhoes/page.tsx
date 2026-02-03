import { getHistory } from '../actions';
import { getJackpotLeaders, getRankingMetrics } from '../ranking/actions';
import { getStarJackpotLeaders } from '../analysis/stars/actions';
import LatestDrawWidget from '@/components/dashboard/LatestDrawWidget';
import TopNumberSystemsWidget from '@/components/dashboard/TopNumberSystemsWidget';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import HistoricalBestWidget from '@/components/dashboard/HistoricalBestWidget';
import StarJackpotLeaders from '@/components/dashboard/StarJackpotLeaders';
import LastDrawNumberSystems from '@/components/dashboard/LastDrawNumberSystems';
import LastDrawStarSystems from '@/components/dashboard/LastDrawStarSystems';

export default async function EuromilhoesPage() {
    const fullHistory = await getHistory();
    const euromilhoesDraws = fullHistory.filter(d => d.game === 'EUROMILLIONS');
    const latestDraw = euromilhoesDraws[0];

    const jackpotLeaders = await getJackpotLeaders();
    const starJackpotLeaders = await getStarJackpotLeaders();
    const rankings = await getRankingMetrics();
    const topNumberSystems = rankings
        .filter(r => !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(r.systemName))
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 pb-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">🇪🇺</div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            Euromilhões
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Análises e previsões para o Euromilhões
                        </p>
                    </div>
                </div>

                {/* Latest Draw Widget */}
                <LatestDrawWidget latestDraw={latestDraw} />

                {/* Top Widgets Row (2 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 space-y-4">
                        <TopNumberSystemsWidget systems={topNumberSystems} />
                    </div>
                    <div className="col-span-1 space-y-4">
                        <TopStarSystemsWidget />
                    </div>
                </div>

                {/* Historical Best (Jackpot Kings) - Side by Side */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <HistoricalBestWidget leaders={jackpotLeaders} />
                    <StarJackpotLeaders leaders={starJackpotLeaders} />
                </section>

                {/* Last Draw Best Systems (Side by Side) */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LastDrawNumberSystems />
                    <LastDrawStarSystems />
                </section>
            </div>
        </div>
    );
}
