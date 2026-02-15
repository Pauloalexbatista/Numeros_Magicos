
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getHotStarRankingMetrics } from '../actions';

export const dynamic = 'force-dynamic';

export default async function HotStarsPage() {
    const rankings = await getHotStarRankingMetrics();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                <div className="flex items-center gap-4">
                    <BackButton href="/analysis/stars/ranking" />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-3">
                            <span className="text-4xl">🌟</span> Hot Trends (Estrelas)
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Análise de Estrelas: Últimos 20 Sorteios.
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="p-6 bg-orange-900/10 border-orange-500/20 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-orange-400 mb-2 flex items-center gap-2">
                        <span>⚡</span> Caçadores de Estrelas
                    </h3>
                    <p className="text-slate-300">
                        Este ranking destaca os sistemas que estão a acertar mais <strong>Estrelas</strong>.
                        O critério principal é o número de <strong className="text-yellow-300">2 Estrelas (Jackpot)</strong> e a frequência de acerto.
                    </p>
                </Card>

                {/* Hot Systems List */}
                <div className="grid gap-4">
                    {rankings.map((rank, index) => {
                        // Logic for "On Fire": 3+ Jackpots
                        const onFire = rank.hits2 >= 3;

                        return (
                            <Link href={`/analysis/stars/ranking/${rank.systemName}`} key={rank.systemName} className="block group">
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
                                                {/* Shine effect for top 1 */}
                                                {index === 0 && (
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                )}
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                                                    {rank.systemName}
                                                    {onFire && <span className="text-lg animate-pulse">✨</span>}
                                                </h3>
                                                <p className="text-sm text-slate-400">{rank.description}</p>
                                                <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">1★: {rank.hits1}</span>
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-yellow-500 font-bold">2★: {rank.hits2}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 md:gap-12">
                                            <div className="text-right">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Precisão (20)</div>
                                                <div className={`text-2xl font-bold ${rank.accuracy >= 50 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {rank.accuracy.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs uppercase tracking-wider text-orange-500/70 mb-1">Pontuação / Freq</div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-yellow-400">{rank.qualityScore} pts</span>
                                                    <span className="text-lg font-bold text-orange-400">{rank.frequencyText}</span>
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
            <ResponsibleGamingFooter />
        </div >
    );
}
