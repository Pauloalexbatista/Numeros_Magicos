import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

import { getStarRankingMetrics, getStarJackpotLeaders } from '../../../analysis/stars/actions';

export const dynamic = 'force-dynamic';

export default async function TotolotoStarRankingPage() {
    // For Totoloto, we might not have 'stars' but we can adapt this for "Numero da Sorte" if applicable
    // Or reuse the star system structure if we decide Totoloto has a secondary mechanic we want to track similarly.
    // For now, assume it works or returns empty.
    const game = 'TOTOLOTO';
    const rankings = await getStarRankingMetrics(game);
    const jackpotLeaders = await getStarJackpotLeaders(game);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            Totoloto: Lucky Number <span className="text-xl text-slate-500 font-normal">(Últimos 100)</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Análise de performance para o Número da Sorte.
                        </p>
                    </div>
                </div>

                {/* Jackpot Kings Card */}
                <div className="space-y-2">
                    <Card className="p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 border-emerald-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className="text-xl font-bold text-emerald-400">Reis da Sorte (Histórico)</h2>
                                    <p className="text-sm text-emerald-500/60">Sistemas com mais acertos no Número da Sorte.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {jackpotLeaders.map((leader, index) => (
                                <div key={leader.systemName} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-emerald-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                                            ${index === 0 ? 'bg-emerald-500 text-black' : 'bg-emerald-500/20 text-emerald-500'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-emerald-100">{leader.systemName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-emerald-400">{leader.jackpots}</span>
                                        <span className="text-[10px] block text-emerald-500/60 uppercase">Acertos</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Regular Systems */}
                <div className="grid gap-4">
                    {rankings.map((rank, index) => (
                        <div key={rank.systemName} className="block group">
                            <Card className="p-6 bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`
                                            flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shadow-lg
                                            ${index === 0 ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white' :
                                                index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                                                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' :
                                                        'bg-slate-800 text-slate-400 border border-slate-700'}
                                        `}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {rank.systemName}
                                            </h3>
                                            <p className="text-sm text-slate-400">{rank.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 md:gap-12">
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Score</div>
                                            <div className="text-3xl font-bold text-emerald-400">
                                                {rank.qualityScore}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div >
    );
}
