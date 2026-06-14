'use client';

import { usePathname } from 'next/navigation';

interface AdLayoutWrapperProps {
    children: React.ReactNode;
}

export default function AdLayoutWrapper({ children }: AdLayoutWrapperProps) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/auth');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen justify-center">
            <aside className="hidden 2xl:flex w-[300px] flex-col items-end pt-24 pr-6 fixed left-0 h-full z-0">
                <div className="w-[300px] h-[600px] rounded-lg flex flex-col items-center justify-center text-xs gap-2 bg-surface-1/60 border border-border/70 text-muted-foreground">
                    <span>Publicidade</span>
                    <span className="text-[10px] opacity-50">300x600</span>
                </div>
            </aside>

            <main className="w-full max-w-[1400px] relative z-10 min-h-screen">
                {children}
            </main>

            <aside className="hidden 2xl:flex w-[300px] flex-col items-start pt-24 pl-6 fixed right-0 h-full z-0">
                <div className="w-[300px] h-[600px] rounded-lg flex flex-col items-center justify-center text-xs gap-2 bg-surface-1/60 border border-border/70 text-muted-foreground">
                    <span>Publicidade</span>
                    <span className="text-[10px] opacity-50">300x600</span>
                </div>
            </aside>
        </div>
    );
}
