'use client';

import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  Layers, 
  ArrowRightLeft, 
  TrendingUp, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Play,
  RotateCcw,
  Sliders,
  BarChart3,
  Flame,
  Info
} from 'lucide-react';

interface MetaSystemConfig {
  id: string;
  polarity: 'DIRETO' | 'ESPELHO';
}

interface MetaSystemStats {
  totalDraws: number;
  distribution: Record<number, number>;
  jackpotsDirect: number;
  jackpotsMirror: number;
  totalJackpots: number;
  nearDirect: number;
  nearMirror: number;
  totalNear: number;
  noise: number;
  fitness: number;
  separationRatio: number;
}

interface MetaSystemEntry {
  game: string;
  size: number;
  systemIds: string[];
  polarities: number[];
  config: MetaSystemConfig[];
  stats: MetaSystemStats;
}

const GAMES = [
  { id: 'euromillions', name: 'Euromilhões', color: '#10b981', balls: 50, win: 5 },
  { id: 'totoloto', name: 'Totoloto', color: '#3b82f6', balls: 49, win: 5 },
  { id: 'eurodreams', name: 'EuroDreams', color: '#8b5cf6', balls: 40, win: 6 },
  { id: 'megasena', name: 'Mega-Sena', color: '#f59e0b', balls: 60, win: 6 }
];

const AVAILABLE_SPECIALISTS = [
  { id: 'mais_quentes', label: 'Mais Quentes', family: 'Inércia / Calor' },
  { id: 'ultimos_a_sair', label: 'Últimos a Sair', family: 'Inércia / Recência' },
  { id: 'tiro_certeiro', label: 'Tiro Certeiro', family: 'Especialista Cirúrgico' },
  { id: 'oscilacao_universal', label: 'Oscilação Universal', family: 'Ciclos / Pêndulo' },
  { id: 'clustering', label: 'Clustering', family: 'Agrupamentos / IA' },
  { id: 'random_forest', label: 'Random Forest AI', family: 'Inteligência Artificial' },
  { id: 'matriz_corte', label: 'Matriz de Corte V2', family: 'Via Negativa' },
  { id: 'piramide_pascal', label: 'Pirâmide de Pascal', family: 'Geometria Matricial' },
  { id: 'piramide_intervalos', label: 'Pirâmide de Intervalos', family: 'Espaço e Gaps' },
  { id: 'diagonais_matriz', label: 'Diagonais da Matriz', family: 'Geometria 2D' },
  { id: 'diagonais_matriz_3d', label: 'Diagonais 3D', family: 'Geometria 3D' },
  { id: 'markov', label: 'Cadeias de Markov', family: 'Transições Estocásticas' },
  { id: 'monte_carlo', label: 'Monte Carlo', family: 'Simulação Probabilística' },
  { id: 'media_3_otimizado', label: 'Média 3 Otimizado', family: 'Harmonia Estatística' },
  { id: 'mais_sorteadas_sempre', label: 'Mais Sorteadas Sempre', family: 'Inércia Histórica' }
];

export default function LaboratorioClient() {
  const [activeGame, setActiveGame] = useState('euromillions');
  const [activeTab, setActiveTab] = useState<'formulas' | 'bancada' | 'metodologia'>('formulas');
  const [loading, setLoading] = useState(true);
  const [topMetaSystems, setTopMetaSystems] = useState<MetaSystemEntry[]>([]);
  const [generatedAt, setGeneratedAt] = useState('');

  // Estado da bancada de testes manual
  const [selectedSpecialists, setSelectedSpecialists] = useState<Record<string, { active: boolean; polarity: 'DIRETO' | 'ESPELHO' }>>({
    mais_quentes: { active: true, polarity: 'DIRETO' },
    clustering: { active: true, polarity: 'ESPELHO' },
    tiro_certeiro: { active: true, polarity: 'DIRETO' },
    piramide_pascal: { active: true, polarity: 'ESPELHO' },
    ultimos_a_sair: { active: true, polarity: 'DIRETO' }
  });

  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simError, setSimError] = useState<string | null>(null);

  // Carregar dados guardados do laboratório
  useEffect(() => {
    async function loadLabData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tools/laboratorio?game=${activeGame}`);
        const data = await res.json();
        setTopMetaSystems(data.topMetaSystems || []);
        setGeneratedAt(data.generatedAt || '');
      } catch (err) {
        console.error('Erro ao carregar laboratório:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLabData();
  }, [activeGame]);

  // Carregar uma fórmula na bancada de testes
  const handleLoadFormula = (entry: MetaSystemEntry) => {
    const newState: Record<string, { active: boolean; polarity: 'DIRETO' | 'ESPELHO' }> = {};
    AVAILABLE_SPECIALISTS.forEach(s => {
      newState[s.id] = { active: false, polarity: 'DIRETO' };
    });

    entry.config.forEach(c => {
      newState[c.id] = { active: true, polarity: c.polarity };
    });

    setSelectedSpecialists(newState);
    setActiveTab('bancada');
    handleSimulate(newState);
  };

  // Executar simulação da bancada
  const handleSimulate = async (customConfig?: typeof selectedSpecialists) => {
    const configToUse = customConfig || selectedSpecialists;
    const activeConfigs = Object.entries(configToUse)
      .filter(([_, val]) => val.active)
      .map(([id, val]) => ({ systemId: id, polarity: val.polarity }));

    if (activeConfigs.length === 0) {
      setSimError('Selecione pelo menos um especialista.');
      return;
    }

    setSimulating(true);
    setSimError(null);

    try {
      const res = await fetch('/api/tools/laboratorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: activeGame, configs: activeConfigs })
      });

      const data = await res.json();
      if (!res.ok) {
        setSimError(data.error || 'Erro na simulação');
        setSimulationResult(null);
      } else {
        setSimulationResult(data);
      }
    } catch (err: any) {
      setSimError(err.message || 'Erro de conexão');
      setSimulationResult(null);
    } finally {
      setSimulating(false);
    }
  };

  const currentGameSpec = GAMES.find(g => g.id === activeGame) || GAMES[0];

  return (
    <div className="space-y-8">
      {/* Seletor de Jogo e Navegação de Abas */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeGame === g.id
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
              {g.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'formulas'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Fórmulas de Ouro
          </button>
          <button
            onClick={() => {
              setActiveTab('bancada');
              if (!simulationResult) handleSimulate();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'bancada'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" /> Bancada de Testes
          </button>
          <button
            onClick={() => setActiveTab('metodologia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'metodologia'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" /> Metodologia
          </button>
        </div>
      </div>

      {/* ABA 1: FÓRMULAS DE OURO */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Meta-Sistemas Descobertos por Otimização Combinatória Walk-Forward
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Ensembles calibrados com inversão cirúrgica de polaridade (+1 Direto e -1 Espelho). Maximizam o esvaziamento do centro gaussiano e empurram as saídas para as pontas.
                </p>
              </div>
              {generatedAt && (
                <div className="text-right text-xs text-slate-500 hidden sm:block">
                  Última Otimização: {new Date(generatedAt).toLocaleString('pt-PT')}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 animate-pulse bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              A carregar meta-sistemas do laboratório...
            </div>
          ) : topMetaSystems.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
              <FlaskConical className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800 dark:text-slate-300">Nenhum meta-sistema pré-calculado para {currentGameSpec.name}.</p>
              <p className="text-sm text-slate-500 mt-1">Execute o script de descoberta offline ou utilize a Bancada de Testes ao lado para simular qualquer combinação em tempo real.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {topMetaSystems.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Cabeçalho da Fórmula */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Ensemble de {entry.size} Especialistas
                        </span>
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          Fitness Score: {entry.stats.fitness}
                        </span>
                      </div>

                      {/* Especialistas e Polaridades */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {entry.config.map((c, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              c.polarity === 'DIRETO'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <span className="text-[10px] font-black">{c.polarity === 'DIRETO' ? '+' : '-'}</span>
                            {c.id.replace(/_/g, ' ')}
                            <span className="text-[9px] opacity-75 font-normal">
                              ({c.polarity === 'DIRETO' ? 'Dir' : 'Esp'})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Métricas Principais */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Jackpots Pontas</div>
                        <div className="text-base font-extrabold text-amber-400">
                          {entry.stats.totalJackpots}
                          <span className="text-[10px] text-slate-500 font-normal ml-1">
                            ({entry.stats.jackpotsDirect} / {entry.stats.jackpotsMirror})
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Traves (Quase)</div>
                        <div className="text-base font-extrabold text-emerald-400">
                          {entry.stats.totalNear}
                          <span className="text-[10px] text-slate-500 font-normal ml-1">
                            ({entry.stats.nearDirect} / {entry.stats.nearMirror})
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Separação Extremos</div>
                        <div className="text-base font-extrabold text-indigo-400">
                          {entry.stats.separationRatio}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Ruído Centro</div>
                        <div className="text-base font-bold text-slate-400">
                          {entry.stats.noise}
                        </div>
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    <button
                      onClick={() => handleLoadFormula(entry)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <FlaskConical className="w-3.5 h-3.5" /> Testar na Bancada
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: BANCADA DE TESTES INTERATIVA */}
      {activeTab === 'bancada' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Seletor de Especialistas e Polaridades */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  Composição do Meta-Sistema
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {Object.values(selectedSpecialists).filter(s => s.active).length} selecionados
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ative ou desative cada especialista e inverta a polaridade para <strong className="text-rose-600 dark:text-rose-400">Espelho</strong> para alimentar o meta-sistema com a cauda inversa.
              </p>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {AVAILABLE_SPECIALISTS.map(spec => {
                  const state = selectedSpecialists[spec.id] || { active: false, polarity: 'DIRETO' };
                  return (
                    <div
                      key={spec.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        state.active
                          ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700'
                          : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/50 opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={state.active}
                          onChange={(e) => {
                            setSelectedSpecialists(prev => ({
                              ...prev,
                              [spec.id]: { ...state, active: e.target.checked }
                            }));
                          }}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{spec.label}</div>
                          <div className="text-[10px] text-slate-500">{spec.family}</div>
                        </div>
                      </label>

                      {state.active && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSpecialists(prev => ({
                              ...prev,
                              [spec.id]: {
                                ...state,
                                polarity: state.polarity === 'DIRETO' ? 'ESPELHO' : 'DIRETO'
                              }
                            }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                            state.polarity === 'DIRETO'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          <ArrowRightLeft className="w-2.5 h-2.5" />
                          {state.polarity === 'DIRETO' ? '+ DIRETO' : '- ESPELHO'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleSimulate()}
                disabled={simulating}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {simulating ? (
                  <>A calcular sobre todo o histórico...</>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Simular Meta-Sistema Agora
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Coluna Direita: Resultados da Simulação em Tempo Real */}
          <div className="lg:col-span-7 space-y-4">
            {simError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {simError}
              </div>
            )}

            {simulationResult ? (
              <div className="space-y-5">
                {/* Cartão de Resumo */}
                <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        Diagnóstico Histórico do Meta-Sistema
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {simulationResult.stats.totalDraws} sorteios alinhados avaliados
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Fitness Score</span>
                      <span className="text-xl font-black text-amber-500 dark:text-amber-400">
                        {simulationResult.stats.fitness}
                      </span>
                    </div>
                  </div>

                  {/* Grelha de Métricas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Jackpots Diretos (5/5)</div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {simulationResult.stats.jackpotsDirect}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Jackpots Espelho (0/5)</div>
                      <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                        {simulationResult.stats.jackpotsMirror}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Traves Totais (4/1 + 1/4)</div>
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                        {simulationResult.stats.totalNear}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Separação de Extremos</div>
                      <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {simulationResult.stats.separationRatio}%
                      </div>
                    </div>
                  </div>

                  {/* Histograma de Distribuição */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Curva de Acertos (Objetivo: Vazio no Centro, Picos nas Pontas)
                    </div>
                    <div className="grid grid-cols-6 gap-2 pt-1">
                      {Object.entries(simulationResult.stats.distribution).map(([hits, count]: any) => {
                        const maxCount = Math.max(...Object.values(simulationResult.stats.distribution).map(Number));
                        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        const isExtreme = hits === '0' || hits === '1' || hits === String(currentGameSpec.win) || hits === String(currentGameSpec.win - 1);
                        return (
                          <div key={hits} className="text-center space-y-1">
                            <div className="h-20 bg-slate-100 dark:bg-slate-950 rounded-lg p-1 flex items-end justify-center border border-slate-200 dark:border-slate-800/80">
                              <div
                                style={{ height: `${Math.max(pct, 5)}%` }}
                                className={`w-full rounded transition-all ${
                                  isExtreme ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-700'
                                }`}
                              />
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{hits} Acertos</div>
                            <div className="text-[10px] text-slate-500">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Números Sugeridos para o Próximo Concurso */}
                {simulationResult.nextDrawNumbers && (
                  <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Números Gerados para o Próximo Concurso
                    </h4>

                    {/* Modo Direto */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" /> Metade Direta ({simulationResult.nextDrawNumbers.direct.length} Bolas)
                        </span>
                        <span className="text-[10px] text-slate-500">Soma de pesos Direto</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        {simulationResult.nextDrawNumbers.direct.map((n: number) => (
                          <span
                            key={n}
                            className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-500/40"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Modo Espelho */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5" /> Metade Espelho ({simulationResult.nextDrawNumbers.mirror.length} Bolas)
                        </span>
                        <span className="text-[10px] text-slate-500">Cauda inversa de acertos</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        {simulationResult.nextDrawNumbers.mirror.map((n: number) => (
                          <span
                            key={n}
                            className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300 font-black text-xs flex items-center justify-center border border-rose-500/40"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <FlaskConical className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhuma simulação ativa.</p>
                <p className="text-xs text-slate-500 mt-1">Selecione especialistas na coluna ao lado e clique em &quot;Simular Meta-Sistema Agora&quot;.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: METODOLOGIA DA POLARIDADE EXTREMA */}
      {activeTab === 'metodologia' && (
        <div className="bg-white dark:bg-slate-900/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-500" />
              A Lei da Separação das Águas e a Otimização de Meta-Sistemas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Princípios matemáticos estabelecidos no projeto Números Mágicos (Artigo 17).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                1. O Perigo da Mistura Cega
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Somar especialistas aleatórios sem considerar as suas correlações empurra as chaves para o centro da curva normal (2 e 3 acertos), destruindo a assimetria e o retorno de prémios.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                2. O Valor do Anti-Sistema (-1)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sistemas com taxa histórica de 0/5 elevada são minas de ouro quando invertidos. Ao atribuir peso negativo, as bolas ignoradas pelo algoritmo sobem para o topo da lista.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                3. A Função de Fitness
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Score = (Jackpots × 10) + (Traves × 1.5) - (Ruído Centro × 0.1). Premeia ensembles que esvaziam o centro gaussiano e concentram os sorteios nas pontas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
