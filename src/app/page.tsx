import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export default function Home() {
  const gameCards = [
    {
      title: 'EUROMILHÕES',
      description: 'JACKPOT PREMIUM!',
      href: '/euromilhoes',
      badge: 'PRÓXIMO SORTEIO: TERÇA',
      jackpot: '€123M',
      jackpotLabel: 'JACKPOT',
      cta: 'VER ANÁLISE',
      color: 'blue',
      gradient: 'from-euro-600 to-euro-400',
      symbols: ['★', '★', '★', '★', '★'],
      shape: 'circle'
    },
    {
      title: 'TOTOLOTO',
      description: 'JACKPOT TOTOLOTO',
      href: '/totoloto',
      badge: 'PRÓXIMO SORTEIO: QUARTA',
      jackpot: '€5M',
      jackpotLabel: 'ACUMULADO',
      cta: 'EXPLORAR SISTEMAS',
      color: 'green',
      gradient: 'from-toto-600 to-toto-400',
      symbols: ['♣', '♣', '♣', '♣'],
      shape: 'hexagon'
    },
    {
      title: 'EURODREAMS',
      description: 'PREMIAÇÃO MENSAL',
      href: '/eurodreams',
      badge: 'PRÓXIMO SORTEIO: SEG & QUI',
      jackpot: '€20K/MÊS',
      jackpotLabel: 'DURANTE 30 ANOS',
      cta: 'VER PREVISÕES',
      color: 'purple',
      gradient: 'from-dream-600 to-dream-400',
      symbols: ['🌙', '✨', '☁️', '🌙'],
      shape: 'star'
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
                    <div className={`
                      relative w-32 h-32 flex flex-col items-center justify-center transition-all duration-300 transform group-hover:scale-110
                      ${card.shape === 'star' ? 'bg-[#fbbf24] text-slate-900 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]' :
                        card.shape === 'hexagon' ? 'bg-white/20 backdrop-blur-md border-2 border-white/30 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] group-hover:bg-[#fbbf24] group-hover:text-slate-900 group-hover:border-[#fbbf24]' :
                          'bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full shadow-inner group-hover:bg-[#fbbf24] group-hover:text-slate-900 group-hover:border-[#fbbf24]'}
                    `}>
                      <span className={`text-[9px] font-bold uppercase ${card.shape === 'star' ? 'mb-0.5' : 'opacity-80'}`}>
                        {card.shape === 'star' ? 'GANHA' : card.jackpotLabel}
                      </span>
                      <span className={`font-black leading-none ${card.shape === 'star' ? 'text-sm my-0.5' : 'text-xl my-1'}`}>
                        {card.jackpot}
                      </span>
                      {card.shape === 'star' && (
                        <span className="text-[7px] font-bold uppercase leading-tight px-3 text-center">
                          {card.jackpotLabel}
                        </span>
                      )}
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
