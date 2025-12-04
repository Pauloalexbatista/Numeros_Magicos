
'use client';

import { Card } from '@/components/ui/card';

interface StarPropertiesStats {
    parity: {
        '2P': number; // 2 Pares
        '2I': number; // 2 Ímpares
        '1P1I': number; // 1 Par / 1 Ímpar
    };
    highLow: {
        '2H': number; // 2 Altos (7-12)
        '2L': number; // 2 Baixos (1-6)
        '1H1L': number; // 1 Alto / 1 Baixo
    };
    primes: {
        count0: number; // 0 Primos
        count1: number; // 1 Primo
        count2: number; // 2 Primos
    };
    consecutive: {
        yes: number;
        no: number;
    };
    sum: {
        avg: number;
        min: number;
        max: number;
    };
    totalDraws: number;
}

interface StarPropertiesClientProps {
    stats: StarPropertiesStats;
}

export function StarPropertiesClient({ stats }: StarPropertiesClientProps) {
    const getPercentage = (val: number) => Math.round((val / stats.totalDraws) * 100);

    return (
        <Card className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-sm col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🧬 Propriedades Combinadas das Estrelas
            </h2>
            <p className="text-slate-400 text-sm mb-6">
                Análise de padrões estruturais nos últimos {stats.totalDraws} sorteios.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                {/* 1. Paridade */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        ⚖️ Paridade
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">1 Par / 1 Ímpar</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.parity['1P1I'])}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${getPercentage(stats.parity['1P1I'])}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">2 Pares</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.parity['2P'])}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-400 h-full" style={{ width: `${getPercentage(stats.parity['2P'])}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">2 Ímpares</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.parity['2I'])}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-300 h-full" style={{ width: `${getPercentage(stats.parity['2I'])}%` }} />
                        </div>
                    </div>
                </div>

                {/* 2. Alto/Baixo */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        📈 Alto/Baixo
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">1 Alto / 1 Baixo</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.highLow['1H1L'])}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: `${getPercentage(stats.highLow['1H1L'])}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">2 Altos (7-12)</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.highLow['2H'])}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-400 h-full" style={{ width: `${getPercentage(stats.highLow['2H'])}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">2 Baixos (1-6)</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.highLow['2L'])}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-300 h-full" style={{ width: `${getPercentage(stats.highLow['2L'])}%` }} />
                        </div>
                    </div>
                </div>

                {/* 3. Primos */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        🔢 Primos
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">1 Primo</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.primes.count1)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full" style={{ width: `${getPercentage(stats.primes.count1)}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">2 Primos</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.primes.count2)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-yellow-400 h-full" style={{ width: `${getPercentage(stats.primes.count2)}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">0 Primos</span>
                            <span className="text-sm font-bold text-white">{getPercentage(stats.primes.count0)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-yellow-300 h-full" style={{ width: `${getPercentage(stats.primes.count0)}%` }} />
                        </div>
                    </div>
                </div>

                {/* 4. Consecutivas */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        🔗 Consecutivas
                    </h3>
                    <div className="flex flex-col items-center justify-center h-32">
                        <div className="text-3xl font-bold text-white mb-1">
                            {getPercentage(stats.consecutive.yes)}%
                        </div>
                        <div className="text-xs text-slate-400 mb-4">Saem Seguidas (Ex: 3-4)</div>

                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${getPercentage(stats.consecutive.yes)}%` }} />
                        </div>
                        <div className="flex justify-between w-full mt-1 text-[10px] text-slate-500">
                            <span>Sim</span>
                            <span>Não ({getPercentage(stats.consecutive.no)}%)</span>
                        </div>
                    </div>
                </div>

                {/* 5. Soma */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        ∑ Soma
                    </h3>
                    <div className="flex flex-col items-center justify-center h-32">
                        <div className="text-4xl font-bold text-purple-400 mb-1">
                            {stats.sum.avg}
                        </div>
                        <div className="text-xs text-slate-400">Média da Soma</div>

                        <div className="flex gap-4 mt-4 text-xs">
                            <div className="text-center">
                                <div className="font-bold text-white">{stats.sum.min}</div>
                                <div className="text-slate-500">Mín</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-white">{stats.sum.max}</div>
                                <div className="text-slate-500">Máx</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
}
