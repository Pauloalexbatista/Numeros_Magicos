import { BackButton } from '@/components/ui';

export default function ResponsibleGamingPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Jogo Responsável</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                                A Estatística não vence a Realidade
                            </h2>

                            <p className="text-lg leading-relaxed">
                                No <strong>Números Mágicos</strong>, adoramos números, padrões e probabilidades.
                                No entanto, existe um número mais importante que qualquer chave do Euromilhões: <strong className="text-red-600 dark:text-red-400">o seu limite</strong>.
                            </p>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800 my-6">
                                <p className="text-blue-900 dark:text-blue-200 font-semibold">
                                    Queremos que a sua experiência neste site e no jogo seja <strong>positiva e divertida</strong>.
                                    Por isso, tenha sempre em mente os seguintes princípios:
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-3">1. O Jogo é Entretenimento, não Investimento</h3>
                            <p>
                                A análise estatística que apresentamos serve para aumentar o interesse e a diversão estratégica do jogo.
                                <strong> Não deve ser vista como uma forma de garantir rendimento ou resolver problemas financeiros</strong>.
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mt-3">
                                <p className="text-red-900 dark:text-red-200 font-semibold text-sm">
                                    A probabilidade de ganhar o jackpot continua a ser de <strong>1 em 139.838.160</strong>.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-3">2. O Passado não prevê o Futuro</h3>
                            <p>
                                Matematicamente, o Euromilhões é um jogo de <strong>"sorteios independentes"</strong>.
                                O facto de um número ter saído 10 vezes no último ano (frequência) ou não sair há 50 sorteios (atraso),
                                <strong className="text-amber-600 dark:text-amber-400"> não garante que sairá ou falhará no próximo</strong>.
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                                As nossas ferramentas ajudam a identificar tendências, mas <strong>não certezas</strong>.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-3">3. Jogue apenas o que pode perder</h3>
                            <p>
                                Defina um <strong>orçamento rigoroso</strong> para o jogo e nunca o ultrapasse.
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-300 dark:border-amber-700 mt-3">
                                <p className="text-amber-900 dark:text-amber-200 font-semibold">
                                    ⚠️ Nunca utilize dinheiro destinado a despesas essenciais (casa, alimentação, contas) para fazer apostas.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-3">4. Proibido a Menores</h3>
                            <p>
                                O jogo a dinheiro e a utilização de plataformas de apostas são <strong className="text-red-600 dark:text-red-400">estritamente proibidos a menores de 18 anos</strong>.
                            </p>
                        </section>

                        <section className="pt-6 border-t-2 border-red-300 dark:border-red-800">
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                                Precisa de ajuda?
                            </h2>

                            <p className="mb-4">
                                Se sentir que o jogo está a deixar de ser uma diversão e a tornar-se uma <strong>ansiedade ou obsessão</strong>,
                                <span className="text-red-600 dark:text-red-400 font-bold"> pare imediatamente</span>.
                            </p>

                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-2 border-green-300 dark:border-green-700">
                                <p className="font-bold text-green-900 dark:text-green-200 mb-4">
                                    🇵🇹 Em Portugal, existem linhas de apoio gratuitas e confidenciais:
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">📞</div>
                                        <div>
                                            <p className="font-bold text-green-900 dark:text-green-200">Linha Vida (SICAD)</p>
                                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">1414</p>
                                            <p className="text-sm text-green-800 dark:text-green-400">Dias úteis, das 10h às 18h</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">🌐</div>
                                        <div>
                                            <p className="font-bold text-green-900 dark:text-green-200">Jogadores Anónimos</p>
                                            <a
                                                href="https://jogadoresanonimos.pt"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                jogadoresanonimos.pt
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pt-6">
                            <div className="bg-zinc-100 dark:bg-zinc-800 p-5 rounded-lg">
                                <p className="text-center text-zinc-700 dark:text-zinc-300 italic">
                                    "O jogo deve ser uma diversão, não uma necessidade. Se deixou de ser divertido, procure ajuda."
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
