import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowLeft, Hash, TrendingUp } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import LastDrawNumberSystems from '@/components/dashboard/LastDrawNumberSystems';
import TopNumberSystemsWidget from '@/components/dashboard/TopNumberSystemsWidget';
import ExplanationCard from '@/components/ExplanationCard';
import { getRankingMetrics } from '@/app/ranking/actions';

export const metadata = {
  title: 'Análise de Números | Números Mágicos',
  description: 'Análises completas de números do EuroMilhões'
};

export default async function NumbersAnalysisPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'USER';

  const rankings = await getRankingMetrics();
  const topNumberSystems = rankings.filter(r => !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(r.systemName)).slice(0, 3);

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
    },
    {
      title: 'Análise de Tendências',
      description: 'Evolução temporal e padrões de subida/descida',
      href: '/analysis/number-trends',
      icon: TrendingUp,
      variant: 'pro' as const,
      gridSpan: 2 as const,
      badge: 'NOVO'
    }
  ];

  const advancedSystemsCards = [
    {
      title: 'Sistema Ouro',
      description: 'Ensemble dos 3 melhores sistemas',
      href: '/analysis/gold',
      icon: TrendingUp,
      variant: 'pro' as const,
      gridSpan: 2 as const,
      badge: 'Top 3'
    },
    {
      title: 'Sistema Prata',
      description: 'Ensemble dos 6 melhores sistemas',
      href: '/analysis/silver',
      icon: TrendingUp,
      variant: 'pro' as const,
      gridSpan: 2 as const,
      badge: 'Top 6'
    },
    {
      title: 'Sistema Bronze',
      description: 'Ensemble dos 9 melhores sistemas',
      href: '/analysis/bronze',
      icon: TrendingUp,
      variant: 'pro' as const,
      gridSpan: 2 as const,
      badge: 'Top 9'
    },

    {
      title: 'Análise Posicional',
      description: 'Pools baseadas em média e desvio padrão por posição',
      href: '/analysis/positional',
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
      title: 'Rede Neuronal LSTM',
      description: 'Aprendizagem Profunda (Séries Temporais)',
      href: '/ranking/euromillions/LSTM Neural Network',
      icon: TrendingUp,
      variant: 'pro' as const,
      gridSpan: 2 as const,
      badge: 'I.A.'
    },
    {
      title: 'Random Forest',
      description: 'Árvores de Decisão Ensemble',
      href: '/ranking/euromillions/Random Forest',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const,
      badge: 'I.A.'
    },
    {
      title: 'ML Classifier',
      description: 'Classificação Algorítmica Estratificada',
      href: '/ranking/euromillions/ML Classifier',
      icon: Hash,
      variant: 'pro' as const,
      gridSpan: 2 as const,
      badge: 'I.A.'
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
            <span className="font-medium">Voltar à Visão Geral</span>
          </Link>

          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-green-100 dark:bg-green-900">
              <Hash className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight text-green-600 dark:text-green-400 text-center">
                Análise de Números
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-2">
                Explorando padrões e estatísticas dos números 1-50
              </p>
            </div>
          </div>
        </header>

        {/* Top Widgets Row - Number Systems Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopNumberSystemsWidget systems={topNumberSystems} />
          <LastDrawNumberSystems />
        </div>

        {/* Explanation Card */}
        <ExplanationCard
          title="ℹ️ O Que São Análises de Números?"
          description="Análises estatísticas e preditivas dos 50 números do EuroMilhões. Cada sistema usa uma abordagem diferente para identificar padrões e tendências."
          points={[
            { title: "🔥 Quentes e Frios:", text: "Números mais e menos frequentes nos últimos sorteios" },
            { title: "🧠 LSTM:", text: "Rede neuronal que aprende padrões complexos do histórico" },
            { title: "🌀 Vortex Pyramid:", text: "Sistema matemático avançado baseado em pirâmides" }
          ]}
          icon={<Hash className="w-6 h-6" />}
          color="green"
        />


        {/* Basic Analysis Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-green-200 dark:bg-green-800" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
              📊 Análises Básicas
            </h2>
            <div className="h-px flex-grow bg-green-200 dark:bg-green-800" />
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
