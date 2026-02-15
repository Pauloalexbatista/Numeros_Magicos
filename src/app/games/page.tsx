import Link from 'next/link';

export default function GamesPage() {
    const gameCards = [
        {
            title: 'EUROMILHÕES',
            drawDays: 'TERÇA & SEXTA',
            description: 'JACKPOT PREMIUM',
            href: '/dashboard/euromillions',
            cta: 'Ver Análise',
        },
        {
            title: 'TOTOLOTO',
            drawDays: 'QUARTA & SÁBADO',
            description: 'ACUMULADO',
            href: '/dashboard/totoloto',
            cta: 'Ver Análise',
        },
        {
            title: 'EURODREAMS',
            drawDays: 'SEGUNDA & QUINTA',
            description: 'PREMIAÇÃO MENSAL',
            href: '/dashboard/eurodreams',
            cta: 'Ver Análise',
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl font-bold text-[#2D3748]">
                        Números Mágicos
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Análises preditivas avançadas para lotarias portuguesas
                    </p>
                </div>

                {/* Game Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {gameCards.map((card) => (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="group"
                        >
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                {/* Card Header with Color */}
                                <div
                                    className={`p-8 text-white text-center ${card.title === 'EUROMILHÕES' ? 'bg-[#4A90E2]' :
                                        card.title === 'TOTOLOTO' ? 'bg-[#27AE60]' :
                                            'bg-[#9B59B6]'
                                        }`}
                                >
                                    <h2 className="text-3xl font-bold mb-3">
                                        {card.title}
                                    </h2>
                                    <p className="text-sm font-medium opacity-90 tracking-wide">
                                        PRÓXIMO SORTEIO: {card.drawDays}
                                    </p>
                                </div>

                                {/* Card Body */}
                                <div className="p-8 text-center space-y-6">
                                    <div className="text-slate-600 font-medium text-sm">
                                        {card.description}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-300 transform group-hover:scale-105 ${card.title === 'EUROMILHÕES' ? 'bg-[#4A90E2] hover:bg-[#3A7BC2]' :
                                            card.title === 'TOTOLOTO' ? 'bg-[#27AE60] hover:bg-[#1E8E50]' :
                                                'bg-[#9B59B6] hover:bg-[#7B3996]'
                                            }`}
                                    >
                                        {card.cta}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 py-8 border-t border-slate-200 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
                        <Link href="/about" className="text-slate-600 hover:text-[#1A5276] transition-colors">
                            Sobre Nós
                        </Link>
                        <Link href="/responsible-gaming" className="text-slate-600 hover:text-[#1A5276] transition-colors">
                            Jogo Responsável
                        </Link>
                        <Link href="/legal" className="text-slate-600 hover:text-[#1A5276] transition-colors">
                            Termos e Condições
                        </Link>
                        <Link href="/contact" className="text-slate-600 hover:text-[#1A5276] transition-colors">
                            Contacto
                        </Link>
                    </div>

                    <div className="text-center text-sm text-slate-500 space-y-2">
                        <p className="flex items-center justify-center gap-2">
                            <span className="inline-block w-5 h-5 text-amber-600">⚠️</span>
                            <strong>Disclaimer:</strong> Este site não se responsabiliza por quaisquer perdas financeiras decorrentes da utilização das informações aqui contidas. As análises são puramente estatísticas e não garantem resultados.
                        </p>
                        <p className="text-slate-400">
                            © 2026 Números Mágicos. Análise estatística educacional.
                        </p>
                        <p className="text-slate-400">
                            Precisa de ajuda? Linha Vista: 1414
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
