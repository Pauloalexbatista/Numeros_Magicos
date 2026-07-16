import { BackButton } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('About');

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
                            <h2 className="text-2xl font-bold">{t('sec1Title')}</h2>

                            <p className="text-lg leading-relaxed">
                                {t.rich('sec1P1', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>

                            <p className="leading-relaxed">
                                {t.rich('sec1P2', {
                                    accent: (chunks) => <span className="text-accent font-semibold">{chunks}</span>,
                                    italic: (chunks) => <em className="text-accent">{chunks}</em>
                                })}
                            </p>

                            <div className="rounded-xl border border-border bg-surface-1/60 p-5">
                                <p className="font-semibold">{t('missionTitle')}</p>
                                <p>
                                    {t.rich('missionText', { bold: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                            </div>

                            <p className="leading-relaxed">
                                {t.rich('homeworkText', { bold: (chunks) => <strong>{chunks}</strong> })}
                            </p>

                            <p className="leading-relaxed text-muted-foreground">
                                {t.rich('luckText', { accent: (chunks) => <strong className="text-accent">{chunks}</strong> })}
                            </p>
                        </section>

                        <section className="border-t border-border pt-6">
                            <h2 className="text-2xl font-bold">{t('sec2Title')}</h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">📊</div>
                                    <h3 className="font-bold">{t('feat1Title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('feat1Desc')}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">🤖</div>
                                    <h3 className="font-bold">{t('feat2Title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('feat2Desc')}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">🎯</div>
                                    <h3 className="font-bold">{t('feat3Title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('feat3Desc')}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-surface-1/60 p-4">
                                    <div className="text-3xl">🔍</div>
                                    <h3 className="font-bold">{t('feat4Title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('feat4Desc')}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="border-t border-border pt-6">
                            <div className="rounded-xl border border-warning/40 bg-warning-muted p-5">
                                <p className="font-semibold">{t('importantTitle')}</p>
                                <p className="text-sm text-muted-foreground">
                                    {t.rich('importantText', { bold: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}