import React from 'react';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Admin Panel
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1">Gestão do Sistema</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem href="/admin" icon="📊" label="Dashboard" />
                    <NavItem href="/admin/systems" icon="🤖" label="Sistemas & AI" />
                    <NavItem href="/admin/users" icon="👥" label="Utilizadores" />
                    <NavItem href="/admin/logs" icon="📜" label="Logs do Sistema" />
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                    >
                        <span>⬅️</span>
                        Voltar ao Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                    <div className="mt-8">
                        <ResponsibleGamingFooter />
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
        >
            <span className="text-lg">{icon}</span>
            {label}
        </Link>
    );
}
