'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAvailableSystemsForFullPool, getFullPoolStats, FullPoolStatsResult, FullPoolDrawData } from './actions';
import { RefreshCw, LayoutDashboard, Sparkles, Trophy, Percent } from 'lucide-react';


// Helper to calculate best combinations of intervals
const findBestCombinations = (allDraws: any[], intervals: any[], selectedGame: string) => {
    const maxHits = (selectedGame === 'EURODREAMS' || selectedGame === 'MEGASENA') ? 6 : 5;
    const labels = intervals.map(i => i.intervalLabel);
    
    const getCombinations = (array: string[], size: number): string[][] => {
        const result: string[][] = [];
        const f = (active: string[], rest: string[]) => {
            if (active.length === size) {
                result.push(active);
                return;
            }
            for (let i = 0; i < rest.length; i++) {
                f([...active, rest[i]], rest.slice(i + 1));
            }
        };
        f([], array);
        return result;
    };

    const resultsBySize: Record<number, any> = {};

    [2, 3, 4].forEach(size => {
        const combos = getCombinations(labels, size);
        const comboEvaluations = combos.map(combo => {
            let totalHits = 0;
            let drawsWithMaxHits = 0;      // 6 or 5
            let drawsWithMaxMinusOne = 0;  // 5 or 4
            let drawsWithMaxMinusTwo = 0;  // 4 or 3
            
            allDraws.forEach(draw => {
                const hits = combo.reduce((sum, label) => sum + (draw.hitsByInterval[label] || 0), 0);
                totalHits += hits;
                if (hits >= maxHits) {
                    drawsWithMaxHits++;
                } else if (hits === maxHits - 1) {
                    drawsWithMaxMinusOne++;
                } else if (hits === maxHits - 2) {
                    drawsWithMaxMinusTwo++;
                }
            });

            const avgHits = totalHits / allDraws.length;
            const efficiency = (totalHits / (allDraws.length * maxHits)) * 100;

            return {
                combo,
                totalHits,
                avgHits,
                efficiency,
                drawsWithMaxHits,
                drawsWithMaxMinusOne,
                drawsWithMaxMinusTwo,
                highHitsScore: drawsWithMaxHits * 1000 + drawsWithMaxMinusOne * 100 + drawsWithMaxMinusTwo * 10,
            };
        });

        const bestHighHits = [...comboEvaluations]
            .sort((a, b) => b.highHitsScore !== a.highHitsScore ? b.highHitsScore - a.highHitsScore : b.efficiency - a.efficiency)
            .slice(0, 3);

        const bestEfficiency = [...comboEvaluations]
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 3);

        resultsBySize[size] = {
            bestHighHits,
            bestEfficiency
        };
    });

    return resultsBySize;
};

export default function FullPoolViewerClient() {
    const [available, setAvailable] = useState<{game: string, systemName: string}[]>([]);
    const [selectedGame, setSelectedGame] = useState<string>('');
    const [selectedSystem, setSelectedSystem] = useState<string>('');
    const [stats, setStats] = useState<FullPoolStatsResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIntervals, setSelectedIntervals] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'date' | 'hits'>('date');
    const [optimizerSize, setOptimizerSize] = useState<number>(3);

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

    
    const bestCombinations = useMemo(() => {
        if (!stats || !stats.allDraws || !stats.intervals || stats.allDraws.length === 0) return null;
        return findBestCombinations(stats.allDraws, stats.intervals, selectedGame);
    }, [stats, selectedGame]);

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
                                        {/* Quadro Unificado de Estatísticas por Intervalo */}
                    <div className="bg-surface-2 rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-surface-1/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary" />
                                Resumo Global e Distribuição por Intervalos
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Análise baseada em {stats.totalDrawsAnalyzed} sorteios de histórico. Selecione intervalos para ver o total combinado.
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
                                                <tr className="bg-surface-3/30 border-b border-border text-sm text-muted-foreground">
                                                    <th className="p-4 font-semibold text-left">Intervalo (Importância)</th>
                                                    <th className="p-4 font-semibold text-center">Total Acertos</th>
                                                    <th className="p-4 font-semibold text-center">Média / Sorteio</th>
                                                    <th className="p-4 font-semibold text-center border-r border-border/40">Eficiência (%)</th>
                                                    {headers.map(h => (
                                                        <th key={h} className="p-4 font-semibold text-center">{h} {h === 1 ? 'Acerto' : 'Acertos'}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.intervals.map((int, i) => {
                                                    const isSelected = selectedIntervals.includes(int.intervalLabel);
                                                    
                                                    // Calcular distribuição para este intervalo específico
                                                    const dist: number[] = new Array(maxHits + 1).fill(0);
                                                    stats.allDraws.forEach(draw => {
                                                        const hits = draw.hitsByInterval[int.intervalLabel] || 0;
                                                        const capped = Math.min(hits, maxHits);
                                                        dist[capped]++;
                                                    });

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
                                                            {/* Checkbox e Intervalo */}
                                                            <td className="p-4 flex items-center gap-3">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isSelected}
                                                                    onChange={() => {}} // click handled by tr onClick
                                                                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-surface-1 cursor-pointer"
                                                                />
                                                                <span className="font-bold text-foreground">{int.intervalLabel}</span>
                                                            </td>
                                                            
                                                            {/* Resumo Global */}
                                                            <td className="p-4 text-center font-mono text-lg">{int.totalHits}</td>
                                                            <td className="p-4 text-center font-mono">{int.avgHitsPerDraw.toFixed(2)}</td>
                                                            <td className="p-4 text-center font-mono border-r border-border/40">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-16 h-2 bg-surface-3 rounded-full overflow-hidden hidden sm:block">
                                                                        <div 
                                                                            className={`h-full rounded-full ${isSelected ? 'bg-green-500' : 'bg-primary'}`} 
                                                                            style={{width: `${Math.min(100, int.efficiency * 2)}%`}}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm font-semibold">{int.efficiency.toFixed(1)}%</span>
                                                                </div>
                                                            </td>

                                                            {/* Distribuição (WOW Matrix) */}
                                                            {headers.map(h => {
                                                                const count = dist[h];
                                                                const pct = (count / stats.totalDrawsAnalyzed) * 100;
                                                                
                                                                let cellBg = "";
                                                                let textClass = "text-foreground";
                                                                let borderClass = "";
                                                                
                                                                if (count > 0) {
                                                                    if (h >= 5) {
                                                                        cellBg = "bg-amber-500/10 shadow-[inset_0_0_10px_rgba(245,158,11,0.08)]";
                                                                        textClass = "text-amber-500 font-black animate-pulse";
                                                                        borderClass = "border border-amber-500/20";
                                                                    } else if (h === 4) {
                                                                        cellBg = "bg-green-500/10";
                                                                        textClass = "text-green-500 font-bold";
                                                                        borderClass = "border border-green-500/20";
                                                                    } else if (h === 3) {
                                                                        cellBg = "bg-blue-500/10";
                                                                        textClass = "text-blue-400 font-semibold";
                                                                        borderClass = "border border-blue-500/20";
                                                                    } else if (h === 2) {
                                                                        cellBg = "bg-surface-3/20";
                                                                        textClass = "text-foreground/90 font-medium";
                                                                    }
                                                                }

                                                                return (
                                                                    <td key={h} className={`p-4 transition-all duration-300 text-center ${cellBg} ${borderClass}`}>
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

                    
                    {/* Otimizador de Combina��es de Blocos */}
                    {!loading && stats && bestCombinations && (
                        <div className="bg-surface-2 rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
                            <div className="border-b border-border pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                                    Otimizador de Blocos (Melhores Combina��es Hist�ricas)
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    An�lise combinat�ria de todos os intervalos de 5 n�meros para descobrir quais blocos juntos geram mais acertos.
                                </p>
                            </div>

                            {/* Selector de Tamanho */}
                            <div className="flex flex-wrap gap-2">
                                {[2, 3, 4].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setOptimizerSize(size)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            optimizerSize === size 
                                                ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                                                : 'bg-surface-3 text-muted-foreground hover:bg-surface-3/80 hover:text-foreground'
                                        }`}
                                    >
                                        Selecionar {size} Blocos ({size * 5} N�meros)
                                    </button>
                                ))}
                            </div>

                            {/* Resultados */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Foco em Grandes Pr�mios */}
                                {(() => {
                                    const data = bestCombinations[optimizerSize];
                                    if (!data) return null;
                                    const comboHits = data.bestHighHits[0]; // Top 1
                                    if (!comboHits) return null;
                                    const isSelected = selectedIntervals.length === comboHits.combo.length && 
                                                       comboHits.combo.every(c => selectedIntervals.includes(c));
                                    const maxHits = (selectedGame === 'EURODREAMS' || selectedGame === 'MEGASENA') ? 6 : 5;

                                    return (
                                        <div className="bg-surface-3/30 border border-border/85 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
                                                        <Trophy className="w-3.5 h-3.5" />
                                                        Foco em Grandes Pr�mios
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-mono">Efici�ncia: {comboHits.efficiency.toFixed(1)}%</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="text-lg font-bold text-foreground">
                                                        {comboHits.combo.join(' + ')}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Esta combina��o obteve o maior n�mero de sorteios com pr�mios elevados ({maxHits}, {maxHits - 1} e {maxHits - 2} acertos).
                                                    </p>
                                                </div>

                                                {/* M�tricas Detalhadas */}
                                                <div className="grid grid-cols-3 gap-2 bg-surface-3/50 p-3 rounded-xl border border-border/50 text-center">
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{maxHits} Acertos</div>
                                                        <div className="font-mono text-lg font-black text-amber-500">{comboHits.drawsWithMaxHits}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{maxHits - 1} Acertos</div>
                                                        <div className="font-mono text-lg font-bold text-green-500">{comboHits.drawsWithMaxMinusOne}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{maxHits - 2} Acertos</div>
                                                        <div className="font-mono text-lg font-semibold text-blue-400">{comboHits.drawsWithMaxMinusTwo}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedIntervals(comboHits.combo)}
                                                className={`w-full mt-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                                    isSelected 
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                        : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                                                }`}
                                            >
                                                {isSelected ? '? Aplicado no Quadro' : 'Aplicar esta Sele��o'}
                                            </button>
                                        </div>
                                    );
                                })()}

                                {/* Foco em M�dia / Efici�ncia */}
                                {(() => {
                                    const data = bestCombinations[optimizerSize];
                                    if (!data) return null;
                                    const comboEff = data.bestEfficiency[0]; // Top 1
                                    if (!comboEff) return null;
                                    const isSelected = selectedIntervals.length === comboEff.combo.length && 
                                                       comboEff.combo.every(c => selectedIntervals.includes(c));
                                    const maxHits = (selectedGame === 'EURODREAMS' || selectedGame === 'MEGASENA') ? 6 : 5;

                                    return (
                                        <div className="bg-surface-3/30 border border-border/85 rounded-2xl p-5 flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-full flex items-center gap-1.5">
                                                        <Percent className="w-3.5 h-3.5" />
                                                        Foco em Efici�ncia M�xima
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-mono">M�dia: {comboEff.avgHits.toFixed(2)} / sort.</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="text-lg font-bold text-foreground">
                                                        {comboEff.combo.join(' + ')}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Esta combina��o obteve a maior quantidade total de n�meros acertados acumulada ao longo de todo o hist�rico.
                                                    </p>
                                                </div>

                                                {/* M�tricas Detalhadas */}
                                                <div className="grid grid-cols-3 gap-2 bg-surface-3/50 p-3 rounded-xl border border-border/50 text-center">
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold font-semibold">M�dia</div>
                                                        <div className="font-mono text-lg font-black text-primary">{comboEff.avgHits.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold font-semibold">Efici�ncia</div>
                                                        <div className="font-mono text-lg font-bold text-primary">{comboEff.efficiency.toFixed(1)}%</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold font-semibold">Total Hits</div>
                                                        <div className="font-mono text-lg font-semibold text-foreground/90">{comboEff.totalHits}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedIntervals(comboEff.combo)}
                                                className={`w-full mt-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                                    isSelected 
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                        : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                                                }`}
                                            >
                                                {isSelected ? '? Aplicado no Quadro' : 'Aplicar esta Sele��o'}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

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