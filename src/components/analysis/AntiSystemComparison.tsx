import React from 'react';
import { RefreshCcw, ShieldAlert, ArrowRightLeft, TrendingDown, TrendingUp } from 'lucide-react';

interface AntiSystemProps {
    systemName: string;
    recoveryStatus: 'hot' | 'warming' | 'cold';
    currentStreak: number;
}

export default function AntiSystemComparison({ systemName, recoveryStatus, currentStreak }: AntiSystemProps) {
    const isAntiSystemRecommended = recoveryStatus === 'cold';

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mt-8">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <RefreshCcw className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Análise do Anti-Sistema</h3>
                        <p className="text-sm text-zinc-200">Comparativo Lógico & Recomendação de Uso</p>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <p className="text-zinc-200">
                        O <strong className="text-purple-400">Anti-Sistema</strong> utiliza exatamente a premissa matemática oposta ao <em>{systemName}</em>. 
                        Na teoria das probabilidades aplicadas, os sistemas movem-se em ciclos de ondas (altas e baixas). 
                        Quando um sistema entra num vale profundo (seca), o seu Anti-Sistema entra num pico de alta probabilidade.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">Ciclo do Sistema</span>
                            </div>
                            <p className="text-sm text-zinc-200">
                                Usa-se quando o sistema principal aproxima-se ou ultrapassa o tempo médio de recuperação histórica.
                            </p>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-lg border border-purple-900/50">
                            <div className="flex items-center gap-2 mb-2 text-purple-400">
                                <TrendingDown className="w-4 h-4" />
                                <span className="font-bold">Ciclo do Anti-Sistema</span>
                            </div>
                            <p className="text-sm text-zinc-200">
                                Usa-se como refúgio tático quando o sistema principal acabou de dar um prémio alto e entra em "dormência".
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${
                    isAntiSystemRecommended 
                        ? 'bg-purple-950/40 border-purple-800/50' 
                        : 'bg-emerald-950/30 border-emerald-800/50'
                }`}>
                    <ArrowRightLeft className={`w-8 h-8 mb-3 ${isAntiSystemRecommended ? 'text-purple-400' : 'text-emerald-400'}`} />
                    <h4 className="text-sm uppercase tracking-wider text-zinc-200 mb-1">Estratégia Recomendada Hoje</h4>
                    
                    {isAntiSystemRecommended ? (
                        <>
                            <div className="text-xl font-bold text-purple-400 mb-2">Usar Anti-Sistema</div>
                            <p className="text-xs text-zinc-200">
                                O <em>{systemName}</em> está frio (acabou de dar prémio e não atingiu 70% da média de recuperação). A probabilidade de acerto agora é maior na lógica oposta.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-xl font-bold text-emerald-400 mb-2">Manter Sistema Atual</div>
                            <p className="text-xs text-zinc-200">
                                O <em>{systemName}</em> está {recoveryStatus === 'hot' ? 'quase a rebentar' : 'a reaquecer'} (seca de {currentStreak} sorteios). Fica no sistema principal, a probabilidade está a convergir.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
