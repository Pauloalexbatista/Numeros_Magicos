'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { calculateQuadrants, QuadrantsDistribution } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';
import { BackButton } from '@/components/ui';

interface DrawWithQuadrants {
    date: string;
    numbers: number[];
    quadrants: QuadrantsDistribution;
    pattern: string;
}

export default function QuadrantsClient() {
    const [draws, setDraws] = useState<DrawWithQuadrants[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(50);

    const loadData = async () => {
        setLoading(true);
        try {
            const history = await getHistory();
            const analyzed = history.slice(0, limit).map(draw => {
                const quadrants = calculateQuadrants(draw.numbers);
                const pattern = `${quadrants.q1}-${quadrants.q2}-${quadrants.q3}-${quadrants.q4}`;
                return {
                    date: typeof draw.date === 'string' ? draw.date : draw.date.toISOString(),
                    numbers: draw.numbers,
                    quadrants,
                    pattern
                };
            });
            setDraws(analyzed);
        } catch (error) {
            console.error('Failed to load quadrants data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [limit]);

    if (loading) return <div className="p-8 text-center text-zinc-500">A carregar análise de quadrantes...</div>;

    // Calculate pattern frequency
    const patternFrequency: { [key: string]: number } = {};
    draws.forEach(d => {
        patternFrequency[d.pattern] = (patternFrequency[d.pattern] || 0) + 1;
    });

    const sortedPatterns = Object.entries(patternFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // Calculate average distribution
    const avgQuadrants = {
        q1: draws.reduce((sum, d) => sum + d.quadrants.q1, 0) / draws.length,
        q2: draws.reduce((sum, d) => sum + d.quadrants.q2, 0) / draws.length,
        q3: draws.reduce((sum, d) => sum + d.quadrants.q3, 0) / draws.length,
        q4: draws.reduce((sum, d) => sum + d.quadrants.q4, 0) / draws.length
    };

    const maxAvg = Math.max(avgQuadrants.q1, avgQuadrants.q2, avgQuadrants.q3, avgQuadrants.q4);

    return (
        <div className="min-h-screen bg-surface-1 text-foreground transition-all duration-500 text-foreground p-4 font-sans">
            <main className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton href="/" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">🎯 Análise de Quadrantes</h1>
                            <p className="text-sm text-muted-foreground">
                                Distribuição dos números por 4 quadrantes (Q1: 1-12, Q2: 13-25, Q3: 26-37, Q4: 38-50)
                            </p>
                        </div>
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
                    </div>
                </div>

                <ExplanationCard
                    title="🎯 Quadrantes"
                    description="Esta análise divide os 50 números em 4 quadrantes iguais e mostra como os números sorteados se distribuem."
                    points={[
                        {
                            title: "Divisão Equilibrada",
                            text: "Os quadrantes dividem o boletim em 4 zonas: Q1 (1-12), Q2 (13-25), Q3 (26-37), Q4 (38-50). Cada quadrante tem aproximadamente 12-13 números."
                        },
                        {
                            title: "Padrões Comuns",
                            text: "Padrões equilibrados como 1-1-2-1 ou 1-2-1-1 são mais comuns. Padrões extremos como 5-0-0-0 são raríssimos."
                        },
                        {
                            title: "Estratégia de Cobertura",
                            text: "Ao criar uma chave, tente incluir números de pelo menos 3 quadrantes diferentes para maximizar a cobertura do boletim."
                        }
                    ]}
                />

                {/* Occurrence Indices */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: 'q1', label: 'Q1 (1-12)', value: avgQuadrants.q1, expected: 1.2, color: 'from-red-500 to-red-600' },
                        { key: 'q2', label: 'Q2 (13-25)', value: avgQuadrants.q2, expected: 1.3, color: 'from-blue-500 to-blue-600' },
                        { key: 'q3', label: 'Q3 (26-37)', value: avgQuadrants.q3, expected: 1.2, color: 'from-green-500 to-green-600' },
                        { key: 'q4', label: 'Q4 (38-50)', value: avgQuadrants.q4, expected: 1.3, color: 'from-purple-500 to-purple-600' }
                    ].map(quadrant => {
                        const index = (quadrant.value / quadrant.expected) * 100;

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
                            <div key={quadrant.key} className={`bg-gradient-to-br ${quadrant.color} text-white p-4 rounded-xl shadow-lg`}>
                                <div className="text-xs opacity-90 mb-1">{quadrant.label}</div>
                                <div className="text-3xl font-bold mb-1">{quadrant.value.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    Esperado: {quadrant.expected}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getIndexColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Visual Quadrants Representation */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">🗺️ Representação Visual dos Quadrantes</h3>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {[
                            { key: 'q1', label: 'Q1', range: '1-12', value: avgQuadrants.q1, color: 'bg-red-500' },
                            { key: 'q2', label: 'Q2', range: '13-25', value: avgQuadrants.q2, color: 'bg-blue-500' },
                            { key: 'q3', label: 'Q3', range: '26-37', value: avgQuadrants.q3, color: 'bg-green-500' },
                            { key: 'q4', label: 'Q4', range: '38-50', value: avgQuadrants.q4, color: 'bg-purple-500' }
                        ].map(quadrant => (
                            <div key={quadrant.key} className={`${quadrant.color} text-white p-6 rounded-xl shadow-lg`}>
                                <div className="text-3xl font-bold mb-2">{quadrant.label}</div>
                                <div className="text-sm opacity-90 mb-3">{quadrant.range}</div>
                                <div className="text-2xl font-bold">{quadrant.value.toFixed(2)}</div>
                                <div className="text-xs opacity-75">média/sorteio</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Average Distribution Chart */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">📈 Distribuição Média por Quadrante</h3>
                    <p className="text-xs text-zinc-500 mb-6">Média de números por quadrante nos últimos {draws.length} sorteios</p>

                    <div className="space-y-4">
                        {[
                            { key: 'q1', label: 'Q1 (1-12)', value: avgQuadrants.q1, color: 'bg-red-500' },
                            { key: 'q2', label: 'Q2 (13-25)', value: avgQuadrants.q2, color: 'bg-blue-500' },
                            { key: 'q3', label: 'Q3 (26-37)', value: avgQuadrants.q3, color: 'bg-green-500' },
                            { key: 'q4', label: 'Q4 (38-50)', value: avgQuadrants.q4, color: 'bg-purple-500' }
                        ].map(quadrant => (
                            <div key={quadrant.key}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{quadrant.label}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{quadrant.value.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${quadrant.color}`}
                                        style={{ width: `${(quadrant.value / maxAvg) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pattern Frequency */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">🏆 Padrões Mais Frequentes</h3>
                    <p className="text-xs text-zinc-500 mb-6">Formato: Q1 | Q2 | Q3 | Q4</p>

                    <div className="space-y-3">
                        {sortedPatterns.map(([pattern, count], idx) => (
                            <div key={pattern} className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-surface-2 text-foreground rounded-full font-bold text-sm text-zinc-700 dark:text-zinc-300">
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
