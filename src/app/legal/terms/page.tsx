import { BackButton } from '@/components/ui';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Termos e Condições</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <p className="text-muted-foreground">
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
                                Esta plataforma fornece ferramentas de análise estatística e previsão baseada em dados históricos e algoritmos matemáticos para o Euromilhões.
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/30 p-5 rounded-lg border-2 border-red-300 dark:border-red-700 mt-4 space-y-3">
                                <p className="font-bold text-red-900 dark:text-red-200 text-lg">⚠️ Aviso Crítico - Leia Atentamente:</p>
                                <ul className="text-red-800 dark:text-red-300 text-sm space-y-2 list-disc list-inside">
                                    <li><strong>Probabilidade Infinitesimal:</strong> A probabilidade de acertar na chave vencedora do Euromilhões é de aproximadamente 1 em 139.838.160.</li>
                                    <li><strong>Sem Garantias:</strong> NENHUMA análise, sistema ou algoritmo pode garantir ou aumentar significativamente as suas hipóteses de ganhar.</li>
                                    <li><strong>Cada Sorteio é Independente:</strong> Eventos passados NÃO influenciam resultados futuros em jogos de pura sorte.</li>
                                    <li><strong>Risco Financeiro:</strong> Apostar envolve perda de dinheiro. Apenas jogue o que pode perder sem comprometer o seu bem-estar financeiro.</li>
                                    <li><strong>Não Vendemos Ilusões:</strong> Este site oferece análise de dados por puro interesse matemático e estatístico, NÃO fórmulas mágicas.</li>
                                </ul>
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

                        <section>
                            <h2 className="text-xl font-bold mb-2">5. Limitação de Garantias</h2>
                            <p className="mb-3">
                                A plataforma é fornecida "COMO ESTÁ" sem garantias de qualquer tipo, expressas ou implícitas. Especificamente:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300 ml-4">
                                <li>NÃO garantimos que as análises irão resultar em prémios ou lucros.</li>
                                <li>NÃO garantimos precisão de 100% em previsões (impossível em jogos de sorte).</li>
                                <li>NÃO nos responsabilizamos por decisões de apostas baseadas nas nossas ferramentas.</li>
                                <li>NÃO garantimos disponibilidade ininterrupta do serviço.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">6. Limitação de Responsabilidade</h2>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-300 dark:border-amber-700 mb-4">
                                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                                    Disclaimer Legal Importante:
                                </p>
                                <p className="text-amber-800 dark:text-amber-300 text-sm mb-3">
                                    <strong>Este site não se responsabiliza por quaisquer perdas financeiras decorrentes da utilização das informações aqui contidas.</strong>
                                </p>
                                <p className="text-amber-800 dark:text-amber-300 text-sm">
                                    Ao utilizar este serviço, reconhece e aceita que a plataforma, seus criadores e operadores NÃO podem ser responsabilizados por:
                                </p>
                                <ul className="text-amber-800 dark:text-amber-300 text-sm mt-2 space-y-1 list-disc list-inside ml-2">
                                    <li>Perdas financeiras resultantes de apostas</li>
                                    <li>Decisões de jogo baseadas nas análises fornecidas</li>
                                    <li>Problemas de jogo compulsivo ou vício</li>
                                    <li>Erros ou imprecisões nas análises estatísticas</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">7. Jogo Responsável</h2>
                            <p className="mb-3">
                                <strong>Apoiamos fortemente o jogo responsável.</strong> Se sente que tem um problema com o jogo:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300 ml-4">
                                <li>🇵🇹 Linha Vida: <strong>1414</strong> (apoio gratuito em Portugal)</li>
                                <li>🌐 Jogadores Anónimos: <a href="https://jogadoresanonimos.pt" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">jogadoresanonimos.pt</a></li>
                                <li>Estabeleça limites de jogo e respeite-os sempre</li>
                                <li>Nunca aposte dinheiro que não pode perder</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">8. Modificações aos Termos</h2>
                            <p>
                                Reservamo-nos o direito de modificar estes termos a qualquer momento. Utilizadores serão notificados de mudanças significativas por email (se subscrito). A utilização continuada após mudanças constitui aceitação dos novos termos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">9. Contacto e Resolução de Disputas</h2>
                            <p className="mb-2">
                                Para questões sobre estes termos ou disputas, contacte-nos através da <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">página de contacto</a>.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Lei Aplicável: Legislação Portuguesa. Foro: Tribunais de Portugal.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
