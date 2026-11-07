import React, { Suspense } from 'react';
import RaioXClient from '@/components/admin/RaioXClient';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Raio-X de Sorteio & Auditoria Total | Números Mágicos',
  description: 'Auditoria histórica concurso a concurso de todos os 20 sistemas, bolas sorteadas e cortes com 100% de transparência.'
};

export default function RaioXPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#080d19] flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <RaioXClient />
    </Suspense>
  );
}
