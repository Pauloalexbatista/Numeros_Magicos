import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

import { getStarRankingMetrics, getStarJackpotLeaders } from '../actions';

export const dynamic = 'force-dynamic';

export default async function StarRankingPage() {
    // New Metrics (Last 100 Draws)
    const rankings = await getStarRankingMetrics();
    const jackpotLeaders = await getStarJackpotLeaders();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
                            Ranking de Sistemas de Estrelas <span className="text-xl text-slate-500 font-normal">(Últimos 100 Sorteios)</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Performance em tempo real (Últimos 100 Sorteios).
                        </p>
                    </div>
                </div>

                {/* Metrics Legend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wider">Como funciona o Score?</h3>
                        <div className="space-y-1 text-sm text-slate-400">
                            <p>Pontuação baseada na qualidade dos prémios (últimos 100 sorteios):</p>
                            <ul className="list-disc list-inside ml-2 space-y-0.5 text-xs text-slate-500">
                                <li><strong>2 Estrelas (Jackpot):</strong> 100 pontos</li>
                                <li><strong>1 Estrela:</strong> 10 pontos</li>
                            </ul>
                        </div>
                    </Card>
                    <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wider">Win Rate (1+)</h3>
                        <div className="space-y-1 text-sm text-slate-400">
                            <p>Percentagem de vezes que o sistema acertou pelo menos 1 estrela.</p>
                            <p className="text-xs text-slate-500 mt-2">
                                Uma Win Rate alta significa que o sistema acerta estrelas com maior regularidade.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Jackpot Kings Card */}
                <div className="space-y-2">
                    <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-amber-900/10 border-yellow-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className="text-xl font-bold text-yellow-400">Reis do Jackpot (Histórico)</h2>
                                    <p className="text-sm text-yellow-500/60">Sistemas com mais jackpots (2 estrelas) desde sempre.</p>
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
                        <Link href="/analysis/stars/history" className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1 transition-colors">
                            Ver Análise Histórica Completa <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>

                {/* Regular Systems */}
                <div className="grid gap-4">
                    {rankings.map((rank, index) => (
                        <Link href={`/analysis/stars/ranking/${rank.systemName}`} key={rank.systemName} className="block group">
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
                                            <p className="text-sm text-slate-400">{rank.description}</p>
                                            <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">1★: {rank.hits1}</span>
                                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold">2★: {rank.hits2}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 md:gap-12">
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Win Rate (1+)</div>
                                            <div className={`text-2xl font-bold ${rank.winRate >= 50 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {rank.winRate.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Score</div>
                                            <div className="text-3xl font-bold text-yellow-400">
                                                {rank.qualityScore}
                                            </div>
                                        </div>
                                        <div className="text-slate-600 group-hover:text-yellow-400 transition-colors hidden sm:block">
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
