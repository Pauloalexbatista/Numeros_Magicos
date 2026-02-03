'use client';

import { useState, useEffect } from 'react';
import { executeCalculation, getLatestDrawInfo } from './execution-actions';

export default function ExecutionPanel() {
    const [game, setGame] = useState<'EUROMILLIONS' | 'TOTOLOTO' | 'EURODREAMS'>('EUROMILLIONS');
    const [systemTypes, setSystemTypes] = useState<('BASE' | 'NEURAL' | 'ENSEMBLE')[]>(['BASE']);
    const [includeStars, setIncludeStars] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [drawInfo, setDrawInfo] = useState<any>(null);

    useEffect(() => {
        loadDrawInfo();
    }, [game]);

    const loadDrawInfo = async () => {
        const info = await getLatestDrawInfo(game);
        setDrawInfo(info);
    };

    const handleExecute = async () => {
        setLoading(true);
        setResult(null);

        const res = await executeCalculation({
            game,
            systemTypes,
            includeStars
        });

        setResult(res);
        setLoading(false);

        if (res.success) {
            await loadDrawInfo();
        }
    };

    const toggleSystemType = (type: 'BASE' | 'NEURAL' | 'ENSEMBLE') => {
        setSystemTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    return (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">⚡</div>
                <div>
                    <h3 className="text-xl font-bold text-white">Painel de Execução</h3>
                    <p className="text-sm text-gray-400">Execute cálculos sob demanda</p>
                </div>
            </div>

            {/* Latest Draw Info */}
            {drawInfo && (
                <div className="bg-black/20 rounded-lg p-4 mb-6">
                    <div className="text-sm text-gray-400 mb-1">Último Sorteio</div>
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-lg font-bold text-white">{drawInfo.date}</div>
                            <div className="text-xs text-gray-500">Concurso #{drawInfo.sequenceNumber}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">{drawInfo.performancesCount}</div>
                            <div className="text-xs text-gray-500">sistemas calculados</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Game Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jogo</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'] as const).map(g => (
                            <button
                                key={g}
                                onClick={() => setGame(g)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${game === g
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {g === 'EUROMILLIONS' ? 'EuroMillions' : g === 'TOTOLOTO' ? 'Totoloto' : 'EuroDreams'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Types */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipos de Sistema</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['BASE', 'NEURAL', 'ENSEMBLE'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => toggleSystemType(type)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${systemTypes.includes(type)
                                    ? type === 'BASE' ? 'bg-purple-500 text-white' :
                                        type === 'NEURAL' ? 'bg-orange-500 text-white' :
                                            'bg-pink-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Include Stars */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIncludeStars(!includeStars)}
                        className={`w-12 h-6 rounded-full transition-colors ${includeStars ? 'bg-yellow-500' : 'bg-gray-700'
                            }`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${includeStars ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                    </button>
                    <span className="text-sm text-gray-300">Incluir Estrelas/Lucky Numbers</span>
                </div>

                {/* Execute Button */}
                <button
                    onClick={handleExecute}
                    disabled={loading || systemTypes.length === 0}
                    className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${loading || systemTypes.length === 0
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-cyan-500/50'
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            A Calcular...
                        </span>
                    ) : (
                        '🚀 Executar Cálculo'
                    )}
                </button>

                {/* Result */}
                {result && (
                    <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
                        }`}>
                        {result.success ? (
                            <div>
                                <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                                    <span className="text-xl">✅</span>
                                    Cálculo Concluído!
                                </div>
                                <div className="text-sm text-white space-y-1">
                                    <div className="font-medium">Sorteio: {result.drawDate}</div>
                                    <div className="font-medium">Sistemas calculados: {result.systemsCalculated}</div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                                    <span className="text-xl">❌</span>
                                    Erro
                                </div>
                                <div className="text-sm text-white">{result.error}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
