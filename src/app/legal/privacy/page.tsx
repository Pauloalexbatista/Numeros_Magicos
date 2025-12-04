import { BackButton } from '@/components/ui';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <p className="text-zinc-500 dark:text-zinc-400">
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
                            </ul>
                            <p className="mt-4">
                                Para exercer qualquer um destes direitos, utilize o nosso formulário de contacto ou envie um email para o administrador.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
