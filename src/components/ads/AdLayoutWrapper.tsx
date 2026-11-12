'use client';

import { usePathname } from 'next/navigation';
import AdBanner from './AdBanner';

interface AdLayoutWrapperProps {
    children: React.ReactNode;
}

export default function AdLayoutWrapper({ children }: AdLayoutWrapperProps) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/auth');
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen justify-center">
            {/* Coluna Esquerda (Apenas Computador / Desktop) */}
            {!isAdminPage && (
                <aside className="hidden xl:flex w-[300px] flex-col items-end pt-20 pr-4 fixed left-0 h-full z-0 pointer-events-auto">
                    <AdBanner
                        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT || 'left-rail'}
                        format="vertical"
                        label="Publicidade"
                    />
                </aside>
            )}

            <main className="w-full max-w-[1400px] relative z-10 min-h-screen flex flex-col">
                {/* Banner Topo Discreto (Apenas Telemóvel, onde as 2 colunas laterais não aparecem) */}
                {!isAdminPage && (
                    <div className="xl:hidden w-full px-4 pt-3 flex justify-center">
                        <AdBanner
                            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_TOP || 'mobile-top'}
                            format="horizontal"
                            className="h-[60px] sm:h-[90px]"
                            label="Publicidade"
                        />
                    </div>
                )}

                <div className="flex-1">{children}</div>

                {/* Banner Fim de Página Discreto (Apenas Telemóvel, antes do rodapé) */}
                {!isAdminPage && (
                    <div className="xl:hidden w-full px-4 pb-6 pt-2 flex justify-center">
                        <AdBanner
                            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_BOTTOM || 'mobile-bottom'}
                            format="horizontal"
                            className="h-[75px] sm:h-[90px]"
                            label="Publicidade"
                        />
                    </div>
                )}
            </main>

            {/* Coluna Direita (Apenas Computador / Desktop) */}
            {!isAdminPage && (
                <aside className="hidden xl:flex w-[300px] flex-col items-start pt-20 pl-4 fixed right-0 h-full z-0 pointer-events-auto">
                    <AdBanner
                        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT || 'right-rail'}
                        format="vertical"
                        label="Publicidade"
                    />
                </aside>
            )}
        </div>
    );
}
