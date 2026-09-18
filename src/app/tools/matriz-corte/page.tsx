import { Suspense } from "react";
import MatrizCorteClient from "@/components/tools/MatrizCorteClient";
import Link from "next/link";
import { ArrowLeft, Loader2, Scissors, ShieldAlert, Sparkles } from "lucide-react";

export const metadata = {
    title: 'Matriz de Corte (Via Negativa) | Números Mágicos',
    description: 'Motor de eliminação e podagem com 5 matrizes de limites históricos e potenciómetro ajustável.'
};

export default function MatrizCortePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            {/* Top Banner & Header */}
            <div className="relative overflow-hidden bg-[#0e1626] border-b border-slate-800">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                    <div className="mb-4">
                        <Link
                            href="/tools"
                            className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para Ferramentas
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Scissors className="w-3.5 h-3.5" />
                            Via Negativa &bull; Podagem de Certeza
                        </span>
                        <span className="text-xs text-gray-400">
                            5 Matrizes Especializadas de Limites
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">
                            Matriz de Corte de Números
                        </span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-400 max-w-3xl">
                        Em vez de adivinhar os números que vão sair, eliminamos com precisão matemática os números que atingiram limites e recordes inviolados nos 4 jogos oficiais.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center p-16">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    }
                >
                    <MatrizCorteClient />
                </Suspense>
            </div>
        </main>
    );
}
