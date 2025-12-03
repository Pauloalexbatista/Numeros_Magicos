import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

import { getTopSystemsYearlyAnalysis, getJackpotLeaders } from './actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
    const rankings = await prisma.systemRanking.findMany({
        include: {
            system: true
        },
        orderBy: {
            avgAccuracy: 'desc'
        }
    });

    const yearlyAnalysis = await getTopSystemsYearlyAnalysis();
    const jackpotLeaders = await getJackpotLeaders();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Ranking de Modelos
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Performance em tempo real dos nossos sistemas de Inteligência Artificial.
                        </p>
                    </div>
                </div>

                {/* Jackpot Kings Card */}
                <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-amber-900/10 border-yellow-500/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🏆</span>
                            <div>
                                <h2 className="text-xl font-bold text-yellow-400">Reis do Jackpot</h2>
                                <p className="text-sm text-yellow-500/60">Sistemas com mais prémios máximos (5 acertos)</p>
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

                <TopSystemsAnalysis data={yearlyAnalysis} />

                <div className="grid gap-4">
                    {rankings.map((rank, index) => (
                        <Link href={`/ranking/${rank.systemName}`} key={rank.id} className="block group">
                            <Card className="p-6 bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`
                                            flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shadow-lg
                                            ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black' :
                                                index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                                                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' :
                                                        'bg-slate-800 text-slate-400 border border-slate-700'}
                                        `}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {rank.systemName}
                                            </h3>
                                            <p className="text-sm text-slate-400">{rank.system.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Precisão</div>
                                            <div className={`text-3xl font-bold ${rank.avgAccuracy >= 50 ? 'text-emerald-400' :
                                                rank.avgAccuracy >= 48 ? 'text-yellow-400' : 'text-rose-400'
                                                }`}>
                                                {rank.avgAccuracy.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="text-right hidden md:block">
                                            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Previsões</div>
                                            <div className="text-2xl font-bold text-slate-200">{rank.totalPredictions}</div>
                                        </div>
                                        <div className="text-slate-600 group-hover:text-blue-400 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
