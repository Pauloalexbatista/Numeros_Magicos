import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

import { getTopSystemsYearlyAnalysis, getJackpotLeaders, getRankingMetrics } from './actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
    // New Metrics (Last 100 Draws)
    const rankings = await getRankingMetrics();

    const yearlyAnalysis = await getTopSystemsYearlyAnalysis();
    const jackpotLeaders = await getJackpotLeaders();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Ranking de Sistemas <span className="text-xl text-slate-500 font-normal">(Últimos 100 Sorteios)</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <p className="text-slate-400 text-lg">
                                Performance em tempo real.
                            </p>
                            <Link
                                href="/ranking/hot"
                                className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full border border-orange-500/30 transition-colors flex items-center gap-1"
                            >
                                <span>🔥</span> Ver Hot Trends (20 Sorteios)
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Metrics Legend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Como funciona o Score?</h3>
                        <div className="space-y-1 text-sm text-slate-400">
                            <p>Pontuação baseada na qualidade dos prémios (últimos 100 sorteios):</p>
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

                {/* Jackpot Kings Card */}
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

                {/* TopSystemsAnalysis data={yearlyAnalysis} /} {/* Hidden for now to focus on new ranking, but code kept if user wants it back on another page */}

                {/* Regular Systems */}
                <div className="grid gap-4">
                    {rankings
                        .filter(rank => ![
                            'Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina',
                            'Anti-Sistema Ouro', 'Anti-Sistema Prata', 'Anti-Sistema Bronze', 'Anti-Sistema Platina'
                        ].includes(rank.systemName))
                        .map((rank, index) => (
                            <Link href={`/ranking/${rank.systemName}`} key={rank.systemName} className="block group">
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
                                                <p className="text-sm text-slate-400">{rank.description}</p>
                                                <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">3★: {rank.hits3}</span>
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">4★: {rank.hits4}</span>
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">5★: {rank.hits5}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 md:gap-12">
                                            <div className="text-right">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Win Rate (3+)</div>
                                                <div className={`text-2xl font-bold ${rank.winRate >= 15 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {rank.winRate.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Score</div>
                                                <div className="text-3xl font-bold text-blue-400">
                                                    {rank.qualityScore}
                                                </div>
                                            </div>
                                            <div className="text-slate-600 group-hover:text-blue-400 transition-colors hidden sm:block">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                </div>

                {/* Medal Systems Separator */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-yellow-500/30"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 text-sm font-bold text-yellow-400 bg-slate-950">
                            🏆 SISTEMAS ELITE (ENSEMBLE)
                        </span>
                    </div>
                </div>

                {/* Medal Systems */}
                <div className="grid gap-4">
                    {rankings
                        .filter(rank => [
                            'Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina',
                            'Anti-Sistema Ouro', 'Anti-Sistema Prata', 'Anti-Sistema Bronze', 'Anti-Sistema Platina'
                        ].includes(rank.systemName))
                        .sort((a, b) => {
                            const order = [
                                'Sistema Ouro', 'Anti-Sistema Ouro',
                                'Sistema Prata', 'Anti-Sistema Prata',
                                'Sistema Bronze', 'Anti-Sistema Bronze',
                                'Sistema Platina', 'Anti-Sistema Platina'
                            ];
                            return order.indexOf(a.systemName) - order.indexOf(b.systemName);
                        })
                        .map((rank) => {
                            const medalIcon = rank.systemName === 'Sistema Ouro' ? '🥇' :
                                rank.systemName === 'Anti-Sistema Ouro' ? '🔄🥇' :
                                    rank.systemName === 'Sistema Prata' ? '🥈' :
                                        rank.systemName === 'Anti-Sistema Prata' ? '🔄🥈' :
                                            rank.systemName === 'Sistema Bronze' ? '🥉' :
                                                rank.systemName === 'Anti-Sistema Bronze' ? '🔄🥉' :
                                                    rank.systemName === 'Sistema Platina' ? '💎' :
                                                        rank.systemName === 'Anti-Sistema Platina' ? '🔄💎' : '🏆';

                            return (
                                <Link href={`/ranking/${rank.systemName}`} key={rank.systemName} className="block group">
                                    <Card className="p-6 bg-gradient-to-r from-yellow-900/20 to-amber-900/10 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl text-3xl">
                                                    {medalIcon}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                                                        {rank.systemName}
                                                    </h3>
                                                    <p className="text-sm text-yellow-500/60">{rank.description}</p>
                                                    <div className="flex gap-2 mt-2 text-xs text-yellow-500/50">
                                                        <span className="px-2 py-0.5 rounded bg-black/20 border border-yellow-500/20">3★: {rank.hits3}</span>
                                                        <span className="px-2 py-0.5 rounded bg-black/20 border border-yellow-500/20">4★: {rank.hits4}</span>
                                                        <span className="px-2 py-0.5 rounded bg-black/20 border border-yellow-500/20">5★: {rank.hits5}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 md:gap-12">
                                                <div className="text-right">
                                                    <div className="text-xs uppercase tracking-wider text-yellow-500/60 mb-1">Win Rate (3+)</div>
                                                    <div className={`text-2xl font-bold ${rank.winRate >= 15 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                        {rank.winRate.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs uppercase tracking-wider text-yellow-500/60 mb-1">Score</div>
                                                    <div className="text-3xl font-bold text-yellow-400">
                                                        {rank.qualityScore}
                                                    </div>
                                                </div>
                                                <div className="text-yellow-600 group-hover:text-yellow-400 transition-colors hidden sm:block">
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
