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
import SystemStatsViewer from '@/components/analysis/SystemStatsViewer';
import SendToWheelingButton from '@/components/SendToWheelingButton';

export default async function SystemDetailsPage({ params }: Props) {
    const { systemName: encodedName } = await params;
    const systemName = decodeURIComponent(encodedName);

    console.log('[DEBUG] System Page:', { encodedName, systemName });

    // Fetch data directly from database
    let allPerformances = await prisma.systemPerformance.findMany({
        where: { systemName },
        include: { draw: true },
        orderBy: { draw: { date: 'desc' } }
    });

    // FALLBACK: Handle cases where '+' in URL might be decoded as ' ' or vice-versa
    if (allPerformances.length === 0 && (systemName.includes(' ') || systemName.includes('+'))) {
        const alternativeName = systemName.includes('+')
            ? systemName.replace(/\+/g, ' ')
            : systemName.replace(/ /g, '+');

        console.log('[DEBUG] Trying alternative name match:', alternativeName);

        allPerformances = await prisma.systemPerformance.findMany({
            where: { systemName: alternativeName },
            include: { draw: true },
            orderBy: { draw: { date: 'desc' } }
        });

        if (allPerformances.length > 0) {
            // If we found it with alternative, we should use that name for the rest of the queries
            const actualNameInDb = allPerformances[0].systemName;
            console.log('[DEBUG] Matched with alternative:', actualNameInDb);
            // We'll update the variable for subsequent queries
            (systemName as any) = actualNameInDb;
        }
    }

    if (allPerformances.length === 0) {
        console.log('[DEBUG] No performances found for:', systemName);
        notFound();
    }

    // DEDUPLICATE - Keep only the most recent record per draw
    const seenDrawIds = new Set<number>();
    const uniquePerformances = allPerformances.filter(p => {
        if (seenDrawIds.has(p.drawId)) {
            return false;
        }
        seenDrawIds.add(p.drawId);
        return true;
    });

    // Calculate statistics
    const distribution = [0, 0, 0, 0, 0, 0];
    let totalHits = 0;

    uniquePerformances.forEach(p => {
        const hits = Math.min(5, Math.max(0, p.hits));
        distribution[hits]++;
        totalHits += hits;
    });

    const accuracy = uniquePerformances.length > 0
        ? ((totalHits / uniquePerformances.length) / 5) * 100
        : 0;

    // Get system metadata
    const system = await prisma.rankedSystem.findUnique({
        where: { name: systemName }
    });

    if (!system) {
        console.log('[DEBUG] System not found in RankedSystem:', systemName);
        notFound();
    }

    // Get next prediction
    const nextPred = await prisma.cachedPrediction.findFirst({
        where: { systemName }
    });

    const nextPrediction = nextPred ? JSON.parse(nextPred.numbers) : [];
    const predictions = uniquePerformances.map(p => ({
        id: p.id,
        date: p.draw.date.toISOString(),
        drawNumbers: JSON.parse(p.actualNumbers),
        predictedNumbers: JSON.parse(p.predictedNumbers),
        hits: p.hits
    }));

    const stats = {
        accuracy,
        totalPredictions: uniquePerformances.length,
        distribution
    };

    // Detect anti-system (Metadata checking would be better, but name parsing works)
    const antiSystemName = systemName.startsWith('Anti-')
        ? systemName.substring(5)
        : `Anti-${systemName}`;

    // Check if anti-system exists in database
    const antiSystem = await prisma.rankedSystem.findUnique({
        where: { name: antiSystemName }
    });
    const antiSystemExists = !!antiSystem;

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

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h2 className="text-xl font-bold text-emerald-100 flex items-center gap-2 shrink-0">
                            <span className="animate-pulse">✨</span> Próxima Previsão
                        </h2>
                        {nextPrediction && nextPrediction.length > 0 && (
                            <SendToWheelingButton
                                numbers={nextPrediction}
                                label="Enviar para Desdobramentos"
                                className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            />
                        )}
                    </div>

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

                {/* 🔥 HOT STATS (Last 20 Draws) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-slate-900 border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔥</span>
                            <h3 className="text-lg font-bold text-white">Forma Recente (20 Sorteios)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-400 text-sm">Precisão Média</div>
                                <div className={`text-2xl font-bold ${(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(5, b.hits) / 5) * 100), 0) / Math.min(20, uniquePerformances.length)) >= 60
                                    ? 'text-emerald-400' : 'text-white'
                                    }`}>
                                    {(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(5, b.hits) / 5) * 100), 0) / Math.min(20, uniquePerformances.length) || 0).toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Acertos Altos (4 ou 5)</div>
                                <div className="text-2xl font-bold text-white">
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length} <span className="text-sm text-slate-500 font-normal">vezes</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-slate-900 border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚡</span>
                            <h3 className="text-lg font-bold text-white">Frequência de Impacto</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-400 text-sm">Intervalo Médio (&gt;4 Acertos)</div>
                                <div className="text-2xl font-bold text-yellow-400">
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length > 0
                                        ? `1 a cada ${(20 / uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length).toFixed(1)} sorteios`
                                        : 'Sem registo recente'}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Baseado nos últimos 20 sorteios</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Interactive Stats Viewer */}
                <SystemStatsViewer
                    systemName={systemName}
                    isActive={system.isActive}
                    initialStats={{
                        accuracy: stats.accuracy,
                        total: stats.totalPredictions,
                        distribution: stats.distribution
                    }}
                />

                {/* History Table */}
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Histórico de Previsões</h2>
                        <span className="text-sm text-slate-500">Últimos 50 Sorteios</span>
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
                                {predictions.slice(0, 50).map((pred: any) => {
                                    // Static file already has arrays, no JSON.parse needed
                                    const predicted = pred.predictedNumbers;
                                    const actual = pred.drawNumbers;

                                    return (
                                        <tr key={pred.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 text-slate-300 font-medium">
                                                {new Date(pred.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {actual.map((n: number) => (
                                                        <span key={n} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold">
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {predicted.map((n: number) => {
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
