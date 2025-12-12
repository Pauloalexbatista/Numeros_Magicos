export default function LegalFooter() {
    return (
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                    <p className="text-xs text-amber-900 dark:text-amber-200 text-center font-semibold">
                        ⚠️ <strong>Disclaimer:</strong> Este site não se responsabiliza por quaisquer perdas financeiras decorrentes da utilização das informações aqui contidas.
                        As análises são puramente estatísticas e não garantem resultados. Jogue responsavelmente.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                    <a href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        Sobre Nós
                    </a>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <a href="/responsible-gaming" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-semibold">
                        Jogo Responsável
                    </a>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <a href="/legal/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        Termos e Condições
                    </a>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <a href="/legal/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        Política de Privacidade
                    </a>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <a href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        Contacto
                    </a>
                </div>

                {/* Responsible Gaming */}
                <div className="text-center text-xs text-zinc-500 dark:text-zinc-500 space-y-1">
                    <p>🎮 Jogo Responsável | Proibido a menores de 18 anos</p>
                    <p>
                        Precisa de ajuda? Linha Vida: <a href="tel:1414" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">1414</a>
                    </p>
                    <p className="text-zinc-400 dark:text-zinc-600 mt-2">
                        © {new Date().getFullYear()} Números Mágicos. Análise estatística educacional.
                    </p>
                </div>
            </div>
        </footer>
    );
}
