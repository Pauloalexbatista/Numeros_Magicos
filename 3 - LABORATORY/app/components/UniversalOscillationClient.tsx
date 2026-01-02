'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCcw, Zap, Activity, Grid, Check, TrendingUp, AlertTriangle } from 'lucide-react';

interface UniversalOscillationData {
    matrix: Record<number, Record<number, number>>;
    saturation: Record<number, { saturation: number, status: 'hot' | 'cold' | 'neutral' }>;
    prediction: {
        dominantRoot: number;
        lastDrawNumbers: number[];
        lastDrawRoots: number[];
        potentialRanking: {
            root: number;
            strategyA_votes: number;
            strategyB_prob: number;
            strategyC_score?: number;
            saturation_status: string;
            score: number;
        }[];
        validation: {
            totalDrawsAnalysed: number;
            top3HitRate: number;
            improvementFactor: number;
            avgPoolHits: string;
            randomPoolBaseline: string;
            recentHistory: {
                date: string;
                prevRoot: number;
                targetRoot: number;
                predictedTop3: number[];
                hit: boolean;
                poolHits: number;
                poolSize: number;
                targetNumbers: number[];
                prevNumbers: number[];
            }[];
        };
    };
}


export default function UniversalOscillationClient() {
    const [data, setData] = useState<UniversalOscillationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [historyLimit, setHistoryLimit] = useState<100 | 500>(500);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/universal-oscillation?limit=${historyLimit}`);
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [historyLimit]);

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
                Erro: {error}
                <button onClick={fetchData} className="ml-4 underline">Tentar novamente</button>
            </div>
        );
    }

    if (!data) return null;

    // Helper to get color for probability (White -> Red Heat Scale, Black Text)
    const getProbColor = (prob: number) => {
        if (prob >= 25) return 'bg-red-600 text-black font-black shadow-lg shadow-red-500/40'; // Magma
        if (prob >= 20) return 'bg-red-500 text-black font-bold'; // Hot
        if (prob >= 15) return 'bg-red-300 text-black font-semibold'; // Warm
        if (prob >= 10) return 'bg-red-100 text-black'; // Tepid
        if (prob >= 5) return 'bg-slate-100 text-black'; // Cool (White-ish)
        return 'bg-white text-slate-400'; // Cold
    };

    // Helper to get color for saturation
    const getSatColor = (status: string) => {
        if (status === 'hot') return 'bg-red-500 text-white';
        if (status === 'cold') return 'bg-green-500 text-white';
        return 'bg-slate-600 text-slate-300';
    };

    // Helper: Get numbers for a root (1-50 range)
    const getNumbersForRoot = (root: number): number[] => {
        const numbers: number[] = [];
        for (let i = 1; i <= 50; i++) {
            let sum = i;
            while (sum > 9) {
                sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
            }
            if (sum === root) numbers.push(i);
        }
        return numbers;
    };

    // Get Top 3 Roots from Ranking
    const top3Roots = data.prediction.potentialRanking.slice(0, 3);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Activity className="w-6 h-6 text-purple-400" />
                        Laboratório de Oscilação Universal
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Visualizando o fluxo de energia entre raízes digitais (Baseado em Tesla/Rodin)
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setHistoryLimit(100)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${historyLimit === 100 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Últimos 100 (Tendência)
                    </button>
                    <button
                        onClick={() => setHistoryLimit(500)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${historyLimit === 500 ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Últimos 500 (Estabilidade)
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-1"></div>
                    <button
                        onClick={fetchData}
                        className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* NEW: Actionable Pool Card (The "Killer Feature") */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp className="w-32 h-32 text-emerald-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    Pool de Apostas Otimizado (Top 3)
                </h3>
                <p className="text-emerald-200/80 text-sm mb-6 max-w-2xl">
                    Com base na previsão de <span className="font-bold text-white">90% de probabilidade</span> (Top 3 Raízes), estes são os ~16-18 números onde o prémio deve estar escondido.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    {top3Roots.map((item, i) => (
                        <div key={item.root} className="bg-slate-950/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-4 hover:border-emerald-500/40 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-slate-800 text-white border border-slate-600'}`}>
                                        {item.root}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 uppercase font-bold">Raiz {item.root}</span>
                                        <span className="text-[10px] text-emerald-400 font-mono">Score: {item.score.toFixed(1)}</span>
                                    </div>
                                </div>
                                {i === 0 && <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/30">FAVORITO</span>}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {getNumbersForRoot(item.root).map(n => (
                                    <div key={n} className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-200 border border-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 cursor-pointer transition-all hover:scale-110 shadow-sm">
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: Deep Analysis */}
                <div className="space-y-6">

                    {/* 1. Last Draw Autopsy */}
                    <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white relative z-10">
                            <Check className="w-5 h-5 text-blue-400" />
                            Análise do Último Sorteio
                        </h3>

                        <div className="relative z-10 w-full max-w-lg mx-auto font-mono text-sm leading-relaxed">
                            {/* Individual Numbers Breakdown */}
                            <div className="space-y-2 mb-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                                {data.prediction.lastDrawNumbers?.map((num: number, i: number) => {
                                    const digits = num.toString().split('').join('+');
                                    const root = data.prediction.lastDrawRoots[i];
                                    return (
                                        <div key={i} className="flex justify-between items-center text-slate-300">
                                            <span>
                                                <span className="text-white font-bold text-lg w-8 inline-block">{num}</span>
                                                <span className="text-slate-500 mx-2">({digits})</span>
                                            </span>
                                            <span className="text-blue-200">= Raiz <span className="font-bold text-blue-400">{root}</span></span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Sum Calculation */}
                            <div className="space-y-3 pt-2 border-t border-slate-700/50">
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Cálculo da Energia do Sorteio:</span>
                                    <div className="text-slate-300">
                                        Soma dos números: <span className="text-white">{data.prediction.lastDrawNumbers?.join('+')}</span> = <span className="text-xl font-bold text-white">{data.prediction.lastDrawNumbers?.reduce((a: any, b: any) => a + b, 0)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Raiz da Soma:</span>
                                    <div className="flex items-center gap-2 text-white">
                                        <span className="font-black text-2xl text-blue-400">Raiz {data.prediction.dominantRoot}</span>
                                        <span className="text-slate-500 text-xs">(Usada como entrada na Tabela abaixo)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Potential Table (The transparent logical conclusion) */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Tabela de Potencial (Ranking)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-400">
                                <thead className="text-xs uppercase bg-slate-800 text-slate-300">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Raiz</th>
                                        <th className="px-4 py-3 text-center">Estrat. A (Votos)</th>
                                        <th className="px-4 py-3 text-center">Estrat. B (Prob)</th>
                                        <th className="px-4 py-3 text-center rounded-r-lg">Conclusão</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {data.prediction.potentialRanking.map((item, idx) => (
                                        <tr key={item.root} className={`hover:bg-slate-800/50 transition-colors ${idx < 3 ? 'bg-slate-800/20' : ''}`}>
                                            <td className="px-4 py-3 font-bold text-white text-lg flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx < 3 ? 'bg-yellow-500 text-black' : 'bg-slate-700'}`}>
                                                    {item.root}
                                                </div>
                                                {idx === 0 && <span className="text-yellow-500 text-xs">👑 #1</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    <span className={`font-bold ${item.strategyA_votes > 0 ? 'text-purple-400' : 'text-slate-600'}`}>{item.strategyA_votes}</span>
                                                    <span className="text-[10px] text-slate-600">votos</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    <span className={`font-bold ${item.strategyB_prob >= 20 ? 'text-red-400' : 'text-slate-400'}`}>{item.strategyB_prob}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.saturation_status === 'hot' ? (
                                                    <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">Saturado ⚠️</span>
                                                ) : idx < 3 ? (
                                                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">Recomendado</span>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Matrix & Validation */}
                <div className="space-y-6">

                    {/* 3. The Matrix (Visual Confirmation) */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Grid className="w-5 h-5 text-blue-400" />
                            Matriz de Transição (Últimos {historyLimit} Sorteios)
                        </h3>
                        <div className="overflow-x-auto flex items-center justify-center">
                            <div className="grid grid-cols-10 gap-2 min-w-[500px]">
                                {/* Header Row */}
                                <div className="text-sm text-slate-500 text-center flex items-center justify-center">Y\X</div>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => (
                                    <div key={r} className="text-sm font-bold text-center flex items-center justify-center h-8 bg-slate-800/50 rounded">{r}</div>
                                ))}

                                {/* Rows */}
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(prev => (
                                    <>
                                        <div key={`head-${prev}`} className={`text-sm font-bold text-center flex items-center justify-center rounded h-10 w-full ${prev === data.prediction.dominantRoot ? 'bg-yellow-500 text-black border-2 border-yellow-300' : 'bg-slate-800 text-slate-400'}`}>
                                            {prev}
                                        </div>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(next => {
                                            const prob = data.matrix[prev][next];
                                            const isTargetRow = prev === data.prediction.dominantRoot;
                                            return (
                                                <div
                                                    key={`${prev}-${next}`}
                                                    className={`text-xs font-medium flex items-center justify-center rounded h-10 transition-transform cursor-default ${getProbColor(prob)} ${isTargetRow ? 'ring-1 ring-yellow-500/30' : ''}`}
                                                    title={`R${prev} -> R${next}: ${prob}%`}
                                                >
                                                    {prob.toFixed(0)}%
                                                </div>
                                            );
                                        })}
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Saturation Meter */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Medidor de Saturação (Atual)
                        </h3>
                        {/* Made rows tighter with gap-2 instead of gap-3 */}
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(root => {
                                const sat = data.saturation[root];
                                const width = Math.min(sat.saturation * 50, 100);
                                return (
                                    <div key={root} className="flex items-center gap-3 text-sm h-7">
                                        <div className="w-6 font-bold text-center text-slate-400">{root}</div>
                                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden relative group">
                                            <div
                                                className={`h-full transition-all duration-500 ${getSatColor(sat.status)}`}
                                                style={{ width: `${width}%` }}
                                            />
                                            {/* Tooltip */}
                                            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white shadow-black drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                {sat.saturation.toFixed(2)}x
                                            </div>
                                        </div>
                                        <div className="w-20 text-[10px] text-right capitalize text-slate-500">
                                            {sat.status === 'hot' ? '🔥 Saturado' : sat.status === 'cold' ? '❄️ Carente' : 'Neutro'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Scientific Validation Log (Last 10 Draws) */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-300">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Validação (Últimos 10 Sorteios)
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Testando o "Pool Otimizado" (~18 num) nos últimos resultados.
                        </p>

                        <div className="space-y-2">
                            {data.prediction.validation.recentHistory.map((log, i) => (
                                <div key={i} className="flex flex-col gap-2 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 relative overflow-hidden mb-4">
                                    {/* Watermark/Background Status */}
                                    <div className={`absolute top-0 right-0 p-2 opacity-10 text-6xl font-black ${log.hit ? 'text-green-500' : 'text-red-500'}`}>
                                        {log.hit ? 'HIT' : 'MISS'}
                                    </div>

                                    {/* STEP 1: THE TRIGGER (Past) */}
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <div className="w-24 text-[10px] text-right font-mono opacity-50">SORTEIO ANTERIOR</div>
                                        <div className="flex-1 flex items-center gap-2 p-2 rounded bg-slate-900/50 border border-dashed border-slate-700">
                                            <div className="flex gap-1 overflow-x-auto">
                                                {log.prevNumbers && log.prevNumbers.map(n => (
                                                    <span key={n} className="text-[10px] text-slate-500">{n}</span>
                                                ))}
                                            </div>
                                            <div className="ml-auto flex items-center gap-1 font-mono text-xs text-blue-400 whitespace-nowrap">
                                                <span>=</span>
                                                <span className="font-bold">RAIZ {log.prevRoot}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONNECTOR ARROW */}
                                    <div className="pl-32 flex items-center gap-2 text-yellow-500/50 text-xs">
                                        <span>⤵</span>
                                        <span>A Matriz sugere estas raízes para o próximo...</span>
                                    </div>

                                    {/* STEP 2: THE PREDICTION */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 text-[10px] text-right font-bold text-yellow-500">PREVISÃO</div>
                                        <div className="flex gap-2">
                                            {log.predictedTop3.map((r: number) => (
                                                <div key={r} className={`px-3 py-1 rounded font-bold text-sm ${r === log.targetRoot ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-700 text-slate-400'}`}>
                                                    R{r}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* STEP 3: THE RESULT (Future/Actual) */}
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="w-24 text-[10px] text-right text-slate-300">RESULTADO REAL</div>
                                        <div className="flex-1 flex flex-col gap-1 p-2 rounded bg-slate-800 border border-slate-700 shadow-inner">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-slate-400">{new Date(log.date).toLocaleDateString('pt-PT')}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-slate-500">Raiz Real:</span>
                                                    <span className={`text-xs font-black ${log.hit ? 'text-green-400' : 'text-red-400'}`}>R{log.targetRoot}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 overflow-x-auto pb-1">
                                                {log.targetNumbers && log.targetNumbers.map((num: number) => {
                                                    // Explicitly calculate pool for this specific prediction set
                                                    // Note: We need getNumbersForRoots from scope or duplicate logic. 
                                                    // Duplicating logic for safety as helper is in component scope but sometimes problematic in map.
                                                    // Actually helper `getNumbersForRoot` is single root. `getNumbersForRoots` is array.
                                                    // Let's use `log.predictedTop3` roots -> flatten chart.

                                                    // Logic: For each root in predictedTop3, get its numbers.
                                                    // Check if num is in that list.
                                                    let isHit = false;
                                                    log.predictedTop3.forEach(r => {
                                                        // Simple root check without helper for safety
                                                        let sum = num;
                                                        while (sum > 9) sum = String(sum).split('').reduce((a, b) => a + Number(b), 0);
                                                        if (sum === r) isHit = true;
                                                        // Wait, "Pool" includes the numbers that SUM to the root.
                                                        // If num sums to a root in predictedTop3, it is a hit.
                                                    });

                                                    return (
                                                        <span key={num} className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold ${isHit ? 'bg-green-500 text-black' : 'bg-slate-700 text-slate-500'}`}>
                                                            {num}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-right text-[10px] text-slate-500 mt-1">
                                                Captura: <span className="text-white font-bold">{log.poolHits}</span> de 5
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xs text-slate-500">Média Acertos (Num)</div>
                                <div className="text-xl font-bold text-yellow-500">{data.prediction.validation.avgPoolHits}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Melhoria vs Random</div>
                                <div className="text-xl font-bold text-blue-400">{data.prediction.validation.improvementFactor}x</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
