import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

import { getTopSystemsYearlyAnalysis, getJackpotLeaders, getRankingMetrics } from '../../ranking/actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';

export const dynamic = 'force-dynamic';

type TimeFrame = 'historical' | 'last100' | 'last20';

export default async function EuroDreamsRankingPage(props: { searchParams: Promise<{ view?: string }> }) {
    const searchParams = await props.searchParams;
    const timeframe = (searchParams.view || 'historical') as TimeFrame;
    const game = 'EURODREAMS';

    // Always get historical data for yearly analysis and jackpot leaders
    // TODO: Update these actions to accept game parameter if they don't already
    const yearlyAnalysis = await getTopSystemsYearlyAnalysis(game);
    const jackpotLeaders = await getJackpotLeaders(game);

    // Get ranking metrics based on timeframe
    const rankings = await getRankingMetrics(game, timeframe);

    // Determine subtitle based on timeframe
    const getSubtitle = () => {
        switch (timeframe) {
            case 'last20':
                return 'Últimos 20 Sorteios';
            case 'last100':
                return 'Últimos 100 Sorteios';
            default:
                return 'Análise Histórica Completa';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pb-24">
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Ranking de Sistemas - EuroDreams
                        </h1>
                        <p className="text-slate-400 text-lg">
                            {getSubtitle()}
                        </p>
                    </div>

                    {/* Temporal Filter Tabs */}
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit">
                        <Link
                            href="/eurodreams/ranking?view=historical"
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'historical'
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            📊 Histórico Completo
                        </Link>
                        <Link
                            href="/eurodreams/ranking?view=last100"
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'last100'
                                ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            🔥 Últimos 100
                        </Link>
                        <Link
                            href="/eurodreams/ranking?view=last20"
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'last20'
                                ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            ⚡ Últimos 20
                        </Link>
                    </div>
                </div>

                {/* 1. YEARLY ANALYSIS - Always Historical */}
                {timeframe === 'historical' && (
                    <TopSystemsAnalysis data={yearlyAnalysis} game={game} />
                )}

                {/* 2. JACKPOT LEADERS - Always Historical */}
                <div className="space-y-2">
                    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/10 border-purple-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className="text-xl font-bold text-purple-400">Reis do Jackpot (Histórico)</h2>
                                    <p className="text-sm text-purple-500/60">Sistemas com mais prémios máximos desde sempre.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {jackpotLeaders.map((leader, index) => (
                                <div key={leader.systemName} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-purple-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                                            ${index === 0 ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-500'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-purple-100">{leader.systemName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-purple-400">{leader.jackpots}</span>
                                        <span className="text-[10px] block text-purple-500/60 uppercase">Jackpots</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 3. SYSTEM RANKINGS - Based on Timeframe */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-purple-400">
                            📊 Ranking de Sistemas
                        </h2>
                    </div>

                    {/* Metrics Legend */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
                            <h3 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Como funciona o Score?</h3>
                            <div className="space-y-1 text-sm text-slate-400">
                                <p>Pontuação baseada na qualidade dos prémios.</p>
                            </div>
                        </Card>
                        <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
                            <h3 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Win Rate (3+)</h3>
                            <div className="space-y-1 text-sm text-slate-400">
                                <p>Percentagem de vezes que o sistema gerou um prémio.</p>
                            </div>
                        </Card>
                    </div>

                    {/* All Systems - Unified Ranking */}
                    <div className="grid gap-4">
                        {rankings.map((rank, index) => {
                            return (
                                <Link href={`/eurodreams/ranking/${rank.systemName}`} key={rank.systemName} className="block group">
                                    <Card className="p-6 bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:bg-slate-800/60 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className={`
                                                    flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shadow-lg
                                                    ${index === 0 ? 'bg-gradient-to-br from-purple-400 to-pink-600 text-white' :
                                                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                                                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' :
                                                                'bg-slate-800 text-slate-400 border border-slate-700'}
                                                `}>
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                                        {rank.systemName}
                                                    </h3>
                                                    <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">3: {rank.hits3}</span>
                                                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">4: {rank.hits4}</span>
                                                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold">5: {rank.hits5}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 md:gap-12">
                                                <div className="text-right">
                                                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Win Rate</div>
                                                    <div className={`text-2xl font-bold ${rank.winRate >= 10 ? 'text-purple-400' : 'text-slate-200'}`}>
                                                        {rank.winRate.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Score</div>
                                                    <div className="text-3xl font-bold text-purple-400">
                                                        {rank.qualityScore}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div >
    );
}
