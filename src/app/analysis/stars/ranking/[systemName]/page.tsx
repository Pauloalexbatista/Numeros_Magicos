
import { BackButton } from '@/components/ui';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getStarSystemDetails, getStarPrediction } from '../../actions';
import StarSystemStatsViewer from '@/components/analysis/StarSystemStatsViewer';

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

    // Calculate distribution for stats
    const distribution = [0, 0, 0]; // [0 hits, 1 hit, 2 hits]
    let totalHits = 0;

    history.forEach(p => {
        const hits = Math.min(2, Math.max(0, p.hits));
        distribution[hits]++;
        totalHits += hits;
    });

    const accuracy = history.length > 0
        ? ((totalHits / history.length) / 2) * 100
        : 0;

    const stats = {
        accuracy,
        totalPredictions: history.length,
        distribution
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton href="/analysis/stars/ranking" />
                        <div>
                            <h1 className="text-3xl font-bold text-white">{system.systemName}</h1>
                            <p className="text-slate-400">Sistema de previsão de estrelas</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/analysis/stars/history`}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            📊 Análise Histórica
                        </Link>
                    </div>
                </div>

                {/* 📖 EXPLANATION CARD (for new systems) */}
                {['Clustering Stars', 'Monte Carlo Stars', 'Vortex Stars', 'Média +1 Stars'].includes(systemName) && (
                    <Card className="p-6 bg-slate-900/60 border-slate-700">
                        <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                            💡 Como Funciona Este Sistema
                        </h3>
                        {systemName === 'Clustering Stars' && (
                            <div className="text-slate-300 space-y-2">
                                <p><strong className="text-yellow-400">Conceito:</strong> Agrupamento inteligente de estrelas em 3 clusters</p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li><strong>Cluster 1:</strong> Estrelas 1-4 (baixas)</li>
                                    <li><strong>Cluster 2:</strong> Estrelas 5-8 (médias)</li>
                                    <li><strong>Cluster 3:</strong> Estrelas 9-12 (altas)</li>
                                </ul>
                                <p className="text-sm"><strong className="text-yellow-400">Lógica:</strong> Analisa qual cluster tem mais atividade histórica e seleciona as 6 estrelas mais frequentes dos clusters mais ativos.</p>
                                <p className="text-xs text-slate-400 mt-2">📊 Ranking: #3 (55.20% accuracy) - Top 3!</p>
                            </div>
                        )}
                        {systemName === 'Monte Carlo Stars' && (
                            <div className="text-slate-300 space-y-2">
                                <p><strong className="text-yellow-400">Conceito:</strong> Simulações probabilísticas avançadas</p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li><strong>1000 simulações</strong> de sorteios futuros</li>
                                    <li><strong>Peso baseado em frequência</strong> histórica de cada estrela</li>
                                    <li><strong>Seleção aleatória ponderada</strong> em cada simulação</li>
                                </ul>
                                <p className="text-sm"><strong className="text-yellow-400">Lógica:</strong> Executa 1000 sorteios simulados usando probabilidades históricas e retorna as 6 estrelas que aparecem mais vezes nas simulações.</p>
                                <p className="text-xs text-slate-400 mt-2">📊 Ranking: #6 (54.07% accuracy) - Top 10!</p>
                            </div>
                        )}
                        {systemName === 'Vortex Stars' && (
                            <div className="text-slate-300 space-y-2">
                                <p><strong className="text-yellow-400">Conceito:</strong> Ressonância toroidal com wrap-around</p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li><strong>Traça diagonais</strong> esquerda e direita no histórico</li>
                                    <li><strong>Wrap-around:</strong> 1→12 e 12→1 (circular)</li>
                                    <li><strong>Score de ressonância</strong> baseado em padrões circulares</li>
                                </ul>
                                <p className="text-sm"><strong className="text-yellow-400">Lógica:</strong> Para cada estrela candidata, analisa quantas vezes aparece em padrões diagonais circulares no histórico. Retorna as 6 com maior ressonância.</p>
                                <p className="text-xs text-slate-400 mt-2">📊 Ranking: #11 (51.35% accuracy)</p>
                            </div>
                        )}
                        {systemName === 'Média +1 Stars' && (
                            <div className="text-slate-300 space-y-2">
                                <p><strong className="text-yellow-400">Conceito:</strong> Média por posição + vizinhos</p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li><strong>Analisa últimos 50 sorteios</strong> por posição (1ª e 2ª estrela)</li>
                                    <li><strong>Calcula média</strong> de cada posição</li>
                                    <li><strong>Seleciona média ±1</strong> (3 estrelas por posição = 6 total)</li>
                                </ul>
                                <p className="text-sm"><strong className="text-yellow-400">Exemplo:</strong> Se a 1ª posição tem média 4, seleciona (3, 4, 5). Se a 2ª tem média 9, seleciona (8, 9, 10).</p>
                                <p className="text-xs text-slate-400 mt-2">📊 Ranking: #7 (53.67% accuracy) - Top 10!</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* 🔮 NEXT PREDICTION CARD (Highlighted) */}
                <Card className="p-8 bg-gradient-to-br from-yellow-900/40 to-amber-900/20 border-yellow-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-9xl">🔮</span>
                    </div>

                    <h2 className="text-xl font-bold text-yellow-100 mb-6 flex items-center gap-2">
                        <span className="animate-pulse">✨</span> Próxima Previsão
                    </h2>

                    <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                        {nextPrediction && nextPrediction.length > 0 ? (
                            nextPrediction.map((star: number) => (
                                <div key={star} className="relative group">
                                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                                    <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full text-lg font-black text-black shadow-xl border-2 border-yellow-300">
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

                {/* Interactive Stats Viewer */}
                <StarSystemStatsViewer
                    systemName={systemName}
                    isActive={true}
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
                                    <th className="p-4">Estrelas Reais</th>
                                    <th className="p-4">Previsão</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {history.slice(0, 50).map((perf) => {
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
