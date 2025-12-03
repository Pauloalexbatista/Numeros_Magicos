import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const dynamic = 'force-dynamic';

interface Props {
    params: {
        systemName: string;
    }
}

import { BackButton } from '@/components/ui';

export default async function SystemDetailsPage({ params }: Props) {
    // Await params in Next.js 15+
    const { systemName: encodedName } = await params;
    // Decode URL encoded system name
    const systemName = decodeURIComponent(encodedName);

    const system = await prisma.rankedSystem.findUnique({
        where: { name: systemName },
        include: {
            ranking: true
        }
    });

    if (!system) {
        notFound();
    }

    // Get last 50 performances
    const performances = await prisma.systemPerformance.findMany({
        where: { systemName: systemName },
        orderBy: { draw: { date: 'desc' } },
        take: 100,
        include: {
            draw: true
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <BackButton href="/ranking" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">{system.name}</h1>
                        <p className="text-slate-400">{system.description}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Precisão Global</div>
                        <div className={`text-3xl font-bold ${(system.ranking?.avgAccuracy || 0) >= 50 ? 'text-emerald-400' : 'text-yellow-400'
                            }`}>
                            {system.ranking?.avgAccuracy.toFixed(1)}%
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total Previsões</div>
                        <div className="text-3xl font-bold text-white">
                            {system.ranking?.totalPredictions || 0}
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Status</div>
                        <div className="text-3xl font-bold text-blue-400">
                            {system.isActive ? 'Ativo' : 'Inativo'}
                        </div>
                    </Card>
                </div>

                {/* Hit Distribution Analysis */}
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            📊 Distribuição de Acertos
                            <span className="text-xs font-normal text-slate-400">
                                (Últimos {performances.length} sorteios)
                            </span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="p-4 text-left">Acertos</th>
                                    <th className="p-4 text-center">Qtd Real</th>
                                    <th className="p-4 text-center">% Real</th>
                                    <th className="p-4 text-center">Qtd Esperada</th>
                                    <th className="p-4 text-center">% Esperada 📊</th>
                                    <th className="p-4 text-center">Desvio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {(() => {
                                    const totalTests = performances.length;
                                    const hitCounts = [0, 0, 0, 0, 0, 0];
                                    performances.forEach(p => {
                                        if (p.hits >= 0 && p.hits <= 5) {
                                            hitCounts[p.hits]++;
                                        }
                                    });

                                    // Mathematical probabilities for 5/50 lottery with 25 predictions
                                    // Using hypergeometric distribution: P(X=k) = C(25,k) * C(25,5-k) / C(50,5)
                                    // With 25 predictions (50% of pool), expected distribution is:
                                    const expectedProbs = [
                                        0.0312,  // 0 hits: 3.12%
                                        0.1562,  // 1 hit:  15.62%
                                        0.3125,  // 2 hits: 31.25%
                                        0.3125,  // 3 hits: 31.25%
                                        0.1562,  // 4 hits: 15.62%
                                        0.0312   // 5 hits: 3.12%
                                    ];

                                    return [0, 1, 2, 3, 4, 5].map(hits => {
                                        const realCount = hitCounts[hits];
                                        const realPercent = totalTests > 0 ? (realCount / totalTests) * 100 : 0;
                                        const expectedCount = totalTests * expectedProbs[hits];
                                        const expectedPercent = expectedProbs[hits] * 100;
                                        const deviation = realPercent - expectedPercent;

                                        return (
                                            <tr key={hits} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-bold text-white">{hits}</td>
                                                <td className="p-4 text-center text-slate-300">{realCount}</td>
                                                <td className="p-4 text-center text-white font-semibold">
                                                    {realPercent.toFixed(2)}%
                                                </td>
                                                <td className="p-4 text-center text-slate-400">{expectedCount.toFixed(1)}</td>
                                                <td className="p-4 text-center text-slate-400">
                                                    {expectedPercent.toFixed(2)}%
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-bold ${Math.abs(deviation) < 0.5 ? 'text-slate-500' :
                                                        deviation > 0 ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}>
                                                        {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* History Table */}
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white">Histórico de Previsões</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Sorteio Real</th>
                                    <th className="p-4">Previsão (Top 25)</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {performances.map((perf) => {
                                    const predicted = JSON.parse(perf.predictedNumbers) as number[];
                                    const actual = JSON.parse(perf.actualNumbers) as number[];

                                    return (
                                        <tr key={perf.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 text-slate-300 font-medium">
                                                {new Date(perf.draw.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {actual.map(n => (
                                                        <span key={n} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold">
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {predicted.map(n => {
                                                        const isHit = actual.includes(n);
                                                        return (
                                                            <span key={n} className={`
                                                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                                                ${isHit ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500'}
                                                            `}>
                                                                {n}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`
                                                    inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold
                                                    ${perf.hits >= 3 ? 'bg-emerald-500/20 text-emerald-400' :
                                                        perf.hits >= 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-slate-800 text-slate-500'}
                                                `}>
                                                    {perf.hits}/5
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
