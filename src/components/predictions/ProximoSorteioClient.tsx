"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    Copy, 
    Check, 
    Dices, 
    Sun, 
    Moon, 
    ExternalLink, 
    Compass, 
    Layers 
} from 'lucide-react';
import { NextDrawSuggestionItem, SYSTEM_FAMILIES } from '@/services/polarity-compass';

const GAMES = [
    { key: 'EUROMILLIONS', name: 'Euromilhões', color: 'from-amber-500 to-yellow-600' },
    { key: 'TOTOLOTO', name: 'Totoloto', color: 'from-blue-500 to-indigo-600' },
    { key: 'EURODREAMS', name: 'EuroDreams', color: 'from-purple-500 to-pink-600' },
    { key: 'MEGASENA', name: 'Mega-Sena', color: 'from-emerald-500 to-teal-600' }
];

export default function ProximoSorteioClient() {
    const [selectedGame, setSelectedGame] = useState('EUROMILLIONS');
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<NextDrawSuggestionItem[]>([]);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchSuggestions() {
            setLoading(true);
            try {
                const res = await fetch(`/api/previsoes/proximo-sorteio?game=${selectedGame}`);
                const json = await res.json();
                if (json.success && isMounted) {
                    setSuggestions(json.data.suggestions);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchSuggestions();
        return () => { isMounted = false; };
    }, [selectedGame]);

    const handleCopy = (key: string, nums: number[]) => {
        navigator.clipboard.writeText(nums.join(', '));
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Game Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                {GAMES.map(g => (
                    <button
                        key={g.key}
                        onClick={() => setSelectedGame(g.key)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                            selectedGame === g.key
                                ? `bg-gradient-to-r ${g.color} text-white shadow-md`
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        {g.name}
                    </button>
                ))}
            </div>

            {/* Suggestions Table / Cards */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-gray-400 uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="p-4 font-bold">Sistema</th>
                                <th className="p-4 font-bold">Família</th>
                                <th className="p-4 text-center font-bold">Bússola</th>
                                <th className="p-4 font-bold">Chave Top 5 (Recomendada)</th>
                                <th className="p-4 font-bold">Top 10</th>
                                <th className="p-4 text-center font-bold">Ações Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500 animate-pulse">
                                        A carregar previsões de todos os sistemas...
                                    </td>
                                </tr>
                            ) : suggestions.map((item) => {
                                const familyConfig = SYSTEM_FAMILIES[item.family] || { name: item.family, icon: '⚙️' };
                                const isDirect = item.recommendation !== 'MIRROR';
                                const activeTop5 = isDirect ? item.top5 : item.mirrorHalf.slice(0, 5);
                                const activeTop10 = isDirect ? item.top10 : item.mirrorHalf.slice(0, 10);
                                const copyId = `${item.systemSlug}_${isDirect ? 'dir' : 'mir'}`;

                                return (
                                    <tr key={item.systemSlug} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="p-4 font-black text-slate-900 dark:text-white whitespace-nowrap">
                                            {item.systemName}
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-slate-500 dark:text-gray-400 whitespace-nowrap">
                                            <span className="mr-1">{familyConfig.icon}</span>
                                            {familyConfig.name.split(' ')[0]}
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
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                {activeTop5.map(n => (
                                                    <span 
                                                        key={n}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs shadow-sm ${
                                                            isDirect 
                                                                ? 'bg-amber-500 text-black font-extrabold ring-1 ring-amber-400' 
                                                                : 'bg-purple-600 text-white font-extrabold ring-1 ring-purple-400'
                                                        }`}
                                                    >
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 items-center">
                                                {activeTop10.map(n => (
                                                    <span 
                                                        key={n}
                                                        className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-gray-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono text-[11px] font-bold"
                                                    >
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleCopy(copyId, activeTop5)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1 transition"
                                                    title="Copiar Chave Top 5"
                                                >
                                                    {copiedKey === copyId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    {copiedKey === copyId ? 'Copiado!' : 'Copiar'}
                                                </button>

                                                <Link
                                                    href={`/tools/cruzador?game=${selectedGame}&system=${item.systemSlug}`}
                                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                                                    title="Abrir no Cruzador com Matriz de Corte"
                                                >
                                                    <Compass className="w-3 h-3" />
                                                    Cruzar
                                                </Link>
                                            </div>
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
