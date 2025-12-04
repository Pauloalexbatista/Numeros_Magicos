'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hash, Star, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

export default function MainNavigation({ session }: { session: any }) {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Dashboard',
            href: '/',
            icon: LayoutDashboard,
            active: pathname === '/'
        },
        {
            name: 'Números',
            href: '/analysis/numbers',
            icon: Hash,
            active: pathname?.startsWith('/analysis') && !pathname?.startsWith('/analysis/stars')
        },
        {
            name: 'Estrelas',
            href: '/analysis/stars',
            icon: Star,
            active: pathname?.startsWith('/analysis/stars')
        }
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <span className="text-lg font-bold">🔮</span>
                    </div>
                    <span className="hidden text-lg font-bold text-white sm:inline-block">
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
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                item.active
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="hidden sm:inline-block">{item.name}</span>
                        </Link>
                    ))}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-medium text-white">
                                    {session.user.name || 'Utilizador'}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {session.user.email}
                                </p>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                                title="Sair"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                        >
                            <User className="h-4 w-4" />
                            <span>Entrar</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
