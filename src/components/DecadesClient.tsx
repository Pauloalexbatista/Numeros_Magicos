'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { calculateDecades, DecadesDistribution } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface DrawWithDecades {
    date: string;
    numbers: number[];
    decades: DecadesDistribution;
    pattern: string;
}

export default function DecadesClient() {
    const [draws, setDraws] = useState<DrawWithDecades[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(50);

    const loadData = async () => {
        setLoading(true);
        try {
            const history = await getHistory();
            const analyzed = history.slice(0, limit).map(draw => {
                const decades = calculateDecades(draw.numbers);
                const pattern = `${decades.d0}-${decades.d10}-${decades.d20}-${decades.d30}-${decades.d40}`;
                return {
                    date: typeof draw.date === 'string' ? draw.date : draw.date.toISOString(),
                    numbers: draw.numbers,
                    decades,
                    pattern
                };
            });
            setDraws(analyzed);
        } catch (error) {
            console.error('Failed to load decades data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [limit]);

    if (loading) return <div className="p-8 text-center text-zinc-500">A carregar análise de dezenas...</div>;

    // Calculate pattern frequency
    const patternFrequency: { [key: string]: number } = {};
    draws.forEach(d => {
        patternFrequency[d.pattern] = (patternFrequency[d.pattern] || 0) + 1;
    });

    const sortedPatterns = Object.entries(patternFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // Calculate average distribution
    const avgDecades = {
        d0: draws.reduce((sum, d) => sum + d.decades.d0, 0) / draws.length,
        d10: draws.reduce((sum, d) => sum + d.decades.d10, 0) / draws.length,
        d20: draws.reduce((sum, d) => sum + d.decades.d20, 0) / draws.length,
        d30: draws.reduce((sum, d) => sum + d.decades.d30, 0) / draws.length,
        d40: draws.reduce((sum, d) => sum + d.decades.d40, 0) / draws.length
    };

    const maxAvg = Math.max(avgDecades.d0, avgDecades.d10, avgDecades.d20, avgDecades.d30, avgDecades.d40);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground p-4 font-sans">
            <main className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">📊 Análise de Dezenas</h1>
                        <p className="text-sm text-muted-foreground">
                            Distribuição dos números por dezenas (1-9, 10-19, 20-29, 30-39, 40-50)
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="px-4 py-2 text-sm font-medium bg-card/50 backdrop-blur-sm border border-border rounded-md"
                        >
                            <option value={50}>50 sorteios</option>
                            <option value={100}>100 sorteios</option>
                            <option value={200}>200 sorteios</option>
                            <option value={500}>500 sorteios</option>
                        </select>
                        <a href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            ← Voltar
                        </a>
                    </div>
                </div>

                <ExplanationCard
                    title="📊 Dezenas"
                    description="Esta análise divide os 50 números em 5 grupos (dezenas) e mostra como os números sorteados se distribuem."
                    points={[
                        {
                            title: "Distribuição Equilibrada",
                            text: "Estatisticamente, espera-se que os 5 números se distribuam de forma relativamente equilibrada pelas dezenas, com padrões como 1-1-1-1-1 ou 0-2-1-1-1."
                        },
                        {
                            title: "Padrões Raros",
                            text: "Padrões como 5-0-0-0-0 (todos os números numa única dezena) são extremamente raros."
                        },
                        {
                            title: "Estratégia",
                            text: "Ao criar uma chave, tente distribuir os números por diferentes dezenas para aumentar a cobertura."
                        }
                    ]}
                />

                {/* Occurrence Indices */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { key: 'd0', label: '1-9', value: avgDecades.d0, expected: 0.9, color: 'from-red-500 to-red-600' },
                        { key: 'd10', label: '10-19', value: avgDecades.d10, expected: 1.0, color: 'from-orange-500 to-orange-600' },
                        { key: 'd20', label: '20-29', value: avgDecades.d20, expected: 1.0, color: 'from-yellow-500 to-yellow-600' },
                        { key: 'd30', label: '30-39', value: avgDecades.d30, expected: 1.0, color: 'from-green-500 to-green-600' },
                        { key: 'd40', label: '40-50', value: avgDecades.d40, expected: 1.1, color: 'from-blue-500 to-blue-600' }
                    ].map(decade => {
                        const index = (decade.value / decade.expected) * 100;

                        const getIndexColor = () => {
                            if (index < 85) return 'bg-white/20 text-white';
                            if (index < 95) return 'bg-white/20 text-white';
                            if (index > 115) return 'bg-white/20 text-white';
                            if (index > 105) return 'bg-white/20 text-white';
                            return 'bg-white/30 text-white border border-white/50';
                        };

                        const getStatus = () => {
                            if (index < 95) return '📉 Abaixo';
                            if (index > 105) return '📈 Acima';
                            return '✅ Normal';
                        };

                        return (
                            <div key={decade.key} className={`bg-gradient-to-br ${decade.color} text-white p-4 rounded-xl shadow-lg`}>
                                <div className="text-xs opacity-90 mb-1">Dezena {decade.label}</div>
                                <div className="text-3xl font-bold mb-1">{decade.value.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    Esperado: {decade.expected}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getIndexColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Average Distribution Chart */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">📈 Distribuição Média por Dezena</h3>
                    <p className="text-xs text-zinc-500 mb-6">Média de números por dezena nos últimos {draws.length} sorteios</p>

                    <div className="space-y-4">
                        {[
                            { key: 'd0', label: '1-9', value: avgDecades.d0, color: 'bg-red-500' },
                            { key: 'd10', label: '10-19', value: avgDecades.d10, color: 'bg-orange-500' },
                            { key: 'd20', label: '20-29', value: avgDecades.d20, color: 'bg-yellow-500' },
                            { key: 'd30', label: '30-39', value: avgDecades.d30, color: 'bg-green-500' },
                            { key: 'd40', label: '40-50', value: avgDecades.d40, color: 'bg-blue-500' }
                        ].map(decade => (
                            <div key={decade.key}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{decade.label}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{decade.value.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${decade.color}`}
                                        style={{ width: `${(decade.value / maxAvg) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pattern Frequency */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">🏆 Padrões Mais Frequentes</h3>
                    <p className="text-xs text-zinc-500 mb-6">Formato: 1-9 | 10-19 | 20-29 | 30-39 | 40-50</p>

                    <div className="space-y-3">
                        {sortedPatterns.map(([pattern, count], idx) => (
                            <div key={pattern} className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full font-bold text-sm text-zinc-700 dark:text-zinc-300">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-mono font-bold text-sm">{pattern}</span>
                                        <span className="text-xs text-zinc-500">{count} vezes ({((count / draws.length) * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx < 3 ? 'bg-amber-500' : 'bg-zinc-400'}`}
                                            style={{ width: `${(count / draws.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Draws Table */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">📋 Últimos Sorteios</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-3 font-medium text-zinc-500">Data</th>
                                    <th className="text-left p-3 font-medium text-zinc-500">Números</th>
                                    <th className="text-center p-3 font-medium text-zinc-500">Padrão</th>
                                </tr>
                            </thead>
                            <tbody>
                                {draws.slice(0, 20).map((draw, idx) => (
                                    <tr key={idx} className="border-b border-border hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                        <td className="p-3 text-muted-foreground">
                                            {new Date(draw.date).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                {draw.numbers.map(n => (
                                                    <div key={n} className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full">
                                                        {n}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                            {draw.pattern}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <ResponsibleGamingFooter />
        </div>
    );
}
