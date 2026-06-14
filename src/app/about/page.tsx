import { BackButton } from '@/components/ui';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Sobre Nós</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold">Quem Somos?</h2>

                            <p className="text-lg leading-relaxed">
                                Somos, acima de tudo, <strong>curiosos por natureza</strong> e <strong>apaixonados por números</strong>.
                            </p>

                            <p className="leading-relaxed">
                                O <span className="text-accent font-semibold">Números Mágicos</span> nasceu de uma pergunta simples:
                                <em className="text-accent"> &quot;Será que no meio do caos de 50 bolas a saltar, existe algum padrão?&quot;</em>
                            </p>

                            <div className="rounded-xl border border-border bg-surface-1/60 p-5">
                                <p className="font-semibold">💡 A nossa missão</p>
                                <p>
                                    Não somos gurus da fortuna nem videntes. Somos <strong>entusiastas de matemática e estatística</strong> que
                                    decidiram criar uma ferramenta para quem, como nós, gosta de preencher o boletim com base em dados e não apenas em datas de aniversário.
                                </p>
                            </div>

                            <p className="leading-relaxed">
                                O nosso <strong>&quot;trabalho de casa&quot;</strong> é analisar frequências, atrasos e tendências, tentando reduzir
                                o vasto universo do Euromilhões a algo mais palpável.
                            </p>

                            <p className="leading-relaxed text-muted-foreground">
                                Sabemos que <strong className="text-accent">a sorte é quem manda no final</strong>,
                                mas adoramos a viagem de tentar decifrar o código.
                            </p>
                        </section>

                        <section className="border-t border-border pt-6">
                            <h2 className="text-2xl font-bold">O que Oferecemos?</h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">📊</div>
                                    <h3 className="font-bold">Análise Estatística</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Mais de 20 análises diferentes baseadas em dados históricos reais
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">🤖</div>
                                    <h3 className="font-bold">Sistemas Preditivos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Algoritmos matemáticos e redes neuronais para identificar padrões
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">🎯</div>
                                    <h3 className="font-bold">100% Gratuito</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Todas as análises disponíveis sem custos ou subscrições
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">🔍</div>
                                    <h3 className="font-bold">Transparência Total</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Sem promessas falsas - apenas paixão por números
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="border-t border-border pt-6">
                            <div className="rounded-xl border border-warning/40 bg-warning-muted p-5">
                                <p className="font-semibold">⚠️ Importante:</p>
                                <p className="text-sm text-muted-foreground">
                                    Este projeto é <strong>educacional e recreativo</strong>. Não garantimos ganhos nem incentivamos
                                    apostas excessivas. Jogue sempre de forma responsável e dentro dos seus limites financeiros.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
