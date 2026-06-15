'use client';

import { useState } from 'react';
import Link from 'next/link';

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

function hypergeometric(N: number, K: number, n: number, k: number): number {
    const waysToChooseWinners = combinations(K, k);
    const waysToChooseLosers = combinations(N - K, n - k);
    const totalWays = combinations(N, n);

    if (totalWays === 0) return 0;
    return (waysToChooseWinners * waysToChooseLosers) / totalWays;
}

export default function ProbabilitiesPage() {
    const [showLogic, setShowLogic] = useState(false);

    const emRows = Array.from({ length: 50 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 6 }, (_, k) => hypergeometric(50, 5, i + 1, k)),
    }));

    const totoRows = Array.from({ length: 49 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 6 }, (_, k) => hypergeometric(49, 5, i + 1, k)),
    }));

    const dreamRows = Array.from({ length: 40 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 7 }, (_, k) => hypergeometric(40, 6, i + 1, k)),
    }));

    const megaRows = Array.from({ length: 60 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 7 }, (_, k) => hypergeometric(60, 6, i + 1, k)),
    }));

    const starRows = Array.from({ length: 12 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 3 }, (_, k) => hypergeometric(12, 2, i + 1, k)),
    }));

    const bonusTotoRows = Array.from({ length: 13 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 2 }, (_, k) => hypergeometric(13, 1, i + 1, k)),
    }));
    const bonusDreamRows = Array.from({ length: 5 }, (_, i) => ({
        picks: i + 1,
        probs: Array.from({ length: 2 }, (_, k) => hypergeometric(5, 1, i + 1, k)),
    }));

    const buildCells = (rows: { picks: number; probs: number[] }[], color: 'blue' | 'green' | 'purple' | 'amber') => {
        const allValues = rows.flatMap((row) => row.probs.map((p) => p * 100));
        const max = allValues.reduce((acc, value) => Math.max(acc, value), 0);

        return rows.map((row) => {
            const cells = row.probs.map((prob) => {
                const value = prob * 100;
                const intensity = max === 0 ? 0 : value / max;

                if (value >= 40) return `${color}-600 text-white`;
                if (value >= 30) return `${color}-500 text-white`;
                if (value >= 20) return `${color}-400 text-white`;
                if (value >= 10) return `${color}-300 text-zinc-900`;
                if (value >= 5) return `${color}-200 text-zinc-900`;
                if (value >= 1) return `${color}-100 text-zinc-900`;
                return 'bg-surface-2/70 text-muted-foreground';
            });

            return { ...row, cells };
        });
    };

    const mainGroups = [
        { title: 'EUROMILLIONS (5/50)', rows: buildCells(emRows, 'blue'), maxHits: 5, color: 'blue' as const, flag: '🇪🇺' },
        { title: 'TOTOLOTO (5/49)', rows: buildCells(totoRows, 'green'), maxHits: 5, color: 'green' as const, flag: '🇵🇹' },
        { title: 'EURODREAMS (6/40)', rows: buildCells(dreamRows, 'purple'), maxHits: 6, color: 'purple' as const, flag: '🇪🇺' },
        { title: 'MEGA-SENA (6/60)', rows: buildCells(megaRows, 'amber'), maxHits: 6, color: 'amber' as const, flag: '🇧🇷' },
    ];

    const bonusGroups = [
        { title: 'TOTOLOTO (1/13)', rows: buildCells(bonusTotoRows, 'green'), maxHits: 1, color: 'green' as const },
        { title: 'EURODREAMS (1/5)', rows: buildCells(bonusDreamRows, 'purple'), maxHits: 1, color: 'purple' as const },
    ];

    return (
        <div className="min-h-screen bg-surface-1 text-foreground p-4 font-sans md:p-8">
            <main className="mx-auto max-w-7xl space-y-10">
                <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Tabela de Probabilidades</h1>
                        <p className="text-sm text-muted-foreground">Análise matemática exata da Distribuição Hipergeométrica por jogo.</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-1/70 px-4 py-2 text-xs font-semibold text-muted-foreground">
                            <span className="inline-flex h-2 w-2 rounded-full bg-foreground/80" />
                            Quente
                            <span className="inline-flex h-2 w-2 rounded-full bg-surface-2/80 ml-2" />
                            Frio
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowLogic((value) => !value)}
                            className="rounded-full bg-surface-3 px-5 py-2 text-xs font-bold shadow-sm transition hover:brightness-110 sm:text-sm"
                        >
                            {showLogic ? '📊 VER DADOS' : '📖 VER LÓGICA'}
                        </button>
                        <Link
                            href="/"
                            className="rounded-full border border-border bg-surface-2 px-5 py-2 text-xs font-bold shadow-sm transition hover:brightness-110 sm:text-sm"
                        >
                            ← VOLTAR
                        </Link>
                    </div>
                </div>

                {showLogic ? (
                    <section className="space-y-8 rounded-3xl border border-border bg-surface-1/70 p-8 shadow-sm backdrop-blur-md">
                        <h2 className="text-2xl font-black">📖 Lógica Matemática</h2>
                        <div className="grid grid-cols-1 gap-10 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-foreground">🎯 Distribuição Hipergeométrica</h3>
                                <p>
                                    Diferente da probabilidade simples, a hipergeométrica calcula a chance de sucessos em amostras retiradas sem reposição. É a matemática real por trás de qualquer lotaria.
                                </p>
                                <div className="rounded-2xl bg-surface-2 p-4 font-mono text-[10px] text-foreground">
                                    P(X=k) = [C(K, k) * C(N-K, n-k)] / C(N, n)
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-foreground">💡 Como interpretar?</h3>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li><strong>Linhas:</strong> Quantos números o sistema prevê (amostra).</li>
                                    <li><strong>Colunas:</strong> Quantos acertos quer verificar no sorteio.</li>
                                    <li><strong>Cores:</strong> Representam a facilidade (quente) ou dificuldade (frio).</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className="space-y-10">
                        {mainGroups.map((group) => (
                            <section key={group.title} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{group.flag}</span>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">{group.title}</h2>
                                        <p className="text-xs text-muted-foreground">Probabilidade de acertos por número de apostas.</p>
                                    </div>
                                </div>
                                <ProbabilityTable rows={group.rows} maxHits={group.maxHits} />
                            </section>
                        ))}

                        <section className="space-y-4">
                            <h2 className="text-lg font-bold tracking-tight">Números complementares</h2>
                            <p className="text-xs text-muted-foreground">Componentes adicionais por jogo.</p>
                            <div className="grid gap-5 md:grid-cols-2">
                                {bonusGroups.map((group) => (
                                    <ProbabilityTable key={group.title} rows={group.rows} maxHits={group.maxHits} />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

type TableRow = {
    picks: number;
    probs: number[];
    cells: string[];
};

type TableProps = {
    rows: TableRow[];
    maxHits: number;
};

function ProbabilityTable({ rows, maxHits }: TableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-1/70 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-[11px]">
                    <thead>
                        <tr className="bg-surface-2 text-muted-foreground uppercase font-semibold">
                            <th className="w-12 border-b border-r border-border p-2 text-foreground">Apostas</th>
                            {Array.from({ length: maxHits + 1 }, (_, i) => i).map((num) => (
                                <th key={num} className="min-w-[4.5rem] border-b border-border p-2 text-[11px] font-semibold text-foreground">
                                    {num}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="[&_tr:nth-child(odd)]:bg-surface-1/80">
                        {rows.map((row, idx) => (
                            <tr key={row.picks ?? idx} className="border-b border-border/60 transition-colors hover:bg-surface-2/70">
                                <td className="border-r border-border bg-surface-2/70 p-2 font-semibold text-foreground">{row.picks}</td>
                                {row.cells.map((className, cellIdx) => (
                                    <td key={cellIdx} className={`p-2 font-medium ${className}`}>
                                        {(row.probs[cellIdx] * 100).toFixed(2)}%
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
