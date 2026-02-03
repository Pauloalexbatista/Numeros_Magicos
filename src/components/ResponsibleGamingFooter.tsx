'use client';

import Link from 'next/link';

export default function ResponsibleGamingFooter() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-amber-50/95 dark:bg-amber-950/95 backdrop-blur-sm border-t border-amber-200 dark:border-amber-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0">⚠️</span>
                        <p className="text-amber-800 dark:text-amber-200">
                            <span className="font-bold">Disclaimer:</span> Este site não se responsabiliza por quaisquer perdas financeiras decorrentes da utilização das informações aqui contidas. As análises são puramente estatísticas e não garantem resultados. Jogue responsavelmente.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-1 text-amber-700 dark:text-amber-300">
                        <div className="flex gap-3">
                            <Link href="/about" className="hover:underline">Sobre Nós</Link>
                            <Link href="/responsible-gaming" className="hover:underline">Jogo Responsável</Link>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/terms" className="hover:underline">Termos e Condições</Link>
                            <Link href="/privacy" className="hover:underline">Política de Privacidade</Link>
                            <Link href="/contact" className="hover:underline">Contacto</Link>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-amber-600 dark:text-amber-400 text-[10px] space-y-1">
                        <p>🏠 Jogo Responsável | Proibido a menores de 18 anos</p>
                        <p>Precisa de ajuda? Linha Vida: <span className="font-bold">1414</span></p>
                        <p>© 2026 Números Mágicos. Análise estatística educacional.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
