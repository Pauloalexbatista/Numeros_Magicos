'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatternsPage() {
    const [type, setType] = useState<'frequency' | 'streaks'>('frequency');
    const [limit, setLimit] = useState<string>('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showLogic, setShowLogic] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        async function fetchData() {
            const params = new URLSearchParams();
            params.set('type', type);
            if (limit) params.set('limit', limit);

            try {
                const res = await fetch(`/api/patterns?${params.toString()}`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (error) {
                if (!cancelled) console.error('Error fetching patterns:', error);
            }
            if (!cancelled) setLoading(false);
        }

        fetchData();
        return () => { cancelled = true; };
    }, [type, limit]);

    const colorToClasses = (color: 'blue' | 'green' | 'purple' | 'amber', ratio: number, max: number) => {
        const intensity = max === 0 ? 0 : ratio / max;
        if (intensity >= 0.4 && (color === 'blue' || color === 'purple')) {
            return { bg: 'bg-accent/25', text: 'text-foreground' };
        }
        if (intensity >= 0.2) {
            return { bg: 'bg-surface-2', text: 'text-foreground' };
        }
        return { bg: 'bg-surface-2/60', text: 'text-muted-foreground' };
    };

    const getHeatColor = (value: number, max: number, reverse: boolean = false) => {
        if (max === 0) return '#13151C';
        let ratio = Math.min(1, Math.max(0, value / max));
        if (reverse) ratio = 1 - ratio;
        // stays within token palette via inline style; consistent with unified tokens
        return ratio > 0.7
            ? 'rgba(74,143,231,0.18)'
            : ratio > 0.35
                ? 'rgba(74,143,231,0.10)'
                : 'rgba(255,255,255,0.03)';
    };

    const renderFrequency = () => {
        if (!data?.data) return null;
        const { numberFreq, starFreq } = data.data;
        if (!numberFreq || !starFreq) return null;
        const maxNum = Math.max(...Object.values(numberFreq) as number[]);
        const maxStar = Math.max(...Object.values(starFreq) as number[]);

        return (
            <div className="space-y-8">
                <section className="space-y-2">
                    <h3 className="text-lg font-semibold">Frequência dos Números (1-50)</h3>
                    <p className="text-sm text-muted-foreground">Quantas vezes cada número apareceu nos sorteios.</p>
                    <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                            <div
                                key={num}
                                className="rounded-lg border border-border p-3 text-center text-sm font-medium shadow-sm"
                                style={{ backgroundColor: getHeatColor(numberFreq[num] || 0, maxNum) }}
                            >
                                <div className="font-bold text-foreground">{num}</div>
                                <div className={`text-xs font-semibold text-muted-foreground`}>{numberFreq[num] || 0}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-2">
                    <h3 className="text-lg font-semibold">Frequência das Estrelas (1-12)</h3>
                    <p className="text-sm text-muted-foreground">Quantas vezes cada estrela apareceu nos sorteios.</p>
                    <div className="grid grid-cols-12 gap-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((star) => (
                            <div
                                key={star}
                                className="rounded-lg border border-border p-3 text-center text-sm font-medium shadow-sm"
                                style={{ backgroundColor: getHeatColor(starFreq[star] || 0, maxStar) }}
                            >
                                <div className="font-bold text-foreground">{star}</div>
                                <div className={`text-xs font-semibold text-muted-foreground`}>{starFreq[star] || 0}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    };

    const renderStreaks = () => {
        if (!data?.data) return null;
        const {
            numberPresenceStreak,
            numberAbsenceStreak,
            starPresenceStreak,
            starAbsenceStreak,
        } = data.data;

        if (!numberPresenceStreak || !numberAbsenceStreak || !starPresenceStreak || !starAbsenceStreak) {
            return (
                <div className="py-12 text-center text-muted-foreground">
                    Erro ao carregar dados de sequências. Por favor, tente novamente.
                </div>
            );
        }

        const maxPresenceNum = Math.max(...Object.values(numberPresenceStreak) as number[]);
        const maxAbsenceNum = Math.max(...Object.values(numberAbsenceStreak) as number[]);
        const maxPresenceStar = Math.max(...Object.values(starPresenceStreak) as number[]);
        const maxAbsenceStar = Math.max(...Object.values(starAbsenceStreak) as number[]);

        return (
            <div className="space-y-8">
                <section className="space-y-2">
                    <h3 className="text-lg font-semibold">Sequências de Presença – Números</h3>
                    <p className="text-sm text-muted-foreground">Maior número de sorteios consecutivos onde o número apareceu.</p>
                    <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                            <div
                                key={num}
                                className="rounded-lg border border-border p-3 text-center text-sm font-medium shadow-sm"
                                style={{ backgroundColor: getHeatColor(numberPresenceStreak[num] || 0, maxPresenceNum) }}
                            >
                                <div className="font-bold text-foreground">{num}</div>
                                <div className={`text-xs font-semibold text-muted-foreground`}>{numberPresenceStreak[num] || 0}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-2">
                    <h3 className="text-lg font-semibold">Sequências de Ausência – Números</h3>
                    <p className="text-sm text-muted-foreground">Maior número de sorteios consecutivos onde o número NÃO apareceu.</p>
                    <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                            <div
                                key={num}
                                className="rounded-lg border border-border p-3 text-center text-sm font-medium shadow-sm"
                                style={{ backgroundColor: getHeatColor(numberAbsenceStreak[num] || 0, maxAbsenceNum, true) }}
                            >
                                <div className="font-bold text-foreground">{num}</div>
                                <div className={`text-xs font-semibold text-muted-foreground`}>{numberAbsenceStreak[num] || 0}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-2">
                    <h3 className="text-lg font-semibold">Sequências de Presença – Estrelas</h3>
                    <p className="text-sm text-muted-foreground">Maior número de sorteios consecutivos onde a estrela apareceu.</p>
                    <div className="grid grid-cols-12 gap-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((star) => (
                            <div
                                key={star}
                                className="rounded-lg border border-border p-3 text-center text-sm font-medium shadow-sm"
                                style={{ backgroundColor: getHeatColor(starPresenceStreak[star] || 0, maxPresenceStar) }}
                            >
                                <div className="font-bold text-foreground">{star}</div>
                                <div className={`text-xs font-semibold text-muted-foreground`}>{starPresenceStreak[star] || 0}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-2">
                    <h3 className="text-lg font-semibold">Sequências de Ausência – Estrelas</h3>
                    <p className="text-sm text-muted-foreground">Maior número de sorteios consecutivos onde a estrela NÃO apareceu.</p>
                    <div className="grid grid-cols-12 gap-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((star) => (
                            <div
                                key={star}
                                className="rounded-lg border border-border p-3 text-center text-sm font-medium shadow-sm"
                                style={{ backgroundColor: getHeatColor(starAbsenceStreak[star] || 0, maxAbsenceStar, true) }}
                            >
                                <div className="font-bold text-foreground">{star}</div>
                                <div className={`text-xs font-semibold text-muted-foreground`}>{starAbsenceStreak[star] || 0}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    };

    const renderRecommendations = () => {
        if (!data?.data || type !== 'frequency') return null;

        const { numberFreq } = data.data;
        if (!numberFreq) return null;

        const sortedNumbers = Object.entries(numberFreq)
            .map(([num, freq]) => ({ num: parseInt(num), freq: freq as number }))
            .sort((a, b) => b.freq - a.freq);

        const top10Hot = sortedNumbers.slice(0, 10);
        const top10Cold = sortedNumbers.slice(-10).reverse();

        const balanced = [
            ...top10Hot.slice(0, 3),
            ...top10Cold.slice(0, 2),
        ].sort((a, b) => a.num - b.num);

        return (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">💡 Recomendações</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-surface-1/60 p-4 shadow-sm">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                            🔥 Top 10 Mais Quentes
                        </h4>
                        <p className="mb-3 text-xs text-muted-foreground">Números que aparecem com mais frequência</p>
                        <div className="space-y-2">
                            {top10Hot.map((item, idx) => (
                                <div key={item.num} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        #{idx + 1} - Número {item.num}
                                    </span>
                                    <span className="rounded bg-surface-2 px-2 py-1 text-xs font-bold text-foreground">
                                        {item.freq}x
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-1/60 p-4 shadow-sm">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                            ❄️ Top 10 Mais Frios
                        </h4>
                        <p className="mb-3 text-xs text-muted-foreground">Números que aparecem com menos frequência</p>
                        <div className="space-y-2">
                            {top10Cold.map((item, idx) => (
                                <div key={item.num} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        #{idx + 1} - Número {item.num}
                                    </span>
                                    <span className="rounded bg-surface-2 px-2 py-1 text-xs font-bold text-foreground">
                                        {item.freq}x
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-surface-1 text-foreground p-4 font-sans md:p-8">
            <main className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detecção de Padrões 🔎</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Análise avançada de frequências e streaks de números e estrelas</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowLogic((value) => !value)}
                            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
                        >
                            {showLogic ? '📊 Ver Dados' : '📖 Ver Lógica'}
                        </button>
                        <Link
                            href="/"
                            className="rounded-md border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:brightness-110"
                        >
                            ← Voltar
                        </Link>
                    </div>
                </div>

                {/* Logic Explanation */}
                {showLogic && (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                        <h2 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">
                            📖 Lógica da Detecção de Padrões
                        </h2>

                        <div className="space-y-6 text-sm">
                            {/* Frequency Mode */}
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-purple-800 dark:text-purple-200">
                                    📊 Modo Frequência
                                </h3>
                                <p className="mb-2">Mostra quantas vezes cada número apareceu nos sorteios históricos.</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <strong>Azul Escuro (Quentes):</strong> Números que aparecem mais frequentemente
                                    </li>
                                    <li>
                                        <strong>Azul Claro (Frios):</strong> Números que aparecem menos frequentemente
                                    </li>
                                </ul>
                            </div>

                            {/* Streaks Mode */}
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-purple-800 dark:text-purple-200">
                                    📈 Modo Sequências
                                </h3>
                                <p className="mb-2">Analisa sequências consecutivas de aparições e ausências.</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <strong>Sequências de Presença (Azul):</strong> Maior sequência de sorteios consecutivos onde o
                                        número apareceu
                                    </li>
                                    <li>
                                        <strong>Sequências de Ausência (Vermelho):</strong> Maior sequência de sorteios consecutivos onde
                                        o número NÃO apareceu
                                    </li>
                                </ul>
                            </div>

                            {/* Practical Use */}
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-purple-800 dark:text-purple-200">
                                    🎯 Como Usar na Prática
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4 mt-3">
                                    <div className="bg-card/50 backdrop-blur-sm p-3 rounded-lg">
                                        <h4 className="font-semibold text-red-600 mb-1">Estratégia "Quentes"</h4>
                                        <p className="text-xs">Apostar em números com alta frequência (teoria: continuarão a sair)</p>
                                    </div>
                                    <div className="bg-card/50 backdrop-blur-sm p-3 rounded-lg">
                                        <h4 className="font-semibold text-blue-600 mb-1">Estratégia "Frios"</h4>
                                        <p className="text-xs">
                                            Apostar em números com baixa frequência (teoria: estão "devidos")
                                        </p>
                                    </div>
                                    <div className="bg-card/50 backdrop-blur-sm p-3 rounded-lg">
                                        <h4 className="font-semibold text-green-600 mb-1">Estratégia "Balanceada"</h4>
                                        <p className="text-xs">Misturar números quentes e frios (equilíbrio)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Aviso Importante</h4>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    Cada sorteio é estatisticamente independente. Não existe "número devido" matematicamente. Use
                                    estas análises como ferramenta de apoio para decisões informadas, não como garantia.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!showLogic && (
                    <>
                        {/* Controls */}
                        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-border">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="flex gap-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="frequency"
                                            checked={type === 'frequency'}
                                            onChange={() => setType('frequency')}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="font-medium">Frequência</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="streaks"
                                            checked={type === 'streaks'}
                                            onChange={() => setType('streaks')}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="font-medium">Sequências</span>
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium">Últimos sorteios:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="todos"
                                        value={limit}
                                        onChange={(e) => setLimit(e.target.value)}
                                        className="w-24 px-3 py-1 border border-border rounded-md bg-card/50 backdrop-blur-sm text-sm"
                                    />
                                </div>

                                {data && (
                                    <div className="text-sm text-zinc-500">Analisando {data.drawsUsed} sorteios</div>
                                )}
                            </div>
                        </div>

                        {/* Results */}
                        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-border">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-zinc-500">Carregando dados...</p>
                                </div>
                            ) : (
                                <>
                                    {type === 'frequency' && renderFrequency()}
                                    {type === 'streaks' && renderStreaks()}
                                </>
                            )}
                        </div>

                        {/* Recommendations */}
                        {!loading && type === 'frequency' && (
                            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-border">
                                {renderRecommendations()}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-border">
                            <h3 className="text-sm font-semibold mb-2">Legenda:</h3>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {type === 'frequency' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(55, 55, 255)' }}></div>
                                        <span>Alta frequência</span>
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(240, 240, 255)' }}></div>
                                        <span>Baixa frequência</span>
                                    </div>
                                )}
                                {type === 'streaks' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(55, 55, 255)' }}></div>
                                            <span>Sequências longas (presença)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(255, 55, 55)' }}></div>
                                            <span>Sequências longas (ausência)</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
