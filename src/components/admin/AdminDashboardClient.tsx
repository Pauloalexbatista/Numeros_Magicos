'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Lock, 
  Unlock, 
  FlaskConical, 
  Wand2, 
  Compass, 
  Waves, 
  Sparkles, 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  Database, 
  Cpu, 
  ExternalLink,
  RefreshCw,
  LogOut,
  FolderLock
} from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';

export default function AdminDashboardClient() {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Tentar ler do sessionStorage ou cookies
    const saved = sessionStorage.getItem('nm_admin_secret');
    if (saved) {
      validateSecret(saved, false);
    } else {
      // Verificar se existe cookie admin_secret
      const match = document.cookie.match(new RegExp('(^| )admin_secret=([^;]+)'));
      if (match && match[2]) {
        validateSecret(decodeURIComponent(match[2]), false);
      }
    }
  }, []);

  const validateSecret = async (pass: string, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: pass })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setSecret(pass);
        sessionStorage.setItem('nm_admin_secret', pass);
      } else {
        setError(data.error || 'Chave mestra inválida.');
        setIsAuthenticated(false);
        sessionStorage.removeItem('nm_admin_secret');
      }
    } catch {
      setError('Erro de ligação ao servidor.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSecret('');
    sessionStorage.removeItem('nm_admin_secret');
    document.cookie = 'admin_secret=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 transition-all">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
              <Database className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin Control Panel
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center mt-2 leading-relaxed">
              Insira a chave mestra para aceder ao Laboratório, ferramentas em análise e gestão do servidor.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Master Secret"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm transition-all"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validateSecret(secret)}
              />
            </div>

            {error && (
              <p className="text-red-500 dark:text-red-400 text-xs font-semibold text-center bg-red-50 dark:bg-red-950/40 py-2 rounded-xl border border-red-200 dark:border-red-900">
                {error}
              </p>
            )}

            <button
              onClick={() => validateSecret(secret)}
              disabled={isLoading || !secret}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A validar chave...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Desbloquear Painel</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar às Ferramentas Públicas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const labTools = [
    {
      title: 'Laboratório de Meta-Sistemas',
      description: 'Pesquisa algorítmica e simulação de ensembles por Polarização Extrema e Separação das Águas.',
      href: '/tools/laboratorio',
      icon: FlaskConical,
      variant: 'premium' as const,
      gridSpan: 2 as const,
      badge: 'FASE 4 • LAB'
    },
    {
      title: 'Gerador Cirúrgico (Motor Edison)',
      description: 'Partição anatómica de quintetos (1-1-1-1-1), Eixo Tesla 3-6-9, Fibonacci e Quota Áurea de Primos.',
      href: '/tools/gerador-cirurgico',
      icon: Wand2,
      variant: 'premium' as const,
      gridSpan: 2 as const,
      badge: 'FASE 6 • EDISON'
    },
    {
      title: 'Cruzador Inteligente',
      description: 'Cruzamento de sistemas no ponto de rebuçado com a Matriz de Corte V2 e filtro Bússola.',
      href: '/tools/cruzador',
      icon: Compass,
      variant: 'premium' as const,
      gridSpan: 2 as const,
      badge: 'EM TESTES'
    }
  ];

  const quarantineTools = [
    {
      title: 'Sismologia de Jackpots (Nazaré)',
      description: 'Monitorização de tensão tectónica e 4 abalos premonitórios que antecipam o Jackpot.',
      href: '/tools/sismologia',
      icon: Waves,
      variant: 'premium' as const,
      gridSpan: 2 as const,
      badge: 'QUARENTENA'
    },
    {
      title: 'Bússola & Separação de Extremos',
      description: 'Separação de frequências altas e baixas e polaridade Direto vs Espelho.',
      href: '/tools/separacao-extremos',
      icon: Compass,
      variant: 'premium' as const,
      gridSpan: 2 as const,
      badge: 'POLARIDADE'
    },
    {
      title: 'Previsões Próximo Sorteio (T-1)',
      description: 'Top sugestões de números calculadas pela Bússola em Modo Direto e Modo Espelho.',
      href: '/previsoes/proximo-sorteio',
      icon: Sparkles,
      variant: 'premium' as const,
      gridSpan: 2 as const,
      badge: 'AVALIAÇÃO'
    }
  ];

  const backendOps = [
    {
      title: 'Diagnóstico & Saúde do Sistema',
      description: 'Métricas de integridade da BD, sorteios em falta, cron jobs e treino de Redes Neuronais.',
      href: '/admin/health',
      icon: Activity,
      variant: 'free' as const,
      gridSpan: 2 as const,
      badge: 'SISTEMA'
    },
    {
      title: 'Inspeção Direta da Base de Dados',
      description: 'Visualização de tabelas Prisma, integridade relacional e auditoria direta de predições.',
      href: '/debug-db',
      icon: Database,
      variant: 'free' as const,
      gridSpan: 2 as const,
      badge: 'DEBUG DB'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Top Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Menu de Ferramentas Públicas</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Bloquear / Sair</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Laboratório Central & Backoffice
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Autenticado
                  </span>
                </div>
                <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  Bancada de ensaio algorítmico, ferramentas em quarentena técnica e operações de backend na VPS e Local.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* SECÇÃO 1: BANCADA DE LABORATÓRIO (EXPERIMENTOS & SIMULAÇÃO) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                🔬 Bancada de Laboratório (Simulações & Ensembles)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Motores combinatórios de simulação avançada e ensembles de alta assimetria.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {labTools.map((card) => (
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

        {/* SECÇÃO 2: FERRAMENTAS EM QUARENTENA / ANÁLISE TÉCNICA (OFF) */}
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-amber-500" />
              🧭 Ferramentas em Quarentena / Análise Técnica (OFF do Público)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instrumentos retirados da montra pública para auditoria estatística, validação de hipóteses e calibragem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {quarantineTools.map((card) => (
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

        {/* SECÇÃO 3: OPERAÇÕES DE BACKEND & SERVIDOR */}
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              ⚙️ Operações de Servidor, Diagnóstico & VPS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitorização de integridade relacional, cálculo de previsões e treino de modelos de Inteligência Artificial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {backendOps.map((card) => (
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
      </div>
    </div>
  );
}
