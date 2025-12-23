'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, Target, GitBranch, Calculator } from 'lucide-react';

interface SystemPerformance {
    name: string;
    accuracy: number;
    jackpots: number;
    score: number;
}

interface StarPair {
    pair: [number, number];
    frequency: number;
    lastSeen: number;
    correlation: number;
}

interface PositionData {
    star: number;
    position1Freq: number;
    position2Freq: number;
    preferredPosition: string;
}

interface GapData {
    avgGap: number;
    minGap: number;
    maxGap: number;
    mostCommonGap: number;
    currentGap: number;
}

export default function StarLabClient() {
    const [activeTab, setActiveTab] = useState<'performance' | 'pairs' | 'position' | 'gaps' | 'sum' | 'oddeven'>('performance');
    const [loading, setLoading] = useState(false);
    const [systemPerformance, setSystemPerformance] = useState<SystemPerformance[]>([]);
    const [pairAnalysis, setPairAnalysis] = useState<StarPair[]>([]);
    const [positionAnalysis, setPositionAnalysis] = useState<PositionData[]>([]);
    const [selectedStar, setSelectedStar] = useState(1);
    const [gapData, setGapData] = useState<GapData | null>(null);
    const [sumPatterns, setSumPatterns] = useState<[number, number][]>([]);
    const [oddEvenData, setOddEvenData] = useState<{ bothOdd: number; bothEven: number; mixed: number } | null>(null);

    const loadPerformance = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/star-lab/performance');
            const data = await res.json();
            setSystemPerformance(data);
        } catch (error) {
            console.error('Error loading performance:', error);
        }
        setLoading(false);
    };

    const loadPairAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/star-lab/pairs');
            const data = await res.json();
            setPairAnalysis(data);
        } catch (error) {
            console.error('Error loading pairs:', error);
        }
        setLoading(false);
    };

    const loadPositionAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/star-lab/positions');
            const data = await res.json();
            setPositionAnalysis(data);
        } catch (error) {
            console.error('Error loading positions:', error);
        }
        setLoading(false);
    };

    const loadGapAnalysis = async (star: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/star-lab/gaps?star=${star}`);
            const data = await res.json();
            setGapData(data);
        } catch (error) {
            console.error('Error loading gaps:', error);
        }
        setLoading(false);
    };

    const loadSumPatterns = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/star-lab/sum-patterns');
            const data = await res.json();
            setSumPatterns(data);
        } catch (error) {
            console.error('Error loading sum patterns:', error);
        }
        setLoading(false);
    };

    const loadOddEvenPatterns = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/star-lab/odd-even');
            const data = await res.json();
            setOddEvenData(data);
        } catch (error) {
            console.error('Error loading odd/even:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'performance') loadPerformance();
        else if (activeTab === 'pairs') loadPairAnalysis();
        else if (activeTab === 'position') loadPositionAnalysis();
        else if (activeTab === 'gaps') loadGapAnalysis(selectedStar);
        else if (activeTab === 'sum') loadSumPatterns();
        else if (activeTab === 'oddeven') loadOddEvenPatterns();
    }, [activeTab, selectedStar]);

    const tabs = [
        { id: 'performance' as const, label: 'Performance Sistemas', icon: BarChart3 },
        { id: 'pairs' as const, label: 'Pares Correlacionados', icon: GitBranch },
        { id: 'position' as const, label: 'Preferência Posicional', icon: Target },
        { id: 'gaps' as const, label: 'Análise de Intervalos', icon: TrendingUp },
        { id: 'sum' as const, label: 'Padrões de Soma', icon: Calculator },
        { id: 'oddeven' as const, label: 'Ímpar/Par', icon: Zap },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                        <p className="text-slate-400 mt-4">A carregar análise...</p>
                    </div>
                )}

                {!loading && activeTab === 'performance' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-yellow-400">📊 Performance dos Sistemas de Estrelas</h2>
                        <div className="space-y-3">
                            {systemPerformance.map((sys, idx) => (
                                <div key={idx} className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500 text-black' :
                                                idx === 1 ? 'bg-slate-400 text-black' :
                                                    idx === 2 ? 'bg-amber-700 text-white' :
                                                        'bg-slate-700 text-slate-300'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{sys.name}</p>
                                            <p className="text-sm text-slate-400">{sys.jackpots} jackpots</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-yellow-400">{sys.accuracy.toFixed(2)}%</p>
                                        <p className="text-sm text-slate-400">Score: {sys.score}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'pairs' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-yellow-400">🔗 Pares de Estrelas Mais Correlacionados</h2>
                        <p className="text-slate-400 mb-6">Estrelas que aparecem juntas com mais frequência (últimos 100 sorteios)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pairAnalysis.map((pair, idx) => (
                                <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-2">
                                                <span className="w-10 h-10 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center">
                                                    {pair.pair[0]}
                                                </span>
                                                <span className="w-10 h-10 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center">
                                                    {pair.pair[1]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-yellow-400">{pair.frequency}x</p>
                                            <p className="text-xs text-slate-400">{(pair.correlation * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400">Última vez: há {pair.lastSeen} sorteios</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'position' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-yellow-400">🎯 Preferência Posicional das Estrelas</h2>
                        <p className="text-slate-400 mb-6">Algumas estrelas preferem sair na 1ª ou 2ª posição</p>
                        <div className="space-y-3">
                            {positionAnalysis.map((data) => (
                                <div key={data.star} className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center">
                                                {data.star}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-white">Estrela {data.star}</p>
                                                <p className="text-sm text-slate-400 capitalize">
                                                    Preferência: <span className="text-yellow-400">{
                                                        data.preferredPosition === 'first' ? '1ª Posição' :
                                                            data.preferredPosition === 'second' ? '2ª Posição' :
                                                                'Ambas'
                                                    }</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-slate-300">1ª: <span className="text-yellow-400 font-semibold">{data.position1Freq}</span></p>
                                            <p className="text-slate-300">2ª: <span className="text-yellow-400 font-semibold">{data.position2Freq}</span></p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-yellow-500 h-full transition-all"
                                            style={{ width: `${(data.position1Freq / (data.position1Freq + data.position2Freq)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'gaps' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-yellow-400">📈 Análise de Intervalos (Gaps)</h2>
                        <p className="text-slate-400 mb-6">Quantos sorteios passam entre aparições da mesma estrela?</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Selecionar Estrela:</label>
                            <div className="grid grid-cols-6 gap-2">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setSelectedStar(star)}
                                        className={`w-12 h-12 rounded-full font-bold transition-all ${selectedStar === star
                                                ? 'bg-yellow-500 text-black scale-110'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {star}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {gapData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-1">Intervalo Médio</p>
                                    <p className="text-3xl font-bold text-yellow-400">{gapData.avgGap}</p>
                                    <p className="text-xs text-slate-500 mt-1">sorteios</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-1">Intervalo Mais Comum</p>
                                    <p className="text-3xl font-bold text-yellow-400">{gapData.mostCommonGap}</p>
                                    <p className="text-xs text-slate-500 mt-1">sorteios</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-1">Intervalo Atual</p>
                                    <p className="text-3xl font-bold text-yellow-400">{gapData.currentGap}</p>
                                    <p className="text-xs text-slate-500 mt-1">sorteios atrás</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-1">Mínimo Histórico</p>
                                    <p className="text-3xl font-bold text-green-400">{gapData.minGap}</p>
                                    <p className="text-xs text-slate-500 mt-1">sorteios</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-1">Máximo Histórico</p>
                                    <p className="text-3xl font-bold text-red-400">{gapData.maxGap}</p>
                                    <p className="text-xs text-slate-500 mt-1">sorteios</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-1">Previsão</p>
                                    <p className="text-lg font-bold text-white">
                                        {gapData.currentGap >= gapData.avgGap ? (
                                            <span className="text-green-400">⚠️ Atrasada</span>
                                        ) : (
                                            <span className="text-slate-400">✓ Normal</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {gapData.currentGap >= gapData.avgGap
                                            ? 'Pode sair em breve'
                                            : 'Ainda dentro do padrão'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!loading && activeTab === 'sum' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-yellow-400">➕ Padrões de Soma (Star1 + Star2)</h2>
                        <p className="text-slate-400 mb-6">Somas mais frequentes entre as duas estrelas</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {sumPatterns.slice(0, 18).map(([sum, freq]) => (
                                <div key={sum} className="bg-slate-800/50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-400">{sum}</p>
                                    <p className="text-sm text-slate-400 mt-1">{freq}x</p>
                                    <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                                        <div
                                            className="bg-yellow-500 h-full rounded-full"
                                            style={{ width: `${(freq / sumPatterns[0][1]) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'oddeven' && oddEvenData && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-yellow-400">⚡ Análise Ímpar/Par</h2>
                        <p className="text-slate-400 mb-6">Distribuição de padrões ímpar/par nas estrelas</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                                <p className="text-sm text-slate-400 mb-2">Ambas Ímpares</p>
                                <p className="text-4xl font-bold text-yellow-400">{oddEvenData.bothOdd}</p>
                                <p className="text-sm text-slate-500 mt-2">
                                    {((oddEvenData.bothOdd / (oddEvenData.bothOdd + oddEvenData.bothEven + oddEvenData.mixed)) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                                <p className="text-sm text-slate-400 mb-2">Ambas Pares</p>
                                <p className="text-4xl font-bold text-blue-400">{oddEvenData.bothEven}</p>
                                <p className="text-sm text-slate-500 mt-2">
                                    {((oddEvenData.bothEven / (oddEvenData.bothOdd + oddEvenData.bothEven + oddEvenData.mixed)) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                                <p className="text-sm text-slate-400 mb-2">Misto (1 Ímpar + 1 Par)</p>
                                <p className="text-4xl font-bold text-purple-400">{oddEvenData.mixed}</p>
                                <p className="text-sm text-slate-500 mt-2">
                                    {((oddEvenData.mixed / (oddEvenData.bothOdd + oddEvenData.bothEven + oddEvenData.mixed)) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <p className="text-sm text-yellow-400">
                                💡 <strong>Insight:</strong> O padrão mais frequente é{' '}
                                {oddEvenData.mixed > oddEvenData.bothOdd && oddEvenData.mixed > oddEvenData.bothEven
                                    ? 'MISTO (1 ímpar + 1 par)'
                                    : oddEvenData.bothOdd > oddEvenData.bothEven
                                        ? 'AMBAS ÍMPARES'
                                        : 'AMBAS PARES'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
