import { BackButton } from '@/components/ui';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-sans">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <p className="text-muted-foreground">
                            Última atualização: {new Date().toLocaleDateString('pt-PT')}
                        </p>

                        <section>
                            <h2 className="text-xl font-bold mb-2">1. Recolha de Dados</h2>
                            <p>
                                Para fornecer os nossos serviços de análise e previsão, recolhemos apenas os dados estritamente necessários:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
                                <li><strong>Email:</strong> Para autenticação única, recuperação de conta e comunicações (se consentido).</li>
                                <li><strong>Nome:</strong> Para personalização da experiência.</li>
                                <li><strong>Password:</strong> Armazenada de forma encriptada (hash) e irreversível.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">2. Finalidade do Tratamento</h2>
                            <p>
                                Os seus dados são utilizados exclusivamente para:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
                                <li>Gerir o acesso à sua conta pessoal.</li>
                                <li>Disponibilizar as ferramentas de análise e previsão.</li>
                                <li>Enviar novidades e atualizações (apenas se subscrever a Newsletter).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">3. Segurança</h2>
                            <p>
                                Implementamos medidas de segurança robustas, incluindo encriptação de passwords e proteção contra acessos não autorizados.
                                Não partilhamos os seus dados com terceiros para fins comerciais.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">4. Os Seus Direitos (RGPD)</h2>
                            <p>
                                De acordo com o Regulamento Geral sobre a Proteção de Dados, tem o direito de:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
                                <li>Aceder aos seus dados pessoais.</li>
                                <li>Retificar dados incorretos.</li>
                                <li>Solicitar o apagamento dos seus dados ("Direito a ser esquecido").</li>
                                <li>Retirar o consentimento para comunicações de marketing a qualquer momento.</li>
                                <li>Exportar os seus dados num formato legível por máquina (portabilidade).</li>
                            </ul>
                            <p className="mt-4">
                                Para exercer qualquer um destes direitos, utilize o nosso <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">formulário de contacto</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">5. Retenção de Dados</h2>
                            <p className="mb-3">
                                Os seus dados pessoais são conservados pelos seguintes períodos:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                                <li><strong>Conta Ativa:</strong> Enquanto a sua conta estiver ativa e em uso.</li>
                                <li><strong>Conta Inativa:</strong> Até 2 anos após o último acesso (depois automaticamente removida).</li>
                                <li><strong>Após Eliminação:</strong> 30 dias em backup para recuperação de emergência, depois apagamento permanente.</li>
                                <li><strong>Dados Estatísticos Anónimos:</strong> Podem ser conservados indefinidamente (sem identificação pessoal).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">6. Cookies e Armazenamento Local</h2>
                            <p className="mb-3">
                                Utilizamos tecnologias de armazenamento para melhorar a sua experiência:
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                                    <li><strong>Cookies de Autenticação:</strong> Essenciais para manter o login (não podem ser desativados).</li>
                                    <li><strong>LocalStorage:</strong> Guarda preferências de tema (dark mode) e configurações de dashboard.</li>
                                    <li><strong>Sem Cookies de Tracking:</strong> NÃO utilizamos Google Analytics nem ferramentas de rastreamento de terceiros.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">7. Transferências Internacionais</h2>
                            <p>
                                Os seus dados são armazenados e processados em servidores localizados na União Europeia (ou jurisdições com proteção equivalente ao RGPD).
                                Não transferimos dados para países fora da UE sem garantias adequadas de proteção.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">8. Atualizações a Esta Política</h2>
                            <p>
                                Esta política de privacidade pode ser atualizada periodicamente. A data da última atualização está indicada no topo da página.
                                Mudanças significativas serão comunicadas por email (se subscrito à newsletter).
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
