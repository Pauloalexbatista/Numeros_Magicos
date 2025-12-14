import { getHistory, updateData } from './actions';
import { getJackpotLeaders, getRankingMetrics } from './ranking/actions'; // Import new action
import Image from 'next/image';
import DashboardActions from '@/components/DashboardActions';
import { auth } from '@/auth';
import Link from 'next/link';
import { Home as HomeIcon, Hash, Star, TrendingUp, Dices, BarChart, Archive, Settings } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import LatestDrawWidget from '@/components/dashboard/LatestDrawWidget';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import HistoricalBestWidget from '@/components/dashboard/HistoricalBestWidget'; // Import new widget
import LatestDrawCard from '@/components/dashboard/LatestDrawCard';
import LastDrawStarSystems from '@/components/dashboard/LastDrawStarSystems';
import LastDrawNumberSystems from '@/components/dashboard/LastDrawNumberSystems';
import ExplanationCard from '@/components/ExplanationCard';

import TopNumberSystemsWidget from '@/components/dashboard/TopNumberSystemsWidget'; // Import new widget

export default async function Home() {
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'USER';

  const fullHistory = await getHistory();
  const latestDraw = fullHistory[0];
  const recentDraws = fullHistory.slice(0, 10);
  const jackpotLeaders = await getJackpotLeaders();
  const rankings = await getRankingMetrics(); // Fetch new rankings for widget
  const topNumberSystems = rankings.filter(r => !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(r.systemName)).slice(0, 3);

  // Dashboard Cards (Azul Bebé)
  const dashboardCards = [
    {
      title: 'Análise de Números',
      description: 'Explorar todas as análises de números 1-50',
      href: '/analysis/numbers',
      icon: Hash,
      variant: 'free' as const,
      gridSpan: 2 as const,
      badge: '22 Análises'
    },
    {
      title: 'Análise de Estrelas',
      description: 'Explorar todas as análises de estrelas 1-12',
      href: '/analysis/stars',
      icon: Star,
      variant: 'free' as const,
      gridSpan: 2 as const,
      badge: '8 Análises'
    },
    {
      title: 'Ranking de Sistemas',
      description: 'Performance de todos os sistemas preditivos',
      href: '/ranking',
      icon: TrendingUp,
      variant: 'free' as const,
      gridSpan: 2 as const
    }
  ];

  // Admin cards (only for admins)
  const adminCards = userRole === 'ADMIN' ? [
    {
      title: 'Admin Dashboard',
      description: 'Painel de administração central',
      href: '/admin',
      icon: Settings,
      variant: 'admin' as const,
      gridSpan: 2 as const
    }
  ] : [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header ... */}
        {/* LatestDrawWidget */}
        <LatestDrawWidget latestDraw={latestDraw} />
        {/* ExplanationCard ... */}

        {/* Top Widgets Row (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 space-y-4">
            {/* Restored Top Number Systems Widget with new metrics */}
            <TopNumberSystemsWidget systems={topNumberSystems} />
          </div>
          <div className="col-span-1 space-y-4">
            <TopStarSystemsWidget />
          </div>
        </div>

        {/* Historical Best (Jackpot Kings) - Full Width below */}
        <section className="space-y-4">
          <HistoricalBestWidget leaders={jackpotLeaders} />
        </section>

        {/* Last Draw Best Systems (Side by Side) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LastDrawNumberSystems />
          <LastDrawStarSystems />
        </section>

        {/* Main Sections Highlight */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-blue-200 dark:bg-blue-800" />
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              🏠 Explore o Dashboard
            </h2>
            <div className="h-px flex-grow bg-blue-200 dark:bg-blue-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {dashboardCards.map((card) => (
              <UnifiedCard
                key={card.href}
                title={card.title}
                description={card.description}
                href={card.href}
                icon={card.icon}
                category="dashboard"
                variant={card.variant}
                gridSpan={card.gridSpan}
                badge={card.badge}
              />
            ))}
          </div>
        </section>


        {/* Admin Section */}
        {adminCards.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-grow bg-blue-200 dark:bg-blue-800" />
              <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                🔐 Administração
              </h2>
              <div className="h-px flex-grow bg-blue-200 dark:bg-blue-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
              {adminCards.map((card) => (
                <UnifiedCard
                  key={card.href}
                  title={card.title}
                  description={card.description}
                  href={card.href}
                  icon={card.icon}
                  category="dashboard"
                  variant={card.variant}
                  gridSpan={card.gridSpan}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      <ResponsibleGamingFooter />
    </div>
  );
}
