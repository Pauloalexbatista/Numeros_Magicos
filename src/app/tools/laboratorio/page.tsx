import React, { Suspense } from 'react';
import LaboratorioClient from '@/components/tools/LaboratorioClient';
import { FlaskConical } from 'lucide-react';

export const metadata = {
  title: 'Laboratório de Meta-Sistemas & Polaridade Extrema | Números Mágicos',
  description: 'Pesquisa e bancada de simulação de meta-sistemas combinatórios com inversão de polaridade (Separação das Águas).'
};

export default function LaboratorioPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <FlaskConical className="w-3.5 h-3.5" /> Laboratório Científico (FASE 4)
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Laboratório de Meta-Sistemas
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pesquisa algorítmica e simulação interativa de ensembles de especialistas. Descubra combinações de alta assimetria calibradas pela <strong>Lei da Separação das Águas</strong>.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-20 text-slate-400 animate-pulse">
          A inicializar o Laboratório de Meta-Sistemas...
        </div>
      }>
        <LaboratorioClient />
      </Suspense>
    </div>
  );
}
