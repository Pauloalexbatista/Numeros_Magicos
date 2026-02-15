
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { notFound } from 'next/navigation';

import { getTopSystemsYearlyAnalysis, getJackpotLeaders, getRankingMetrics } from '../actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';
import { GameType } from '@/types/game';

export const dynamic = 'force-dynamic';

type TimeFrame = 'historical' | 'last100' | 'last20';

// Map URL param to GameType
const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

const GAME_NAMES: Record<GameType, string> = {
    [GameType.EUROMILLIONS]: 'Euromilhões',
    [GameType.TOTOLOTO]: 'Totoloto',
    [GameType.EURODREAMS]: 'EuroDreams'
};

interface PageProps {
    params: Promise<{
        game: string;
    }>;
    searchParams: Promise<{ view?: string }>;
}


export default async function RankingPage({ params, searchParams }: PageProps) {
    const { game } = await params;
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];

    if (!gameType) {
        notFound();
    }

    const sp = await searchParams;
    const timeframe = (sp.view || 'historical') as TimeFrame;

    // Determine terminology based on game
    const isTotoloto = gameType === GameType.TOTOLOTO;
    const isEuroDreams = gameType === GameType.EURODREAMS;

    // Theme Configuration (Light Mode - Matching Star Ranking)
    // EM: Amber, TL: Emerald, ED: Rose
    const theme = isEuroDreams ? {
        primary: 'rose',
        bg: 'bg-rose-50',
        title: 'text-rose-900',
        subtitle: 'text-rose-600',
        accent: 'rose-600',
        border: 'border-rose-100',
        btn: 'bg-rose-100 text-rose-700'
    } : isTotoloto ? {
        primary: 'emerald',
        bg: 'bg-emerald-50',
        title: 'text-emerald-900',
        subtitle: 'text-emerald-600',
        accent: 'emerald-600',
        border: 'border-emerald-100',
        btn: 'bg-emerald-100 text-emerald-700'
    } : {
        primary: 'amber', // Yellow for Euromillions
        bg: 'bg-amber-50',
        title: 'text-amber-900',
        subtitle: 'text-amber-600',
        accent: 'amber-600',
        border: 'border-amber-100',
        btn: 'bg-amber-100 text-amber-800'
    };

    const themeColor = isTotoloto ? 'emerald' : isEuroDreams ? 'rose' : 'amber';
    const gradientFrom = isTotoloto ? 'emerald-400' : isEuroDreams ? 'rose-400' : 'amber-400';
    const gradientTo = isTotoloto ? 'teal-600' : isEuroDreams ? 'pink-600' : 'orange-500';

    // Always get historical data for yearly analysis and jackpot leaders
    const yearlyAnalysis = await getTopSystemsYearlyAnalysis(gameType);
    const jackpotLeaders = await getJackpotLeaders(gameType);

    // Get ranking metrics based on timeframe
    const rankings = await getRankingMetrics(gameType, timeframe);

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
        <div className={`min-h-screen ${theme.bg} p-6 pb-24 font-sans`}>
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header - Title + Back Button on same line */}
                <div className="flex items-center justify-between">
                    <h1 className={`text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`}>
                        Ranking de Sistemas - {GAME_NAMES[gameType]}
                    </h1>
                    <BackButton />
                </div>

                {/* 1. LIGA DOS CAMPEÕES - Always Historical */}
                {timeframe === 'historical' && (
                    <TopSystemsAnalysis data={yearlyAnalysis} game={gameType} />
                )}

                {/* 2. REIS DO JACKPOT - Always Historical */}
                <div className="space-y-2">
                    <Card className="p-6 bg-white border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className={`text-xl font-bold ${theme.title}`}>Reis do Jackpot (Histórico)</h2>
                                    <p className="text-sm text-slate-500">Sistemas com mais prémios máximos desde sempre.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {jackpotLeaders.map((leader, index) => (
                                <div key={leader.systemName} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                                            ${index === 0 ? `bg-${themeColor}-500 text-white` : 'bg-slate-200 text-slate-600'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-slate-700">{leader.systemName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-bold text-${themeColor}-600`}>{leader.jackpots}</span>
                                        <span className="text-[10px] block text-slate-400 uppercase">Jackpots</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 3. FILTER BUTTONS */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 w-fit shadow-sm">
                    <Link
                        href={`/ranking/${game}?view=historical`}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'historical'
                            ? `bg-${themeColor}-100 text-${themeColor}-700`
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        📊 Histórico Completo
                    </Link>
                    <Link
                        href={`/ranking/${game}?view=last100`}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'last100'
                            ? `bg-${themeColor}-100 text-${themeColor}-700`
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        🔥 Últimos 100
                    </Link>
                    <Link
                        href={`/ranking/${game}?view=last20`}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeframe === 'last20'
                            ? `bg-${themeColor}-100 text-${themeColor}-700`
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        ⚡ Últimos 20
                    </Link>
                </div>


                {/* List Ranking Systems */}
                <div className="space-y-4">
                    {rankings.map((sys, idx) => (
                        <Link key={sys.systemName} href={`/ranking/${game}/${encodeURIComponent(sys.systemName)}`} className="block">
                            <Card className={`p-6 bg-white border-slate-200 hover:border-${themeColor}-300 hover:shadow-md transition-all group`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={`
                                            w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl shadow-sm
                                            ${idx === 0 ? `bg-${themeColor}-100 text-${themeColor}-700` :
                                                idx === 1 ? 'bg-slate-100 text-slate-600' :
                                                    idx === 2 ? 'bg-orange-50 text-orange-600' :
                                                        'bg-slate-50 text-slate-400 border border-slate-100'}
                                        `}>
                                            #{idx + 1}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-lg font-bold text-slate-800 group-hover:text-${themeColor}-600 transition-colors`}>
                                                    {sys.systemName}
                                                </h3>
                                                {sys.systemName.includes('Platina') && (
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">IA</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                {/* Safe Description */}
                                                {(sys as any).description || 'Sistema de previsão estatística.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-right">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1">Win Rate</span>
                                            <span className={`text-xl font-bold ${sys.winRate > 50 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                {sys.winRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1">Score</span>
                                            <span className="text-xl font-bold text-slate-900 tabular-nums">
                                                {sys.qualityScore.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className={`text-2xl text-slate-300 group-hover:text-${themeColor}-500 transition-colors`}>
                                            →
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 opacity-70">
                    <ResponsibleGamingFooter />
                </div>
            </div>
        </div>
    );
}
