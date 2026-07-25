"use client";

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Trophy, Calendar, Hash, Filter, Loader2, Medal, Crown, Activity, Clock } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface JackpotRecord {
  id: number;
  date: string;
  game: string;
  systemName: string;
  hits: number;
  prizeType: string;
}

export default function JackpotsList() {
  const t = useTranslations('Tools.Jackpots');
  const [data, setData] = useState<JackpotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [prizeFilter, setPrizeFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const url = new URL('/api/tools/jackpots', window.location.origin);
        if (gameFilter !== 'all') url.searchParams.set('game', gameFilter);
        
        const res = await fetch(url.toString());
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch jackpots', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [gameFilter]);

  const availableSystems = useMemo(() => {
    const sys = new Set(data.map(d => d.systemName));
    return Array.from(sys).sort();
  }, [data]);

  // Data for the summary table (filtered by game and system, but NOT prize)
  const baseData = useMemo(() => {
    let result = data;
    if (systemFilter !== 'all') {
      result = result.filter(d => d.systemName === systemFilter);
    }
    return result;
  }, [data, systemFilter]);

  // Data for the main list (filtered by all three)
  const listData = useMemo(() => {
    let result = baseData;
    if (prizeFilter !== 'all') {
      result = result.filter(d => d.prizeType === prizeFilter);
    }
    return result;
  }, [baseData, prizeFilter]);

  const calcStats = (subset: JackpotRecord[]) => {
    const total = subset.length;
    let freq = '-';
    let king = '-';

    if (total > 0) {
      const counts: Record<string, number> = {};
      subset.forEach(d => { counts[d.systemName] = (counts[d.systemName] || 0) + 1; });
      king = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      
      if (total > 1) {
        const dates = subset.map(d => new Date(d.date).getTime()).sort((a, b) => a - b);
        const diffDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
        if (diffDays > 0) {
          freq = `1 a cada ${Math.max(1, Math.round(diffDays / total))} dias`;
        }
      }
    }
    return { total, freq, king };
  };

  const summaryStats = useMemo(() => {
    return {
      jackpot: calcStats(baseData.filter(d => d.prizeType === 'jackpot')),
      jackpot_1: calcStats(baseData.filter(d => d.prizeType === 'jackpot_1')),
      jackpot_2: calcStats(baseData.filter(d => d.prizeType === 'jackpot_2')),
      overall: calcStats(baseData)
    };
  }, [baseData]);

  const getPrizeLabel = (type: string) => {
    switch (type) {
      case 'jackpot': return '1º Prémio';
      case 'jackpot_1': return '2º Prémio';
      case 'jackpot_2': return '3º Prémio';
      case 'overall': return 'Total Geral';
      default: return type;
    }
  };

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'jackpot': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'jackpot_1': return <Medal className="w-4 h-4 text-slate-400" />;
      case 'jackpot_2': return <Medal className="w-4 h-4 text-amber-700" />;
      case 'overall': return <Activity className="w-4 h-4 text-indigo-500" />;
      default: return null;
    }
  };

  const getPrizeColor = (type: string) => {
    switch (type) {
      case 'jackpot': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'jackpot_1': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case 'jackpot_2': return 'bg-amber-700/10 text-amber-800 dark:text-amber-500 border-amber-700/20';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={gameFilter}
              onChange={(e) => {
                setGameFilter(e.target.value);
                setSystemFilter('all');
                setPrizeFilter('all');
              }}
              className="bg-transparent border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none transition-colors"
            >
              <option value="all">{t('filter_all_games')}</option>
              <option value="EUROMILLIONS">EuroMillions</option>
              <option value="TOTOLOTO">Totoloto</option>
              <option value="EURODREAMS">EuroDreams</option>
              <option value="MEGASENA">MegaSena</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <select 
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              className="bg-transparent border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none transition-colors max-w-[200px]"
            >
              <option value="all">Todos os Sistemas</option>
              {availableSystems.map(sys => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gray-400" />
            <select 
              value={prizeFilter}
              onChange={(e) => setPrizeFilter(e.target.value)}
              className="bg-transparent border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none transition-colors"
            >
              <option value="all">{t('filter_all_prizes')}</option>
              <option value="jackpot">{t('prize_jackpot')}</option>
              <option value="jackpot_1">{t('prize_jackpot_1')}</option>
              <option value="jackpot_2">{t('prize_jackpot_2')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      {!loading && (
        <div className="relative w-full overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm mb-8">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Resumo Estatístico
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-transparent dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-semibold">Prémio</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-center">Total</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Frequência</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Melhor Sistema</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                        {[
                            { key: 'jackpot', data: summaryStats.jackpot },
                            { key: 'jackpot_1', data: summaryStats.jackpot_1 },
                            { key: 'jackpot_2', data: summaryStats.jackpot_2 },
                            { key: 'overall', data: summaryStats.overall }
                        ].map((row, idx) => (
                            <tr key={row.key} className={cn("hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors", row.key === 'overall' && "bg-gray-50/50 dark:bg-slate-800/20 font-medium")}>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                                        row.key === 'overall' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' : getPrizeColor(row.key)
                                    )}>
                                        {getPrizeIcon(row.key)}
                                        {getPrizeLabel(row.key)}
                                    </span>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-center text-gray-900 dark:text-white font-bold text-lg">
                                    {row.data.total}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-teal-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{row.data.freq}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-purple-500" />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-bold max-w-[200px] truncate" title={row.data.king}>
                                            {row.data.king}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Main List Section */}
      <div className="relative w-full overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/90 dark:bg-slate-800/90 dark:text-gray-300 sticky top-0 z-10 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">{t('table_date')}</th>
                  <th scope="col" className="px-6 py-4 font-semibold">{t('table_game')}</th>
                  <th scope="col" className="px-6 py-4 font-semibold">{t('table_system')}</th>
                  <th scope="col" className="px-6 py-4 font-semibold">{t('table_prize')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {listData.length > 0 ? (
                  listData.slice(0, 100).map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-300">
                        {item.game}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-indigo-400" />
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                            {item.systemName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                          getPrizeColor(item.prizeType)
                        )}>
                          {getPrizeIcon(item.prizeType)}
                          {getPrizeLabel(item.prizeType)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                )}
                {listData.length > 100 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50/30 dark:bg-slate-800/30">
                      Mostrando os 100 resultados mais recentes de um total de {listData.length}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
