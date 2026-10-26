import React, { Suspense } from 'react';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Laboratório Central & Backoffice | Números Mágicos',
  description: 'Ambiente reservado: Bancada de Laboratório, ferramentas em análise e operações de servidor.'
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <AdminDashboardClient />
    </Suspense>
  );
}
