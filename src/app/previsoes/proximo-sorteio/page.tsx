import React, { Suspense } from 'react';
import ProximoSorteioClient from '@/components/predictions/ProximoSorteioClient';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Sugestões do Próximo Sorteio (Direto vs Espelho) | Números Mágicos',
  description: 'Previsões em tempo real baseadas na Bússola de Polaridade: Modo Direto (Top Sistemas Quentes) e Modo Espelho (Top Anti-Sistemas Frios).'
};

export default function ProximoSorteioPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Bússola de Polaridade T-1
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Previsões do Próximo Sorteio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explora os números sugeridos para cada jogo em duas frentes complementares: <strong>Modo Direto</strong> (aproveitamento dos sistemas em colheita) e <strong>Modo Espelho</strong> (colheita reversa dos sistemas em jejum de acertos).
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-20 text-slate-400 animate-pulse">
          A carregar previsões com base na Bússola de Polaridade...
        </div>
      }>
        <ProximoSorteioClient />
      </Suspense>
    </div>
  );
}
