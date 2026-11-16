'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertTriangle, LockOpen } from 'lucide-react';

const EXEMPT_PREFIXES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/legal',
    '/responsible-gaming',
    '/about',
    '/contact',
    '/admin',
    '/setup-admin',
];

const BOT_USER_AGENTS =
    /googlebot|mediapartners-google|adsbot-google|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|applebot/i;

/**
 * EntryGuard - Apresenta o aviso de Jogo Responsável em modal quando o visitante
 * ainda não aceitou os termos, mantendo a URL original com HTTP 200 (sem redirects 307).
 */
export default function EntryGuard({ children }: { children?: React.ReactNode }) {
    const pathname = usePathname();
    const t = useTranslations('login');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!pathname || pathname === '/') {
            setShowModal(false);
            return;
        }

        if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
            setShowModal(false);
            return;
        }

        if (BOT_USER_AGENTS.test(navigator.userAgent)) {
            setShowModal(false);
            return;
        }

        const hasAccepted = document.cookie
            .split(';')
            .some((cookie) => cookie.trim().startsWith('terms_accepted='));

        setShowModal(!hasAccepted);
    }, [pathname]);

    const handleAccept = () => {
        document.cookie = 'terms_accepted=true; path=/; max-age=31536000; SameSite=Lax';
        setShowModal(false);
    };

    return (
        <>
            {children}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="entry-guard-title"
                >
                    <div className="w-full max-w-lg rounded-3xl border border-border bg-surface-1 p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="entry-guard-title" className="text-xl font-bold font-display text-foreground">
                                {t('access_data')}
                            </h2>
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-surface-2 text-muted-foreground border border-border">
                                {t('free')}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                            {t('disclaimer_text')}
                        </p>

                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6 text-yellow-700 dark:text-yellow-400">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-xs leading-relaxed">
                                    {t('warning_text')}{' '}
                                    <a
                                        href="https://www.sicad.pt"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline font-semibold hover:opacity-80"
                                    >
                                        sicad.pt
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleAccept}
                            className="glass-button w-full py-4 px-4 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                backgroundColor: 'var(--accent)',
                                borderColor: 'var(--accent)',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <div className="flex items-center gap-2 text-base">
                                <LockOpen className="w-5 h-5" />
                                <span>Continuar</span>
                            </div>
                            <span className="text-xs font-normal opacity-90 leading-relaxed text-center">
                                Compreendo que o jogo pode ser viciante, quero explorar os dados com responsabilidade.
                            </span>
                        </button>

                        <p className="text-[11px] text-muted-foreground text-center mt-4">
                            {t('footer_info')}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
