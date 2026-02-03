'use client';

import { useState } from 'react';
import Link from 'next/link';

// --- Math Helpers ---

function combinations(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;

    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

/**
 * Hypergeometric Distribution: P(X=k)
 * N: Population size (50)
 * K: Successes in population (5 winning numbers)
 * n: Sample size (number of picks, 1 to 50)
 * k: Successes in sample (number of hits, 0 to 5)
 */
function hypergeometric(N: number, K: number, n: number, k: number): number {
    const waysToChooseWinners = combinations(K, k);
    const waysToChooseLosers = combinations(N - K, n - k);
    const totalWays = combinations(N, n);

    if (totalWays === 0) return 0;
    return (waysToChooseWinners * waysToChooseLosers) / totalWays;
}

export default function ProbabilitiesPage() {
    const [showLogic, setShowLogic] = useState(false);

    // --- Data Generation ---

    // 1. EuroMillions (5/50)
    const emRows = Array.from({ length: 50 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 6 }, (_, k) => hypergeometric(50, 5, i + 1, k))
    }));

    // 2. Totoloto (5/49) - NEW
    const totoRows = Array.from({ length: 49 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 6 }, (_, k) => hypergeometric(49, 5, i + 1, k))
    }));

    // 3. EuroDreams (6/40) - NEW
    const dreamRows = Array.from({ length: 40 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 7 }, (_, k) => hypergeometric(40, 6, i + 1, k))
    }));

    // 4. Stars EuroMillions (2/12)
    const starRows = Array.from({ length: 12 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 3 }, (_, k) => hypergeometric(12, 2, i + 1, k))
    }));

    // 5. Bonus/Lucky Number (1/13 Totoloto, 1/5 EuroDreams) - NEW
    const bonusTotoRows = Array.from({ length: 13 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 2 }, (_, k) => hypergeometric(13, 1, i + 1, k))
    }));
    const bonusDreamRows = Array.from({ length: 5 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 2 }, (_, k) => hypergeometric(5, 1, i + 1, k))
    }));

    // --- Heatmap Helpers ---
    const getCellColor = (prob: number, color: 'blue' | 'green' | 'purple' | 'amber') => {
        const p = prob * 100;
        const base = {
            blue: 'bg-blue',
            green: 'bg-emerald',
            purple: 'bg-purple',
            amber: 'bg-amber'
        }[color];

        if (p >= 40) return `${base}-600 text-white`;
        if (p >= 30) return `${base}-500 text-white`;
        if (p >= 20) return `${base}-400 text-white`;
        if (p >= 10) return `${base}-300 text-zinc-900`;
        if (p >= 5) return `${base}-200 text-zinc-900`;
        if (p >= 1) return `${base}-100 text-zinc-900`;
        return 'bg-white dark:bg-zinc-900 text-zinc-500';
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans">
            <main className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Tabela de Probabilidades 📊
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium">
                            Análise matemática exata da Distribuição Hipergeométrica por jogo.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowLogic(!showLogic)}
                            className="px-6 py-2.5 text-sm font-bold bg-slate-900 dark:bg-zinc-800 text-white rounded-full hover:scale-105 transition-transform shadow-lg"
                        >
                            {showLogic ? '📊 VER DADOS' : '📖 VER LÓGICA'}
                        </button>
                        <Link href="/" className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
                            ← VOLTAR
                        </Link>
                    </div>
                </div>

                {showLogic ? (
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">📖 Lógica Matemática</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">🎯 Distribuição Hipergeométrica</h3>
                                <p>
                                    Diferente da probabilidade simples, a hipergeométrica calcula a chance de sucessos em amostras retiradas sem reposição. É a matemática real por trás de qualquer lotaria.
                                </p>
                                <div className="bg-zinc-50 dark:bg-black p-4 rounded-2xl font-mono text-[10px] text-blue-600 dark:text-blue-400">
                                    P(X=k) = [C(K, k) * C(N-K, n-k)] / C(N, n)
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">💡 Como interpretar?</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><strong>Linhas:</strong> Quantos números o sistema prevê (amostra).</li>
                                    <li><strong>Colunas:</strong> Quantos acertos quer verificar no sorteio.</li>
                                    <li><strong>Cores:</strong> Representam a facilidade (Quente) ou dificuldade (Frio).</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-16 pb-20">
                        {/* 1. EuroMillions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">🇪🇺</div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">EUROMILLIONS (5/50)</h2>
                            </div>
                            <ProbabilityTable rows={emRows} maxHits={5} color="blue" />
                        </div>

                        {/* 2. Totoloto */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">🇵🇹</div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">TOTOLOTO (5/49)</h2>
                            </div>
                            <ProbabilityTable rows={totoRows} maxHits={5} color="green" />
                        </div>

                        {/* 3. EuroDreams */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg">🌙</div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">EURODREAMS (6/40)</h2>
                            </div>
                            <ProbabilityTable rows={dreamRows} maxHits={6} color="purple" />
                        </div>

                        {/* 4. Stars & Bonus Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    ⭐ ESTRELAS EM (2/12)
                                </h2>
                                <ProbabilityTable rows={starRows} maxHits={2} color="amber" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    💎 NÚMERO DA SORTE / DREAM
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-zinc-500">TOTOLOTO (1/13)</p>
                                        <ProbabilityTable rows={bonusTotoRows} maxHits={1} color="green" hideApostas />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-zinc-500">EURODREAMS (1/5)</p>
                                        <ProbabilityTable rows={bonusDreamRows} maxHits={1} color="purple" hideApostas />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );

    // --- Sub-Component for Tables ---
    function ProbabilityTable({ rows, maxHits, color, hideApostas = false }: any) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-center border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase font-black">
                                {!hideApostas && <th className="p-2 border-r border-zinc-200 dark:border-zinc-700 w-10">Apostas</th>}
                                {Array.from({ length: maxHits + 1 }, (_, i) => i).map(num => (
                                    <th key={num} className="p-2 border-b border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                        {num}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row: any) => (
                                <tr key={row.picks} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                    {!hideApostas && (
                                        <td className="p-1.5 border-r border-zinc-200 dark:border-zinc-800 font-black bg-zinc-50 dark:bg-zinc-900 text-zinc-700">
                                            {row.picks}
                                        </td>
                                    )}
                                    {row.probs.map((prob: number, idx: number) => (
                                        <td key={idx} className={`p-1.5 border-b border-zinc-100 dark:border-zinc-800 font-medium ${getCellColor(prob, color)}`}>
                                            {(prob * 100).toFixed(2)}%
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
