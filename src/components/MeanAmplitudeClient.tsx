'use client';

import { useState } from 'react';
import Link from 'next/link';
import { calculateAmplitude, classifyAmplitude } from '@/services/statistics';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface DrawData {
    date: string;
    numbers: number[];
    stars: number[];
    mean: number;
    amplitude: number;
    ampClass: 'Concentrado' | 'Normal' | 'Disperso';
}

interface MeanAmplitudeClientProps {
    draws: DrawData[];
    limit: number;
}

export default function MeanAmplitudeClient({ draws, limit }: MeanAmplitudeClientProps) {
    const [showLogic, setShowLogic] = useState(false);

    // Calculate global stats for the sample
    const globalMean = (draws.reduce((acc, d) => acc + d.mean, 0) / draws.length).toFixed(2);
    const avgAmplitude = (draws.reduce((acc, d) => acc + d.amplitude, 0) / draws.length).toFixed(2);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground p-4 font-sans">
            <main className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Média e Amplitude 📉</h1>
                        <p className="text-sm text-muted-foreground">
                            Análise da tendência (Alta/Baixa) e dispersão dos números.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setShowLogic(!showLogic)}
                            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                            {showLogic ? '📊 Ver Dados' : '📖 Ver Lógica'}
                        </button>

                        <form method="GET" className="flex items-center gap-2">
                            <input
                                type="number"
                                name="limit"
                                defaultValue={limit}
                                className="w-16 text-sm rounded border border-border bg-card/50 backdrop-blur-sm p-2"
                                placeholder="Qtd"
                            />
                            <button type="submit" className="px-3 py-2 text-sm font-medium text-white bg-zinc-800 dark:bg-zinc-700 rounded hover:bg-zinc-600">
                                Atualizar
                            </button>
                        </form>

                        <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            ← Voltar
                        </Link>
                    </div>
                </div>

                {/* Logic Explanation */}
                {showLogic && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 mb-6 animate-in fade-in slide-in-from-top-4">
                        <h2 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">
                            📖 Lógica da Média e Amplitude
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-indigo-800 dark:text-indigo-200">
                                    📏 Média (Mean)
                                </h3>
                                <p className="mb-2">
                                    A soma dos 5 números dividida por 5.
                                    <br />
                                    <strong>Valor Teórico Central: 25.5</strong>
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                                    <li><strong>&lt; 22:</strong> Sorteio "Baixo" (Muitos números pequenos)</li>
                                    <li><strong>&gt; 29:</strong> Sorteio "Alto" (Muitos números grandes)</li>
                                    <li><strong>22 - 29:</strong> Sorteio Equilibrado (O mais comum)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-indigo-800 dark:text-indigo-200">
                                    ↔️ Amplitude (Range)
                                </h3>
                                <p className="mb-2">
                                    A diferença entre o maior e o menor número sorteado.
                                    <br />
                                    (Máx - Mín)
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                                    <li><strong>&lt; 25 (Concentrado):</strong> Números muito próximos uns dos outros. Raro.</li>
                                    <li><strong>&gt; 40 (Disperso):</strong> Cobre quase todo o boletim. Comum.</li>
                                    <li><strong>25 - 40 (Normal):</strong> Dispersão padrão.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 bg-yellow-100 dark:bg-yellow-900 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                <strong>Dica de Estratégia:</strong> A maioria dos sorteios tende a regressar à média (25.5). Se saíram muitos sorteios "Altos" recentemente, estatisticamente pode estar para vir um "Baixo" ou "Equilibrado".
                            </p>
                        </div>
                    </div>
                )}

                {/* Occurrence Indices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mean Index */}
                    {(() => {
                        const val = parseFloat(globalMean);
                        const expected = 25.5;
                        const index = (val / expected) * 100;

                        const getColor = () => {
                            if (index < 90) return 'from-blue-500 to-blue-600'; // Low mean
                            if (index > 110) return 'from-red-500 to-red-600'; // High mean
                            return 'from-green-500 to-green-600'; // Normal
                        };

                        const getStatus = () => {
                            if (index < 95) return '📉 Baixa';
                            if (index > 105) return '📈 Alta';
                            return '✅ Normal';
                        };

                        return (
                            <div className={`bg-gradient-to-br ${getColor()} text-white p-6 rounded-xl shadow-lg`}>
                                <div className="text-sm opacity-90 mb-2">Média Global da Amostra</div>
                                <div className="text-4xl font-bold mb-1">{val}</div>
                                <div className="text-xs opacity-75 mb-3">média/sorteio</div>

                                <div className="flex items-center gap-2">
                                    <div className="text-xs bg-white/20 px-2 py-1 rounded">
                                        Esperado: {expected}
                                    </div>
                                    <div className="text-xs bg-white/20 px-2 py-1 rounded font-bold">
                                        {index.toFixed(0)}% {getStatus()}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Amplitude Index */}
                    {(() => {
                        const val = parseFloat(avgAmplitude);
                        const expected = 34.0; // Heuristic average for 5/50
                        const index = (val / expected) * 100;

                        const getColor = () => {
                            if (index < 85) return 'from-orange-500 to-orange-600'; // Concentrated
                            if (index > 115) return 'from-teal-500 to-teal-600'; // Dispersed
                            return 'from-purple-500 to-purple-600'; // Normal
                        };

                        const getStatus = () => {
                            if (index < 90) return '📉 Concentrada';
                            if (index > 110) return '📈 Dispersa';
                            return '✅ Normal';
                        };

                        return (
                            <div className={`bg-gradient-to-br ${getColor()} text-white p-6 rounded-xl shadow-lg`}>
                                <div className="text-sm opacity-90 mb-2">Amplitude Média</div>
                                <div className="text-4xl font-bold mb-1">{val}</div>
                                <div className="text-xs opacity-75 mb-3">média/sorteio</div>

                                <div className="flex items-center gap-2">
                                    <div className="text-xs bg-white/20 px-2 py-1 rounded">
                                        Esperado: ~{expected}
                                    </div>
                                    <div className="text-xs bg-white/20 px-2 py-1 rounded font-bold">
                                        {index.toFixed(0)}% {getStatus()}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Charts Section */}
                <div className="space-y-8">

                    {/* Mean Chart */}
                    <section className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            📉 Evolução da Média
                            <span className="text-xs font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Linha Central = 25.5</span>
                        </h3>

                        <div className="relative h-64 w-full flex items-end gap-1 overflow-x-auto pb-8">
                            {/* Reference Line 25.5 */}
                            <div className="absolute w-full border-t-2 border-dashed border-green-500/50 z-0" style={{ bottom: '51%' }}></div>

                            {draws.map((d, i) => {
                                // Scale: 0 to 50. 25.5 is ~51% height.
                                const heightPct = (d.mean / 50) * 100;
                                const isHigh = d.mean > 29;
                                const isLow = d.mean < 22;
                                const colorClass = isHigh ? 'bg-red-400' : isLow ? 'bg-blue-400' : 'bg-zinc-300 dark:bg-zinc-600';

                                return (
                                    <div key={i} className="flex-1 min-w-[20px] flex flex-col justify-end group relative h-full z-10">
                                        <div
                                            className={`w-full rounded-t-sm transition-all hover:opacity-80 ${colorClass}`}
                                            style={{ height: `${heightPct}%` }}
                                        ></div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded z-20 whitespace-nowrap">
                                            <div className="font-bold">{new Date(d.date).toLocaleDateString('pt-PT')}</div>
                                            <div>Média: {d.mean}</div>
                                            <div>Números: {d.numbers.join(', ')}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400 mt-2">
                            <span>Antigo</span>
                            <span>Recente</span>
                        </div>
                    </section>

                    {/* Amplitude Chart */}
                    <section className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold mb-6">↔️ Evolução da Amplitude</h3>

                        <div className="relative h-40 w-full flex items-end gap-1 overflow-x-auto">
                            {draws.map((d, i) => {
                                // Scale: 0 to 50.
                                const heightPct = (d.amplitude / 50) * 100;
                                const colorClass = d.ampClass === 'Concentrado' ? 'bg-orange-400' : d.ampClass === 'Disperso' ? 'bg-teal-400' : 'bg-zinc-300 dark:bg-zinc-600';

                                return (
                                    <div key={i} className="flex-1 min-w-[20px] flex flex-col justify-end group relative h-full">
                                        <div
                                            className={`w-full rounded-t-sm transition-all hover:opacity-80 ${colorClass}`}
                                            style={{ height: `${heightPct}%` }}
                                        ></div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded z-20 whitespace-nowrap">
                                            <div className="font-bold">{new Date(d.date).toLocaleDateString('pt-PT')}</div>
                                            <div>Amp: {d.amplitude} ({d.ampClass})</div>
                                            <div>{Math.min(...d.numbers)} - {Math.max(...d.numbers)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-4 mt-4 text-xs justify-center">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded"></div> Concentrado (&lt;25)</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 rounded"></div> Normal</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-teal-400 rounded"></div> Disperso (&gt;40)</div>
                        </div>
                    </section>
                </div>
                <ResponsibleGamingFooter />
            </main>
        </div>
    );
}
