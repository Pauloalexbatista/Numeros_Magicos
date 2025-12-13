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
import { getNumberPrediction } from '../actions';
import SystemStatsViewer from '@/components/analysis/SystemStatsViewer';

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

    // 1. Get List for Display (Last 20)
    const predictions = await prisma.systemPrediction.findMany({
        where: { systemName: systemName },
        orderBy: { draw: { date: 'desc' } },
        take: 20,
        include: {
            draw: true
        }
    });

    // 2. Get Full Stats for Analysis (All History)
    // We use groupBy which is ultra-fast and doesn't load thousands of rows
    const hitStats = await prisma.systemPrediction.groupBy({
        by: ['hits'],
        where: { systemName: systemName },
        _count: {
            hits: true
        }
    });

    // Map stats to array format [0, 1, 2, 3, 4, 5]
    const fullHitCounts = [0, 0, 0, 0, 0, 0];
    let totalFullPredictions = 0;
    let totalHitsSum = 0;

    hitStats.forEach(stat => {
        if (stat.hits >= 0 && stat.hits <= 5) {
            fullHitCounts[stat.hits] = stat._count.hits;
            totalFullPredictions += stat._count.hits;
            totalHitsSum += (stat.hits * stat._count.hits);
        }
    });

    const initialAccuracy = totalFullPredictions > 0
        ? ((totalHitsSum / totalFullPredictions) / 5) * 100
        : 0;


    // Fetch NEXT draw prediction
    const nextPrediction = await getNumberPrediction(systemName);

    // Detect anti-system
    const antiSystemName = systemName.startsWith('Anti-')
        ? systemName.substring(5)
        : `Anti-${systemName}`;

    const antiSystemExists = await prisma.rankedSystem.findUnique({
        where: { name: antiSystemName }
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton href="/ranking" />
                        <div>
                            <h1 className="text-3xl font-bold text-white">{system.name}</h1>
                            <p className="text-slate-400">{system.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/analysis/history/${encodeURIComponent(systemName)}`}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            📊 Análise Histórica
                        </Link>
                        {antiSystemExists && (
                            <Link
                                href={`/analysis/compare?system1=${encodeURIComponent(systemName)}&system2=${encodeURIComponent(antiSystemName)}`}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                🔄 Comparar Sistemas
                            </Link>
                        )}
                    </div>
                </div>

                {/* 🔮 NEXT PREDICTION CARD (Highlighted) */}
                <Card className="p-8 bg-gradient-to-br from-emerald-900/40 to-green-900/20 border-emerald-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-9xl">🔮</span>
                    </div>

                    <h2 className="text-xl font-bold text-emerald-100 mb-6 flex items-center gap-2">
                        <span className="animate-pulse">✨</span> Próxima Previsão
                    </h2>

                    <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                        {nextPrediction && nextPrediction.length > 0 ? (
                            nextPrediction.map((num: number) => (
                                <div key={num} className="relative group">
                                    <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                                    <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-green-600 rounded-full text-lg font-black text-black shadow-xl border-2 border-emerald-300">
                                        {num}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-emerald-200/50 italic">Calculando previsão...</div>
                        )}
                    </div>
                    <p className="text-emerald-200/60 text-sm mt-6">
                        Sugestão para o próximo sorteio baseada no algoritmo {system.name}.
                    </p>
                </Card>

                {/* Interactive Stats Viewer */}
                <SystemStatsViewer
                    systemName={systemName}
                    isActive={system.isActive}
                    initialStats={{
                        accuracy: initialAccuracy,
                        total: totalFullPredictions,
                        distribution: fullHitCounts
                    }}
                />

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
                                {predictions.map((pred) => {
                                    const predicted = JSON.parse(pred.prediction) as number[];
                                    const actual = JSON.parse(pred.draw.numbers) as number[];

                                    return (
                                        <tr key={pred.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 text-slate-300 font-medium">
                                                {new Date(pred.draw.date).toLocaleDateString('pt-PT')}
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
                                                    ${pred.hits >= 3 ? 'bg-emerald-500/20 text-emerald-400' :
                                                        pred.hits >= 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-slate-800 text-slate-500'}
                                                `}>
                                                    {pred.hits}/5
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
