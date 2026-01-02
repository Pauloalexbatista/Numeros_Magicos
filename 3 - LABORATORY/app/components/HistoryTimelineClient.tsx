'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function HistoryTimelineClient() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/history')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400">Processando anos de história matemática...</p>
            </div>
        );
    }

    const getFriendlyLabel = (type: string) => {
        switch (type) {
            case 'ML_NEURONAL': return 'Redes Neuronais';
            case 'ESTATISTICO': return 'Estatística / Médias';
            case 'ESTRUTURAL': return 'Vortex / Pirâmide';
            case 'MIXED': return 'Misto / Transição';
            default: return type;
        }
    };

    return (
        <div className="space-y-20">
            {/* Yearly Overview */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-10">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    <h2 className="text-3xl font-black text-white tracking-tight">Evolução da Entropia (2004 - 2025)</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-11 gap-4">
                    {data.yearly.map((y: any) => (
                        <div key={y.period} className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between hover:bg-slate-800/80 hover:shadow-lg hover:shadow-blue-500/5">
                            <div className="text-slate-500 font-black mb-2 text-sm tracking-widest">{y.period}</div>
                            <div className={`text-3xl font-black mb-4 ${y.entropy === 0 ? 'text-slate-700' :
                                    y.regime === 'CHAOTIC' ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]' :
                                        'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                                }`}>
                                {y.entropy > 0 ? `${y.entropy.toFixed(0)}%` : '---'}
                            </div>
                            <div className={`text-[9px] uppercase tracking-tighter font-black px-2 py-1 rounded-lg w-full text-center mt-2 ${y.entropy === 0 ? 'bg-slate-900/50 text-slate-600' :
                                    y.topSystemType === 'ML_NEURONAL' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                        y.topSystemType === 'ESTATISTICO' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                            'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                }`}>
                                {y.entropy === 0 ? 'Sem Dados' : getFriendlyLabel(y.topSystemType)}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Monthly Tactical Timeline (Vertical Layout) */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-4 mb-16">
                    <TrendingUp className="w-10 h-10 text-emerald-400" />
                    <h2 className="text-4xl font-black text-white tracking-tight">Mapa Tático de Regimes (Visão Vertical)</h2>
                </div>

                <div className="w-full">
                    {/* Header: X-Axis Labels */}
                    <div className="flex items-center mb-10 pl-48 pr-12 text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                        <div className="flex-1 text-center text-blue-400 border-x border-slate-800 py-4 bg-blue-500/5 rounded-t-2xl">Estatística / Médias</div>
                        <div className="flex-1 text-center text-orange-400 border-r border-slate-800 py-4 bg-orange-500/5 rounded-t-2xl">Vortex / Pirâmide</div>
                        <div className="flex-1 text-center text-purple-400 border-r border-slate-800 py-4 bg-purple-500/5 rounded-t-2xl">ML / Neuronais</div>
                    </div>

                    <div className="space-y-8 relative pb-20">
                        {/* Continuous vertical dividers */}
                        <div className="absolute left-[calc(33.33%+192px)] top-0 bottom-0 w-[1px] bg-slate-800/50 z-0" />
                        <div className="absolute left-[calc(66.66%+192px)] top-0 bottom-0 w-[1px] bg-slate-800/50 z-0" />

                        {data.monthly.map((m: any, i: number) => (
                            <div key={i} className="flex items-center group min-h-[70px]">
                                {/* Y-Axis: Date */}
                                <div className="w-48 pr-12 text-right">
                                    <div className="text-slate-500 font-black text-sm uppercase tracking-[0.2em] group-hover:text-white transition-all duration-300 group-hover:translate-x-2">
                                        {m.period}
                                    </div>
                                </div>

                                {/* X-Axis: Entropy Track */}
                                <div className="flex-1 h-16 bg-slate-950/40 rounded-2xl relative border border-slate-800/50 group-hover:border-slate-500/30 transition-all flex items-center px-4 shadow-inner group-hover:bg-slate-900/40">
                                    {/* Subtle zone backgrounds */}
                                    <div className="absolute inset-y-0 left-0 w-1/3 bg-blue-500/[0.03]" />
                                    <div className="absolute inset-y-0 left-1/3 w-1/3 bg-orange-500/[0.03]" />
                                    <div className="absolute inset-y-0 left-2/3 w-1/3 bg-purple-500/[0.03]" />

                                    {/* Central Guide Line */}
                                    <div className="absolute left-4 right-4 h-[1px] bg-slate-800/50 z-0" />

                                    {/* Data Point */}
                                    <div
                                        className="absolute transition-all duration-1000 z-10 flex flex-col items-center"
                                        style={{ left: `calc(${m.entropy}% + 16px)`, transform: 'translateX(-50%)' }}
                                    >
                                        <div className={`w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:scale-125 transition-transform shadow-2xl ${m.entropy > 68 ? 'bg-purple-500 shadow-purple-500/50' :
                                                m.entropy > 42 ? 'bg-orange-500 shadow-orange-500/50' :
                                                    'bg-blue-500 shadow-blue-500/50'
                                            }`}>
                                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                                        </div>

                                        {/* Entropy Value Chip */}
                                        <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-white text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-md shadow-2xl z-20 whitespace-nowrap">
                                            {m.entropy.toFixed(1)}% ENTROPIA
                                        </div>
                                    </div>

                                    {/* Track Fill */}
                                    <div
                                        className={`absolute inset-y-4 left-4 rounded-full opacity-10 transition-all duration-1000 ${m.entropy > 68 ? 'bg-purple-500' :
                                                m.entropy > 42 ? 'bg-orange-500' :
                                                    'bg-blue-500'
                                            }`}
                                        style={{ width: `calc(${m.entropy}% - 32px)` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Labels */}
                    <div className="flex items-center mt-12 pl-48 pr-12 text-xs font-black uppercase tracking-[0.3em] text-slate-700">
                        <div className="flex-1 text-center">Estatística / Médias</div>
                        <div className="flex-1 text-center border-l border-slate-800">Vortex / Pirâmide</div>
                        <div className="flex-1 text-center border-l border-slate-800">ML / Neuronais</div>
                    </div>
                </div>
            </section>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 flex gap-6 items-start max-w-4xl mx-auto shadow-2xl">
                <AlertCircle className="w-10 h-10 text-blue-400 shrink-0" />
                <div className="text-base text-slate-300 leading-relaxed">
                    <strong className="text-xl text-blue-300 block mb-2 font-black tracking-tight">A Descoberta do Maestro V2.0:</strong>
                    Este mapa permite identificar visualmente a "fuga" do EuroMilhões entre diferentes regimes matemáticos. Quando os pontos se movem para a direita, entramos em caos total (Neuronais). Quando deslizam para a esquerda, a estrutura (Vortex) e a estatística pura voltam a dominar.
                </div>
            </div>
        </div>
    );
}
