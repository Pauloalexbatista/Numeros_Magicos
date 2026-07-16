import { BackButton } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function ResponsibleGamingPage() {
    const t = useTranslations('RespGaming');

    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">{t('title')}</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold">{t('subtitle')}</h2>

                            <p className="text-lg leading-relaxed">
                                {t.rich('intro1', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>

                            <div className="rounded-xl border border-border bg-surface-1/60 p-5">
                                <p className="font-semibold">
                                    {t.rich('intro2', { bold: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">{t('rule1Title')}</h3>
                            <p>
                                {t.rich('rule1Desc', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                            <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                <p className="font-semibold text-sm">
                                    {t.rich('rule1Box', { bold: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">{t('rule2Title')}</h3>
                            <p>
                                {t.rich('rule2Desc', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t.rich('rule2Box', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">{t('rule3Title')}</h3>
                            <p>
                                {t.rich('rule3Desc', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                            <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                <p className="font-semibold">
                                    {t('rule3Box')}
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold">{t('rule4Title')}</h3>
                            <p>
                                {t.rich('rule4Desc', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                        </section>

                        <section className="border-t-2 border-border pt-6">
                            <h2 className="text-2xl font-bold">{t('helpTitle')}</h2>

                            <p>
                                {t.rich('helpDesc', { bold: (chunks) => <strong className="font-semibold">{chunks}</strong> })}
                            </p>

                            <div className="rounded-xl border border-border bg-surface-1/60 p-6 space-y-6">
                                <p className="font-bold">
                                    {t('helpBoxIntro')}
                                </p>

                                <div className="space-y-4">
                                    {/* Portugal */}
                                    <div>
                                        <h4 className="font-bold text-lg text-accent">{t('helpPtTitle')}</h4>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <p className="font-bold">{t('helpPt1Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpPt1Desc')}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold">{t('helpPt2Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpPt2Desc')}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold">{t('helpPt3Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpPt3Desc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brasil */}
                                    <div>
                                        <h4 className="font-bold text-lg text-green-600 dark:text-green-400">{t('helpBrTitle')}</h4>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <p className="font-bold">{t('helpBr1Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpBr1Desc')}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold">{t('helpBr2Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpBr2Desc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* França */}
                                    <div>
                                        <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">{t('helpFrTitle')}</h4>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <p className="font-bold">{t('helpFr1Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpFr1Desc')}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold">{t('helpFr2Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpFr2Desc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Espanha */}
                                    <div>
                                        <h4 className="font-bold text-lg text-red-600 dark:text-red-400">{t('helpEsTitle')}</h4>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <p className="font-bold">{t('helpEs1Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpEs1Desc')}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold">{t('helpEs2Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpEs2Desc')}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold">{t('helpEs3Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpEs3Desc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* União Europeia */}
                                    <div>
                                        <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{t('helpEuTitle')}</h4>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <p className="font-bold">{t('helpEu1Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpEu1Desc')}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold">{t('helpEu2Title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('helpEu2Desc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </section>

                        <section className="pt-6">
                            <div className="rounded-xl border border-border bg-surface-1/60 p-5 text-center">
                                <p className="text-sm text-muted-foreground italic">
                                    {t('footerQuote')}
                                </p>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {t('footerNote')}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}