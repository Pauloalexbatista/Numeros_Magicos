'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame, 
  Filter, 
  Sparkles, 
  ShieldAlert, 
  Target, 
  Layers, 
  Lock, 
  ExternalLink 
} from 'lucide-react';
import { StrategyEntry, StrategyMetrics } from '@/services/strategy-tracker';

const GAME_STYLES: Record<string, {
  name: string;
  badgeClass: string;
  buttonActiveClass: string;
}> = {
  EUROMILLIONS: {
    name: 'Euromilhões',
    badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30',
    buttonActiveClass: 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
  },
  TOTOLOTO: {
    name: 'Totoloto',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    buttonActiveClass: 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
  },
  EURODREAMS: {
    name: 'EuroDreams',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30',
    buttonActiveClass: 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
  },
  MEGASENA: {
    name: 'Mega-Sena',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
    buttonActiveClass: 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
  }
};

export default function AdminStrategiesPage() {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputSecret, setInputSecret] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [strategies, setStrategies] = useState<StrategyEntry[]>([]);
  const [metrics, setMetrics] = useState<StrategyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filtros
  const [filterGame, setFilterGame] = useState<'ALL' | 'TOTOLOTO' | 'EUROMILLIONS' | 'EURODREAMS' | 'MEGASENA'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ATIVA' | 'CONCRETIZADA' | 'EXPIRADA_SEM_PREMIO'>('ALL');
  const [filterSide, setFilterSide] = useState<'ALL' | 'DIRECT' | 'MIRROR'>('ALL');

  useEffect(() => {
    // 1. Tentar ler chave do sessionStorage ou cookies
    const saved = sessionStorage.getItem('nm_admin_secret');
    if (saved) {
      validateSecret(saved);
    } else {
      const match = document.cookie.match(new RegExp('(^| )admin_secret=([^;]+)'));
      if (match && match[2]) {
        validateSecret(decodeURIComponent(match[2]));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const validateSecret = async (pass: string) => {
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
        fetchStrategies();
      } else {
        setAuthError('Chave incorreta. Dica: a chave de laboratório padrão é magia2026.');
        setLoading(false);
      }
    } catch {
      setAuthError('Falha na comunicação com o servidor.');
      setLoading(false);
    }
  };

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    validateSecret(inputSecret);
  };

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/strategies');
      const json = await res.json();
      if (json.success) {
        setStrategies(json.data.strategies);
        setMetrics(json.data.metrics);
      }
    } catch (e) {
      console.error('Erro ao carregar estratégias:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncScan = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/admin/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' })
      });
      const json = await res.json();
      if (json.success) {
        setStrategies(json.data.strategies);
        setMetrics(json.data.metrics);
        setSyncFeedback(`Varredura concluída: ${json.data.syncResult.added} novos eventos identificados e sincronizados.`);
      }
    } catch (e) {
      setSyncFeedback('Erro ao sincronizar sorteios.');
    } finally {
      setSyncing(false);
    }
  };

  // Estratégias filtradas por Jogo e Lado (para as métricas dos cartões calcularem dinamicamente conforme os filtros)
  const scopedForMetrics = React.useMemo(() => {
    return strategies.filter(item => {
      if (filterGame !== 'ALL' && item.game !== filterGame) return false;
      if (filterSide !== 'ALL' && item.targetSide !== filterSide) return false;
      return true;
    });
  }, [strategies, filterGame, filterSide]);

  const displayedMetrics: StrategyMetrics = React.useMemo(() => {
    const total = scopedForMetrics.length;
    const ativas = scopedForMetrics.filter(s => s.status === 'ATIVA').length;
    const concretizadas = scopedForMetrics.filter(s => s.status === 'CONCRETIZADA').length;
    const expiradas = scopedForMetrics.filter(s => s.status === 'EXPIRADA_SEM_PREMIO').length;
    const concluidas = concretizadas + expiradas;
    const taxaConcretizacao = concluidas > 0 ? Math.round((concretizadas / concluidas) * 1000) / 10 : 0;

    return {
      total,
      ativas,
      concretizadas,
      expiradas,
      taxaConcretizacao
    };
  }, [scopedForMetrics]);

  // Filtragem completa da lista apresentada
  const filteredStrategies = React.useMemo(() => {
    return scopedForMetrics.filter(item => {
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      return true;
    });
  }, [scopedForMetrics, filterStatus]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Acesso Reservado</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
            Insira a chave mestra de laboratório para abrir o Rastreador de Estratégias e Acompanhamento de Valor.
          </p>

          <form onSubmit={handleManualAuth} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Palavra-passe mestra..."
                value={inputSecret}
                onChange={(e) => setInputSecret(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {authError && (
              <p className="text-rose-600 dark:text-rose-400 text-xs text-center font-medium">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
            >
              Entrar no Laboratório
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              ← Voltar ao Backoffice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* NAVEGAÇÃO & TÍTULO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href="/admin" 
                className="inline-flex items-center text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Backoffice Admin
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Laboratório Forense</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span>🎯 Rastreador de Estratégias & Acompanhamento de Valor</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-3xl">
              Auditoria em tempo real de cada gatilho de jackpot e anti-jackpot. Acompanhamento rigoroso concurso a concurso para aferir se a evidência histórica se comprovou ou expirou.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncScan}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'A Varrer Sorteios...' : '⚡ Varredura Automática'}
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button onClick={() => setSyncFeedback(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-75">✕</button>
          </div>
        )}

        {/* METRICS CARDS (CALCULADOS DINAMICAMENTE COM BASE NOS FILTROS) */}
        {displayedMetrics && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* CARD 1: TOTAL */}
            <div 
              onClick={() => setFilterStatus('ALL')}
              className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:border-indigo-400 ${
                filterStatus === 'ALL' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total de Gatilhos</span>
                {filterStatus === 'ALL' && <span className="text-[10px] text-indigo-500 font-bold">Filtro Ativo</span>}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{displayedMetrics.total}</div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block mt-0.5">
                {filterGame === 'ALL' ? 'Todos os Jogos' : GAME_STYLES[filterGame]?.name} • {filterSide === 'ALL' ? 'Ambos os Lados' : (filterSide === 'DIRECT' ? 'Sistema Principal' : 'Anti-Sistema')}
              </span>
            </div>

            {/* CARD 2: ATIVAS */}
            <div 
              onClick={() => setFilterStatus(filterStatus === 'ATIVA' ? 'ALL' : 'ATIVA')}
              className={`bg-amber-50 dark:bg-amber-950/30 border rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:border-amber-400 ${
                filterStatus === 'ATIVA' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-amber-200 dark:border-amber-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-pulse" /> Ativas no Momento
                </span>
                {filterStatus === 'ATIVA' && <span className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">Filtrado</span>}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-300 mt-1">{displayedMetrics.ativas}</div>
              <span className="text-[11px] text-amber-600/80 dark:text-amber-500/80 block mt-0.5">
                Janela T+1 a T+3 em curso
              </span>
            </div>

            {/* CARD 3: CONCRETIZADAS */}
            <div 
              onClick={() => setFilterStatus(filterStatus === 'CONCRETIZADA' ? 'ALL' : 'CONCRETIZADA')}
              className={`bg-emerald-50 dark:bg-emerald-950/30 border rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:border-emerald-400 ${
                filterStatus === 'CONCRETIZADA' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-emerald-200 dark:border-emerald-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Concretizadas (Sucesso)
                </span>
                {filterStatus === 'CONCRETIZADA' && <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold">Filtrado</span>}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">{displayedMetrics.concretizadas}</div>
              <span className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80 block mt-0.5">
                Trave (Jackpot - 1) ou Jackpot
              </span>
            </div>

            {/* CARD 4: EXPIRADAS */}
            <div 
              onClick={() => setFilterStatus(filterStatus === 'EXPIRADA_SEM_PREMIO' ? 'ALL' : 'EXPIRADA_SEM_PREMIO')}
              className={`bg-rose-50 dark:bg-rose-950/20 border rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:border-rose-400 ${
                filterStatus === 'EXPIRADA_SEM_PREMIO' ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-rose-200 dark:border-rose-900/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Expiradas sem Prémio
                </span>
                {filterStatus === 'EXPIRADA_SEM_PREMIO' && <span className="text-[10px] text-rose-600 dark:text-rose-300 font-bold">Filtrado</span>}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-300 mt-1">{displayedMetrics.expiradas}</div>
              <span className="text-[11px] text-rose-600/80 dark:text-rose-500/80 block mt-0.5">
                Sem prémio nos 3 sorteios
              </span>
            </div>

            {/* CARD 5: TAXA DE CONCRETIZAÇÃO */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Taxa de Concretização
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-200 mt-1">{displayedMetrics.taxaConcretizacao}%</div>
              <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 block mt-0.5">
                Eficácia real no filtro ativo
              </span>
            </div>

          </div>
        )}

        {/* BARRA DE FILTROS */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtros:
            </span>

            {/* Jogo */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setFilterGame('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterGame === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Todos os Jogos
              </button>
              <button
                onClick={() => setFilterGame('EUROMILLIONS')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterGame === 'EUROMILLIONS' ? GAME_STYLES.EUROMILLIONS.buttonActiveClass : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Euromilhões
              </button>
              <button
                onClick={() => setFilterGame('TOTOLOTO')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterGame === 'TOTOLOTO' ? GAME_STYLES.TOTOLOTO.buttonActiveClass : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Totoloto
              </button>
              <button
                onClick={() => setFilterGame('EURODREAMS')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterGame === 'EURODREAMS' ? GAME_STYLES.EURODREAMS.buttonActiveClass : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                EuroDreams
              </button>
              <button
                onClick={() => setFilterGame('MEGASENA')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterGame === 'MEGASENA' ? GAME_STYLES.MEGASENA.buttonActiveClass : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Mega-Sena
              </button>
            </div>

            {/* Estado */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === 'ALL' ? 'bg-slate-800 dark:bg-slate-700 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('ATIVA')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === 'ATIVA' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                🟡 Ativas
              </button>
              <button
                onClick={() => setFilterStatus('CONCRETIZADA')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === 'CONCRETIZADA' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                🟢 Concretizadas
              </button>
              <button
                onClick={() => setFilterStatus('EXPIRADA_SEM_PREMIO')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === 'EXPIRADA_SEM_PREMIO' ? 'bg-slate-400 dark:bg-slate-700 text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                ⚪ Expiradas
              </button>
            </div>

            {/* Lado Apostado */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setFilterSide('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterSide === 'ALL' ? 'bg-slate-800 dark:bg-slate-700 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Ambos os Lados
              </button>
              <button
                onClick={() => setFilterSide('DIRECT')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterSide === 'DIRECT' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                ☀️ Sistema Principal
              </button>
              <button
                onClick={() => setFilterSide('MIRROR')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterSide === 'MIRROR' ? 'bg-purple-700 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                🌑 Anti-Sistema
              </button>
            </div>
          </div>

          <span className="text-xs text-slate-500">
            A mostrar {filteredStrategies.length} de {strategies.length} estratégias
          </span>
        </div>

        {/* FEED / LISTA DE ESTRATÉGIAS */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm">A carregar registo de estratégias...</span>
          </div>
        ) : filteredStrategies.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
            <Target className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Nenhuma estratégia corresponde aos filtros selecionados.</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Experimente alterar os filtros de jogo ou de estado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStrategies.map((strat) => {
              const gameStyle = GAME_STYLES[strat.game] || GAME_STYLES.EUROMILLIONS;
              const isAtiva = strat.status === 'ATIVA';
              const isConcretizada = strat.status === 'CONCRETIZADA';

              return (
                <div 
                  key={strat.id}
                  className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-5 transition-all shadow-sm ${
                    isAtiva 
                      ? 'border-amber-400 dark:border-amber-600/50 bg-amber-50/20 dark:bg-gradient-to-r dark:from-slate-900 dark:via-amber-950/10 dark:to-slate-900 ring-1 ring-amber-400/30' 
                      : isConcretizada
                        ? 'border-emerald-300 dark:border-emerald-700/40 bg-emerald-50/20 dark:bg-gradient-to-r dark:from-slate-900 dark:via-emerald-950/10 dark:to-slate-900'
                        : 'border-slate-200 dark:border-slate-800/80 opacity-90'
                  }`}
                >
                  {/* LINHA SUPERIOR: JOGO, SISTEMA, GATILHO & BADGE DE ESTADO */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase border ${gameStyle.badgeClass}`}>
                        {strat.game}
                      </span>

                      <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {strat.systemName}
                      </span>

                      <span className="text-slate-400 dark:text-slate-500 text-xs">
                        • Sorteio #{strat.triggerDrawId} ({strat.triggerDate})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAtiva && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          ATIVA NO MOMENTO
                        </span>
                      )}

                      {isConcretizada && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          CONCRETIZADA ({strat.highestHit} ACERTOS)
                        </span>
                      )}

                      {!isAtiva && !isConcretizada && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <XCircle className="w-3.5 h-3.5" />
                          EXPIRADA (MÁX {strat.highestHit})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CORPO: O QUE ACONTECEU & A RECOMENDAÇÃO */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 items-center">
                    
                    {/* COLUNA ESQUERDA: GATILHO & LADO APOSTADO */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-800 dark:text-slate-300">Gatilho Disparado:</strong> {strat.triggerDescription}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Ação de Valor:</span>
                        {strat.targetSide === 'DIRECT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/50 text-emerald-700 dark:text-emerald-300">
                            ☀️ MANTER NO SISTEMA PRINCIPAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-600/50 text-purple-700 dark:text-purple-300">
                            🌑 MUDAR PARA O ANTI-SISTEMA
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Tese Histórica:</span> {strat.thesisEvidence}
                      </p>
                    </div>

                    {/* COLUNA DIREITA: ACOMPANHAMENTO DOS 3 SORTEIOS (T+1, T+2, T+3) */}
                    <div className="md:col-span-7">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Acompanhamento da Janela de 3 Sorteios ($W_3$):
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {strat.steps.map((st) => {
                          const isWin = st.isWinner;
                          const isPend = st.isPending;

                          return (
                            <div 
                              key={st.step}
                              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                                isPend 
                                  ? 'bg-slate-50/50 dark:bg-slate-950/50 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                                  : isWin 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/60 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{st.step}</span>
                                {isPend ? (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                                    Pendente
                                  </span>
                                ) : isWin ? (
                                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-600">
                                    🎯 BATEU!
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    #{st.drawId}
                                  </span>
                                )}
                              </div>

                              <div className="my-2">
                                {isPend ? (
                                  <div className="text-lg font-bold text-slate-300 dark:text-slate-600">—</div>
                                ) : (
                                  <div className="flex items-baseline gap-1.5">
                                    <span className={`text-xl font-extrabold ${isWin ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                                      {st.apostaHits}
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">acertos</span>
                                  </div>
                                )}
                              </div>

                              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                {isPend ? 'Aguardar sorteio' : (st.date || 'Realizado')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
