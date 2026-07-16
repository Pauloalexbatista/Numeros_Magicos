'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ResponsibleGamingFooter() {
    const t = useTranslations('Footer');

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-amber-50/95 dark:bg-amber-950/95 backdrop-blur-sm border-t border-amber-200 dark:border-amber-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0">⚠️</span>
                        <p className="text-amber-800 dark:text-amber-200">
                            <span className="font-bold">{t('disclaimerStrong')}</span> {t('disclaimerText')}
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-1 text-amber-700 dark:text-amber-300">
                        <div className="flex gap-3">
                            <Link href="/about" className="hover:underline">{t('about')}</Link>
                            <Link href="/responsible-gaming" className="hover:underline">{t('responsibleGaming')}</Link>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/legal/terms" className="hover:underline">{t('terms')}</Link>
                            <Link href="/legal/privacy" className="hover:underline">{t('privacy')}</Link>
                            <Link href="/contact" className="hover:underline">{t('contact')}</Link>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-amber-600 dark:text-amber-400 text-[10px] space-y-1">
                        <p>🔞 {t('underage')}</p>
                        <p>{t('copyright')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}