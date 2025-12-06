
import { BackButton } from '@/components/ui';
import { Card } from '@/components/ui/card';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getStarSystemsYearlyAnalysis, getStarSystemRanking } from '../actions';
import { TopStarSystemsAnalysis } from '@/components/TopStarSystemsAnalysis';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StarRankingPage() {
    const yearlyAnalysis = await getStarSystemsYearlyAnalysis();
    const ranking = await getStarSystemRanking();

    return (
        <div className="min-h-screen bg-slate-950 p-6 font-sans">
            <div className="container mx-auto space-y-8 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <BackButton href="/analysis/stars" />
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                            Ranking de Estrelas
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Performance histórica e confiabilidade dos sistemas de estrelas.
                        </p>
                    </div>
                </div>

                {/* Liga das Estrelas (Yearly Analysis) */}
                <TopStarSystemsAnalysis data={yearlyAnalysis} />

                {/* Full Ranking List */}
                <div className="grid gap-4">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        📊 Classificação Geral
                        <span className="text-sm font-normal text-slate-500">(Baseada em precisão histórica)</span>
                    </h2>

                    {ranking.map((rank, index) => (
                        <Link href={`/analysis/stars/ranking/${encodeURIComponent(rank.systemName)}`} key={rank.id} className="block group">
                            <Card className="p-6 bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10">
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
                                            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                                                {rank.systemName}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                Precisão Média: <span className="text-yellow-200 font-bold">{rank.avgAccuracy.toFixed(1)}%</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-right hidden md:block">
                                            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Previsões</div>
                                            <div className="text-2xl font-bold text-slate-200">{rank.totalPredictions}</div>
                                        </div>
                                        <div className="text-slate-600 group-hover:text-yellow-400 transition-colors">
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
