import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export default function Home() {
  const gameCards = [
    {
      title: 'EUROMILLIONS',
      description: 'JACKPOT PREMIUM!',
      href: '/euromilhoes',
      badge: 'NEXT DRAW: TUESDAY',
      jackpot: '€123M',
      cta: 'PLAY NOW',
      color: 'blue',
      gradient: 'from-euro-600 to-euro-400',
      symbols: ['★', '★', '★', '★', '★'],
      icon: 'stars'
    },
    {
      title: 'TOTOLOTO',
      description: 'JACKPOT TOTOLOTO',
      href: '/totoloto',
      badge: 'PRÓXIMO SORTEIO: QUARTA',
      jackpot: '€5M',
      cta: 'TENTAR A SORTE',
      color: 'green',
      gradient: 'from-toto-600 to-toto-400',
      symbols: ['♣', '♣', '♣', '♣'],
      icon: 'clover'
    },
    {
      title: 'EURODREAMS',
      description: 'SAMPLE PREMIAUR',
      href: '/eurodreams',
      badge: 'NEXT DRAW: MON & THU',
      jackpot: '€20K/MONTH',
      cta: 'DREAM BIG',
      color: 'purple',
      gradient: 'from-dream-600 to-dream-400',
      symbols: ['🌙', '✨', '☁️', '🌙'],
      icon: 'dreams'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            Números Mágicos
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Análises preditivas avançadas para lotarias portuguesas
          </p>
        </div>

        {/* Game Cards Grid - Redesigned to match illustrative style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {gameCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative h-[450px] overflow-hidden rounded-[32px] shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-hover"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} shadow-inner`} />

              {/* Decorative Symbols (Illustrative Background) */}
              <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden text-white select-none">
                {card.symbols.map((sym, i) => (
                  <div
                    key={i}
                    className="absolute text-4xl animate-pulse"
                    style={{
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  >
                    {sym}
                  </div>
                ))}
              </div>

              {/* Card Content */}
              <div className="relative h-full flex flex-col items-center justify-between p-10 text-center text-white">
                {/* Title */}
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">
                  {card.title}
                </h2>

                {/* Info Container */}
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase">
                      {card.badge}
                    </p>
                    <p className="text-sm font-bold opacity-90 uppercase tracking-widest">
                      {card.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="px-8 py-4 bg-[#fbbf24] text-slate-900 rounded-full font-black text-lg shadow-xl transform transition-transform group-hover:scale-110">
                    {card.cta}
                  </div>

                  {/* Jackpot Badge */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex flex-col items-center justify-center shadow-inner group-hover:bg-[#fbbf24] group-hover:text-slate-900 transition-colors duration-300">
                      <span className="text-[10px] font-bold uppercase opacity-80">JACKPOT</span>
                      <span className="text-xl font-black leading-none">{card.jackpot}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Bottom Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
            </Link>
          ))}
        </div>

      </div>
      <ResponsibleGamingFooter />
    </div>
  );
}
