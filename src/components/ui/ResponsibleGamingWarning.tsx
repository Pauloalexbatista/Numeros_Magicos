export default function ResponsibleGamingWarning() {
    return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-6 rounded-xl border-2 border-yellow-400 dark:border-yellow-600 shadow-md">
            <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                        Aviso Importante - Jogo Responsável
                    </h3>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
                        <p>
                            <strong>Esta aplicação é apenas uma ferramenta de análise estatística.</strong> Não garantimos prémios nem resultados. Cada sorteio do EuroMilhões é estatisticamente independente e aleatório.
                        </p>
                        <p>
                            🎲 <strong>Probabilidades reais:</strong> A probabilidade de ganhar o jackpot é de aproximadamente 1 em 140 milhões. As análises apresentadas não alteram estas probabilidades.
                        </p>
                        <p>
                            💰 <strong>Jogue com responsabilidade:</strong> Aposte apenas o que pode perder. O jogo deve ser uma forma de entretenimento, não uma fonte de rendimento. Se sentir que tem problemas com o jogo, procure ajuda profissional.
                        </p>
                        <p className="text-xs mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-700">
                            📞 <strong>Linha Jogo Responsável:</strong> Para apoio, contacte a{' '}
                            <a
                                href="https://www.jogoremoto.pt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-yellow-600 font-semibold"
                            >
                                Linha Vida
                            </a>
                            {' '}ou visite{' '}
                            <a
                                href="https://www.sicad.pt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-yellow-600 font-semibold"
                            >
                                SICAD
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
