'use client';

import Link from 'next/link';

export default function ResponsibleGamingFooter() {
    return (
        <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Col 1: Aviso Principal */}
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-xl">
                        ⚠️
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-amber-900 dark:text-amber-100 mb-1">
                            Jogo Responsável
                        </h3>
                        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                            Ferramenta estatística. Não garantimos prémios. Resultados aleatórios.
                        </p>
                    </div>
                </div>

                {/* Col 2: Probabilidades */}
                <div className="space-y-3 text-xs text-amber-800 dark:text-amber-200 border-l border-amber-200 dark:border-amber-800 pl-4">
                    <div className="flex gap-2 items-start">
                        <span className="text-base">🎲</span>
                        <p>
                            <span className="font-bold">Jackpot:</span> 1 em 140 milhões. A estatística não muda sorte.
                        </p>
                    </div>
                    <div className="flex gap-2 items-start">
                        <span className="text-base">💰</span>
                        <p>
                            <span className="font-bold">Aposte o que pode perder.</span> Jogo é diversão, não rendimento.
                        </p>
                    </div>
                </div>

                {/* Col 3: Ajuda */}
                <div className="flex gap-2 items-start text-xs text-amber-800 dark:text-amber-200 border-l border-amber-200 dark:border-amber-800 pl-4 h-full">
                    <span className="text-base">📞</span>
                    <div>
                        <p className="mb-2">
                            <span className="font-bold">Precisa de ajuda?</span>
                        </p>
                        <p>
                            Contacte a <span className="font-bold underline">Linha Vida</span> ou visite <Link href="https://www.sicad.pt" target="_blank" className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100">SICAD</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
