import { BackButton } from '@/components/ui';

export default function ResponsibleGamingPage() {
    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Jogo Responsável</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold">A Estatística não vence a Realidade</h2>

                            <p className="text-lg leading-relaxed">
                                No <strong>Números Mágicos</strong>, adoramos números, padrões e probabilidades.
                                No entanto, existe um número mais importante que qualquer chave do Euromilhões: <strong className="text-foreground">o seu limite</strong>.
                            </p>

                            <div className="rounded-xl border border-border bg-surface-1/60 p-5">
                                <p className="font-semibold">
                                    Queremos que a sua experiência neste site e no jogo seja <strong>positiva e divertida</strong>.
                                    Por isso, tenha sempre em mente os seguintes princípios:
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">1. O Jogo é Entretenimento, não Investimento</h3>
                            <p>
                                A análise estatística que apresentamos serve para aumentar o interesse e a diversão estratégica do jogo.
                                <strong> Não deve ser vista como uma forma de garantir rendimento ou resolver problemas financeiros</strong>.
                            </p>
                            <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                <p className="font-semibold text-sm">
                                    A probabilidade de ganhar o jackpot continua a ser de <strong>1 em 139.838.160</strong>.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">2. O Passado não prevê o Futuro</h3>
                            <p>
                                Matematicamente, o Euromilhões é um jogo de <strong>&quot;sorteios independentes&quot;</strong>.
                                O facto de um número ter saído 10 vezes no último ano (frequência) ou não sair há 50 sorteios (atraso),
                                <strong className="text-foreground"> não garante que sairá ou falhará no próximo</strong>.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                As nossas ferramentas ajudam a identificar tendências, mas <strong>não certezas</strong>.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">3. Jogue apenas o que pode perder</h3>
                            <p>
                                Defina um <strong>orçamento rigoroso</strong> para o jogo e nunca o ultrapasse.
                            </p>
                            <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                <p className="font-semibold">
                                    ⚠️ Nunca utilize dinheiro destinado a despesas essenciais (casa, alimentação, contas) para fazer apostas.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">4. Proibido a Menores</h3>
                            <p>
                                O jogo a dinheiro e a utilização de plataformas de apostas são <strong className="text-foreground">estritamente proibidos a menores de 18 anos</strong>.
                            </p>
                        </section>

                        <section className="border-t-2 border-border pt-6">
                            <h2 className="text-2xl font-bold">Precisa de ajuda?</h2>

                            <p>
                                Se sentir que o jogo está a deixar de ser uma diversão e a tornar-se uma <strong>ansiedade ou obsessão</strong>,
                                <span className="font-semibold"> pare imediatamente</span>.
                            </p>

                            <div className="rounded-xl border border-border bg-surface-1/60 p-6">
                                <p className="mb-4 font-bold">
                                    🇵🇹 Em Portugal, existem linhas de apoio gratuitas e confidenciais:
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">📞</div>
                                        <div>
                                            <p className="font-bold">Linha Vida (SICAD)</p>
                                            <p className="text-2xl font-bold">1414</p>
                                            <p className="text-sm text-muted-foreground">Dias úteis, das 10h às 18h</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">🌐</div>
                                        <div>
                                            <p className="font-bold">Jogadores Anónimos</p>
                                            <a
                                                href="https://jogadoresanonimos.pt"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent hover:underline"
                                            >
                                                jogadoresanonimos.pt
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pt-6">
                            <div className="rounded-xl border border-border bg-surface-1/60 p-5 text-center">
                                <p className="text-sm text-muted-foreground italic">
                                    &quot;O jogo deve ser uma diversão, não uma necessidade. Se deixou de ser divertido, procure ajuda.&quot;
                                </p>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Se precisar de apoio imediato, procure ajuda especializada. Nós não substituímos serviços profissionais de apoio.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
