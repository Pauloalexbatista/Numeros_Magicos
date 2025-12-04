
import { getStarSystemDetails, getStarPrediction } from '../../actions';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const dynamic = 'force-dynamic';

interface Props {
    params: {
        systemName: string;
    }
}

export default async function StarSystemDetailsPage({ params }: Props) {
    const { systemName: encodedName } = await params;
    const systemName = decodeURIComponent(encodedName);

    const data = await getStarSystemDetails(systemName);
    const nextPrediction = await getStarPrediction(systemName);

    if (!data) {
        notFound();
    }

    const { system, history } = data;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {system.systemName}
                            <span className="text-sm font-normal bg-slate-800 px-2 py-1 rounded text-slate-400">Estrelas</span>
                        </h1>
                        <p className="text-slate-400">Análise detalhada de performance.</p>
                    </div>
                </div>

                {/* Next Prediction Card */}
                {nextPrediction && (
                    <Card className="p-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/30 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m12 16 4-4-4-4" /><path d="M8 12h8" /></svg>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                🔮 Próxima Previsão
                            </h2>
                            <p className="text-slate-300 mb-6">
                                Estrelas calculadas para o próximo sorteio com base na estratégia <strong>{system.systemName}</strong>.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {nextPrediction.map((star: number) => (
                                    <div key={star} className="
                                        w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600
                                        flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-amber-500/20
                                        animate-in zoom-in duration-500
                                    ">
                                        {star}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-4">
                                *Previsão gerada em tempo real com base no histórico completo.
                            </p>
                        </div>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Precisão Global</div>
                        <div className={`text-3xl font-bold ${(system.avgAccuracy || 0) >= 20 ? 'text-emerald-400' : 'text-yellow-400'
                            }`}>
                            {system.avgAccuracy.toFixed(1)}%
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total Previsões</div>
                        <div className="text-3xl font-bold text-white">
                            {system.totalPredictions || 0}
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Última Atualização</div>
                        <div className="text-lg font-bold text-slate-300">
                            {new Date(system.lastUpdated).toLocaleDateString('pt-PT')}
                        </div>
                    </Card>
                </div>

                {/* Hit Distribution Analysis */}
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            📊 Distribuição de Acertos
                            <span className="text-xs font-normal text-slate-400">
                                Comparação com Probabilidade Matemática (4/12)
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
                                    const totalTests = history.length;
                                    const hitCounts = [0, 0, 0]; // 0, 1, 2 hits
                                    history.forEach((p: any) => {
                                        if (p.hits >= 0 && p.hits <= 2) {
                                            hitCounts[p.hits]++;
                                        }
                                    });

                                    // Mathematical probabilities for choosing 4 stars from 12 (Target: 2 winning stars)
                                    // Hypergeometric Distribution:
                                    // Total Combinations C(12,4) = 495
                                    // 2 Hits (Jackpot): C(2,2)*C(10,2) = 1*45 = 45 -> 45/495 = 9.09%
                                    // 1 Hit: C(2,1)*C(10,3) = 2*120 = 240 -> 240/495 = 48.48%
                                    // 0 Hits: C(2,0)*C(10,4) = 1*210 = 210 -> 210/495 = 42.42%
                                    const expectedProbs = [
                                        0.4242, // 0 hits
                                        0.4848, // 1 hit
                                        0.0909  // 2 hits
                                    ];

                                    return [0, 1, 2].map(hits => {
                                        const realCount = hitCounts[hits];
                                        const realPercent = totalTests > 0 ? (realCount / totalTests) * 100 : 0;
                                        const expectedCount = Math.round(totalTests * expectedProbs[hits]);
                                        const expectedPercent = expectedProbs[hits] * 100;
                                        const deviation = realPercent - expectedPercent;

                                        let label = 'Sem Acerto';
                                        let colorClass = 'text-slate-400';

                                        if (hits === 2) {
                                            label = '2 Estrelas (Jackpot)';
                                            colorClass = 'text-yellow-400';
                                        } else if (hits === 1) {
                                            label = '1 Estrela';
                                            colorClass = 'text-slate-300';
                                        }

                                        return (
                                            <tr key={hits} className="hover:bg-slate-800/30 transition-colors">
                                                <td className={`p-4 font-bold ${colorClass}`}>
                                                    {label}
                                                </td>
                                                <td className="p-4 text-center text-slate-300">{realCount}</td>
                                                <td className="p-4 text-center font-semibold text-white">
                                                    {realPercent.toFixed(1)}%
                                                </td>
                                                <td className="p-4 text-center text-slate-400">{expectedCount}</td>
                                                <td className="p-4 text-center text-slate-400">
                                                    {expectedPercent.toFixed(1)}%
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-bold ${Math.abs(deviation) < 1 ? 'text-slate-500' :
                                                        deviation > 0 ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}>
                                                        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
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
                                    <th className="p-4">Previsão</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {history.map((perf: any) => {
                                    const predicted = JSON.parse(perf.predictedStars) as number[];
                                    const actual = JSON.parse(perf.actualStars) as number[];

                                    return (
                                        <tr key={perf.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 text-slate-300 font-medium">
                                                {new Date(perf.draw.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {actual.map(n => (
                                                        <span key={n} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold border border-slate-600">
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
                                                                ${isHit ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-slate-800 text-slate-500'}
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
                                                    ${perf.hits === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        perf.hits === 1 ? 'bg-slate-500/20 text-slate-400' :
                                                            'bg-slate-800 text-slate-600'}
                                                `}>
                                                    {perf.hits}/2
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
