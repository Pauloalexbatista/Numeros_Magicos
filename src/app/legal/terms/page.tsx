import { BackButton } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function TermsPage() {
    const t = useTranslations('LegalTerms');

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
                                {t('sec1Content')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec2Title')}</h2>
                            <p>
                                {t('sec2Content')}
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/30 p-5 rounded-lg border-2 border-red-300 dark:border-red-700 mt-4 space-y-3">
                                <p className="font-bold text-red-900 dark:text-red-200 text-lg">{t('sec2WarningTitle')}</p>
                                <ul className="text-red-800 dark:text-red-300 text-sm space-y-2 list-disc list-inside">
                                    <li>
                                        {t.rich('sec2Warning1', {
                                            bold: (chunks) => <strong>{chunks}</strong>
                                        })}
                                    </li>
                                    <li>
                                        {t.rich('sec2Warning2', {
                                            bold: (chunks) => <strong>{chunks}</strong>
                                        })}
                                    </li>
                                    <li>
                                        {t.rich('sec2Warning3', {
                                            bold: (chunks) => <strong>{chunks}</strong>
                                        })}
                                    </li>
                                    <li>
                                        {t.rich('sec2Warning4', {
                                            bold: (chunks) => <strong>{chunks}</strong>
                                        })}
                                    </li>
                                    <li>
                                        {t.rich('sec2Warning5', {
                                            bold: (chunks) => <strong>{chunks}</strong>
                                        })}
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec3Title')}</h2>
                            <p>
                                {t('sec3Content')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec4Title')}</h2>
                            <p className="mb-3">
                                {t('sec4Intro')}
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300 ml-4">
                                <li>{t('sec4Li1')}</li>
                                <li>{t('sec4Li2')}</li>
                                <li>{t('sec4Li3')}</li>
                                <li>{t('sec4Li4')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec5Title')}</h2>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-300 dark:border-amber-700 mb-4">
                                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                                    {t('sec5DisclaimerTitle')}
                                </p>
                                <p className="text-amber-800 dark:text-amber-300 text-sm mb-3">
                                    <strong>{t('sec5DisclaimerStrong')}</strong>
                                </p>
                                <p className="text-amber-800 dark:text-amber-300 text-sm">
                                    {t('sec5DisclaimerContent')}
                                </p>
                                <ul className="text-amber-800 dark:text-amber-300 text-sm mt-2 space-y-1 list-disc list-inside ml-2">
                                    <li>{t('sec5DisclaimerLi1')}</li>
                                    <li>{t('sec5DisclaimerLi2')}</li>
                                    <li>{t('sec5DisclaimerLi3')}</li>
                                    <li>{t('sec5DisclaimerLi4')}</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec6Title')}</h2>
                            <p className="mb-3">
                                {t.rich('sec6Intro', {
                                    bold: (chunks) => <strong>{chunks}</strong>
                                })}
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300 ml-4">
                                <li>
                                    {t.rich('sec6Li1', {
                                        bold: (chunks) => <strong>{chunks}</strong>
                                    })}
                                </li>
                                <li>
                                    {t.rich('sec6Li2', {
                                        link: (chunks) => <a href="https://jogadoresanonimos.pt" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">{chunks}</a>
                                    })}
                                </li>
                                <li>{t('sec6Li3')}</li>
                                <li>{t('sec6Li4')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec7Title')}</h2>
                            <p>
                                {t('sec7Content')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-2">{t('sec8Title')}</h2>
                            <p className="mb-2">
                                {t.rich('sec8Content', {
                                    contact: (chunks) => <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">{chunks}</a>
                                })}
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}