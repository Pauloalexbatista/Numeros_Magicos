import { Suspense } from "react";
import SeparacaoExtremosClient from "@/components/tools/SeparacaoExtremosClient";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import ResponsibleGamingFooter from "@/components/ResponsibleGamingFooter";

export const metadata = {
  title: "Ranking de Polaridade & Separação dos Extremos | Números Mágicos",
  description: "Tabela comparativa dos sistemas com maior taxa de Jackpots nos extremos (5-0 no Direto e 0-5 no Anti-Sistema) e menor ruído central."
};

export default function SeparacaoExtremosPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
      <div className="relative overflow-hidden bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-slate-800">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-6">
            <Link
              href="/tools"
              className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Ferramentas
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              RANKING DE POLARIZAÇÃO
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              • A Separação das Águas & Morte do Ruído Central (3-2)
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500">
              Ranking de Polaridade & Separação dos Extremos
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Sistemas que concentram os resultados no <strong>Jackpot Direto (5-0)</strong> ou no <strong>Jackpot do Espelho (0-5)</strong>, esvaziando o ruído estatístico inútil do centro da curva de Gauss.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-16">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          }
        >
          <SeparacaoExtremosClient />
        </Suspense>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ResponsibleGamingFooter />
      </div>
    </main>
  );
}
