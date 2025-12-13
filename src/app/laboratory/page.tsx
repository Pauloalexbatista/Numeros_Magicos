
import Link from 'next/link';
import { Beaker, GitMerge, Brain, ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Laboratório Experimental | Números Mágicos',
    description: 'Área de testes para novas ferramentas e análises avançadas.'
};

export default function LaboratoryPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/20">
                            <Beaker className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                Laboratório Experimental
                            </h1>
                            <p className="text-slate-400 text-lg mt-2">
                                Ferramentas em desenvolvimento e análises avançadas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Card 1: Complementarity */}
                    <Link href="/laboratory/complementarity" className="group relative block h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                <GitMerge className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                Análise de Complementaridade
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Descubra quais sistemas acertam quando os outros falham. Encontre a "Combinação Perfeita" que cobre 100% dos sorteios.
                            </p>
                        </div>
                    </Link>

                    {/* Card 2: Model Lab (Link to existing) */}
                    <Link href="/model-lab" className="group relative block h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                                <Brain className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                                Laboratório ML
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Treine, teste e compare modelos de Inteligência Artificial (LSTM, Random Forest) em tempo real.
                            </p>
                        </div>
                    </Link>

                    {/* Card 3: Consensus (Coming Soon / Existing?) */}
                    <div className="group relative block h-full opacity-60 cursor-not-allowed">
                        <div className="relative h-full bg-slate-900/30 border border-slate-800 rounded-xl p-8 border-dashed">
                            <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center mb-6">
                                <span className="text-2xl">🗳️</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-500 mb-2">
                                Laboratório de Consenso
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                (Em breve) Simulação de votação ponderada entre múltiplos sistemas para gerar a "Super Previsão".
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
