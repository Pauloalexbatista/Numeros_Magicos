'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Flame, 
  Sparkles, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Waves, 
  AlertTriangle, 
  Trophy, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';

const GAMES = [
  { id: 'euromillions', name: 'Euromilhões', color: '#10b981' },
  { id: 'totoloto', name: 'Totoloto', color: '#3b82f6' },
  { id: 'eurodreams', name: 'EuroDreams', color: '#8b5cf6' },
  { id: 'megasena', name: 'Mega-Sena', color: '#f59e0b' }
];

const POPULAR_SYSTEMS = [
  { id: 'mais_quentes', label: 'Mais Quentes', badge: 'Calor / Inércia' },
  { id: 'ultimos_a_sair', label: 'Últimos a Sair', badge: 'Recência' },
  { id: 'media_3_otimizado', label: 'Média 3 Otimizado', badge: 'Harmonia Estatística' },
  { id: 'diagonais_matriz', label: 'Diagonais da Matriz', badge: 'Geometria 2D' },
  { id: 'oscilacao_universal', label: 'Oscilação Universal', badge: 'Pêndulo' },
  { id: 'markov', label: 'Cadeias de Markov', badge: 'Transições' },
  { id: 'clustering', label: 'Clustering', badge: 'Agrupamentos' },
  { id: 'monte_carlo', label: 'Monte Carlo', badge: 'Simulação' },
  { id: 'piramide_pascal', label: 'Pirâmide de Pascal', badge: 'Matriz Triangular' },
  { id: 'matriz_corte', label: 'Matriz de Corte V2', badge: 'Via Negativa' }
];

export default function SismologiaNazareClient() {
  const [activeGame, setActiveGame] = useState('euromillions');
  const [activeSystem, setActiveSystem] = useState('mais_quentes');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Player Temporal ("Filme da Onda")
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadSeismicData() {
      setLoading(true);
      setError(null);
      setIsPlaying(false);
      try {
        const res = await fetch(`/api/tools/sismologia?game=${activeGame}&system=${activeSystem}&points=100`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Erro ao carregar sismologia');
          setData(null);
        } else {
          setData(json);
          // Coloca o cursor no último ponto da timeline
          setCurrentFrameIndex(json.timeline.length - 1);
        }
      } catch (err: any) {
        setError(err.message || 'Erro de conexão');
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadSeismicData();
  }, [activeGame, activeSystem]);

  // Controlo do Player Temporal automático
  useEffect(() => {
    if (isPlaying && data && data.timeline.length > 0) {
      playTimerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => {
          if (prev >= data.timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, data]);

  const currentFrame = data?.timeline?.[currentFrameIndex] || null;

  return (
    <div className="space-y-8">
      {/* Seletor de Jogo e de Sistema */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Jogos */}
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

        {/* Seletor de Sistema */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400">Sistema:</span>
          <select
            value={activeSystem}
            onChange={(e) => setActiveSystem(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500"
          >
            {POPULAR_SYSTEMS.map(s => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.badge})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 dark:text-slate-400 animate-pulse bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Activity className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-spin" />
          A calcular sismologia e ondas de acertos dos últimos 100 sorteios...
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-500/10 rounded-2xl border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm">
          {error}
        </div>
      ) : data && currentFrame ? (
        <div className="space-y-6">
          {/* PAINEL PRINCIPAL: ESTADO DA FALHA & TENSÃO TECTÓNICA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bloco 1: O Manómetro de Tensão Tectónica */}
            <div className="lg:col-span-5 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" /> Sismógrafo de Jackpots
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Janela Áurea: 25 Sorteios
                </span>
              </div>

              {/* Tensão Tectónica Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tensão Tectónica Acumulada</span>
                  <span className="text-xl font-black" style={{ color: currentFrame.tensionPercentage >= 80 ? '#ef4444' : currentFrame.tensionPercentage >= 60 ? '#f59e0b' : '#3b82f6' }}>
                    {currentFrame.tensionPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
                  <div
                    style={{ width: `${currentFrame.tensionPercentage}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentFrame.tensionPercentage >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 shadow-lg shadow-rose-500/50'
                        : currentFrame.tensionPercentage >= 60
                        ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                        : 'bg-gradient-to-r from-emerald-500 to-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Fase Sísmica Atual */}
              <div className="p-4 rounded-xl border" style={{ backgroundColor: `${data.currentStatus.phaseColor}15`, borderColor: `${data.currentStatus.phaseColor}40` }}>
                <div className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5" style={{ color: data.currentStatus.phaseColor }}>
                  {currentFrame.phase === 'RUTURA_IMINENTE' && <Flame className="w-4 h-4 animate-pulse" />}
                  {currentFrame.phase === 'ABALOS_PREMONITORIOS' && <AlertTriangle className="w-4 h-4" />}
                  {currentFrame.phase === 'RESSACA' && <Waves className="w-4 h-4" />}
                  {data.currentStatus.phaseLabel}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                  {data.currentStatus.advice}
                </p>
              </div>

              {/* Estatísticas Rápidas do Modelo da Nazaré */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Abalos Janela 25</div>
                  <div className="text-lg font-black text-amber-500 dark:text-amber-400">
                    {currentFrame.windowForeshocks} <span className="text-xs font-normal text-slate-500">/ 4 meta</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Atraso Desde Jackpot</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {currentFrame.delaySinceLastJackpot} <span className="text-xs font-normal text-slate-500">sorteios</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 2: O SISMÓGRAFO VISUAL INTERATIVO */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Waves className="w-4 h-4 text-emerald-500" />
                    Ondas de Acertos & Sismograma Histórico
                  </h3>
                  <p className="text-xs text-slate-400">
                    Picos de magnitude 5 (Jackpots) e magnitude 4 (Abalos premonitórios que antecipam a onda).
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  Média Ciclo: <strong>{data.averageJackpotCycle}</strong> sort.
                </div>
              </div>

              {/* Gráfico do Sismógrafo */}
              <div className="h-44 bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex items-end gap-1 overflow-x-auto relative">
                {/* Linha guia de magnitude 4 e 5 */}
                <div className="absolute top-4 left-3 right-3 border-b border-dashed border-amber-500/30 flex justify-between text-[9px] text-amber-500/60 pointer-events-none">
                  <span>Magnitude 5 (Jackpot)</span>
                </div>
                <div className="absolute top-16 left-3 right-3 border-b border-dashed border-emerald-500/20 flex justify-between text-[9px] text-emerald-500/40 pointer-events-none">
                  <span>Magnitude 4 (Abalo Premonitório)</span>
                </div>

                {data.timeline.map((point: any, idx: number) => {
                  const isSelected = idx === currentFrameIndex;
                  const isJackpot = point.isJackpot;
                  const isForeshock = point.isForeshock;
                  // Altura percentual baseada em hits (0 a 5)
                  const heightPct = Math.max(10, (point.hits / 5) * 100);

                  let barColor = 'bg-slate-700/50';
                  if (isJackpot) barColor = 'bg-gradient-to-t from-amber-600 to-yellow-400 shadow-md shadow-yellow-500/40';
                  else if (isForeshock) barColor = 'bg-gradient-to-t from-emerald-600 to-teal-400';
                  else if (point.hits === 3) barColor = 'bg-blue-500/40';

                  return (
                    <button
                      key={point.drawId}
                      type="button"
                      onClick={() => {
                        setCurrentFrameIndex(idx);
                        setIsPlaying(false);
                      }}
                      className={`h-full flex-1 flex flex-col justify-end items-center group relative min-w-[5px] transition-all`}
                    >
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-sm transition-all ${barColor} ${
                          isSelected ? 'ring-2 ring-white scale-110' : 'group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* CONTROLO DO PLAYER TEMPORAL ("FILME DA ONDA") */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-white">Sorteio #{currentFrame.drawId || (data.totalDraws - data.timeline.length + 1 + currentFrameIndex)}</span>
                    <span className="text-slate-400">({currentFrame.date ? new Date(currentFrame.date).toLocaleDateString('pt-PT') : ''})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Acertos Registados:</span>
                    <span className={`font-black px-2 py-0.5 rounded-md text-xs ${
                      currentFrame.isJackpot ? 'bg-amber-500 text-slate-950' : currentFrame.isForeshock ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-300'
                    }`}>
                      {currentFrame.hits} / 5
                    </span>
                  </div>
                </div>

                {/* Slider Temporal */}
                <input
                  type="range"
                  min={0}
                  max={data.timeline.length - 1}
                  value={currentFrameIndex}
                  onChange={(e) => {
                    setCurrentFrameIndex(Number(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />

                {/* Botões do Media Player */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentFrameIndex(prev => Math.max(0, prev - 1));
                        setIsPlaying(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                      title="Sorteio Anterior"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                      {isPlaying ? 'Pausar Filme' : 'Reproduzir Filme da Onda'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentFrameIndex(prev => Math.min(data.timeline.length - 1, prev + 1));
                        setIsPlaying(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                      title="Próximo Sorteio"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentFrameIndex(data.timeline.length - 1);
                      setIsPlaying(false);
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Ir para o Mais Recente
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FUNDAMENTAÇÃO CIENTÍFICA: O MODELO DA NAZARÉ */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Os 4 Abalos Premonitórios e a Teoria da Nazaré
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-400 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-blue-400 uppercase">1. Acumulação Tectónica</div>
                <p>O sistema passa por sorteios dominados por 2 e 3 acertos. A tensão elástica na falha matemática começa a acumular silenciosamente.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-amber-400 uppercase">2. Tremores Premonitórios</div>
                <p>Surgem 2 a 3 acertos de magnitude 4. Na proporção fractal da Nazaré, cada onda gigante é precedida por 4 abalos de 4 acertos.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-rose-400 uppercase">3. Rutura Iminente (Pico)</div>
                <p>Quando a janela atinge 18 a 25 sorteios com 3 ou 4 abalos, a falha entra em sobrecarga crítica. É o momento de aposta máxima!</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-emerald-400 uppercase">4. Ressaca da Onda</div>
                <p>Após a saída do 5/5, a tensão cai para níveis mínimos. O sistema entra num período de calmaria e arrefecimento de 3 a 5 sorteios.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
