'use client';

import { usePathname } from 'next/navigation';

interface AdLayoutWrapperProps {
    children: React.ReactNode;
}

export default function AdLayoutWrapper({ children }: AdLayoutWrapperProps) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/auth');

    // If it's an auth page, render children directly (no layout changes)
    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen justify-center">
            {/* Left Ad Sidebar - Only visible on very large screens */}
            <aside className="hidden 2xl:flex w-[300px] flex-col items-end pt-24 pr-6 fixed left-0 h-full z-0">
                <div className="w-[300px] h-[600px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
                    <span>Publicidade</span>
                    <span className="text-[10px] opacity-50">300x600</span>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <main className="w-full max-w-[1400px] relative z-10 bg-zinc-50 dark:bg-black min-h-screen shadow-2xl shadow-black/5">
                {children}
            </main>

            {/* Right Ad Sidebar - Only visible on very large screens */}
            <aside className="hidden 2xl:flex w-[300px] flex-col items-start pt-24 pl-6 fixed right-0 h-full z-0">
                <div className="w-[300px] h-[600px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
                    <span>Publicidade</span>
                    <span className="text-[10px] opacity-50">300x600</span>
                </div>
            </aside>
        </div>
    );
}
