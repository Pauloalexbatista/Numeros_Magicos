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
import { GameType } from '@/types/game';

export default async function EuroDreamsPage() {
    const eurodreamsDraws = await getHistory('EURODREAMS');
    const latestDraw = eurodreamsDraws[0];

    const jackpotLeaders = await getJackpotLeaders('EURODREAMS');
    const starJackpotLeaders = await getStarJackpotLeaders('EURODREAMS');
    const rankings = await getRankingMetrics('EURODREAMS');
    const topNumberSystems = rankings
        .filter(r => !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(r.systemName))
        .slice(0, 3);

    return (
        <div className="w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">✨</div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            EuroDreams
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Análises e previsões para o EuroDreams
                        </p>
                    </div>
                </div>

                {/* Latest Draw Widget */}
                <LatestDrawWidget latestDraw={latestDraw} game={GameType.EURODREAMS} />

                {/* Core Columns (2 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {/* Left: Numbers Area */}
                    <div className="space-y-6">
                        <TopNumberSystemsWidget systems={topNumberSystems} game={GameType.EURODREAMS} />
                        <HistoricalBestWidget leaders={jackpotLeaders} game={GameType.EURODREAMS} />
                        <LastDrawNumberSystems game={GameType.EURODREAMS} />
                    </div>

                    {/* Right: Dream Number Area */}
                    <div className="space-y-6">
                        <TopStarSystemsWidget game={GameType.EURODREAMS} />
                        <StarJackpotLeaders leaders={starJackpotLeaders} game={GameType.EURODREAMS} />
                        <LastDrawStarSystems game={GameType.EURODREAMS} />
                    </div>
                </div>
            </div>
        </div>
    );
}
