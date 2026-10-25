"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    Layers, 
    ArrowRightLeft, 
    Sun, 
    Moon, 
    ExternalLink, 
    Sparkles, 
    TrendingUp, 
    SlidersHorizontal,
    Activity
} from 'lucide-react';
import { PolarityRankingItem, SYSTEM_FAMILIES } from '@/types/polarity';

const GAMES = [
    { key: 'EUROMILLIONS', name: 'Euromilhões', color: 'from-amber-500 to-yellow-600' },
    { key: 'TOTOLOTO', name: 'Totoloto', color: 'from-blue-500 to-indigo-600' },
    { key: 'EURODREAMS', name: 'EuroDreams', color: 'from-purple-500 to-pink-600' },
    { key: 'MEGASENA', name: 'Mega-Sena', color: 'from-emerald-500 to-teal-600' },
    { key: 'LOTOFACIL', name: 'Lotofácil', color: 'from-purple-600 to-pink-600' }
];

export default function SeparacaoExtremosClient() {
    const [selectedGame, setSelectedGame] = useState('EUROMILLIONS');
    const [sortMode, setSortMode] = useState<'EXTREMES' | 'DIRECT' | 'MIRROR'>('EXTREMES');
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<PolarityRankingItem[]>([]);

    useEffect(() => {
        let isMounted = true;
        async function fetchRanking() {
            setLoading(true);
            try {
                const res = await fetch(`/api/tools/separacao-extremos?game=${selectedGame}`);
                const json = await res.json();
                if (json.success && isMounted) {
                    setRanking(json.data.ranking);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchRanking();
        return () => { isMounted = false; };
    }, [selectedGame]);

    const sortedList = useMemo(() => {
        const copy = [...ranking];
        if (sortMode === 'DIRECT') {
            copy.sort((a, b) => b.directJackpots - a.directJackpots || b.extremeSeparationRate - a.extremeSeparationRate);
        } else if (sortMode === 'MIRROR') {
            copy.sort((a, b) => b.mirrorJackpots - a.mirrorJackpots || b.extremeSeparationRate - a.extremeSeparationRate);
        } else {
            copy.sort((a, b) => b.extremeSeparationRate - a.extremeSeparationRate || (b.directJackpots + b.mirrorJackpots) - (a.directJackpots + a.mirrorJackpots));
        }
        return copy;
    }, [ranking, sortMode]);

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Games */}
                <div className="flex flex-wrap items-center gap-2">
                    {GAMES.map(g => (
                        <button
                            key={g.key}
                            onClick={() => setSelectedGame(g.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                selectedGame === g.key
                                    ? `bg-gradient-to-r ${g.color} text-white shadow-md`
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {g.name}
                        </button>
                    ))}
                </div>

                {/* Sort Mode Filter */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 mr-1">Ordenar por:</span>
                    <button
                        onClick={() => setSortMode('EXTREMES')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            sortMode === 'EXTREMES'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        ⚡ Maior Separação (% Extremos)
                    </button>
                    <button
                        onClick={() => setSortMode('DIRECT')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            sortMode === 'DIRECT'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        ☀️ Mais Jackpots Diretos (5-0)
                    </button>
                    <button
                        onClick={() => setSortMode('MIRROR')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            sortMode === 'MIRROR'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        🌑 Mais Jackpots Espelho (0-5)
                    </button>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-gray-400 uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="p-4 font-bold"># Rank</th>
                                <th className="p-4 font-bold">Sistema</th>
                                <th className="p-4 font-bold">Família</th>
                                <th className="p-4 text-center font-bold text-amber-600 dark:text-amber-400">☀️ Jackpots Direto</th>
                                <th className="p-4 text-center font-bold text-purple-600 dark:text-purple-400">🌑 Jackpots Espelho</th>
                                <th className="p-4 text-center font-bold">Total Extremos</th>
                                <th className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400">Separação Extrema (%)</th>
                                <th className="p-4 text-center font-bold text-rose-500">Ruído Central (%)</th>
                                <th className="p-4 text-center font-bold">Bússola Hoje</th>
                                <th className="p-4 text-center font-bold">Cruzador</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="p-12 text-center text-slate-500 animate-pulse">
                                        A carregar estatísticas completas de polaridade...
                                    </td>
                                </tr>
                            ) : sortedList.map((item, idx) => {
                                const familyConfig = SYSTEM_FAMILIES[item.family] || { name: item.family, icon: '⚙️' };
                                return (
                                    <tr key={item.systemSlug} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="p-4 font-mono font-bold text-slate-400">
                                            #{idx + 1}
                                        </td>
                                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                                            {item.systemName}
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-slate-500 dark:text-gray-400 whitespace-nowrap">
                                            <span className="mr-1">{familyConfig.icon}</span>
                                            {familyConfig.name.split(' ')[0]}
                                        </td>
                                        <td className="p-4 text-center font-mono font-black text-amber-500">
                                            {item.directJackpots}
                                        </td>
                                        <td className="p-4 text-center font-mono font-black text-purple-500">
                                            {item.mirrorJackpots}
                                        </td>
                                        <td className="p-4 text-center font-mono font-extrabold text-slate-900 dark:text-white">
                                            {item.totalExtremeJackpots}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                {item.extremeSeparationRate}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-mono text-xs text-rose-500 font-bold">
                                            {item.centralNoiseRate}%
                                        </td>
                                        <td className="p-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                                                item.recommendation === 'DIRECT'
                                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                                    : item.recommendation === 'MIRROR'
                                                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-300'
                                            }`}>
                                                {item.recommendation === 'DIRECT' ? <Sun className="w-3 h-3 text-amber-500" /> : item.recommendation === 'MIRROR' ? <Moon className="w-3 h-3 text-purple-400" /> : null}
                                                {item.recommendation === 'DIRECT' ? '☀️ DIRETO' : item.recommendation === 'MIRROR' ? '🌑 ESPELHO' : '⚖️ NEUTRO'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link
                                                href={`/tools/cruzador?game=${selectedGame}&system=${item.systemSlug}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition border border-indigo-200 dark:border-indigo-800"
                                            >
                                                Cruzar <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
