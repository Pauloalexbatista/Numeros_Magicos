'use client';

import { useState, useEffect } from 'react';
import { Shield, Zap, TrendingUp, CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react';

export default function MaestroClient() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/maestro')
            .then(res => res.json())
            .then(data => {
                setStatus(data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Sincronizando com o núcleo do Maestro...</p>
            </div>
        );
    }

    const { regime, consensus, veto } = status;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${regime.regime === 'CHAOTIC' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                <Zap size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Estado do Sistema</h2>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end gap-8">
                            <div className="flex-1">
                                <div className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">Regime Atual</div>
                                <div className={`text-5xl font-black mb-4 ${regime.regime === 'CHAOTIC' ? 'text-orange-400' : 'text-emerald-400'}`}>
                                    {regime.regime}
                                </div>
                                <p className="text-slate-300 leading-relaxed max-w-md">
                                    {regime.description}
                                </p>
                            </div>

                            <div className="w-full md:w-48 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-500 uppercase">Índice de Entropia</span>
                                        <span className="text-white">{regime.entropyScore.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${regime.regime === 'CHAOTIC' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${regime.entropyScore}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-white/10 text-white">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Veto de Inteligência</h2>
                        </div>
                        <div className="text-5xl font-black text-white mb-2">{veto.vetoedNumbers.length}</div>
                        <div className="text-sm text-indigo-300 font-medium uppercase tracking-wider">Candidatos Eliminados</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                <section>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-400">
                        <XCircle size={18} /> Números com Veto (Rejeitados)
                    </h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {veto.vetoedNumbers.map((n: number) => (
                            <div key={n} className="aspect-square flex items-center justify-center rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 font-bold">
                                {n}
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 size={18} /> Seleção Final Maestro
                    </h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                        {veto.finalNumbers.map((n: number) => (
                            <div key={n} className="aspect-square flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-lg shadow-lg shadow-emerald-500/5">
                                {n}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
