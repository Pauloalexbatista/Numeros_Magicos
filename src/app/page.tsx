import Link from 'next/link';
import { Sparkles, Trophy, Dices, Wrench } from 'lucide-react';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export default function Home() {
  const gameCards = [
    {
      title: 'Euromilhões',
      description: 'Análises e previsões para o Euromilhões',
      href: '/euromilhoes',
      icon: '🇪🇺',
      gradient: 'from-euro-500 to-euro-700',
      badge: 'Números + Estrelas'
    },
    {
      title: 'Totoloto',
      description: 'Análises e previsões para o Totoloto',
      href: '/totoloto',
      icon: '🇵🇹',
      gradient: 'from-toto-500 to-toto-700',
      badge: 'Números + Lucky Number'
    },
    {
      title: 'EuroDreams',
      description: 'Análises e previsões para o EuroDreams',
      href: '/eurodreams',
      icon: '✨',
      gradient: 'from-dream-500 to-dream-700',
      badge: 'Números + Dream Number'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="container mx-auto px-4 py-12 pb-20">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-land-300 via-land-500 to-land-300 bg-clip-text text-transparent">
            Números Mágicos
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Análises preditivas avançadas para lotarias portuguesas
          </p>
        </div>

        {/* Game Cards Grid - Agora com 3 jogos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {gameCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-105"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative p-6 space-y-3">
                {/* Icon */}
                <div className="text-4xl mb-2">
                  {card.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white transition-all">
                  {card.title}
                </h2>

                {/* Description */}
                <p className="text-zinc-400 text-sm">
                  {card.description}
                </p>

                {/* Badge */}
                <div className="inline-block px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-300 border border-zinc-700">
                  {card.badge}
                </div>

                {/* Arrow */}
                <div className="absolute bottom-6 right-6 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12 text-zinc-300">
            O Que Oferecemos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="text-4xl">🎯</div>
              <h4 className="font-bold text-white">Previsões Avançadas</h4>
              <p className="text-sm text-zinc-400">
                Sistemas preditivos baseados em análise histórica e machine learning
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">📊</div>
              <h4 className="font-bold text-white">Análises Detalhadas</h4>
              <p className="text-sm text-zinc-400">
                Estatísticas completas, padrões e tendências de cada jogo
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">🏆</div>
              <h4 className="font-bold text-white">Rankings de Sistemas</h4>
              <p className="text-sm text-zinc-400">
                Compare a performance de diferentes estratégias preditivas
              </p>
            </div>
          </div>
        </div>
      </div>
      <ResponsibleGamingFooter />
    </div>
  );
}
