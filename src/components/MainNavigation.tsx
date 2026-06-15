'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { Hash, Star, Wrench, HelpCircle, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

const GAMES = [
  {
    id: 'euromillions',
    name: 'Euromilhões',
    href: '/dashboard/euromillions',
    icon: (props: any) => <img src="https://flagcdn.com/eu.svg" alt="EU" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--euro-accent)',
    borderVar: 'var(--euro-border)',
  },
  {
    id: 'totoloto',
    name: 'Totoloto',
    href: '/dashboard/totoloto',
    icon: (props: any) => <img src="https://flagcdn.com/pt.svg" alt="PT" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--toto-accent)',
    borderVar: 'var(--toto-border)',
  },
  {
    id: 'eurodreams',
    name: 'EuroDreams',
    href: '/dashboard/eurodreams',
    icon: (props: any) => <img src="https://flagcdn.com/eu.svg" alt="EU" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--dream-accent)',
    borderVar: 'var(--dream-border)',
  },
  {
    id: 'megasena',
    name: 'Mega-Sena',
    href: '/dashboard/megasena',
    icon: (props: any) => <img src="https://flagcdn.com/br.svg" alt="BR" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--mega-accent)',
    borderVar: 'var(--mega-border)',
  },
];

export default function MainNavigation({ session }: { session: any }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('nm-theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newDark = !isDark;
    setIsDark(newDark);
    html.classList.toggle('dark', newDark);
    html.classList.toggle('light', !newDark);
    localStorage.setItem('nm-theme', newDark ? 'dark' : 'light');
  };

  const activeGame = GAMES.find(g => pathname?.toLowerCase().includes(g.id.toLowerCase()));
  const headerBorderColor = activeGame ? activeGame.borderVar : 'var(--border-subtle)';
  const isActive = (gameId: string, href: string) => pathname === href || pathname?.startsWith(href) || pathname?.toLowerCase().includes(`/${gameId.toLowerCase()}`);

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
      <div className="absolute inset-0 -z-10" style={{ backdropFilter: 'blur(18px) saturate(1.6)' }} />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/games" onClick={(e) => { if (isLogin) e.preventDefault(); }} className="flex items-center gap-2 shrink-0" aria-label="Números Mágicos — página inicial">
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

        <div className="flex items-center gap-1" role="tablist" aria-label="Seleccionar jogo">
          {!isLogin && GAMES.map((game) => {
            const active = isActive(game.id, game.href);
            const Icon = game.icon;
            return (
              <Link
                key={game.id}
                href={game.href}
                onClick={(e) => { if (isLogin) e.preventDefault(); }}
                role="tab"
                aria-selected={active}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? `color-mix(in srgb, ${game.accentVar} 15%, transparent)` : 'transparent',
                  color: active ? game.accentVar : 'var(--text-tertiary)',
                  border: `1px solid ${active ? game.borderVar : 'transparent'}`, boxShadow: active ? `0px 4px 24px -2px color-mix(in srgb, ${game.accentVar} 60%, transparent), inset 0 0 8px -2px color-mix(in srgb, ${game.accentVar} 40%, transparent)` : 'none',
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
                <span className="hidden sm:inline">{t(game.id as any)}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/tools"
            onClick={(e) => { if (isLogin) e.preventDefault(); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: activeGame ? activeGame.accentVar : 'var(--text-tertiary)' }}
            title={t("tools")}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = isActive('/tools') ? 'var(--accent)' : 'var(--text-tertiary)')}
          >
            <Wrench size={15} aria-hidden="true" />
            
          </Link>

          <Link
            href="/how-it-works"
            onClick={(e) => { if (isLogin) e.preventDefault(); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: activeGame ? activeGame.accentVar : 'var(--text-tertiary)' }}
            title="Como funciona"
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
          >
            <HelpCircle size={15} aria-hidden="true" />
            
          </Link>

          <div className="mx-1 h-5 w-px" style={{ backgroundColor: 'var(--border-default)' }} aria-hidden="true" />

          <LanguageSwitcher />
          <div className="mx-1 h-5 w-px" style={{ backgroundColor: 'var(--border-default)' }} aria-hidden="true" />

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-lg p-2 transition-colors duration-200"
            style={{ color: activeGame ? activeGame.accentVar : 'var(--text-tertiary)' }}
            aria-label={mounted ? (isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro') : 'Tema'}
            title={mounted ? (isDark ? 'Tema claro' : 'Tema escuro') : 'Tema'}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
          >
            {mounted ? (isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />) : '◐'}
          </button>
        </div>
      </div>
    </nav>
  );
}
