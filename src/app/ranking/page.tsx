import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

import { getTopSystemsYearlyAnalysis, getJackpotLeaders, getRankingMetrics } from './actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';

export const dynamic = 'force-dynamic';

type TimeFrame = 'historical' | 'last100' | 'last20';

export default async function RankingPage(props: { searchParams: Promise<{ view?: string }> }) {
    const searchParams = await props.searchParams;
    const timeframe = (searchParams.view || 'historical') as TimeFrame;

    // Always get historical data for yearly analysis and jackpot leaders
    const yearlyAnalysis = await getTopSystemsYearlyAnalysis('EUROMILLIONS');
    const jackpotLeaders = await getJackpotLeaders();

    // Get ranking metrics based on timeframe
    const rankings = await getRankingMetrics('EUROMILLIONS', timeframe);

    // Determine subtitle based on timeframe
    const getSubtitle = () => {
        switch (timeframe) {
            case 'last20':
                return 'Últimos 20 Sorteios';
            case 'last100':
                return 'Últimos 100 Sorteios';
            default:
                return 'Análise Histórica Completa (Desde 2004)';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pb-24">
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Ranking de Sistemas - Euromilhões
                        </h1>
                        <p className="text-slate-400 text-lg">
                            {getSubtitle()}
                        </p>
                    </div>

                    {/* Temporal Filter Tabs */}
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit">
                        <Link
                            href="/ranking?view=historical"
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'historical'
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            📊 Histórico Completo
                        </Link>
                        <Link
                            href="/ranking?view=last100"
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'last100'
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            🔥 Últimos 100
                        </Link>
                        <Link
                            href="/ranking?view=last20"
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'last20'
                                ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            ⚡ Últimos 20
                        </Link>
                    </div>
                </div>

                {/* 1. YEARLY ANALYSIS - Always Historical */}
                {timeframe === 'historical' && (
                    <TopSystemsAnalysis data={yearlyAnalysis} game="EUROMILLIONS" />
                )}

                {/* 2. JACKPOT LEADERS - Always Historical */}
                <div className="space-y-2">
                    <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-amber-900/10 border-yellow-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className="text-xl font-bold text-yellow-400">Reis do Jackpot (Histórico)</h2>
                                    <p className="text-sm text-yellow-500/60">Sistemas com mais prémios máximos desde sempre.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {jackpotLeaders.map((leader, index) => (
                                <div key={leader.systemName} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-yellow-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                                            ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-yellow-500/20 text-yellow-500'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-yellow-100">{leader.systemName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-yellow-400">{leader.jackpots}</span>
                                        <span className="text-[10px] block text-yellow-500/60 uppercase">Jackpots</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <div className="flex justify-end">
                        <Link href="/ranking/history" className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1 transition-colors">
                            Ver Análise Histórica Completa <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>

                {/* 3. SYSTEM RANKINGS - Based on Timeframe */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-blue-400">
                            📊 Ranking de Sistemas
                        </h2>
                    </div>

                    {/* Metrics Legend */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
                            <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Como funciona o Score?</h3>
                            <div className="space-y-1 text-sm text-slate-400">
                                <p>Pontuação baseada na qualidade dos prémios:</p>
                                <ul className="list-disc list-inside ml-2 space-y-0.5 text-xs text-slate-500">
                                    <li><strong>5 Acertos (Jackpot):</strong> 100 pontos</li>
                                    <li><strong>4 Acertos:</strong> 10 pontos</li>
                                    <li><strong>3 Acertos:</strong> 1 ponto</li>
                                </ul>
                            </div>
                        </Card>
                        <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
                            <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Win Rate (3+)</h3>
                            <div className="space-y-1 text-sm text-slate-400">
                                <p>Percentagem de vezes que o sistema gerou um prémio (3 ou mais acertos).</p>
                                <p className="text-xs text-slate-500 mt-2">
                                    Uma Win Rate alta significa que o sistema paga prémios com maior regularidade.
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* All Systems - Unified Ranking */}
                    <div className="grid gap-4">
                        {rankings.map((rank, index) => {
                            // Check if this is a Medal system for special styling
                            const isMedalSystem = [
                                'Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina',
                                'Anti-Sistema Ouro', 'Anti-Sistema Prata', 'Anti-Sistema Bronze', 'Anti-Sistema Platina'
                            ].includes(rank.systemName);

                            // Medal icon for Medal systems
                            const medalIcon = isMedalSystem ? (
                                rank.systemName === 'Sistema Ouro' ? '🥇' :
                                    rank.systemName === 'Anti-Sistema Ouro' ? '🔄🥇' :
                                        rank.systemName === 'Sistema Prata' ? '🥈' :
                                            rank.systemName === 'Anti-Sistema Prata' ? '🔄🥈' :
                                                rank.systemName === 'Sistema Bronze' ? '🥉' :
                                                    rank.systemName === 'Anti-Sistema Bronze' ? '🔄🥉' :
                                                        rank.systemName === 'Sistema Platina' ? '💎' :
                                                            rank.systemName === 'Anti-Sistema Platina' ? '🔄💎' : '🏆'
                            ) : null;

                            // Rank badge for non-medal systems
                            const rankBadge = !isMedalSystem && (
                                <div className={`
                                    flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shadow-lg
                                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black' :
                                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' :
                                                'bg-slate-800 text-slate-400 border border-slate-700'}
                                `}>
                                    #{index + 1}
                                </div>
                            );

                            return (
                                <Link href={`/ranking/${rank.systemName}`} key={rank.systemName} className="block group">
                                    <Card className={`p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${isMedalSystem
                                        ? 'bg-gradient-to-r from-yellow-900/20 to-amber-900/10 border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-yellow-500/10'
                                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-blue-500/30 hover:shadow-blue-500/10'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                {isMedalSystem ? (
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl text-3xl">
                                                        {medalIcon}
                                                    </div>
                                                ) : rankBadge}
                                                <div>
                                                    <h3 className={`text-xl font-bold transition-colors ${isMedalSystem
                                                        ? 'text-yellow-400 group-hover:text-yellow-300'
                                                        : 'text-white group-hover:text-blue-400'
                                                        }`}>
                                                        {rank.systemName}
                                                    </h3>
                                                    <p className={`text-sm ${isMedalSystem ? 'text-yellow-500/60' : 'text-slate-400'}`}>
                                                        {rank.description}
                                                    </p>
                                                    <div className={`flex gap-2 mt-2 text-xs ${isMedalSystem ? 'text-yellow-500/50' : 'text-slate-500'}`}>
                                                        <span className={`px-2 py-0.5 rounded ${isMedalSystem
                                                            ? 'bg-black/20 border border-yellow-500/20'
                                                            : 'bg-slate-800 border border-slate-700'
                                                            }`}>3★: {rank.hits3}</span>
                                                        <span className={`px-2 py-0.5 rounded ${isMedalSystem
                                                            ? 'bg-black/20 border border-yellow-500/20'
                                                            : 'bg-slate-800 border border-slate-700'
                                                            }`}>4★: {rank.hits4}</span>
                                                        <span className={`px-2 py-0.5 rounded ${isMedalSystem
                                                            ? 'bg-black/20 border border-yellow-500/20'
                                                            : 'bg-slate-800 border border-slate-700'
                                                            }`}>5★: {rank.hits5}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 md:gap-12">
                                                <div className="text-right">
                                                    <div className={`text-xs uppercase tracking-wider mb-1 ${isMedalSystem ? 'text-yellow-500/60' : 'text-slate-500'}`}>
                                                        Win Rate (3+)
                                                    </div>
                                                    <div className={`text-2xl font-bold ${rank.winRate >= 15 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                        {rank.winRate.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xs uppercase tracking-wider mb-1 ${isMedalSystem ? 'text-yellow-500/60' : 'text-slate-500'}`}>
                                                        Score
                                                    </div>
                                                    <div className={`text-3xl font-bold ${isMedalSystem ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                        {rank.qualityScore}
                                                    </div>
                                                </div>
                                                <div className={`transition-colors hidden sm:block ${isMedalSystem
                                                    ? 'text-yellow-600 group-hover:text-yellow-400'
                                                    : 'text-slate-600 group-hover:text-blue-400'
                                                    }`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
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
