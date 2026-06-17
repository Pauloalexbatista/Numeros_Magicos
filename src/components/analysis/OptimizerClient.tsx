'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { getSystemsAction, getPerformanceAction } from '@/app/analysis/optimizer/actions';

interface OptimizerClientProps {
    initialSystems: Array<{ name: string; description: string | null }>;
}

export default function OptimizerClient({ initialSystems }: OptimizerClientProps) {
    const [game, setGame] = useState<'EUROMILLIONS' | 'TOTOLOTO' | 'EURODREAMS' | 'MEGASENA'>('EUROMILLIONS');
    const [systems, setSystems] = useState(initialSystems);
    const [selectedSystem, setSelectedSystem] = useState(initialSystems[0]?.name || '');
    const [limit, setLimit] = useState<number>(50);
    const [rangeStart, setRangeStart] = useState<number>(1);
    const [rangeEnd, setRangeEnd] = useState<number>(10);
    const [performanceData, setPerformanceData] = useState<any>(null);

    const [isPending, startTransition] = useTransition();

    const getMaxNumbers = (g: string) => {
        return (g === 'EURODREAMS' || g === 'MEGASENA') ? 6 : 5;
    };

    const getPoolSize = (g: string) => {
        switch (g) {
            case 'EURODREAMS': return 40;
            case 'MEGASENA': return 60;
            default: return 50;
        }
    };

    useEffect(() => {
        startTransition(async () => {
            const data = await getSystemsAction(game);
            setSystems(data);
            if (data.length > 0) {
                setSelectedSystem(data[0].name);
            } else {
                setSelectedSystem('');
            }
        });
    }, [game]);

    useEffect(() => {
        if (!selectedSystem) {
            setPerformanceData(null);
            return;
        }
        startTransition(async () => {
            const data = await getPerformanceAction(selectedSystem, game);
            setPerformanceData(data);
        });
    }, [selectedSystem, game]);

    const poolSize = getPoolSize(game);
    const maxNumbers = getMaxNumbers(game);

    const analysisHistory = performanceData?.history?.slice(0, limit) || [];

    const rankHits = Array(poolSize).fill(0);
    analysisHistory.forEach((draw: any) => {
        const actual = new Set(draw.drawNumbers);
        const predicted = draw.predictedNumbers || [];
        predicted.forEach((num: number, idx: number) => {
            if (actual.has(num) && idx < poolSize) {
                rankHits[idx]++;
            }
        });
    });

    const rankAccuracy = rankHits.map(hits => 
        analysisHistory.length > 0 ? (hits / analysisHistory.length) * 100 : 0
    );

    let bestWindow = { start: 1, end: 10, hitRate: 0, size: 10 };
    const windowSizes = [5, 10, 15, 20, 25, 30];

    if (analysisHistory.length > 0) {
        let maxRate = -1;
        windowSizes.forEach(size => {
            for (let i = 0; i <= poolSize - size; i++) {
                let totalHitsInWindow = 0;
                analysisHistory.forEach((draw: any) => {
                    const actual = new Set(draw.drawNumbers);
                    const predicted = draw.predictedNumbers || [];
                    const windowSlice = predicted.slice(i, i + size);
                    const hits = windowSlice.filter((n: number) => actual.has(n)).length;
                    totalHitsInWindow += hits;
                });
                
                const rate = totalHitsInWindow / analysisHistory.length;
                if (rate > maxRate) {
                    maxRate = rate;
                    bestWindow = {
                        start: i + 1,
                        end: i + size,
                        hitRate: rate,
                        size: size
                    };
                }
            }
        });
    }

    let customHits = 0;
    analysisHistory.forEach((draw: any) => {
        const actual = new Set(draw.drawNumbers);
        const predicted = draw.predictedNumbers || [];
        const slice = predicted.slice(rangeStart - 1, rangeEnd);
        const hits = slice.filter((n: number) => actual.has(n)).length;
        customHits += hits;
    });
    const customHitRate = analysisHistory.length > 0 ? (customHits / analysisHistory.length) : 0;
    const customAccuracy = (customHitRate / maxNumbers) * 100;

    return (
        <div className="space-y-8">
            <Card className="p-6 glass-card grid grid-cols-1 md:grid-cols-4 gap-6 bg-zinc-900/40 border-zinc-800">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Jogo</label>
                    <select
                        value={game}
                        onChange={(e: any) => setGame(e.target.value)}
                        className="bg-surface-2 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
                    >
                        <option value="EUROMILLIONS">EuroMilhoes</option>
                        <option value="TOTOLOTO">Totoloto</option>
                        <option value="EURODREAMS">EuroDreams</option>
                        <option value="MEGASENA">Mega-Sena</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sistema de Previsao</label>
                    <select
                        value={selectedSystem}
                        onChange={(e) => setSelectedSystem(e.target.value)}
                        className="bg-surface-2 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
                    >
                        {systems.map(sys => (
                            <option key={sys.name} value={sys.name}>{sys.name}</option>
                        ))}
                        {systems.length === 0 && <option value="">Sem sistemas disponiveis</option>}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Amostra (Sorteios)</label>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="bg-surface-2 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
                    >
                        <option value={20}>Ultimos 20</option>
                        <option value={50}>Ultimos 50</option>
                        <option value={100}>Ultimos 100</option>
                    </select>
                </div>
            </Card>

            {isPending && (
                <div className="text-center py-12 text-muted-foreground animate-pulse font-medium">
                    A analisar base de dados e a calcular estatisticas otimizadas...
                </div>
            )}

            {!isPending && performanceData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="p-6 glass-card border-green-500/20 bg-green-950/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-4">
                                o "Sweet Spot" Historico
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <p className="text-sm text-zinc-300">
                                    O intervalo que produziu a melhor taxa de acerto media nesta amostra foi:
                                </p>
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                                    <span className="text-xs font-bold text-green-400 block uppercase">Intervalo Recomendado</span>
                                    <span className="text-3xl font-black text-white">Posicao {bestWindow.start} - {bestWindow.end}</span>
                                    <span className="text-xs text-zinc-400 block mt-1">Tamanho da Pool: {bestWindow.size} numeros</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
                                        <span className="text-xs text-muted-foreground block">Media Acertos</span>
                                        <span className="text-lg font-bold text-white">{bestWindow.hitRate.toFixed(2)} / {maxNumbers}</span>
                                    </div>
                                    <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
                                        <span className="text-xs text-muted-foreground block">Precisao Relativa</span>
                                        <span className="text-lg font-bold text-white">{((bestWindow.hitRate / maxNumbers) * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 glass-card border-zinc-800 bg-zinc-900/20">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-4">
                                Testar Intervalo Customizado
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Posicao Inicial: <strong className="text-white">{rangeStart}</strong></span>
                                        <span className="text-muted-foreground">Posicao Final: <strong className="text-white">{rangeEnd}</strong></span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-zinc-500">Inicio</span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={rangeEnd}
                                                value={rangeStart}
                                                onChange={(e) => setRangeStart(Math.max(1, Math.min(rangeEnd, Number(e.target.value))))}
                                                className="bg-surface-2 border border-zinc-800 text-white rounded-lg px-3 py-2 text-center"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-zinc-500">Fim</span>
                                            <input
                                                type="number"
                                                min={rangeStart}
                                                max={poolSize}
                                                value={rangeEnd}
                                                onChange={(e) => setRangeEnd(Math.min(poolSize, Math.max(rangeStart, Number(e.target.value))))}
                                                className="bg-surface-2 border border-zinc-800 text-white rounded-lg px-3 py-2 text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estatisticas do Intervalo</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-300">Numeros no Intervalo:</span>
                                        <span className="font-bold text-white">{rangeEnd - rangeStart + 1}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-300">Media de Acertos:</span>
                                        <span className="font-bold text-white">{customHitRate.toFixed(2)} / {maxNumbers}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-300">Taxa de Eficacia:</span>
                                        <span className="font-bold text-green-400">{customAccuracy.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-6 glass-card border-zinc-800">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-2">
                                Histograma de Acertos por Posicao
                            </h3>
                            <p className="text-xs text-muted-foreground mb-6">
                                Demonstra a taxa de acerto historica de cada posicao de importancia individual.
                            </p>

                            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                                {rankAccuracy.map((acc, index) => {
                                    const rankNum = index + 1;
                                    const isInCustomRange = rankNum >= rangeStart && rankNum <= rangeEnd;
                                    return (
                                        <div key={rankNum} className="flex items-center gap-4">
                                            <span className={`w-8 text-right text-xs font-bold ${isInCustomRange ? "text-green-400" : "text-zinc-500"}`}>
                                                #{rankNum}
                                            </span>
                                            <div className="flex-1 h-3.5 bg-zinc-800/40 rounded-full overflow-hidden border border-zinc-900">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isInCustomRange ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-zinc-700/60"}`}
                                                    style={{ width: acc + '%' }}
                                                ></div>
                                            </div>
                                            <span className="w-12 text-left text-xs font-semibold text-zinc-400">
                                                {acc.toFixed(1)}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}