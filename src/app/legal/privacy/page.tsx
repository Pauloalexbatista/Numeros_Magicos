import { BackButton } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
    const t = useTranslations('LegalPrivacy');

    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-sans">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">{t('title')}</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <p className="text-muted-foreground">
                            {t('lastUpdate')} {new Date().toLocaleDateString('pt-PT')}
                        </p>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec1Title')}</h2>
                            <p>
                                {t.rich('sec1Content', {
                                    bold: (chunks) => <strong>{chunks}</strong>
                                })}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec2Title')}</h2>
                            <p className="mb-3">
                                {t('sec2Intro')}
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
                                <li>
                                    {t.rich('sec2Li1', {
                                        bold: (chunks) => <strong>{chunks}</strong>
                                    })}
                                </li>
                                <li>
                                    {t.rich('sec2Li2', {
                                        bold: (chunks) => <strong>{chunks}</strong>
                                    })}
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec3Title')}</h2>
                            <p>
                                {t('sec3Content')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec4Title')}</h2>
                            <p>
                                {t('sec4Content')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec5Title')}</h2>
                            <p>
                                {t('sec5Content')}
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}