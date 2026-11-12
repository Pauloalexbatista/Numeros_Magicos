'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutGrid, Sparkles, Trophy, Calculator } from 'lucide-react';
import { Suspense } from 'react';

const KNOWN_GAMES = ['euromillions', 'totoloto', 'eurodreams', 'megasena', 'lotofacil'];

function MobileBottomNavInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
        return null;
    }

    // Detect active game from URL path or ?game= query parameter
    const pathGame = KNOWN_GAMES.find(g => pathname?.toLowerCase().includes(`/${g}`));
    const queryGame = searchParams?.get('game')?.toLowerCase();
    const activeGame = pathGame || (queryGame && KNOWN_GAMES.includes(queryGame) ? queryGame : 'euromillions');

    const navItems = [
        {
            id: 'painel',
            label: 'Jogos & Painel',
            href: pathGame ? `/dashboard/${activeGame}` : `/games`,
            isActive: pathname === '/games' || pathname?.startsWith('/dashboard') || pathname?.startsWith('/systems'),
            icon: LayoutGrid,
        },
        {
            id: 'previsoes',
            label: 'Previsões',
            href: `/previsoes/proximo-sorteio?game=${activeGame}`,
            isActive: pathname?.startsWith('/previsoes'),
            icon: Sparkles,
        },
        {
            id: 'ranking',
            label: 'Top Sistemas',
            href: `/ranking/${activeGame}`,
            isActive: pathname?.startsWith('/ranking'),
            icon: Trophy,
        },
        {
            id: 'desdobrar',
            label: 'Desdobrar',
            href: `/wheeling?game=${activeGame.toUpperCase()}`,
            isActive: pathname?.startsWith('/wheeling') || pathname?.startsWith('/simulator'),
            icon: Calculator,
        },
    ];

    return (
        <nav
            aria-label="Navegação rápida mobile"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-surface-0/95 dark:bg-zinc-950/95 backdrop-blur-xl pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"
        >
            <div className="grid grid-cols-4 h-14 max-w-md mx-auto px-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-150 ${
                                item.isActive
                                    ? 'text-[var(--accent,rgb(59,130,246))] font-bold'
                                    : 'text-muted-foreground hover:text-foreground font-medium'
                            }`}
                        >
                            <div
                                className={`p-1 rounded-lg transition-colors ${
                                    item.isActive ? 'bg-[var(--accent,rgb(59,130,246))]/15' : ''
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export default function MobileBottomNav() {
    return (
        <Suspense fallback={null}>
            <MobileBottomNavInner />
        </Suspense>
    );
}
