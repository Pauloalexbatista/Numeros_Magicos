'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hash, Star, Wrench, MessageCircleQuestion, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

export default function MainNavigation({ session }: { session: any }) {
    const pathname = usePathname();

    // Detetar o jogo em qualquer rota do site (dashboard, ranking, análise de estrelas, etc.)
    const isEuromillions = pathname?.includes('euromillions');
    const isTotoloto = pathname?.includes('totoloto');
    const isEurodreams = pathname?.includes('eurodreams');

    let navBorderColor = "border-zinc-200 dark:border-zinc-800";
    if (isEuromillions) {
        navBorderColor = "border-euro-100 dark:border-euro-900/40";
    } else if (isTotoloto) {
        navBorderColor = "border-toto-100 dark:border-toto-900/40";
    } else if (isEurodreams) {
        navBorderColor = "border-dream-100 dark:border-dream-900/40";
    }

    const navItems = [
        {
            name: 'Início',
            href: '/games',
            icon: LayoutDashboard,
            active: pathname === '/games',
            itemActiveColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
        },
        {
            name: 'Euromilhões',
            href: '/dashboard/euromillions',
            icon: Hash,
            active: pathname?.includes('euromillions'),
            itemActiveColor: "bg-euro-50 dark:bg-euro-950/20 text-euro-600 dark:text-euro-400"
        },
        {
            name: 'Totoloto',
            href: '/dashboard/totoloto',
            icon: Hash,
            active: pathname?.includes('totoloto'),
            itemActiveColor: "bg-toto-50 dark:bg-toto-950/20 text-toto-600 dark:text-toto-400"
        },
        {
            name: 'EuroDreams',
            href: '/dashboard/eurodreams',
            icon: Star,
            active: pathname?.includes('eurodreams'),
            itemActiveColor: "bg-dream-50 dark:bg-dream-950/20 text-dream-600 dark:text-dream-400"
        },
        {
            name: 'Ferramentas',
            href: '/tools',
            icon: Wrench,
            active: pathname?.startsWith('/tools'),
            itemActiveColor: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
        }
    ];

    return (
        <nav className={cn(
            "sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300",
            "bg-white/80 dark:bg-zinc-950/80 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60",
            navBorderColor
        )}>
            <div className="container flex h-16 items-center justify-between px-4 mx-auto">
                {/* Logo com adaptação de cor */}
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "hidden text-lg font-bold sm:inline-block transition-colors duration-300",
                        isEuromillions ? "text-euro-600 dark:text-euro-400" :
                        isTotoloto ? "text-toto-600 dark:text-toto-400" :
                        isEurodreams ? "text-dream-600 dark:text-dream-400" :
                        "text-zinc-800 dark:text-white"
                    )}>
                        Números Mágicos
                    </span>
                </div>

                {/* Main Navigation */}
                <div className="flex items-center gap-1 sm:gap-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                item.active
                                    ? item.itemActiveColor
                                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-100"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="hidden sm:inline-block">{item.name}</span>
                        </Link>
                    ))}

                    {/* How it Works Button */}
                    <Link
                        href="/how-it-works"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-100 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        title="Como Funciona"
                    >
                        <MessageCircleQuestion className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Como Funciona</span>
                    </Link>

                    {/* Contact Button */}
                    <Link
                        href="/contact"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-100 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        title="Contacto"
                    >
                        <MessageCircleQuestion className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Contacto</span>
                    </Link>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-medium text-zinc-850 dark:text-white">
                                    {session.user.name || 'Utilizador'}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {session.user.email}
                                </p>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-white"
                                title="Sair"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </nav>
    );
}
