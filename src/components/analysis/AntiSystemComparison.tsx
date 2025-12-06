'use client';

interface Props {
    systemName: string;
    antiSystemName: string;
    inverseExtremes: number;
    totalExtremes: number;
    extremeYears: { year: number; system1: number; system2: number }[];
}

export default function AntiSystemComparison({
    systemName,
    antiSystemName,
    inverseExtremes,
    totalExtremes,
    extremeYears
}: Props) {
    const inversePercentage = totalExtremes > 0
        ? ((inverseExtremes / totalExtremes) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 rounded-xl p-6 border border-purple-800/50">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                ⚡ Comparação com Anti-Sistema
            </h3>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-200">Sistema Principal:</span>
                    <span className="font-bold text-white">{systemName}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-purple-200">Anti-Sistema:</span>
                    <span className="font-bold text-white">{antiSystemName}</span>
                </div>
            </div>

            {/* Correlation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
                    <div className="text-xs text-purple-300 mb-1">Anos Extremos</div>
                    <div className="text-2xl font-bold text-white">{totalExtremes}</div>
                </div>
                <div className="bg-pink-900/30 rounded-lg p-4 border border-pink-700/50">
                    <div className="text-xs text-pink-300 mb-1">Correlação Inversa</div>
                    <div className="text-2xl font-bold text-white">{inverseExtremes}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-700/50">
                    <div className="text-xs text-purple-300 mb-1">Taxa Inversa</div>
                    <div className="text-2xl font-bold text-white">{inversePercentage}%</div>
                </div>
            </div>

            {/* Extreme Years */}
            {extremeYears.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-3">
                        🔥 Anos com Comportamento Inverso
                    </h4>
                    <div className="space-y-2">
                        {extremeYears.map(({ year, system1, system2 }) => (
                            <div
                                key={year}
                                className="flex items-center justify-between p-3 rounded-lg bg-purple-950/50 border border-purple-800/50"
                            >
                                <span className="font-bold text-white">{year}</span>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-purple-300">{systemName}</div>
                                        <div className={`font-bold ${system1 >= 5 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {system1 >= 5 ? '🔥' : '❄️'} {system1} jackpots
                                        </div>
                                    </div>
                                    <div className="text-purple-500">↔</div>
                                    <div className="text-left">
                                        <div className="text-xs text-purple-300">{antiSystemName}</div>
                                        <div className={`font-bold ${system2 >= 5 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {system2 >= 5 ? '🔥' : '❄️'} {system2} jackpots
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interpretation */}
            <div className="mt-6 p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
                <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Interpretação</h4>
                <p className="text-sm text-purple-200">
                    {parseFloat(inversePercentage) > 60 ? (
                        <>
                            <strong className="text-emerald-400">Correlação Inversa Forte!</strong> Quando um sistema está quente (≥5 jackpots),
                            o outro tende a estar frio (≤1 jackpot). Os 25 números de cada sistema têm pouca sobreposição.
                        </>
                    ) : parseFloat(inversePercentage) > 40 ? (
                        <>
                            <strong className="text-yellow-400">Correlação Inversa Moderada.</strong> Há alguma tendência inversa,
                            mas os sistemas também podem estar quentes/frios ao mesmo tempo.
                        </>
                    ) : (
                        <>
                            <strong className="text-zinc-400">Correlação Inversa Fraca.</strong> Os sistemas comportam-se de forma
                            independente na maioria dos anos. Distribuição típica: 3 números de um + 2 do outro.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
