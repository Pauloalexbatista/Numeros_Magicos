
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
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 backdrop-blur-sm col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                🏆 Crème de la Crème
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-6">
                As melhores sugestões baseadas em análise histórica, momento atual e probabilidade racional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Golden Pair */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/60 dark:bg-yellow-900/40 p-6 rounded-xl border border-yellow-400/50 text-center backdrop-blur-md">
                        <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-2">O Par de Ouro 👑</div>
                        <div className="text-4xl font-black text-yellow-900 dark:text-yellow-100 mb-2 tracking-tight">
                            {formatPair(suggestions.golden.pair)}
                        </div>
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                            Saiu <span className="font-bold">{suggestions.golden.count} vezes</span> em {suggestions.golden.total} sorteios.
                            <br />O campeão histórico absoluto.
                        </div>
                    </div>
                </div>

                {/* 2. Hot Pair */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-orange-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/60 dark:bg-yellow-900/40 p-6 rounded-xl border border-red-400/50 text-center backdrop-blur-md">
                        <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">O Par do Momento 🔥</div>
                        <div className="text-4xl font-black text-yellow-900 dark:text-yellow-100 mb-2 tracking-tight">
                            {formatPair(suggestions.hot.pair)}
                        </div>
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                            Saiu <span className="text-red-600 dark:text-red-400 font-bold">{suggestions.hot.count} vezes</span> nos últimos 100.
                            <br />A tendência mais forte agora.
                        </div>
                    </div>
                </div>

                {/* 3. Rational Pick */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/60 dark:bg-yellow-900/40 p-6 rounded-xl border border-blue-400/50 text-center backdrop-blur-md">
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">A Escolha Racional 🧠</div>
                        <div className="text-4xl font-black text-yellow-900 dark:text-yellow-100 mb-2 tracking-tight">
                            {formatPair(suggestions.rational.pair)}
                        </div>
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                            Combina as <span className="text-blue-600 dark:text-blue-400 font-bold">2 Estrelas Mais Frequentes</span>.
                            <br />Estatisticamente a aposta mais segura.
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
}
