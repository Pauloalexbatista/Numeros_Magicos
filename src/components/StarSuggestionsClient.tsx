
'use client';

import { Card } from '@/components/ui/card';

interface StarSuggestions {
    golden: { pair: string; count: number; total: number };
    hot: { pair: string; count: number; total: number };
    rational: { pair: string; stars: number[] };
}

interface StarSuggestionsClientProps {
    suggestions: StarSuggestions;
}

export function StarSuggestionsClient({ suggestions }: StarSuggestionsClientProps) {
    const formatPair = (pair: string) => pair.split('-').map(n => n.padStart(2, '0')).join(' + ');

    return (
        <Card className="p-6 bg-gradient-to-br from-amber-900/40 to-slate-900/60 border-amber-500/20 backdrop-blur-sm col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2 flex items-center gap-2">
                🏆 Crème de la Crème
            </h2>
            <p className="text-amber-200/60 text-sm mb-6">
                As melhores sugestões baseadas em análise histórica, momento atual e probabilidade racional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Golden Pair */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-slate-900/80 p-6 rounded-xl border border-yellow-500/30 text-center">
                        <div className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-2">O Par de Ouro 👑</div>
                        <div className="text-4xl font-black text-white mb-2 tracking-tight">
                            {formatPair(suggestions.golden.pair)}
                        </div>
                        <div className="text-xs text-slate-400">
                            Saiu <span className="text-yellow-400 font-bold">{suggestions.golden.count} vezes</span> em {suggestions.golden.total} sorteios.
                            <br />O campeão histórico absoluto.
                        </div>
                    </div>
                </div>

                {/* 2. Hot Pair */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-slate-900/80 p-6 rounded-xl border border-red-500/30 text-center">
                        <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">O Par do Momento 🔥</div>
                        <div className="text-4xl font-black text-white mb-2 tracking-tight">
                            {formatPair(suggestions.hot.pair)}
                        </div>
                        <div className="text-xs text-slate-400">
                            Saiu <span className="text-red-400 font-bold">{suggestions.hot.count} vezes</span> nos últimos 100.
                            <br />A tendência mais forte agora.
                        </div>
                    </div>
                </div>

                {/* 3. Rational Pick */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-slate-900/80 p-6 rounded-xl border border-blue-500/30 text-center">
                        <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">A Escolha Racional 🧠</div>
                        <div className="text-4xl font-black text-white mb-2 tracking-tight">
                            {formatPair(suggestions.rational.pair)}
                        </div>
                        <div className="text-xs text-slate-400">
                            Combina as <span className="text-blue-400 font-bold">2 Estrelas Mais Frequentes</span> individualmente.
                            <br />Estatisticamente a aposta mais segura.
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
}
