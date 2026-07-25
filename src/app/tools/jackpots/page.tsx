import { getTranslations } from 'next-intl/server';
import JackpotsList from '@/components/tools/JackpotsList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export async function generateMetadata() {
  const t = await getTranslations('Tools.Jackpots');
  return {
    title: `${t('jackpots_title')} | Números Mágicos`,
    description: t('jackpots_subtitle')
  };
}

export default async function JackpotsPage() {
  const t = await getTranslations('Tools.Jackpots');

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
      
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-slate-800">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="mb-6">
                <Link
                    href="/tools"
                    className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Ferramentas
                </Link>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    {t('jackpots_title')}
                </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                {t('jackpots_subtitle')}
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <JackpotsList />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ResponsibleGamingFooter />
      </div>
    </main>
  );
}
