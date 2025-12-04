import { BackButton } from '@/components/ui';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Termos e Condições</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Última atualização: {new Date().toLocaleDateString('pt-PT')}
                        </p>

                        <section>
                            <h2 className="text-xl font-bold mb-2">1. Aceitação dos Termos</h2>
                            <p>
                                Ao criar uma conta e utilizar este serviço, concorda com estes termos. Se não concordar, não deve utilizar a plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">2. Natureza do Serviço</h2>
                            <p>
                                Esta plataforma fornece ferramentas de análise estatística e previsão baseada em inteligência artificial para jogos de sorte (Euromilhões).
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-4">
                                <p className="font-bold text-yellow-800 dark:text-yellow-200">Aviso Importante:</p>
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                                    As previsões são baseadas em probabilidades matemáticas e não garantem resultados. O jogo envolve riscos. Jogue de forma responsável.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">3. Contas de Utilizador</h2>
                            <p>
                                É responsável por manter a confidencialidade da sua password. Reservamo-nos o direito de suspender contas que violem estes termos ou tentem abusar do sistema.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">4. Propriedade Intelectual</h2>
                            <p>
                                Todo o conteúdo, algoritmos e análises apresentados são propriedade exclusiva da plataforma. É proibida a reprodução ou revenda dos dados sem autorização.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
