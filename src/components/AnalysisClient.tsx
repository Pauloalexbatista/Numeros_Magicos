'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

import {
    calculateAverage,
    calculateRange,
    getStarParity,
    countPrimes,
    getTensDistribution,
    getQuadrantsDistribution,
    countMultiples,
    calculateStandardDeviation,
    calculateMedian,
    calculateMode,
    calculateAverageDelay,
    getVisualPatterns,
    getDayOfWeek,
    getMonth,
    countRepetitions
} from '@/utils/statistics';
import { Draw } from '@/models/types';

interface AnalysisClientProps {
    numberFrequency: { [key: number]: number };
    limit: number;
    maxFreq: number;
    minFreq: number;
    userRole?: string;
    draws: Draw[];
}

export default function AnalysisClient({ numberFrequency, limit, maxFreq, minFreq, userRole, draws }: AnalysisClientProps) {
    const [compactMode, setCompactMode] = useState(false);
    const [showLogic, setShowLogic] = useState(false);

    const canCopy = userRole === 'PRO' || userRole === 'ADMIN';

    const getColor = (freq: number) => {
        if (maxFreq === minFreq) return 'bg-zinc-100 dark:bg-zinc-800';
        const norm = (freq - minFreq) / (maxFreq - minFreq);
        if (norm >= 0.8) return 'bg-red-600 text-white';
        if (norm >= 0.6) return 'bg-red-500 text-white';
        if (norm >= 0.4) return 'bg-red-400 text-white';
        if (norm >= 0.2) return 'bg-red-300 text-zinc-900';
        return 'bg-red-100 text-zinc-900';
    };

    // Calculate statistics for the sample
    const stats = {
        avgAverage: 0,
        avgRange: 0,
        primesCount: 0,
        starParity: {} as Record<string, number>,
        tensDist: {} as Record<string, number>,
        quadrantsDist: {} as Record<string, number>,
        multiples3: 0,
        multiples5: 0,
        multiples7: 0
    };

    // Advanced Statistics (Phase 4)
    const advancedStats = {
        avgStdDev: 0,
        avgMedian: 0,
        avgDelay: 0
    };

    // Visual Patterns (Phase 5)
    const visualStats = {
        horizontal: 0,
        vertical: 0,
        diagonal: 0
    };

    // Temporal Stats (Phase 6)
    const temporalStats = {
        avgRepetitions: 0,
        tuesdayCount: 0,
        fridayCount: 0,
        monthDist: {} as Record<number, number>
    };

    if (draws && draws.length > 0) {
        let totalAverage = 0;
        let totalRange = 0;
        let totalPrimes = 0;
        let totalMult3 = 0;
        let totalMult5 = 0;
        let totalMult7 = 0;

        let totalStdDev = 0;
        let totalMedian = 0;
        let totalDelay = 0;

        let totalHorizontal = 0;
        let totalVertical = 0;
        let totalDiagonal = 0;

        let totalRepetitions = 0;
        let tuesdays = 0;
        let fridays = 0;

        draws.forEach((d, index) => {
            // Basic Stats
            totalAverage += calculateAverage(d.numbers);
            totalRange += calculateRange(d.numbers);
            totalPrimes += countPrimes(d.numbers);
            totalMult3 += countMultiples(d.numbers, 3);
            totalMult5 += countMultiples(d.numbers, 5);
            totalMult7 += countMultiples(d.numbers, 7);

            const parity = getStarParity(d.stars);
            stats.starParity[parity] = (stats.starParity[parity] || 0) + 1;

            const tens = getTensDistribution(d.numbers);
            stats.tensDist[tens] = (stats.tensDist[tens] || 0) + 1;

            const quads = getQuadrantsDistribution(d.numbers);
            stats.quadrantsDist[quads] = (stats.quadrantsDist[quads] || 0) + 1;

            // Advanced Stats
            totalStdDev += calculateStandardDeviation(d.numbers);
            totalMedian += calculateMedian(d.numbers);

            // Calculate delay based on draws *after* this one in the array (assuming Newest -> Oldest)
            const pastDraws = draws.slice(index + 1);
            totalDelay += calculateAverageDelay(d.numbers, pastDraws);

            // Visual Patterns
            const patterns = getVisualPatterns(d.numbers);
            totalHorizontal += patterns.horizontal;
            totalVertical += patterns.vertical;
            totalDiagonal += patterns.diagonal;

            // Repetitions (compare with NEXT draw in array, which is the PREVIOUS chronological draw)
            const previousDraw = draws[index + 1];
            if (previousDraw) {
                totalRepetitions += countRepetitions(d.numbers, previousDraw.numbers);
            }

            // Day of Week
            const day = getDayOfWeek(d.date);
            if (day === 2) tuesdays++;
            if (day === 5) fridays++;

            // Month
            const month = getMonth(d.date);
            temporalStats.monthDist[month] = (temporalStats.monthDist[month] || 0) + 1;
        });

        stats.avgAverage = Number((totalAverage / draws.length).toFixed(2));
        stats.avgRange = Number((totalRange / draws.length).toFixed(2));
        stats.primesCount = Number((totalPrimes / draws.length).toFixed(2));
        stats.multiples3 = Number((totalMult3 / draws.length).toFixed(2));
        stats.multiples5 = Number((totalMult5 / draws.length).toFixed(2));
        stats.multiples7 = Number((totalMult7 / draws.length).toFixed(2));

        advancedStats.avgStdDev = Number((totalStdDev / draws.length).toFixed(2));
        advancedStats.avgMedian = Number((totalMedian / draws.length).toFixed(2));
        advancedStats.avgDelay = Number((totalDelay / draws.length).toFixed(1));

        visualStats.horizontal = Number((totalHorizontal / draws.length).toFixed(2));
        visualStats.vertical = Number((totalVertical / draws.length).toFixed(2));
        visualStats.diagonal = Number((totalDiagonal / draws.length).toFixed(2));

        // Average repetitions is based on draws-1 comparisons
        const comparisonCount = draws.length > 1 ? draws.length - 1 : 1;
        temporalStats.avgRepetitions = Number((totalRepetitions / comparisonCount).toFixed(2));
        temporalStats.tuesdayCount = tuesdays;
        temporalStats.fridayCount = fridays;
    }

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Helper to get top pattern
    const getTopPattern = (dist: Record<string, number>) => {
        const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? `${sorted[0][0]} (${sorted[0][1]}x)` : 'N/A';
    };

    return (
        <div className={`min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans ${!canCopy ? 'select-none' : ''}`}>
            <main className="w-full mx-auto space-y-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Análise Estatística 📊</h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Amostra: {limit > 0 ? limit : 'Todos'} sorteios
                            </p>
                        </div>

                        {/* Summary Stats in Header */}
                        <div className="hidden md:flex items-center gap-4 text-xs border-l border-zinc-200 dark:border-zinc-700 pl-4 ml-4">
                            <div>
                                <span className="text-zinc-500 mr-1">Média:</span>
                                <span className="font-bold">{stats.avgAverage}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 mr-1">Amplitude:</span>
                                <span className="font-bold">{stats.avgRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
                        {/* Logic Toggle */}
                        <button
                            onClick={() => setShowLogic(!showLogic)}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                            {showLogic ? '📊 Ver Dados' : '📖 Ver Lógica'}
                        </button>

                        {/* Compact Mode Toggle */}
                        <button
                            onClick={() => setCompactMode(!compactMode)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${compactMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {compactMode ? '📊 Compacto' : '📊 Normal'}
                        </button>

                        {/* Controls */}
                        <form method="GET" className="flex items-center gap-2">
                            <label htmlFor="limit" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Amostra:
                            </label>
                            <input
                                type="number"
                                id="limit"
                                name="limit"
                                defaultValue={limit === 0 ? '' : limit.toString()}
                                placeholder="Qtd"
                                className="w-16 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-1"
                            />
                            <button
                                type="submit"
                                className="px-3 py-1 text-xs font-medium text-white bg-zinc-800 dark:bg-zinc-700 rounded hover:bg-zinc-700"
                            >
                                Atualizar
                            </button>
                            <Link
                                href="/analysis?limit=0"
                                className="px-3 py-1 text-xs font-medium text-zinc-600 bg-zinc-200 rounded hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Todos
                            </Link>
                        </form>

                        <Link
                            href="/"
                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-200 rounded hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                        >
                            ← Voltar
                        </Link>

                        <Link
                            href="/analysis/mean-reversion"
                            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                        >
                            📉 Regressão à Média
                        </Link>
                    </div>
                </div>

                {/* Logic Explanation */}
                {showLogic && (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 p-6 rounded-xl border border-red-200 dark:border-red-800">
                        <h2 className="text-2xl font-bold mb-4 text-red-900 dark:text-red-100">
                            📖 Lógica da Análise
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-red-800 dark:text-red-200">
                                    🎯 O que esta página faz?
                                </h3>
                                <p>
                                    Analisa a <strong>frequência de aparição</strong> de cada número (1-50) nos sorteios históricos do
                                    EuroMilhões. Quanto mais vezes um número apareceu, mais "quente" ele é considerado.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-red-800 dark:text-red-200">
                                    🔥 Números Quentes vs ❄️ Números Frios
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <strong className="text-red-600">Vermelho Escuro (Muito Quente):</strong> Números que aparecem
                                        com frequência muito alta (80-100% do máximo)
                                    </li>
                                    <li>
                                        <strong className="text-red-500">Vermelho Médio (Quente):</strong> Números que aparecem com
                                        frequência alta (60-80%)
                                    </li>
                                    <li>
                                        <strong className="text-red-400">Vermelho Claro (Morno):</strong> Números com frequência média
                                        (40-60%)
                                    </li>
                                    <li>
                                        <strong className="text-red-300">Rosa (Frio):</strong> Números com frequência baixa (20-40%)
                                    </li>
                                    <li>
                                        <strong className="text-red-100">Rosa Claro (Muito Frio):</strong> Números que aparecem
                                        raramente (0-20%)
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-red-800 dark:text-red-200">
                                    🎯 Estatísticas Avançadas
                                </h3>
                                <p>
                                    Além da frequência, analisamos padrões como média, amplitude, números primos e distribuição por dezenas.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-red-800 dark:text-red-200">
                                    🔧 Funcionalidades
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <strong>Amostra:</strong> Escolha quantos sorteios recentes analisar (ex: 50, 100, ou todos)
                                    </li>
                                    <li>
                                        <strong>Modo Compacto:</strong> Ver todos os 50 números numa única linha (ideal para telas
                                        grandes)
                                    </li>
                                    <li>
                                        <strong>Estatísticas:</strong> Máx (maior frequência), Mín (menor frequência), Amp (amplitude)
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Aviso Importante</h4>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    Cada sorteio é estatisticamente independente. A probabilidade de cada número é sempre 1/50 (2%),
                                    independentemente do histórico. Use esta análise como ferramenta de apoio, não como garantia.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!showLogic && (
                    <>
                        {/* Statistics Cards */}
                        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Média (N)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.avgAverage}</p>
                                <p className="text-xs text-zinc-400">Média por sorteio</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Amplitude</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.avgRange}</p>
                                <p className="text-xs text-zinc-400">Diferença Maior-Menor</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Primos (Méd)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.primesCount}</p>
                                <p className="text-xs text-zinc-400">Por sorteio</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Múltiplos (Méd)</h3>
                                <div className="flex flex-col text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    <span className="text-xs font-normal text-zinc-500">3: <strong className="text-zinc-900 dark:text-zinc-100">{stats.multiples3}</strong></span>
                                    <span className="text-xs font-normal text-zinc-500">5: <strong className="text-zinc-900 dark:text-zinc-100">{stats.multiples5}</strong></span>
                                    <span className="text-xs font-normal text-zinc-500">7: <strong className="text-zinc-900 dark:text-zinc-100">{stats.multiples7}</strong></span>
                                </div>
                            </div>
                        </section>

                        {/* Advanced Stats (Phase 4) */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Desvio Padrão (Méd)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{advancedStats.avgStdDev}</p>
                                <p className="text-xs text-zinc-400">Dispersão média</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Mediana (Méd)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{advancedStats.avgMedian}</p>
                                <p className="text-xs text-zinc-400">Valor central médio</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Atraso Médio</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{advancedStats.avgDelay}</p>
                                <p className="text-xs text-zinc-400">Sorteios sem sair</p>
                            </div>
                        </section>

                        {/* Visual Patterns (Phase 5) */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Padrão Horizontal (Méd)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{visualStats.horizontal}</p>
                                <p className="text-xs text-zinc-400">Pares lado a lado</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Padrão Vertical (Méd)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{visualStats.vertical}</p>
                                <p className="text-xs text-zinc-400">Pares mesma coluna</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Padrão Diagonal (Méd)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{visualStats.diagonal}</p>
                                <p className="text-xs text-zinc-400">Pares na diagonal</p>
                            </div>
                        </section>

                        {/* Temporal Stats (Phase 6) */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Repetições (Méd)</h3>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{temporalStats.avgRepetitions}</p>
                                <p className="text-xs text-zinc-400">Do sorteio anterior</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Dia da Semana</h3>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="text-center">
                                        <span className="block text-lg font-bold text-zinc-900 dark:text-zinc-100">{temporalStats.tuesdayCount}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase">Terças</span>
                                    </div>
                                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700 mx-2"></div>
                                    <div className="text-center">
                                        <span className="block text-lg font-bold text-zinc-900 dark:text-zinc-100">{temporalStats.fridayCount}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase">Sextas</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Top Mês</h3>
                                <div className="space-y-1 mt-1">
                                    {Object.entries(temporalStats.monthDist)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 2)
                                        .map(([monthIdx, count]) => (
                                            <div key={monthIdx} className="flex justify-between text-xs">
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{monthNames[Number(monthIdx)]}</span>
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{count}x</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </section>

                        {/* Detailed Stats with Visual Bars */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tens Distribution */}
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-sm font-bold mb-4 text-zinc-700 dark:text-zinc-300">Distribuição por Dezenas</h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.tensDist)
                                        .sort((a, b) => {
                                            // Sort by the range start number to keep order 0-9, 10-19...
                                            const getStart = (s: string) => parseInt(s.split('-')[0]);
                                            return getStart(a[0]) - getStart(b[0]);
                                        })
                                        .map(([pattern, count]) => {
                                            const percentage = Math.round((count / (limit || draws.length)) * 100);
                                            // Max possible for a single pattern in one draw is 5, but we are counting occurrences across draws.
                                            // Actually, stats.tensDist counts how many times a SPECIFIC PATTERN (e.g. "2-1-1-1-0-0") appeared.
                                            // Wait, getTensDistribution returns a string like "2-1-1-1-0-0".
                                            // So we are visualizing which *distribution patterns* are most common.
                                            // Let's stick to the top 5 patterns to avoid clutter, or show all if few.
                                            return { pattern, count, percentage };
                                        })
                                        .sort((a, b) => b.count - a.count) // Sort by frequency
                                        .slice(0, 5) // Top 5 patterns
                                        .map((item, idx) => {
                                            const maxCount = Math.max(...Object.values(stats.tensDist));
                                            const width = `${(item.count / maxCount) * 100}%`;
                                            return (
                                                <div key={item.pattern} className="text-xs">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-mono text-zinc-600 dark:text-zinc-400">{item.pattern}</span>
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.count}x</span>
                                                    </div>
                                                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-blue-500 h-full rounded-full"
                                                            style={{ width }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-3 text-center">Formato: 0-9, 10-19, 20-29, 30-39, 40-49, 50</p>
                            </div>

                            {/* Quadrants Distribution */}
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-sm font-bold mb-4 text-zinc-700 dark:text-zinc-300">Distribuição por Quadrantes</h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.quadrantsDist)
                                        .map(([pattern, count]) => ({ pattern, count }))
                                        .sort((a, b) => b.count - a.count)
                                        .slice(0, 5)
                                        .map((item) => {
                                            const maxCount = Math.max(...Object.values(stats.quadrantsDist));
                                            const width = `${(item.count / maxCount) * 100}%`;
                                            return (
                                                <div key={item.pattern} className="text-xs">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-mono text-zinc-600 dark:text-zinc-400">{item.pattern}</span>
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.count}x</span>
                                                    </div>
                                                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-purple-500 h-full rounded-full"
                                                            style={{ width }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-3 text-center">Formato: Q1, Q2, Q3, Q4</p>
                            </div>

                            {/* Month Distribution (New) */}
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 md:col-span-2">
                                <h3 className="text-sm font-bold mb-4 text-zinc-700 dark:text-zinc-300">Sazonalidade (Meses)</h3>
                                <div className="flex items-end justify-between h-32 gap-2">
                                    {Object.entries(temporalStats.monthDist)
                                        .sort((a, b) => Number(a[0]) - Number(b[0])) // Sort by month index Jan-Dec
                                        .map(([monthIdx, count]) => {
                                            const maxCount = Math.max(...Object.values(temporalStats.monthDist));
                                            const height = `${(count / maxCount) * 100}%`;
                                            const isTop = count === maxCount;
                                            return (
                                                <div key={monthIdx} className="flex-1 flex flex-col items-center justify-end h-full group">
                                                    <div className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {count}
                                                    </div>
                                                    <div
                                                        className={`w-full rounded-t-sm transition-all duration-300 ${isTop ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'}`}
                                                        style={{ height }}
                                                    ></div>
                                                    <div className="text-[10px] text-zinc-500 mt-1 uppercase">
                                                        {monthNames[Number(monthIdx)].substring(0, 3)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </section>

                        {/* Numbers Grid */}
                        <section className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-4">
                            <div className={compactMode ? 'overflow-x-auto' : ''}>
                                <div className={compactMode ? 'min-w-max' : ''}>
                                    {/* Header Row with Numbers */}
                                    <div
                                        className={`flex mb-2 font-mono text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1 ${compactMode ? 'text-[8px]' : 'text-[10px]'
                                            }`}
                                    >
                                        <div className={compactMode ? 'w-6 text-center' : 'w-8 text-center'}>#</div>
                                        {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                                            <div
                                                key={`h-${num}`}
                                                className={`flex-1 text-center ${compactMode ? 'min-w-[20px]' : 'min-w-[28px]'}`}
                                            >
                                                {num}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Frequency Row */}
                                    <div className="flex items-center">
                                        <div className={`font-bold text-zinc-500 ${compactMode ? 'w-6 text-[8px]' : 'w-8 text-[10px]'}`}>
                                            Freq
                                        </div>
                                        {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
                                            const freq = numberFrequency[num];
                                            const color = getColor(freq);
                                            return (
                                                <div
                                                    key={num}
                                                    className={`flex-1 flex flex-col items-center gap-1 group ${compactMode ? 'min-w-[20px]' : 'min-w-[28px]'
                                                        }`}
                                                >
                                                    <div
                                                        className={`
                              ${color} 
                              w-full 
                              ${compactMode ? 'aspect-[2/3] text-[10px]' : 'aspect-[3/4] text-xs'} 
                              flex items-center justify-center 
                              font-bold 
                              rounded-sm
                              transition-all duration-200
                              ${compactMode ? 'group-hover:scale-125' : 'group-hover:scale-110'} 
                              group-hover:z-10 group-hover:shadow-md
                            `}
                                                    >
                                                        {freq}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Compact Mode Info */}
                            {compactMode && (
                                <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                                    💡 Modo Compacto ativado - Todos os 50 números visíveis numa linha
                                </div>
                            )}
                        </section>

                        {/* Legend */}
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-4">
                            <h3 className="text-sm font-semibold mb-2">Legenda de Cores:</h3>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                                    <span>Muito quente (80-100%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span>Quente (60-80%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                                    <span>Morno (40-60%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-300 rounded"></div>
                                    <span>Frio (20-40%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-100 rounded"></div>
                                    <span>Muito frio (0-20%)</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <ResponsibleGamingFooter />
            </main>
        </div >
    );
}
