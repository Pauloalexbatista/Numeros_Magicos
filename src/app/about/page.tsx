import { BackButton } from '@/components/ui';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Sobre Nós</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Quem Somos?</h2>

                            <p className="text-lg leading-relaxed mb-4">
                                Somos, acima de tudo, <strong>curiosos por natureza</strong> e <strong>apaixonados por números</strong>.
                            </p>

                            <p className="leading-relaxed mb-4">
                                O <span className="text-amber-600 dark:text-amber-400 font-semibold">Números Mágicos</span> nasceu de uma pergunta simples:
                                <em className="text-blue-600 dark:text-blue-400"> "Será que no meio do caos de 50 bolas a saltar, existe algum padrão?"</em>
                            </p>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800 my-6">
                                <p className="text-blue-900 dark:text-blue-200 font-semibold mb-2">
                                    💡 A nossa missão
                                </p>
                                <p className="text-blue-800 dark:text-blue-300">
                                    Não somos gurus da fortuna nem videntes. Somos <strong>entusiastas de matemática e estatística</strong> que
                                    decidiram criar uma ferramenta para quem, como nós, gosta de preencher o boletim com base em dados e não apenas em datas de aniversário.
                                </p>
                            </div>

                            <p className="leading-relaxed mb-4">
                                O nosso <strong>"trabalho de casa"</strong> é analisar frequências, atrasos e tendências, tentando reduzir
                                o vasto universo do Euromilhões a algo mais palpável.
                            </p>

                            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                                Sabemos que <strong className="text-amber-600 dark:text-amber-400">a sorte é quem manda no final</strong>,
                                mas adoramos a viagem de tentar decifrar o código.
                            </p>
                        </section>

                        <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-2xl font-bold mb-4">O que Oferecemos?</h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="text-3xl mb-2">📊</div>
                                    <h3 className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">Análise Estatística</h3>
                                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                                        Mais de 20 análises diferentes baseadas em dados históricos reais
                                    </p>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="text-3xl mb-2">🤖</div>
                                    <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-1">Sistemas Preditivos</h3>
                                    <p className="text-sm text-purple-800 dark:text-purple-300">
                                        Algoritmos matemáticos e redes neuronais para identificar padrões
                                    </p>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <div className="text-3xl mb-2">🎯</div>
                                    <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-1">100% Gratuito</h3>
                                    <p className="text-sm text-amber-800 dark:text-amber-300">
                                        Todas as análises disponíveis sem custos ou subscrições
                                    </p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="text-3xl mb-2">🔍</div>
                                    <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-1">Transparência Total</h3>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        Sem promessas falsas - apenas paixão por números
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg border border-amber-300 dark:border-amber-700">
                                <p className="text-amber-900 dark:text-amber-200 font-semibold mb-2">
                                    ⚠️ Importante:
                                </p>
                                <p className="text-amber-800 dark:text-amber-300 text-sm">
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
