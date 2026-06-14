'use client';

import Link from 'next/link';

export default function LegalFooter() {
    return (
        <footer className="mt-auto border-t border-border bg-surface-0/70 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Disclaimer */}
                    <div className="lg:col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                        <p className="text-xs text-amber-200/90 text-center sm:text-left leading-relaxed">
                            ⚠️ <strong>Disclaimer:</strong> Este site não se responsabiliza por quaisquer perdas financeiras
                            decorrentes da utilização das informações aqui contidas. As análises são puramente estatísticas
                            e não garantem resultados. Jogue responsavelmente.
                        </p>
                    </div>

                    {/* Right: compact links + help */}
                    <div className="flex flex-col gap-3 text-xs text-muted-foreground">
                        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Links úteis">
                            <Link href="/about" className="hover:text-foreground transition-colors">Sobre Nós</Link>
                            <Link href="/responsible-gaming" className="hover:text-foreground transition-colors font-semibold">Jogo Responsável</Link>
                            <Link href="/legal/terms" className="hover:text-foreground transition-colors">Termos e Condições</Link>
                            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
                            <Link href="/contact" className="hover:text-foreground transition-colors">Contacto</Link>
                        </nav>
                        <p className="text-muted-foreground">
                            🎮 Jogo Responsável | Proibido a menores de 18 anos
                        </p>
                        <p>
                            Precisa de ajuda? Linha Vida:{' '}
                            <a href="tel:1414" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>1414</a>
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <p>Acesso gratuito • Sem login • Apenas análise estatística</p>
                    <p>© {new Date().getFullYear()} Números Mágicos. Análise estatística educacional.</p>
                </div>
            </div>
        </footer>
    );
}
