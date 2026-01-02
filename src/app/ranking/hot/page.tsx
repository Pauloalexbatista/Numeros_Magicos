import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getHotRankingMetrics } from '../actions';

export const dynamic = 'force-dynamic';

export default async function HotRankingPage() {
    const rankings = await getHotRankingMetrics();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                <div className="flex items-center gap-4">
                    <BackButton href="/ranking" />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-3">
                            <span className="text-4xl">🔥</span> Ranking "Em Alta" (Hot Trends)
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Análise de performance recente: Últimos 20 Sorteios.
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="p-6 bg-orange-900/10 border-orange-500/20 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-orange-400 mb-2 flex items-center gap-2">
                        <span>⚡</span> Foco na Frequência de Impacto
                    </h3>
                    <p className="text-slate-300">
                        Este ranking destaca os sistemas que estão <strong className="text-orange-300">"On Fire"</strong> recentemente.
                        A classificação dá prioridade à quantidade de altos prémios (4 ou 5 acertos) e à frequência com que ocorrem.
                    </p>
                </Card>

                {/* Hot Systems List */}
                <div className="grid gap-4">
                    {rankings.map((rank, index) => {
                        const isTop3 = index < 3;
                        const onFire = rank.hits4 + rank.hits5 >= 3; // Arbitrary threshold for visual styling

                        return (
                            <Link href={`/ranking/${rank.systemName}`} key={rank.systemName} className="block group">
                                <Card className={`
                                    p-6 backdrop-blur-sm transition-all duration-300 
                                    ${onFire ? 'bg-gradient-to-r from-slate-900/60 to-orange-900/10 border-orange-500/30 shadow-lg shadow-orange-900/10' : 'bg-slate-900/40 border-slate-800'}
                                    hover:bg-slate-800/60 hover:border-orange-500/50 hover:shadow-xl
                                `}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`
                                                flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shadow-lg relative overflow-hidden
                                                ${index === 0 ? 'bg-gradient-to-br from-orange-400 to-red-600 text-white' :
                                                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                                                        index === 2 ? 'bg-gradient-to-br from-orange-700 to-amber-800 text-white' :
                                                            'bg-slate-800 text-slate-400 border border-slate-700'}
                                            `}>
                                                {/* Flame effect for top 1 */}
                                                {index === 0 && (
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                )}
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                                                    {rank.systemName}
                                                    {onFire && <span className="text-lg animate-pulse">🔥</span>}
                                                </h3>
                                                <p className="text-sm text-slate-400">{rank.description}</p>
                                                <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">4★: {rank.hits4}</span>
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">5★: {rank.hits5}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 md:gap-12">
                                            <div className="text-right">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Precisão (20)</div>
                                                <div className={`text-2xl font-bold ${rank.accuracy >= 60 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {rank.accuracy.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs uppercase tracking-wider text-orange-500/70 mb-1">Score / Freq</div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-yellow-400">{rank.qualityScore} pts</span>
                                                    <span className="text-lg font-bold text-orange-400">{rank.frequencyText}</span>
                                                </div>
                                            </div>
                                            <div className="text-slate-600 group-hover:text-orange-400 transition-colors hidden sm:block">
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
            <ResponsibleGamingFooter />
        </div >
    );
}

