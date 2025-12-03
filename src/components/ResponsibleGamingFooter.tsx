'use client';

import Link from 'next/link';

export default function ResponsibleGamingFooter() {
    return (
        <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-2xl">
                        ⚠️
                    </div>
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                            Aviso Importante - Jogo Responsável
                        </h3>
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                            Esta aplicação é apenas uma ferramenta de análise estatística. Não garantimos prémios nem resultados.
                            Cada sorteio do EuroMilhões é estatisticamente independente e aleatório.
                        </p>
                    </div>

                    <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
                        <div className="flex gap-2 items-start">
                            <span className="text-lg">🎲</span>
                            <p>
                                <span className="font-bold">Probabilidades reais:</span> A probabilidade de ganhar o jackpot é de aproximadamente 1 em 140 milhões.
                                As análises apresentadas não alteram estas probabilidades.
                            </p>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="text-lg">💰</span>
                            <p>
                                <span className="font-bold">Jogue com responsabilidade:</span> Aposte apenas o que pode perder.
                                O jogo deve ser uma forma de entretenimento, não uma fonte de rendimento.
                                Se sentir que tem problemas com o jogo, procure ajuda profissional.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-amber-200 dark:border-amber-800 flex items-center gap-2 text-sm">
                        <span className="text-lg">📞</span>
                        <p>
                            <span className="font-bold">Linha Jogo Responsável:</span> Para apoio, contacte a <span className="font-bold underline">Linha Vida</span> ou visite <Link href="https://www.sicad.pt" target="_blank" className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100">SICAD</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
