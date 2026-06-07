'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hash, Star, Wrench, HelpCircle, Mail, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

const GAMES = [
  {
    id: 'euromillions',
    name: 'Euromilhões',
    href: '/dashboard/euromillions',
    icon: Hash,
    accentVar: 'var(--euro-accent)',
    borderVar: 'var(--euro-border)',
  },
  {
    id: 'totoloto',
    name: 'Totoloto',
    href: '/dashboard/totoloto',
    icon: Hash,
    accentVar: 'var(--toto-accent)',
    borderVar: 'var(--toto-border)',
  },
  {
    id: 'eurodreams',
    name: 'EuroDreams',
    href: '/dashboard/eurodreams',
    icon: Star,
    accentVar: 'var(--dream-accent)',
    borderVar: 'var(--dream-border)',
  },
];

export default function MainNavigation({ session }: { session: any }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para mudar aparência do header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Toggle de tema
  const toggleTheme = () => {
    const html = document.documentElement;
    const newDark = !isDark;
    setIsDark(newDark);
    html.classList.toggle('dark', newDark);
    html.classList.toggle('light', !newDark);
    localStorage.setItem('nm-theme', newDark ? 'dark' : 'light');
  };

  // Restaurar tema guardado
  useEffect(() => {
    const saved = localStorage.getItem('nm-theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  // Jogo activo
  const activeGame = GAMES.find(g => pathname?.includes(g.id));

  // Cor de destaque do header baseada no jogo activo
  const headerBorderColor = activeGame
    ? activeGame.borderVar
    : 'var(--border-subtle)';

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href);

  return (
    <nav
      style={{
        borderBottomColor: headerBorderColor,
        backgroundColor: scrolled
          ? 'color-mix(in srgb, var(--surface-0) 92%, transparent)'
          : 'color-mix(in srgb, var(--surface-0) 80%, transparent)',
      }}
      className="sticky top-0 z-50 w-full border-b transition-all duration-300"
      role="navigation"
      aria-label="Navegação principal"
    >
      {/* Backdrop blur via elemento separado para melhor performance */}
      <div
        className="absolute inset-0 -z-10"
        style={{ backdropFilter: 'blur(16px) saturate(1.6)' }}
      />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* Logo */}
        <Link
          href="/games"
          className="flex items-center gap-2 shrink-0"
          aria-label="Números Mágicos — página inicial"
        >
          <span
            className="text-lg font-bold tracking-tight transition-colors duration-300"
            style={{
              fontFamily: 'var(--font-display)',
              color: activeGame ? activeGame.accentVar : 'var(--text-primary)',
            }}
          >
            Números Mágicos
          </span>
        </Link>

        {/* Tabs dos jogos — centro */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Seleccionar jogo">
          {GAMES.map((game) => {
            const active = isActive(game.href);
            const Icon = game.icon;
            return (
              <Link
                key={game.id}
                href={game.href}
                role="tab"
                aria-selected={active}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? `color-mix(in srgb, ${game.accentVar} 12%, transparent)` : 'transparent',
                  color: active ? game.accentVar : 'var(--text-tertiary)',
                  borderBottom: active ? `2px solid ${game.accentVar}` : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={14} aria-hidden="true" />
                <span className="hidden sm:inline">{game.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Acções — direita */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Ferramentas */}
          <Link
            href="/tools"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
            style={{ color: isActive('/tools') ? 'var(--accent)' : 'var(--text-tertiary)' }}
            title="Ferramentas"
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = isActive('/tools') ? 'var(--accent)' : 'var(--text-tertiary)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <Wrench size={15} aria-hidden="true" />
            <span className="hidden md:inline">Ferramentas</span>
          </Link>

          {/* Como funciona */}
          <Link
            href="/how-it-works"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--text-tertiary)' }}
            title="Como funciona"
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <HelpCircle size={15} aria-hidden="true" />
            <span className="hidden md:inline">Como funciona</span>
          </Link>

          {/* Divider */}
          <div
            className="mx-1 h-5 w-px"
            style={{ backgroundColor: 'var(--border-default)' }}
            aria-hidden="true"
          />

          {/* Toggle tema */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-lg p-2 transition-all duration-200"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={isDark ? 'Tema claro' : 'Tema escuro'}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            {isDark
              ? <Sun size={15} aria-hidden="true" />
              : <Moon size={15} aria-hidden="true" />
            }
          </button>

        </div>
      </div>
    </nav>
  );
}
