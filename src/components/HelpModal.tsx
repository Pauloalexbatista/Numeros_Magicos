'use client';

import React from 'react';
import Link from 'next/link';
import { 
    HelpCircle, 
    X, 
    Sparkles, 
    Cpu, 
    Scissors, 
    Wand2, 
    Scale, 
    ExternalLink, 
    ShieldCheck, 
    TrendingUp 
} from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-2xl rounded-3xl bg-surface-1 border border-border/80 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                                Como Funciona o Números Mágicos?
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Guia rápido sobre sistemas estatísticos, fluxo de decisão e valor matemático.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="py-5 space-y-6 text-xs text-foreground/90 leading-relaxed">
                    {/* SECTION 1: O que é um Sistema Estatístico? */}
                    <div className="p-4 rounded-2xl bg-surface-2/60 border border-border/40 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Cpu className="w-4 h-4" />
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-foreground">
                                1. O Que é um Sistema Estatístico?
                            </h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Um sistema estatístico <strong>não é adivinhação nem uma fórmula mágica de lucro</strong>. É um modelo matemático que analisa mais de 10.000 sorteios oficiais para identificar regularidades mecânicas, limites térmicos e padrões probabilísticos reais no volante.
                        </p>
                    </div>

                    {/* SECTION 2: O Fluxo em 3 Etapas */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="w-4 h-4" />
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-foreground">
                                2. O Ecossistema em 3 Etapas
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Step A */}
                            <div className="p-3.5 rounded-2xl bg-surface-2/40 border border-border/50 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-1">
                                        Etapa 1 &bull; Seleção
                                    </span>
                                    <h4 className="text-xs font-bold text-foreground mb-1">Os Nossos Sistemas</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        18 modelos matemáticos (Frequência, Geometria, Ciclos, IA) organizam as bolas por relevância e polaridade.
                                    </p>
                                </div>
                            </div>

                            {/* Step B */}
                            <div className="p-3.5 rounded-2xl bg-surface-2/40 border border-border/50 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block mb-1">
                                        Etapa 2 &bull; Podagem
                                    </span>
                                    <h4 className="text-xs font-bold text-foreground mb-1">Matriz de Corte</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        A via negativa elimina com certeza matemática as bolas que atingiram recordes e limites empíricos inviolados.
                                    </p>
                                </div>
                            </div>

                            {/* Step C */}
                            <div className="p-3.5 rounded-2xl bg-surface-2/40 border border-border/50 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 block mb-1">
                                        Etapa 3 &bull; Execução
                                    </span>
                                    <h4 className="text-xs font-bold text-foreground mb-1">GCI (Wheeling)</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Gera chaves inteligentes blindadas com o Molde Anatómico (dispersão de dezenas e sem trios consecutivos).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Como Saber se um Sistema Tem Valor? */}
                    <div className="p-4 rounded-2xl bg-surface-2/60 border border-border/40 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Scale className="w-4 h-4" />
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-foreground">
                                3. Como Saber se um Sistema Tem Valor?
                            </h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Nas páginas de cada sistema, apresentamos sempre a <strong>comparação contra o Esperado ao Acaso</strong> (distribuição hipergeométrica neutra). Quando a precisão real ou a contagem de picos supera de forma consistente a linha teórica de base, existe uma vantagem estatística explorável.
                        </p>
                    </div>
                </div>

                {/* Footer with Actions */}
                <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link
                        href="/how-it-works"
                        onClick={onClose}
                        className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                        <span>Abrir Guia Metodológico Completo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-95 transition-opacity shadow-sm"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
