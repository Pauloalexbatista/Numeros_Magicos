import React, { Suspense } from 'react';
import SismologiaNazareClient from '@/components/tools/SismologiaNazareClient';
import { Waves } from 'lucide-react';

export const metadata = {
  title: 'Sismologia de Jackpots & O Modelo da Nazaré | Números Mágicos',
  description: 'Análise sísmica de falhas probabilísticas, tensão tectónica e player temporal da onda gigante de 25 sorteios.'
};

export default function SismologiaPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Waves className="w-3.5 h-3.5" /> Teoria Sísmica & Janela Áurea de 25 Sorteios
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            O Modelo da Nazaré & Sismologia de Jackpots
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mapeamento da tensão acumulada nos sistemas e monitorização dos <strong>4 abalos premonitórios</strong> que antecedem a onda de 5 acertos. Aceda ao <em>Filme da Onda</em> e antecipe os momentos de colheita máxima.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-20 text-slate-400 animate-pulse">
          A sintonizar os sismógrafos de jackpots...
        </div>
      }>
        <SismologiaNazareClient />
      </Suspense>
    </div>
  );
}
