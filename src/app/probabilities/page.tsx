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
    const N = 50; // Total numbers
    const K = 5;  // Winning numbers

    // Generate table data
    const rows = [];
    for (let n = 1; n <= 50; n++) {
        const rowData = { picks: n, probs: [] as number[] };
        for (let k = 1; k <= 5; k++) { // Columns 1 to 5 (Max hits is 5)
            rowData.probs.push(hypergeometric(N, K, n, k));
        }
        rows.push(rowData);
    }

    // Helper for heatmap color
    const getCellColor = (prob: number) => {
        const p = prob * 100;
        if (p >= 40) return 'bg-blue-600 text-white';
        if (p >= 30) return 'bg-blue-500 text-white';
        if (p >= 20) return 'bg-blue-400 text-white';
        if (p >= 10) return 'bg-blue-300 text-zinc-900';
        if (p >= 5) return 'bg-blue-200 text-zinc-900';
        if (p >= 1) return 'bg-blue-100 text-zinc-900';
        return 'bg-white dark:bg-zinc-900 text-zinc-500';
    };

    // Generate stars table data
    const starRows = [];
    const N_stars = 12;
    const K_stars = 2;
    for (let n = 1; n <= 12; n++) {
        const rowData = { picks: n, probs: [] as number[] };
        for (let k = 1; k <= 2; k++) {
            rowData.probs.push(hypergeometric(N_stars, K_stars, n, k));
        }
        starRows.push(rowData);
    }

    const getStarCellColor = (prob: number) => {
        const p = prob * 100;
        if (p >= 40) return 'bg-amber-600 text-white';
        if (p >= 30) return 'bg-amber-500 text-white';
        if (p >= 20) return 'bg-amber-400 text-white';
        if (p >= 10) return 'bg-amber-300 text-zinc-900';
        if (p >= 5) return 'bg-amber-200 text-zinc-900';
        if (p >= 1) return 'bg-amber-100 text-zinc-900';
        return 'bg-white dark:bg-zinc-900 text-zinc-500';
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans">
            <main className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tabela de Probabilidades 📊</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Probabilidade matemática para Números (1-50) e Estrelas (1-12).
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowLogic(!showLogic)}
                            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                            {showLogic ? '📊 Ver Dados' : '📖 Ver Lógica'}
                        </button>
                        <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            ← Voltar
                        </Link>
                    </div>
                </div>

                {/* Logic Explanation */}
                {showLogic && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                            📖 Lógica da Tabela de Probabilidades
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">
                                    🎯 O que esta tabela mostra?
                                </h3>
                                <p>
                                    Esta tabela calcula a probabilidade matemática exata de acertar uma certa quantidade de números (colunas 1 a 5) dependendo de quantos números você joga (linhas "Apostas").
                                    Utiliza a <strong>Distribuição Hipergeométrica</strong>.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">
                                    📊 Como ler a tabela?
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>Linhas (Apostas):</strong> Representam a quantidade de números que você escolheu jogar (ex: se fizer uma aposta múltipla de 10 números, olhe a linha 10).</li>
                                    <li><strong>Colunas (1 a 5):</strong> Representam a quantidade de números que você quer acertar.</li>
                                    <li><strong>Célula:</strong> A percentagem de chance de isso acontecer.</li>
                                </ul>
                                <p className="mt-2 text-xs italic">
                                    Exemplo: Na linha 10, coluna 5, o valor indica a probabilidade de acertar os 5 números vencedores se você jogar 10 números.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">
                                    🎨 Legenda de Cores
                                </h3>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="bg-blue-600 text-white px-2 py-1 rounded">Alta (&gt;40%)</span>
                                    <span className="bg-blue-500 text-white px-2 py-1 rounded">Média-Alta (&gt;30%)</span>
                                    <span className="bg-blue-400 text-white px-2 py-1 rounded">Média (&gt;20%)</span>
                                    <span className="bg-blue-300 text-zinc-900 px-2 py-1 rounded">Baixa (&gt;10%)</span>
                                    <span className="bg-white border border-zinc-200 text-zinc-500 px-2 py-1 rounded">Muito Baixa (&lt;1%)</span>
                                </div>
                            </div>

                            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Nota Matemática</h4>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    Estas probabilidades são puramente matemáticas e baseadas nas regras do jogo (50 números totais, 5 sorteados). Não dependem de sorteios passados.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!showLogic && (
                    <>
                        {/* Numbers Table */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>🔢</span> Números (1-50)
                            </h2>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-center border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                <th className="p-1.5 border-b border-r border-zinc-200 dark:border-zinc-700 font-semibold w-12">
                                                    Apostas
                                                </th>
                                                {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                                                    <th key={num} className="p-1.5 border-b border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100 w-20">
                                                        {num}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row) => (
                                                <tr key={row.picks} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="p-1.5 border-r border-zinc-200 dark:border-zinc-800 font-bold bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                                        {row.picks}
                                                    </td>
                                                    {row.probs.map((prob, idx) => (
                                                        <td key={idx} className={`p-1.5 border-b border-zinc-100 dark:border-zinc-800 ${getCellColor(prob)}`}>
                                                            {(prob * 100).toFixed(2)}%
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                                * Distribuição Hipergeométrica (N=50, K=5).
                            </div>
                        </div>

                        {/* Stars Table */}
                        <div className="space-y-2 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>⭐</span> Estrelas (1-12)
                            </h2>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-center border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                <th className="p-1.5 border-b border-r border-zinc-200 dark:border-zinc-700 font-semibold w-12">
                                                    Apostas
                                                </th>
                                                {Array.from({ length: 2 }, (_, i) => i + 1).map(num => (
                                                    <th key={num} className="p-1.5 border-b border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100 w-20">
                                                        {num}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {starRows.map((row) => (
                                                <tr key={row.picks} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="p-1.5 border-r border-zinc-200 dark:border-zinc-800 font-bold bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                                        {row.picks}
                                                    </td>
                                                    {row.probs.map((prob, idx) => (
                                                        <td key={idx} className={`p-1.5 border-b border-zinc-100 dark:border-zinc-800 ${getStarCellColor(prob)}`}>
                                                            {(prob * 100).toFixed(2)}%
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                                * Distribuição Hipergeométrica (N=12, K=2).
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
