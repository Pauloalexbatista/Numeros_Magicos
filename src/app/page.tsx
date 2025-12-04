import { getHistory, updateData } from './actions';
import Image from 'next/image';
import DashboardActions from '@/components/DashboardActions';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getComponent } from '@/lib/component-registry';
import DashboardClientWrapper from '@/components/dashboard/DashboardClientWrapper';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { LockedCardWrapper } from '@/components/shop/LockedCardWrapper';
import LatestDrawCard from '@/components/dashboard/LatestDrawCard';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import RankingSummaryWidget from '@/components/dashboard/RankingSummaryWidget';
import LatestDrawWidget from '@/components/dashboard/LatestDrawWidget';

export default async function Home() {
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'USER';

  const fullHistory = await getHistory();
  const latestDraw = fullHistory[0];
  const recentDraws = fullHistory.slice(0, 10);

  // Fetch active cards from DB
  const cards = await prisma.dashboardCard.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  // Fetch user purchases and settings if logged in
  let purchasedCardIds: string[] = [];
  let userSettings: any[] = [];

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        purchases: true,
        cardSettings: true
      }
    });
    purchasedCardIds = user?.purchases.map(p => p.cardId) || [];
    userSettings = user?.cardSettings || [];
  }

  // Determine Visibility and Locked Status
  let processedCards = cards.map((card: any) => {
    // 1. Role Check (Base Visibility)
    // If minRole is ADMIN and user is not ADMIN, hide completely (don't even show locked)
    if (card.minRole === 'ADMIN' && userRole !== 'ADMIN') {
      return null;
    }

    // 2. Locked Status
    // If it has a price > 0 and user hasn't bought it (and isn't ADMIN), it's locked.
    let isLocked = false;
    if (userRole !== 'ADMIN' && (card.price || 0) > 0) {
      if (!purchasedCardIds.includes(card.id)) {
        isLocked = true;
      }
    }

    // 3. User Settings (Order and Visibility Preference)
    const setting = userSettings.find((s: any) => s.cardId === card.id);
    let order = card.order;
    let isVisible = true;

    if (setting) {
      order = setting.order;
      isVisible = setting.isVisible;
    }

    return {
      ...card,
      order,
      isVisible,
      isLocked
    };
  }).filter(Boolean); // Remove nulls (Admin cards hidden from users)

  // Sort by order
  processedCards.sort((a: any, b: any) => a.order - b.order);

  // Filter out hidden cards for display (but keep them for customizer if we were passing to it)
  // Also filter out cards that are now hardcoded to avoid duplicates
  const hardcodedKeys = ['LatestDrawWidget', 'TopStarSystemsWidget', 'RankingSummaryWidget'];
  const displayCards = processedCards.filter((c: any) => c.isVisible && !hardcodedKeys.includes(c.componentKey));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <Image src="/crystal-ball.png" alt="Bola de Cristal" width={60} height={60} className="drop-shadow-lg" />
              <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Números Mágicos
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
              Análise Avançada do EuroMilhões
            </p>
          </div>

          <div className="flex items-center gap-4">
            <DashboardActions updateDataAction={updateData} />
            {/* We need a client component to handle the modal state */}
            <DashboardClientWrapper cards={processedCards} />
          </div>
        </header>

        {/* 1. Latest Draw Banner (Always Top) */}
        <LatestDrawWidget latestDraw={latestDraw} />

        {/* 2. Top Widgets Row (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="col-span-1 md:col-span-2">
            <TopStarSystemsWidget />
          </div>
          <div className="col-span-1 md:col-span-2">
            <RankingSummaryWidget />
          </div>
          <div className="col-span-1 md:col-span-2">
            <LatestDrawCard latestDraw={latestDraw} />
          </div>
        </div>

        {/* Dynamic Grid for other cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {displayCards.map((card: any) => {
            const registryItem = getComponent(card.componentKey);
            if (!registryItem) return null;
            const Component = registryItem.component;

            const config = card.config ? JSON.parse(card.config) : {};

            // Inject dynamic data
            const props = {
              ...config,
              title: card.title,
              description: card.description,
              icon: card.icon,
              latestDraw,
              recentDraws,
              fullHistory,
            };

            // Determine Color Variant
            if (!props.variant) {
              props.variant = 'light';
            }

            // Tailwind doesn't support dynamic class names like `col-span-${span}`
            const spanMap: Record<number, string> = {
              1: 'col-span-1',
              2: 'col-span-1 md:col-span-2',
              3: 'col-span-1 md:col-span-2 lg:col-span-3',
              4: 'col-span-1 md:col-span-2 lg:col-span-4',
              5: 'col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-5',
              6: 'col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-6',
            };

            const gridClass = spanMap[card.gridSpan || 1] || 'col-span-1';

            return (
              <div key={card.id} className={gridClass}>
                <LockedCardWrapper isLocked={card.isLocked} card={card}>
                  <Component {...props} />
                </LockedCardWrapper>
              </div>
            );
          })}
        </div>

      </div>

      <ResponsibleGamingFooter />
    </div>

  );
}
