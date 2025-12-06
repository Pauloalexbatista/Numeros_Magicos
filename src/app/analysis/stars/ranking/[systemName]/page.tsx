
import { BackButton } from '@/components/ui';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getStarSystemDetails, getStarPrediction } from '../../actions';

export const dynamic = 'force-dynamic';

interface Props {
    params: {
        systemName: string;
    }
}

export default async function StarSystemDetailsPage({ params }: Props) {
    const { systemName: encodedName } = await params;
    const systemName = decodeURIComponent(encodedName);

    const details = await getStarSystemDetails(systemName);

    if (!details) {
        notFound();
    }

    const { system, history } = details;

    // Fetch NEXT draw prediction
    const nextPrediction = await getStarPrediction(systemName);

    return (
        <div className="min-h-screen bg-slate-950 p-6 font-sans">
            <div className="container mx-auto space-y-8 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <BackButton href="/analysis/stars/ranking" />
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                            {system.systemName}
                        </h1>
                        <p className="text-slate-400">Análise detalhada de performance e previsões futuras.</p>
                    </div>
                </div>

                {/* 🔮 NEXT PREDICTION CARD (Highlighted) */}
                <Card className="p-8 bg-gradient-to-br from-yellow-900/40 to-amber-900/20 border-yellow-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-9xl">🔮</span>
                    </div>

                    <h2 className="text-xl font-bold text-yellow-100 mb-6 flex items-center gap-2">
                        <span className="animate-pulse">✨</span> Próxima Previsão
                    </h2>

                    <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                        {nextPrediction && nextPrediction.length > 0 ? (
                            nextPrediction.map((star: number) => (
                                <div key={star} className="relative group">
                                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                                    <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full text-2xl font-black text-black shadow-xl border-2 border-yellow-300">
                                        {star}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-yellow-200/50 italic">Calculando previsão...</div>
                        )}
                    </div>
                    <p className="text-yellow-200/60 text-sm mt-6">
                        Sugestão para o próximo sorteio baseada no algoritmo {system.systemName}.
                    </p>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Precisão Global</div>
                        <div className={`text-4xl font-black ${system.avgAccuracy >= 30 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {system.avgAccuracy.toFixed(1)}%
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total Previsões</div>
                        <div className="text-4xl font-black text-white">
                            {system.totalPredictions}
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Status</div>
                        <div className="text-4xl font-black text-blue-400">
                            Ativo
                        </div>
                    </Card>
                </div>

                {/* History Table */}
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            📜 Histórico de Sorteios
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Estrelas Reais</th>
                                    <th className="p-4">Previsão</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {history.map((perf) => {
                                    // Get predicted stars from the performance record
                                    const predicted = (perf as any).predictedStars
                                        ? JSON.parse((perf as any).predictedStars) as number[]
                                        : [];
                                    // Handle string or object for actual stars depending on Draw schema
                                    const actual = typeof perf.draw.stars === 'string'
                                        ? JSON.parse(perf.draw.stars)
                                        : perf.draw.stars as number[];

                                    return (
                                        <tr key={perf.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 text-slate-300 font-medium">
                                                {new Date(perf.draw.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {actual.map((n: number) => (
                                                        <span key={n} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-yellow-500 border border-yellow-500/30 text-xs font-bold">
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2 max-w-xs">
                                                    {predicted.map(n => {
                                                        const isHit = actual.includes(n);
                                                        return (
                                                            <span key={n} className={`
                                                                w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                                                                ${isHit
                                                                    ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)] scale-110'
                                                                    : 'bg-slate-800 text-slate-500'}
                                                            `}>
                                                                {n}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`
                                                    inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black
                                                    ${perf.hits === 2 ? 'bg-yellow-500 text-black' :
                                                        perf.hits === 1 ? 'bg-yellow-500/20 text-yellow-300' :
                                                            'bg-slate-800 text-slate-500'}
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
