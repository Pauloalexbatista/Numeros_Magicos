import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowLeft, Hash, TrendingUp } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import ExclusionNumbersCard from '@/components/analysis/ExclusionNumbersCard';
import { getExclusionPrediction, getExclusionStats } from '@/services/exclusion-lstm';
import LastDrawNumberSystems from '@/components/dashboard/LastDrawNumberSystems';

export const metadata = {
  title: 'Análise de Números | Números Mágicos',
  description: 'Análises completas de números do EuroMilhões'
};

export default async function NumbersAnalysisPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'USER';

  // Define all number analysis cards
  const basicAnalysisCards = [
    {
      title: 'Quentes e Frios',
      description: 'Análise de números mais e menos frequentes',
      href: '/statistics',
      icon: TrendingUp,
      variant: 'free' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Média e Amplitude',
      description: 'Estatísticas de média e amplitude dos números',
      href: '/mean',
      icon: Hash,
      variant: 'free' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Sequências',
      description: 'Análise de padrões sequenciais',
      href: '/sequences',
      icon: Hash,
      variant: 'free' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Números Primos',
      description: 'Análise de números primos',
      href: '/analysis/primes',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Dezenas',
      description: 'Distribuição por dezenas (0-9, 10-19, etc.)',
      href: '/analysis/decades',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Quadrantes',
      description: 'Distribuição em 4 quadrantes',
      href: '/analysis/quadrants',
      icon: Hash,
      variant: 'free' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Múltiplos',
      description: 'Múltiplos de 3, 4, 5 e 7',
      href: '/analysis/multiples',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Propriedades',
      description: 'Pares, ímpares, primos (análise unificada)',
      href: '/analysis/number-properties',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    }
  ];

  // Get LSTM exclusion prediction & stats
  let exclusionPrediction;
  let exclusionStats = { reliability: 0, total: 0 };
  let exclusionLoading = false;
  try {
    const [prediction, stats] = await Promise.all([
      getExclusionPrediction('NUMBERS'),
      getExclusionStats('NUMBERS')
    ]);
    exclusionPrediction = prediction;
    exclusionStats = stats;
  } catch (error) {
    console.error('[Numbers Page] LSTM prediction failed:', error);
    exclusionLoading = false;
  }

  const advancedSystemsCards = [
    {
      title: 'Laboratório ML',
      description: 'Teste e compare modelos de machine learning',
      href: '/model-lab',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Análise Posicional',
      description: 'Análise por posição (Casa 1-5)',
      href: '/probabilities',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Monte Carlo',
      description: 'Simulações probabilísticas',
      href: '/analysis/monte-carlo',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Cadeias Markov',
      description: 'Análise de probabilidades de transição',
      href: '/analysis/markov',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Clustering',
      description: 'Agrupamento de padrões de números',
      href: '/analysis/clustering',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Detecção Padrões',
      description: 'Sistema de detecção de padrões',
      href: '/patterns',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Matrix Binária',
      description: 'Visualização binária de padrões',
      href: '/matrix',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Vortex Pyramid',
      description: 'Sistema piramidal avançado',
      href: '/analysis/vortex-pyramid',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'LSTM Neural Net',
      description: 'Rede neuronal recorrente',
      href: '/analysis/lstm',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Random Forest',
      description: 'Modelo de floresta aleatória',
      href: '/analysis/random-forest',
      icon: Hash,
      variant: 'premium' as const,
      gridSpan: 2 as const
    },
    {
      title: 'ML Classifier',
      description: 'Classificador de machine learning',
      href: '/analysis/ml-classifier',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Root Sum',
      description: 'Sistema de soma de raízes',
      href: '/analysis/root-sum',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Standard Deviation',
      description: 'Análise de desvio padrão',
      href: '/analysis/standard-deviation',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    },
    {
      title: 'Pattern Based',
      description: 'Sistema baseado em padrões',
      href: '/analysis/pattern-based',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <header className="space-y-6">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </Link>

          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-green-100 dark:bg-green-900">
              <Hash className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight text-green-600 dark:text-green-400">
                Análise de Números
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-2">
                Explorando padrões e estatísticas dos números 1-50
              </p>
            </div>
          </div>
        </header>

        {/* Explanation Card */}
        <div className="rounded-2xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-500 text-white">
              <Hash className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
                ℹ️ O Que São Análises de Números?
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                Análises <strong>estatísticas e preditivas</strong> dos 50 números do EuroMilhões. Cada sistema usa uma abordagem diferente para identificar padrões e tendências.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <strong className="text-green-600 dark:text-green-400">🔥 Quentes e Frios:</strong> Números mais e menos frequentes nos últimos sorteios
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <strong className="text-green-600 dark:text-green-400">🧠 LSTM:</strong> Rede neuronal que aprende padrões complexos do histórico
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <strong className="text-green-600 dark:text-green-400">🌀 Vortex Pyramid:</strong> Sistema matemático avançado baseado em pirâmides
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Basic Analysis Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-green-200 dark:bg-green-800" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
              📊 Análises Básicas
            </h2>
            <div className="h-px flex-grow bg-green-200 dark:bg-green-800" />
          </div>

          {/* LSTM Exclusion Card - Featured */}
          <div className="mb-8">
            <ExclusionNumbersCard
              excluded={exclusionPrediction?.excluded || []}
              confidence={exclusionPrediction?.confidence || 0}
              reliability={exclusionStats.reliability}
              lastUpdate={exclusionPrediction ? new Date() : undefined}
              isLoading={exclusionLoading}
            />
          </div>

          {/* Last Draw Systems & Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="h-full">
              <LastDrawNumberSystems />
            </div>
            <div className="flex flex-col justify-center gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                <h3 className="font-black text-2xl mb-2">🏆 Liga dos Números</h3>
                <p className="font-medium opacity-90 mb-4">Ranking completo dos sistemas de 1-50.</p>
                <Link
                  href="/ranking"
                  className="inline-block px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-zinc-800 transition-colors"
                >
                  Ver Ranking Oficial →
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {basicAnalysisCards.map((card) => (
              <UnifiedCard
                key={card.href}
                title={card.title}
                description={card.description}
                href={card.href}
                icon={card.icon}
                category="numbers"
                variant={card.variant}
                gridSpan={card.gridSpan}
              />
            ))}
          </div>
        </section>

        {/* Advanced Systems Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-green-200 dark:bg-green-800" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
              🤖 Sistemas Avançados
            </h2>
            <div className="h-px flex-grow bg-green-200 dark:bg-green-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {advancedSystemsCards.map((card) => (
              <UnifiedCard
                key={card.href}
                title={card.title}
                description={card.description}
                href={card.href}
                icon={card.icon}
                category="numbers"
                variant={card.variant}
                gridSpan={card.gridSpan}
              />
            ))}
          </div>
        </section>

      </div>

      <ResponsibleGamingFooter />
    </div>
  );
}
