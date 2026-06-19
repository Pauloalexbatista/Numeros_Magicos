'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAvailableSystemsForFullPool, getFullPoolStats, FullPoolStatsResult, FullPoolDrawData } from './actions';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

export default function FullPoolViewerClient() {
    const [available, setAvailable] = useState<{game: string, systemName: string}[]>([]);
    const [selectedGame, setSelectedGame] = useState<string>('');
    const [selectedSystem, setSelectedSystem] = useState<string>('');
    const [stats, setStats] = useState<FullPoolStatsResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIntervals, setSelectedIntervals] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'date' | 'hits'>('date');

    useEffect(() => {
        getAvailableSystemsForFullPool().then(res => {
            setAvailable(res);
            if (res.length > 0) {
                const uniqueGames = Array.from(new Set(res.map(r => r.game)));
                setSelectedGame(uniqueGames[0]);
            }
        });
    }, []);

    const systemsForGame = useMemo(() => {
        return available.filter(a => a.game === selectedGame).map(a => a.systemName);
    }, [available, selectedGame]);

    useEffect(() => {
        if (systemsForGame.length > 0 && !systemsForGame.includes(selectedSystem)) {
            setSelectedSystem(systemsForGame[0]);
        }
    }, [systemsForGame, selectedSystem]);

    useEffect(() => {
        setSelectedIntervals([]);
        setSortBy('date');
    }, [selectedGame, selectedSystem]);

    useEffect(() => {
        if (selectedGame && selectedSystem) {
            setLoading(true);
            getFullPoolStats(selectedGame, selectedSystem).then(res => {
                setStats(res);
                setLoading(false);
            });
        }
    }, [selectedGame, selectedSystem]);

    const drawsToDisplay = useMemo(() => {
        if (!stats) return [];
        let list = [...stats.allDraws];
        if (sortBy === 'hits') {
            list.sort((a, b) => {
                const hitsA = selectedIntervals.reduce((sum, label) => sum + (a.hitsByInterval[label] || 0), 0);
                const                     hitsB = selectedIntervals.reduce((sum, label) => sum + (b.hitsByInterval[label] || 0), 0);
                if (hitsB !== hitsA) {
                    return hitsB - hitsA;
                }
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
        } else {
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        return list.slice(0, 20);
    }, [stats, sortBy, selectedIntervals]);

    const uniqueGames = Array.from(new Set(available.map(a => a.game)));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface-2 p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Jogo</label>
                    <select 
                        value={selectedGame}
                        onChange={e => setSelectedGame(e.target.value)}
                        className="w-full bg-surface-1 border border-border rounded-xl p-3 text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                        {uniqueGames.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Sistema de Previsão</label>
                    <select 
                        value={selectedSystem}
                        onChange={e => setSelectedSystem(e.target.value)}
                        className="w-full bg-surface-1 border border-border rounded-xl p-3 text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                        {systemsForGame.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                
                <button 
                    onClick={() => {
                        setLoading(true);
                        getFullPoolStats(selectedGame, selectedSystem).then(res => {
                            setStats(res);
                            setLoading(false);
                        });
                    }}
                    disabled={loading}
                    className="h-[50px] px-6 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                </button>
            </div>

            {loading && (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )}

            {!loading && stats && (
                <div className="space-y-8">
                    <div className="bg-surface-2 rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-surface-1/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary" />
                                Resumo Global por Intervalos
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Análise baseada em {stats.totalDrawsAnalyzed} sorteios de histórico.
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-3/30 border-b border-border text-sm text-muted-foreground">
                                        <th className="p-4 font-semibold">Intervalo (Importância)</th>
                                        <th className="p-4 font-semibold">Total de Acertos</th>
                                        <th className="p-4 font-semibold">Média / Sorteio</th>
                                        <th className="p-4 font-semibold">Eficiência (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.intervals.map((int, i) => {
                                        const isSelected = selectedIntervals.includes(int.intervalLabel);
                                        return (
                                            <tr 
                                                key={i} 
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedIntervals(selectedIntervals.filter(l => l !== int.intervalLabel));
                                                    } else {
                                                        setSelectedIntervals([...selectedIntervals, int.intervalLabel]);
                                                    }
                                                }}
                                                className={`border-b border-border/50 hover:bg-surface-1/50 transition-colors cursor-pointer ${
                                                    isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''
                                                }`}
                                            >
                                                <td className="p-4 flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => {}} // click handled by tr onClick
                                                        className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-surface-1 cursor-pointer"
                                                    />
                                                    <span className="font-bold text-foreground">{int.intervalLabel}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-mono text-lg">{int.totalHits}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-mono">{int.avgHitsPerDraw.toFixed(2)}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${isSelected ? 'bg-green-500' : 'bg-primary'}`} 
                                                                style={{width: `${Math.min(100, int.efficiency * 2)}%`}}
                                                            ></div>
                                                        </div>
                                                        <span className="font-mono text-sm">{int.efficiency.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Distribuição Individual por Intervalo (WOW Matrix) */}
                    <div className="bg-surface-2 rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-surface-1/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary" />
                                Distribuição de Acertos Individual por Intervalo
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Frequência exata de acertos (de 0 a 5) em cada bloco individual ao longo de {stats.totalDrawsAnalyzed} sorteios.
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                {(() => {
                                    const maxHits = (selectedGame === 'EURODREAMS' || selectedGame === 'MEGASENA') ? 6 : 5;
                                    const headers: number[] = [];
                                    for (let h = maxHits; h >= 0; h--) {
                                        headers.push(h);
                                    }

                                    return (
                                        <>
                                            <thead>
                                                <tr className="bg-surface-3/30 border-b border-border text-sm text-muted-foreground text-center">
                                                    <th className="p-4 font-semibold text-left">Intervalo</th>
                                                    {headers.map(h => (
                                                        <th key={h} className="p-4 font-semibold">{h} {h === 1 ? 'Acerto' : 'Acertos'}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.intervals.map((int, idx) => {
                                                    const dist: number[] = new Array(maxHits + 1).fill(0);
                                                    stats.allDraws.forEach(draw => {
                                                        const hits = draw.hitsByInterval[int.intervalLabel] || 0;
                                                        const capped = Math.min(hits, maxHits);
                                                        dist[capped]++;
                                                    });

                                                    return (
                                                        <tr key={idx} className="border-b border-border/50 hover:bg-surface-1/50 transition-colors text-center">
                                                            <td className="p-4 font-bold text-foreground text-left">
                                                                {int.intervalLabel}
                                                            </td>
                                                            {headers.map(h => {
                                                                  const count = dist[h];
                                                                  const pct = (count / stats.totalDrawsAnalyzed) * 100;
                                                                  
                                                                  let cellBg = "";
                                                                  let textClass = "text-foreground";
                                                                  let borderClass = "border-b border-border/30";
                                                                  
                                                                  if (count > 0) {
                                                                      if (h >= 5) {
                                                                          cellBg = "bg-amber-500/15 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]";
                                                                          textClass = "text-amber-500 font-black animate-pulse";
                                                                          borderClass = "border border-amber-500/30 rounded-xl";
                                                                      } else if (h === 4) {
                                                                          cellBg = "bg-green-500/15";
                                                                          textClass = "text-green-500 font-bold";
                                                                          borderClass = "border border-green-500/30 rounded-xl";
                                                                      } else if (h === 3) {
                                                                          cellBg = "bg-blue-500/10";
                                                                          textClass = "text-blue-400 font-semibold";
                                                                          borderClass = "border border-blue-500/20 rounded-xl";
                                                                      } else if (h === 2) {
                                                                          cellBg = "bg-surface-3/30";
                                                                          textClass = "text-foreground/90 font-medium";
                                                                      }
                                                                  }

                                                                  return (
                                                                      <td key={h} className={`p-4 transition-all duration-300 ${cellBg} ${borderClass}`}>
                                                                          <div className={`font-mono text-base ${textClass}`}>
                                                                              {count}
                                                                          </div>
                                                                          <div className="text-xs text-muted-foreground font-mono">
                                                                              {pct.toFixed(1)}%
                                                                          </div>
                                                                      </td>
                                                                  );
                                                              })}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </>
                                    );
                                })()}
                            </table>
                        </div>
                    </div>

                    {/* Combined Metrics Card */}
                    {selectedIntervals.length > 0 && (() => {
                        const totalDraws = stats.totalDrawsAnalyzed;
                        const maxNumbersToDraw = (selectedGame === 'EURODREAMS' || selectedGame === 'MEGASENA') ? 6 : 5;
                        const totalBallsDrawn = totalDraws * maxNumbersToDraw;
                        
                        const selectedStats = stats.intervals.filter(int => selectedIntervals.includes(int.intervalLabel));
                        const combinedHits = selectedStats.reduce((sum, curr) => sum + curr.totalHits, 0);
                        const combinedAvg = combinedHits / totalDraws;
                        const combinedEff = (combinedHits / totalBallsDrawn) * 100;

                        // Calcular a quantidade de números envolvidos na seleção
                        const totalSelectedNumbers = selectedStats.reduce((sum, curr) => {
                            const match = curr.intervalLabel.match(/\d+/g);
                            if (match && match.length >= 2) {
                                const start = parseInt(match[0]);
                                const end = parseInt(match[1]);
                                return sum + (end - start + 1);
                            }
                            return sum;
                        }, 0);

                        // Calcular a distribuição de acertos (0 a maxHits) ao longo de todo o histórico
                        const maxHits = (selectedGame === 'EURODREAMS' || selectedGame === 'MEGASENA') ? 6 : 5;
                        const distribution: number[] = new Array(maxHits + 1).fill(0);

                        if (stats.allDraws) {
                            stats.allDraws.forEach(draw => {
                                const hits = selectedIntervals.reduce((sum, label) => sum + (draw.hitsByInterval[label] || 0), 0);
                                const cappedHits = Math.min(hits, maxHits);
                                distribution[cappedHits]++;
                            });
                        }

                        return (
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-primary/10 pb-4">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h3 className="font-bold text-lg text-primary">Intervalos Selecionados Combinados</h3>
                                        <p className="text-muted-foreground text-sm">
                                            {selectedIntervals.join(' + ')}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-6 justify-center md:justify-end">
                                        <div className="text-center">
                                            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Números Selecionados</div>
                                            <div className="font-mono text-2xl font-bold text-foreground">{totalSelectedNumbers}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Total Acertos</div>
                                            <div className="font-mono text-2xl font-bold text-foreground">{combinedHits}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Média / Sorteio</div>
                                            <div className="font-mono text-2xl font-bold text-foreground">{combinedAvg.toFixed(2)}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Eficiência</div>
                                            <div className="font-mono text-2xl font-bold text-primary">{combinedEff.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Distribuição de Acertos no Histórico</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                                        {distribution.map((count, hits) => {
                                            const pct = (count / totalDraws) * 100;
                                            return (
                                                <div key={hits} className="bg-surface-3/50 rounded-xl p-3 border border-border/50 text-center flex flex-col justify-between">
                                                    <div className="text-sm font-bold text-primary mb-1">
                                                        {hits} {hits === 1 ? 'Acerto' : 'Acertos'}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-mono text-xl font-bold text-foreground">{count}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{pct.toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="bg-surface-2 rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-surface-1/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold">Histórico de Sorteios (Amostra de 20)</h2>
                                <p className="text-muted-foreground mt-1">
                                    {sortBy === 'hits' ? 'Os 20 sorteios com mais acertos nos blocos selecionados' : 'Os últimos 20 sorteios cronologicamente'}
                                </p>
                            </div>
                            <div className="flex bg-surface-3 rounded-lg p-1 border border-border">
                                <button
                                    onClick={() => setSortBy('date')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        sortBy === 'date' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Mais Recentes
                                </button>
                                <button
                                    onClick={() => setSortBy('hits')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        sortBy === 'hits' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Melhores Resultados
                                </button>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-surface-3/30 border-b border-border text-muted-foreground">
                                        <th className="p-4 font-semibold">Data</th>
                                        <th className="p-4 font-semibold">Resultado Real</th>
                                        {stats.intervals.map(int => (
                                            <th key={int.intervalLabel} className="p-4 font-semibold text-center">{int.intervalLabel}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {drawsToDisplay.map((draw, i) => (
                                        <tr key={i} className="border-b border-border/50 hover:bg-surface-1/50 transition-colors">
                                            <td className="p-4 whitespace-nowrap text-muted-foreground">
                                                {new Date(draw.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4 font-mono font-medium">
                                                {draw.actualNumbers.join(', ')}
                                            </td>
                                            {stats.intervals.map(int => {
                                                const hits = draw.hitsByInterval[int.intervalLabel] || 0;
                                                return (
                                                    <td key={int.intervalLabel} className="p-4 text-center">
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                                            hits === 0 ? 'bg-surface-3 text-muted-foreground' : 
                                                            hits === 1 ? 'bg-blue-500/20 text-blue-400' :
                                                            hits === 2 ? 'bg-green-500/20 text-green-400' :
                                                            'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                            {hits}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {!loading && !stats && available.length > 0 && (
                <div className="text-center p-12 bg-surface-2 rounded-2xl border border-border">
                    <p className="text-muted-foreground">Não existem dados processados para esta combinação.</p>
                </div>
            )}
        </div>
    );
}