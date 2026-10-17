import React, { Suspense } from 'react';
import GeradorCirurgicoClient from '@/components/tools/GeradorCirurgicoClient';
import { Wand2 } from 'lucide-react';

export const metadata = {
  title: 'Gerador de Chaves Cirúrgicas & Motor Edison | Números Mágicos',
  description: 'Desdobramento inteligente com anatomia de quintetos (1-1-1-1-1) e filtros harmónicos de Tesla, Fibonacci e Primos.'
};

export default function GeradorCirurgicoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Wand2 className="w-3.5 h-3.5" /> FASE 6 — Motor Edison & Harmonia Sagrada
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Gerador de Chaves Cirúrgicas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Partição das 25 bolas em 5 blocos anatómicos (<strong>1-1-1-1-1</strong> e <strong>2-1-1-1-0</strong>) aliada ao filtro das Leis Universais: <strong>Eixo 3-6-9 de Tesla</strong>, <strong>Gaps de Fibonacci</strong> e <strong>Quota Áurea de Primos</strong>.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-20 text-slate-400 animate-pulse">
          A sintonizar o Motor Edison e os blocos anatómicos...
        </div>
      }>
        <GeradorCirurgicoClient />
      </Suspense>
    </div>
  );
}
