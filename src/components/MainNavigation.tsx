'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hash, Star, Wrench, MessageCircleQuestion, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

export default function MainNavigation({ session }: { session: any }) {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Início',
            href: '/games',
            icon: LayoutDashboard,
            active: pathname === '/games'
        },
        {
            name: 'Euromilhões',
            href: '/dashboard/euromillions',
            icon: Hash,
            active: pathname?.startsWith('/dashboard/euromillions')
        },
        {
            name: 'Totoloto',
            href: '/dashboard/totoloto',
            icon: Hash,
            active: pathname?.startsWith('/dashboard/totoloto')
        },
        {
            name: 'EuroDreams',
            href: '/dashboard/eurodreams',
            icon: Star,
            active: pathname?.startsWith('/dashboard/eurodreams')
        },
        {
            name: 'Ferramentas',
            href: '/tools',
            icon: Wrench,
            active: pathname?.startsWith('/tools')
        }
    ];


    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
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

                    {/* How it Works Button */}
                    <Link
                        href="/how-it-works"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-all border border-transparent hover:border-zinc-700"
                        title="Como Funciona"
                    >
                        <MessageCircleQuestion className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Como Funciona</span>
                    </Link>

                    {/* Contact Button */}
                    <Link
                        href="/contact"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-all border border-transparent hover:border-zinc-700"
                        title="Contacte-nos"
                    >
                        <MessageCircleQuestion className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Contacte-nos</span>
                    </Link>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-medium text-white">
                                    {session.user.name || 'Utilizador'}
                                </p>
                                <p className="text-xs text-zinc-400">
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
                    ) : null}
                </div>
            </div>
        </nav>
    );
}
