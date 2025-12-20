
import Link from 'next/link';
import { Beaker, GitMerge, Brain, ArrowLeft, Vote, Ban, Activity, TrendingUp, Clock } from 'lucide-react';

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
          <Link href="http://localhost:3000" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar à App Principal
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
                Ferramentas em desenvolvimento e análises independentes.
              </p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1: Complementarity */}
          <Link href="/complementarity" className="group relative block h-full">
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

          {/* Card 2: Consensus */}
          <Link href="/consensus" className="group relative block h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Vote className="w-6 h-6 text-blue-500 group-hover:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                Laboratório de Consenso
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A "Mente Coletiva". Simulação de votação ponderada entre múltiplos sistemas para gerar uma Super Previsão.
              </p>
            </div>
          </Link>

          {/* Card 3: Universal Oscillation */}
          <Link href="/universal-oscillation" className="group relative block h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-green-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <Activity className="w-6 h-6 text-green-500 group-hover:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
                Oscilação Universal
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualize a "respiração" dos números. Descubra como as raízes digitais oscilam e preveja a próxima onda de energia.
              </p>
            </div>
          </Link>

          {/* Card 4: Exclusion */}
          <Link href="/exclusion" className="group relative block h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-red-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                <Ban className="w-6 h-6 text-red-500 group-hover:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-300 transition-colors">
                Simulação de Exclusão
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Identificação matemática dos números "frios" com menor probabilidade estatística de sair.
              </p>
            </div>
          </Link>

          {/* Card 5: Maestro (NEW) */}
          <Link href="/maestro" className="group relative block h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-amber-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <Brain className="w-6 h-6 text-amber-500 group-hover:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                Professor Maestro
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                O cerebro do laboratório. Analisa todos os outros sistemas e decide qual a melhor combinação para o próximo sorteio.
              </p>
            </div>
          </Link>

          {/* Card 6: Regimes -> Redirects to History Timeline */}
          <Link href="/history-timeline" className="group relative block h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-emerald-500 group-hover:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                Detector de Regimes
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Identifica se estamos em regime de "Frequência", "Caos" ou "Compensação" (Ver Cronologia Histórica).
              </p>
            </div>
          </Link>

          {/* Card 7: History Timeline (NEW) */}
          <Link href="/history-timeline" className="group relative block h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-xl p-8 transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Clock className="w-6 h-6 text-blue-500 group-hover:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                Cronologia de Entropia
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A "viagem no tempo" do Maestro. Veja como o regime do EuroMilhões mudou ao longo dos anos e quais sistemas ganharam em cada fase.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
