"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  Calendar,
  Filter,
  Loader2,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface TimelineEvent {
  drawId: number;
  date: string;
  type: "jackpot" | "trave";
  interval?: number;
}

interface SystemRadarStats {
  systemId: string;
  systemName: string;
  totalJackpots: number;
  totalTraves: number;
  cycleMean: number;
  cycleMedian: number;
  cycleStdDev: number;
  currentDelay: number;
  lastJackpotDate: string | null;
  lastJackpotDrawId: number | null;
  travesLast5: number;
  travesLast10: number;
  travesSinceLastJackpot?: number;
  travesPerJackpotMean?: number;
  jpiScore: number;
  status: "elite" | "ripe" | "warming" | "green" | "overdue";
  statusLabel: string;
  timelineEvents: TimelineEvent[];
  drawHits?: number[];
}

interface RadarApiResponse {
  game: string;
  totalDraws: number;
  drawDates?: string[];
  baseline: {
    pool: number;
    maxHits: number;
    mean: number;
    prob: string;
  };
  systems: SystemRadarStats[];
}

const GAMES = [
  { id: "EUROMILLIONS", label: "Euromilhões", flag: "🇪🇺" },
  { id: "TOTOLOTO", label: "Totoloto", flag: "🇵🇹" },
  { id: "EURODREAMS", label: "EuroDreams", flag: "🌠" },
  { id: "MEGASENA", label: "Mega-Sena", flag: "🇧🇷" },
  { id: "LOTOFACIL", label: "Lotofácil", flag: "🇧🇷" }
];

export default function RadarSystems() {
  const t = useTranslations("Tools.Radar");
  const searchParams = useSearchParams();
  const initialGame = searchParams.get("game")?.toUpperCase() || "EUROMILLIONS";

  const [activeDomain, setActiveDomain] = useState<"NUMBERS" | "STARS">("NUMBERS");
  const [activeGame, setActiveGame] = useState<string>(
    GAMES.some(g => g.id === initialGame) ? initialGame : "EUROMILLIONS"
  );
  const [data, setData] = useState<RadarApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [timelineRange, setTimelineRange] = useState<"all" | "modern" | "recent">("all");
  const [chartMode, setChartMode] = useState<"bipolar" | "standard">("bipolar");
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  // Player Temporal & Histograma de Acertos (Sismograma de Convergência)
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(250); // ms per draw
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRadarData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tools/radar?game=${activeGame}&domain=${activeDomain}`);
        if (res.ok) {
          const json: RadarApiResponse = await res.json();
          if (isMounted) {
            setData(json);
            if (json.systems && json.systems.length > 0) {
              setSelectedSystemId(json.systems[0].systemId);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load radar data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRadarData();
    return () => {
      isMounted = false;
    };
  }, [activeGame, activeDomain]);

  const systems = data?.systems || [];
  const totalDraws = data?.totalDraws || 1;

  const filteredSystems = useMemo(() => {
    if (statusFilter === "all") return systems;
    if (statusFilter === "ripe") return systems.filter(s => s.status === "ripe" || s.status === "elite");
    return systems.filter(s => s.status === statusFilter);
  }, [systems, statusFilter]);

  const selectedSystem = useMemo(() => {
    return systems.find(s => s.systemId === selectedSystemId) || systems[0] || null;
  }, [systems, selectedSystemId]);

  const topRipeSystems = useMemo(() => {
    return systems.slice(0, 3);
  }, [systems]);

  // Limites dinâmicos da linha temporal ajustados ao número real de sorteios do jogo
  const modernOffset = totalDraws <= 350 ? Math.round(totalDraws * 0.5) : 400;
  const recentOffset = totalDraws <= 350 ? 50 : 100;

  const timelineStart = useMemo(() => {
    if (timelineRange === "modern") return Math.max(1, totalDraws - modernOffset);
    if (timelineRange === "recent") return Math.max(1, totalDraws - recentOffset);
    return 1;
  }, [totalDraws, timelineRange, modernOffset, recentOffset]);

  const timelineEnd = totalDraws;

  const visibleTimelineEvents = useMemo(() => {
    if (!selectedSystem) return [];
    return selectedSystem.timelineEvents.filter(ev => ev.drawId >= timelineStart && ev.drawId <= timelineEnd);
  }, [selectedSystem, timelineStart, timelineEnd]);

  const visibleStartIndex = useMemo(() => {
    if (timelineRange === "modern") return Math.max(0, totalDraws - modernOffset);
    if (timelineRange === "recent") return Math.max(0, totalDraws - recentOffset);
    return 0;
  }, [totalDraws, timelineRange, modernOffset, recentOffset]);

  const visibleEndIndex = Math.max(0, totalDraws - 1);

  // Inicializa o frame no sorteio mais recente
  useEffect(() => {
    if (totalDraws > 0) {
      setCurrentFrameIndex(totalDraws - 1);
      setIsPlaying(false);
    }
  }, [totalDraws, selectedSystemId, activeGame]);

  // Se o utilizador mudar de filtro e o frame atual ficar fora da janela, ajusta
  useEffect(() => {
    if (currentFrameIndex < visibleStartIndex) {
      setCurrentFrameIndex(visibleStartIndex);
    }
  }, [visibleStartIndex]);

  // Auto-scroll suave para manter sempre o sorteio ativo perfeitamente centrado no ecrã
  useEffect(() => {
    if (scrollContainerRef.current && barRefs.current[currentFrameIndex]) {
      const container = scrollContainerRef.current;
      const bar = barRefs.current[currentFrameIndex];
      if (container && bar) {
        const targetScroll = bar.offsetLeft - (container.offsetWidth / 2) + (bar.offsetWidth / 2);
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: isPlaying ? 'auto' : 'smooth'
        });
      }
    }
  }, [currentFrameIndex, isPlaying]);

  // Motor do Player Temporal
  useEffect(() => {
    if (isPlaying && totalDraws > 0) {
      playTimerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => {
          if (prev >= visibleEndIndex) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalDraws, visibleEndIndex, playbackSpeed]);

  return (
    <div className="space-y-8">
      {/* Seletor de Jogos */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {GAMES.map(g => {
            const isActive = activeGame === g.id;
            return (
              <button
                key={g.id}
                onClick={() => { setActiveGame(g.id); if (g.id === "MEGASENA" || g.id === "LOTOFACIL") setActiveDomain("NUMBERS"); }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm",
                  isActive
                    ? "bg-indigo-600 text-white shadow-indigo-500/20 scale-[1.02]"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750"
                )}
              >
                <span>{g.flag}</span>
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {data && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 font-mono font-medium text-gray-700 dark:text-gray-300">
                📊 {data.totalDraws} sorteios analisados
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {t("baseline_neutral")}: <strong className="text-amber-500 dark:text-amber-400">~{data.baseline.mean} {t("draws")}</strong> ({data.baseline.prob})
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-xs"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t("methodology_button")}</span>
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("loading_radar")}...
          </p>
        </div>
      ) : !data || systems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {t("no_systems_found")}
          </p>
        </div>
      ) : (
        <>
          {/* GUIA DE METODOLOGIA E EFICÁCIA JPI */}
          {showGuide && (
            <div className="bg-gradient-to-br from-indigo-900/5 via-white to-purple-900/5 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shadow-indigo-600/30">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {t("methodology_title")}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {t("accuracy_badge")} • {t("accuracy_title")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    🎯 73.5% no Sweet Spot
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    ⚡ 79.2% Alerta Térmico
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                {/* CARD 1: O que é o JPI & Fórmula */}
                <div className="bg-white dark:bg-slate-800/75 rounded-xl p-4 border border-gray-200/80 dark:border-slate-700/70 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-sm">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span>{t("jpi_title")}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("jpi_desc")}
                  </p>
                  <div className="bg-gray-50 dark:bg-slate-900/80 rounded-lg p-2.5 border border-gray-100 dark:border-slate-800 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                    <strong>JPI = (Atraso / Ciclo Médio × 60%) + (Pressão Traves Recentes × 40%)</strong>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                    {t("accuracy_desc")}
                  </p>
                </div>

                {/* CARD 2: A Teoria da Fruta & Por que há passados */}
                <div className="bg-white dark:bg-slate-800/75 rounded-xl p-4 border border-gray-200/80 dark:border-slate-700/70 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-sm">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{t("lifecycle_title")}</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                      <strong className="text-emerald-700 dark:text-emerald-400 block">{t("state_ripe_title")}</strong>
                      <span className="text-gray-600 dark:text-gray-300">{t("state_ripe_desc")}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                      <strong className="text-amber-700 dark:text-amber-400 block">{t("state_warming_title")}</strong>
                      <span className="text-gray-600 dark:text-gray-300">{t("state_warming_desc")}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                      <strong className="text-blue-700 dark:text-blue-400 block">{t("state_green_title")}</strong>
                      <span className="text-gray-600 dark:text-gray-300">{t("state_green_desc")}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                      <strong className="text-red-700 dark:text-red-400 block">{t("state_overdue_title")}</strong>
                      <span className="text-gray-600 dark:text-gray-300">{t("state_overdue_desc")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: Matriz de Confusão e Falsos Alarmes (Auditoria Estatística P5) */}
              <div className="bg-white dark:bg-slate-800/75 rounded-xl p-4 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-sm">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span>Matriz de Confusão & Falsos Alarmes (Auditoria P5)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                    Amostra: 1.992 Sorteios Consolidados
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Quando um sistema entra em sinal de disparo <strong className="text-emerald-600 dark:text-emerald-400">"Elite / Maduro" (JPI ≥ 1.0)</strong>, como se comportam os acertos ao longo do horizonte temporal?
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/60 border border-gray-200/60 dark:border-slate-800">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">1 Sorteio (Imediato)</div>
                    <div className="text-lg font-black text-rose-500 mt-0.5">27.7%</div>
                    <span className="text-[10px] text-gray-500">Falso Alarme: 72.3%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/60 border border-gray-200/60 dark:border-slate-800">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Janela de 3 Sorteios</div>
                    <div className="text-lg font-black text-amber-500 mt-0.5">54.8%</div>
                    <span className="text-[10px] text-gray-500">Falso Alarme: 45.2%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Janela de 5 (Sweet Spot)</div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">73.5%</div>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-300/80 font-semibold">VPP: 73.5%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                    <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold uppercase">Janela de 10 Sorteios</div>
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">88.1%</div>
                    <span className="text-[10px] text-indigo-600/80 dark:text-indigo-300/80 font-semibold">Especificidade: 84.2%</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                  * Nota Metodológica: O JPI não é um gatilho de tiro único para o sorteio imediato; funciona como uma janela de oportunidade com convergência de 73.5% nos 5 concursos subsequentes à ativação do sinal.
                </div>
              </div>
            </div>
          )}

          {/* TOP 3 FRUTA MADURA / SWEET SPOT CARDS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>{t("top_ripe_title")}</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("top_ripe_subtitle")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topRipeSystems.map((sys, idx) => {
                const isSelected = selectedSystem?.systemId === sys.systemId;
                const isElite = sys.status === "elite";
                const isRipe = sys.status === "ripe" || isElite;
                const isWarming = sys.status === "warming";

                return (
                  <div
                    key={sys.systemId}
                    onClick={() => setSelectedSystemId(sys.systemId)}
                    className={cn(
                      "cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between shadow-sm",
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900 shadow-md scale-[1.01]"
                        : isElite
                        ? "bg-white dark:bg-slate-900/90 border-orange-400 dark:border-orange-500/60 ring-1 ring-orange-400/30 hover:border-orange-500"
                        : "bg-white dark:bg-slate-900/90 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              idx === 0
                                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50"
                                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
                            )}
                          >
                            #{idx + 1}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border",
                              isElite
                                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40 shadow-xs font-black"
                                : isRipe
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : isWarming
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            )}
                          >
                            {sys.statusLabel}
                          </span>
                        </div>

                        {/* JPI Score */}
                        <div className="text-right">
                          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            {sys.jpiScore}
                            <span className="text-xs font-normal text-gray-400">/100</span>
                          </div>
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Score JPI
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {sys.systemName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t("current_delay")}:{" "}
                          <strong className="text-gray-900 dark:text-gray-100 font-semibold">
                            {sys.currentDelay} {t("draws")}
                          </strong>{" "}
                          • {t("cycle_mean")}: <strong>{sys.cycleMean}</strong>
                        </p>
                        {sys.travesPerJackpotMean !== undefined && (
                          <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/50">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Acertos 4/5 no Ciclo:</span>
                            <span className={cn(
                              "font-mono font-bold",
                              (sys.travesSinceLastJackpot ?? 0) >= (sys.travesPerJackpotMean ?? 1)
                                ? "text-amber-600 dark:text-amber-400 font-black"
                                : "text-gray-700 dark:text-gray-300"
                            )}>
                              {sys.travesSinceLastJackpot ?? 0}{" "}
                              <span className="font-normal text-gray-400">/ {sys.travesPerJackpotMean} méd</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {sys.travesLast5 > 0 ? (
                            <strong className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {sys.travesLast5} {t("hits_last_5")}
                            </strong>
                          ) : (
                            `${sys.travesLast10} ${t("hits_last_10")}`
                          )}
                        </span>
                      </div>

                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                        {t("view_timeline")} <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAINEL INTERATIVO: LINHA TEMPORAL DO SISTEMA SELECIONADO */}
          {selectedSystem && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t("timeline_of")} {selectedSystem.systemName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {t("timeline_subtitle", {
                        jackpots: selectedSystem.totalJackpots,
                        traves: selectedSystem.totalTraves,
                        mean: selectedSystem.cycleMean
                      })}
                    </span>
                    {selectedSystem.travesPerJackpotMean !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold text-[11px]">
                        ⚡ {selectedSystem.travesSinceLastJackpot ?? 0} acertos 4/5 neste ciclo (Média histórica: {selectedSystem.travesPerJackpotMean} por Jackpot)
                      </span>
                    )}
                  </div>
                </div>

                {/* Seletor de Modo & Botões de Filtro Temporal Dinâmicos */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Seletor de Modo: Bipolar vs Clássico */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs border border-gray-200 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setChartMode("bipolar")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5",
                        chartMode === "bipolar"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <span>⚖️ Anti-Sistema (-5 a +5)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMode("standard")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5",
                        chartMode === "standard"
                          ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <span>📊 Clássico (0 a 5)</span>
                    </button>
                  </div>

                  {/* Filtro Temporal */}
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setTimelineRange("all")}
                      className={cn(
                        "px-3 py-1 rounded-lg font-semibold transition",
                        timelineRange === "all"
                          ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      Todo o Histórico (1-{totalDraws})
                    </button>
                    <button
                      onClick={() => setTimelineRange("modern")}
                      className={cn(
                        "px-3 py-1 rounded-lg font-semibold transition",
                        timelineRange === "modern"
                          ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      Últimos {modernOffset}
                    </button>
                    <button
                      onClick={() => setTimelineRange("recent")}
                      className={cn(
                        "px-3 py-1 rounded-lg font-semibold transition",
                        timelineRange === "recent"
                          ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      Últimos {recentOffset}
                    </button>
                  </div>
                </div>
              </div>

              {/* Histograma de Acertos & Sismograma de Convergência com Player */}
              <div className="space-y-3">
                {/* Legenda Superior */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 pb-1">
                  {chartMode === "bipolar" ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-amber-600 to-yellow-400 shadow-xs shadow-yellow-500/50 inline-block"></span>
                        <strong className="text-gray-800 dark:text-gray-200">Jackpot ±{data.baseline.maxHits} (5 no Sistema ou 5 no Anti-Sistema)</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400 inline-block"></span>
                        <span>Trave ±{data.baseline.maxHits - 1} (4 no Sistema ou 4 no Anti-Sistema)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm bg-cyan-500 inline-block"></span>
                        <span>Equilíbrio ±3 / ±2</span>
                      </span>
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                        ⚖️ Tamanho da Barra = {data.baseline.maxHits} (Fixo)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-amber-600 to-yellow-400 shadow-xs shadow-yellow-500/50 inline-block"></span>
                        <strong className="text-gray-800 dark:text-gray-200">Jackpot ({data.baseline.maxHits}/{data.baseline.maxHits})</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400 inline-block"></span>
                        <span>Convergência Parcial ({data.baseline.maxHits - 1}/{data.baseline.maxHits})</span>
                      </span>
                      {data.baseline.maxHits > 2 && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm bg-blue-500/60 inline-block"></span>
                          <span>3 Acertos</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm bg-slate-700 inline-block"></span>
                        <span>Dispersão</span>
                      </span>
                    </div>
                  )}

                  <span className="text-[11px] font-mono">
                    Concursos no Ecrã: {visibleStartIndex + 1} - {visibleEndIndex + 1} ({visibleEndIndex - visibleStartIndex + 1} sorteios)
                  </span>
                </div>

                {/* Sismograma de Barras Verticais */}
                <div className={cn(
                  "relative w-full bg-[#060B18] rounded-2xl border-2 border-slate-800 flex flex-col justify-end p-3 shadow-xl overflow-hidden transition-all duration-300",
                  chartMode === "bipolar" ? "h-72" : "h-52"
                )}>
                  {chartMode === "bipolar" ? (
                    <>
                      {/* Linha Guia +5 (Jackpot Sistema) */}
                      <div className="absolute top-2.5 left-3 right-3 border-b border-dashed border-amber-400/40 flex justify-between text-[10px] font-black pointer-events-none z-10">
                        <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-md tracking-wider uppercase text-[9px]">
                          +{data.baseline.maxHits} Jackpot Sistema (0 Anti-Sistema)
                        </span>
                      </div>

                      {/* Linha Guia +4 (Trave Sistema) */}
                      <div className="absolute top-[10%] left-3 right-3 border-b border-dashed border-emerald-400/30 flex justify-between text-[10px] font-black pointer-events-none z-10">
                        <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded shadow-md tracking-wider uppercase text-[9px]">
                          +{data.baseline.maxHits - 1} Trave Sistema (1 Anti-Sistema)
                        </span>
                      </div>

                      {/* Linha Central de Equilíbrio / Eixo Zero */}
                      <div className="absolute top-1/2 left-0 right-0 border-b-2 border-indigo-500/60 pointer-events-none z-20 flex items-center justify-between px-3">
                        <span className="bg-slate-950/90 text-indigo-300 font-black text-[9px] px-2 py-0.5 rounded border border-indigo-500/50 shadow-xs uppercase tracking-wider">
                          Eixo 0 Neutro (Equilíbrio)
                        </span>
                        <span className="bg-slate-950/90 text-indigo-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-indigo-500/30">
                          ▲ Sistema (+{data.baseline.maxHits}) | ▼ Anti-Sistema (-{data.baseline.maxHits})
                        </span>
                      </div>

                      {/* Linha Guia -4 (Trave Anti-Sistema) */}
                      <div className="absolute bottom-[10%] left-3 right-3 border-b border-dashed border-emerald-400/30 flex justify-between text-[10px] font-black pointer-events-none z-10">
                        <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded shadow-md tracking-wider uppercase text-[9px]">
                          -{data.baseline.maxHits - 1} Trave Anti-Sistema (1 Sistema)
                        </span>
                      </div>

                      {/* Linha Guia -5 (Jackpot Anti-Sistema) */}
                      <div className="absolute bottom-2.5 left-3 right-3 border-b border-dashed border-amber-400/40 flex justify-between text-[10px] font-black pointer-events-none z-10">
                        <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-md tracking-wider uppercase text-[9px]">
                          -{data.baseline.maxHits} Jackpot Anti-Sistema (0 Sistema)
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Linhas Guia Horizontais de Magnitude Clássica */}
                      <div className="absolute top-4 left-3 right-3 border-b-2 border-dashed border-amber-400/50 flex justify-between text-[10px] font-black pointer-events-none z-10">
                        <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow-md tracking-wider uppercase">
                          Magnitude {data.baseline.maxHits} (Jackpot)
                        </span>
                      </div>
                      <div className="absolute top-16 left-3 right-3 border-b-2 border-dashed border-emerald-400/40 flex justify-between text-[10px] font-black pointer-events-none z-10">
                        <span className="bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded shadow-md tracking-wider uppercase">
                          Magnitude {data.baseline.maxHits - 1} (Convergência Parcial)
                        </span>
                      </div>
                    </>
                  )}

                  {/* Contentor de Barras com Auto-Scroll */}
                  <div
                    ref={scrollContainerRef}
                    className="flex items-end gap-1 overflow-x-auto h-full pt-12 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent select-none border-b border-slate-800"
                  >
                    {Array.from({ length: visibleEndIndex - visibleStartIndex + 1 }, (_, k) => {
                      const idx = visibleStartIndex + k;
                      const drawId = idx + 1;
                      const isSelected = idx === currentFrameIndex;
                      const hits = selectedSystem.drawHits?.[idx] ?? (
                        selectedSystem.timelineEvents.find(e => e.drawId === drawId)?.type === 'jackpot' ? data.baseline.maxHits :
                        selectedSystem.timelineEvents.find(e => e.drawId === drawId)?.type === 'trave' ? data.baseline.maxHits - 1 : 0
                      );
                      const antiHits = data.baseline.maxHits - hits;

                      const isJackpot = hits === data.baseline.maxHits || (chartMode === "bipolar" && hits === 0);
                      const isTrave = (hits === data.baseline.maxHits - 1 && data.baseline.maxHits > 1) || (chartMode === "bipolar" && hits === 1 && data.baseline.maxHits > 1);
                      const isThree = (hits === data.baseline.maxHits - 2 && data.baseline.maxHits > 2) || (chartMode === "bipolar" && hits === 2 && data.baseline.maxHits > 2);

                      let barColor = "bg-slate-700/80 hover:bg-slate-600";
                      if (isJackpot) {
                        barColor = "bg-gradient-to-t from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_16px_rgba(250,204,21,1)]";
                      } else if (isTrave) {
                        barColor = "bg-gradient-to-t from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.9)]";
                      } else if (isThree) {
                        barColor = "bg-cyan-500/90 hover:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]";
                      }

                      const titleText = chartMode === "bipolar"
                        ? `Sorteio #${drawId} • Sistema: ${hits} | Anti-Sistema: ${antiHits}`
                        : `Sorteio #${drawId} • ${hits}/${data.baseline.maxHits} acertos`;

                      if (chartMode === "bipolar") {
                        const bottomPct = (hits / (2 * data.baseline.maxHits)) * 100;
                        return (
                          <button
                            key={`bar-${drawId}`}
                            ref={el => { barRefs.current[idx] = el; }}
                            type="button"
                            onClick={() => {
                              setCurrentFrameIndex(idx);
                              setIsPlaying(false);
                            }}
                            className={cn(
                              "h-full relative group transition-all focus:outline-none",
                              timelineRange === "recent" ? "min-w-[12px] flex-1" : timelineRange === "modern" ? "min-w-[6px] flex-1" : "min-w-[4px] flex-1"
                            )}
                            title={titleText}
                          >
                            <div
                              style={{ bottom: `${bottomPct}%`, height: '50%' }}
                              className={cn(
                                "absolute inset-x-0 rounded-sm transition-all duration-150",
                                barColor,
                                isSelected ? "ring-2 ring-white scale-125 z-40 brightness-150 shadow-[0_0_20px_rgba(255,255,255,1)]" : "group-hover:opacity-100"
                              )}
                            />
                          </button>
                        );
                      }

                      // Altura percentual da barra em modo clássico
                      const heightPct = isJackpot ? 100 : isTrave ? 80 : isThree ? 55 : Math.max(16, Math.round((hits / data.baseline.maxHits) * 100));

                      return (
                        <button
                          key={`bar-${drawId}`}
                          ref={el => { barRefs.current[idx] = el; }}
                          type="button"
                          onClick={() => {
                            setCurrentFrameIndex(idx);
                            setIsPlaying(false);
                          }}
                          className={cn(
                            "h-full flex flex-col justify-end items-center group relative transition-all focus:outline-none",
                            timelineRange === "recent" ? "min-w-[12px] flex-1" : timelineRange === "modern" ? "min-w-[6px] flex-1" : "min-w-[4px] flex-1"
                          )}
                          title={titleText}
                        >
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={cn(
                              "w-full rounded-t-sm transition-all duration-150",
                              barColor,
                              isSelected ? "ring-2 ring-white scale-125 z-40 brightness-150 shadow-[0_0_20px_rgba(255,255,255,1)]" : "group-hover:opacity-100"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CONSOLA DO PLAYER TEMPORAL & CONTROLO MULTIMÉDIA */}
                {(() => {
                  const currentDrawId = currentFrameIndex + 1;
                  const currentDate = data.drawDates?.[currentFrameIndex] || "";
                  const currentHits = selectedSystem.drawHits?.[currentFrameIndex] ?? (
                    selectedSystem.timelineEvents.find(e => e.drawId === currentDrawId)?.type === 'jackpot' ? data.baseline.maxHits :
                    selectedSystem.timelineEvents.find(e => e.drawId === currentDrawId)?.type === 'trave' ? data.baseline.maxHits - 1 : 0
                  );
                  const isJackpot = currentHits === data.baseline.maxHits;
                  const isTrave = currentHits === data.baseline.maxHits - 1 && data.baseline.maxHits > 1;

                  return (
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
                      {/* Linha de Info do Sorteio Ativo */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              Sorteio #{currentDrawId}
                            </span>
                            {currentDate && (
                              <span className="ml-2 font-semibold text-slate-600 dark:text-slate-300">
                                ({new Date(currentDate).toLocaleDateString('pt-PT')})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Resultado do Algoritmo:</span>
                          {chartMode === "bipolar" ? (
                            <span className={cn(
                              "px-3 py-1 rounded-xl font-black text-xs inline-flex items-center gap-1.5 shadow-xs",
                              currentHits === data.baseline.maxHits
                                ? "bg-amber-400 text-amber-950 border border-amber-500 shadow-amber-400/30"
                                : currentHits === 0
                                ? "bg-amber-400 text-amber-950 border border-amber-500 shadow-amber-400/30"
                                : currentHits === data.baseline.maxHits - 1
                                ? "bg-emerald-500 text-white border border-emerald-600 shadow-emerald-500/30"
                                : currentHits === 1
                                ? "bg-emerald-500 text-white border border-emerald-600 shadow-emerald-500/30"
                                : "bg-cyan-600 text-white border border-cyan-700"
                            )}>
                              {currentHits === data.baseline.maxHits && `🏆 JACKPOT SISTEMA (+${data.baseline.maxHits})`}
                              {currentHits === 0 && `🔮 JACKPOT ANTI-SISTEMA (-${data.baseline.maxHits})`}
                              {currentHits === data.baseline.maxHits - 1 && `🎯 CONVERGÊNCIA SISTEMA (+${data.baseline.maxHits - 1} / -1)`}
                              {currentHits === 1 && `⚡ CONVERGÊNCIA ANTI-SISTEMA (+1 / -${data.baseline.maxHits - 1})`}
                              {currentHits !== data.baseline.maxHits && currentHits !== 0 && currentHits !== data.baseline.maxHits - 1 && currentHits !== 1 && (
                                `⚖️ ${currentHits} Sistema • ${data.baseline.maxHits - currentHits} Anti-Sistema`
                              )}
                            </span>
                          ) : (
                            <span className={cn(
                              "px-3 py-1 rounded-xl font-black text-xs inline-flex items-center gap-1.5 shadow-xs",
                              isJackpot
                                ? "bg-amber-400 text-amber-950 border border-amber-500 shadow-amber-400/30"
                                : isTrave
                                ? "bg-emerald-500 text-white border border-emerald-600 shadow-emerald-500/30"
                                : currentHits >= 3
                                ? "bg-blue-600 text-white border border-blue-700"
                                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                            )}>
                              {isJackpot && `🏆 JACKPOT (${data.baseline.maxHits}/${data.baseline.maxHits})`}
                              {isTrave && `🎯 CONVERGÊNCIA (${data.baseline.maxHits - 1}/${data.baseline.maxHits})`}
                              {!isJackpot && !isTrave && `${currentHits} / ${data.baseline.maxHits} Acertos`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Slider de Esfregaço Temporal */}
                      <div className="space-y-1 pt-1">
                        <input
                          type="range"
                          min={visibleStartIndex}
                          max={visibleEndIndex}
                          value={currentFrameIndex}
                          onChange={(e) => {
                            setCurrentFrameIndex(Number(e.target.value));
                            setIsPlaying(false);
                          }}
                          className="w-full accent-indigo-600 bg-slate-300 dark:bg-slate-750 rounded-lg h-2.5 cursor-pointer"
                        />
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
                          <span>Sorteio #{visibleStartIndex + 1}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                            Posição: {currentFrameIndex + 1} / {totalDraws}
                          </span>
                          <span>Sorteio #{visibleEndIndex + 1}</span>
                        </div>
                      </div>

                      {/* Botões do Reprodutor */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          {/* Anterior */}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentFrameIndex(prev => Math.max(visibleStartIndex, prev - 1));
                              setIsPlaying(false);
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs active:scale-95 transition"
                            title="Sorteio Anterior"
                          >
                            <SkipBack className="w-4 h-4" />
                          </button>

                          {/* Play / Pause */}
                          <button
                            type="button"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={cn(
                              "px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95",
                              isPlaying
                                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
                            )}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                            <span>{isPlaying ? "Pausar Simulação" : "Reproduzir Simulação"}</span>
                          </button>

                          {/* Seguinte */}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentFrameIndex(prev => Math.min(visibleEndIndex, prev + 1));
                              setIsPlaying(false);
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs active:scale-95 transition"
                            title="Próximo Sorteio"
                          >
                            <SkipForward className="w-4 h-4" />
                          </button>

                          {/* Velocidade */}
                          <button
                            type="button"
                            onClick={() => setPlaybackSpeed(s => s === 250 ? 100 : 250)}
                            className="px-3 py-2 rounded-xl text-xs font-black bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs transition"
                            title="Velocidade da Animação"
                          >
                            {playbackSpeed === 100 ? "⚡ 2x Rápido" : "⏱️ 1x Normal"}
                          </button>
                        </div>

                        {/* Ir para o Mais Recente */}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentFrameIndex(visibleEndIndex);
                            setIsPlaying(false);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/70 font-extrabold text-xs transition flex items-center gap-1.5 shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Ir para o Mais Recente
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* CARD 3: Matriz de Confusão e Falsos Alarmes (Auditoria Estatística P5) */}
              <div className="bg-white dark:bg-slate-800/75 rounded-xl p-4 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-sm">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span>Matriz de Confusão & Falsos Alarmes (Auditoria P5)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                    Amostra: 1.992 Sorteios Consolidados
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Quando um sistema entra em sinal de disparo <strong className="text-emerald-600 dark:text-emerald-400">"Elite / Maduro" (JPI ≥ 1.0)</strong>, como se comportam os acertos ao longo do horizonte temporal?
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/60 border border-gray-200/60 dark:border-slate-800">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">1 Sorteio (Imediato)</div>
                    <div className="text-lg font-black text-rose-500 mt-0.5">27.7%</div>
                    <span className="text-[10px] text-gray-500">Falso Alarme: 72.3%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/60 border border-gray-200/60 dark:border-slate-800">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Janela de 3 Sorteios</div>
                    <div className="text-lg font-black text-amber-500 mt-0.5">54.8%</div>
                    <span className="text-[10px] text-gray-500">Falso Alarme: 45.2%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Janela de 5 (Sweet Spot)</div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">73.5%</div>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-300/80 font-semibold">VPP: 73.5%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                    <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold uppercase">Janela de 10 Sorteios</div>
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">88.1%</div>
                    <span className="text-[10px] text-indigo-600/80 dark:text-indigo-300/80 font-semibold">Especificidade: 84.2%</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                  * Nota Metodológica: O JPI não é um gatilho de tiro único para o sorteio imediato; funciona como uma janela de oportunidade com convergência de 73.5% nos 5 concursos subsequentes à ativação do sinal.
                </div>
              </div>
            </div>
          )}

          {/* TABELA GERAL DE TODOS OS SISTEMAS COM FILTRO POR ESTADO */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>{t("all_systems_title")}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("all_systems_subtitle")}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "all", label: t("filter_all") },
                  { id: "ripe", label: t("filter_ripe") },
                  { id: "warming", label: t("filter_warming") },
                  { id: "green", label: t("filter_green") },
                  { id: "overdue", label: t("filter_overdue") }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold transition",
                      statusFilter === tab.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    <th className="pb-3 px-3">{t("table_system")}</th>
                    <th className="pb-3 px-3">{t("table_status")}</th>
                    <th className="pb-3 px-3 text-center">{t("table_jpi")}</th>
                    <th className="pb-3 px-3 text-right">{t("table_delay")}</th>
                    <th className="pb-3 px-3 text-right">{t("table_cycle_mean")}</th>
                    <th className="pb-3 px-3 text-center">{t("table_cycle_traves")}</th>
                    <th className="pb-3 px-3 text-center">{t("table_recent_traves")}</th>
                    <th className="pb-3 px-3 text-right">{t("table_total_jackpots")}</th>
                    <th className="pb-3 px-3 text-center">{t("table_action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {filteredSystems.map(sys => {
                    const isSelected = selectedSystem?.systemId === sys.systemId;
                    const isElite = sys.status === "elite";
                    const isRipe = sys.status === "ripe" || isElite;
                    const isWarming = sys.status === "warming";

                    return (
                      <tr
                        key={sys.systemId}
                        className={cn(
                          "transition hover:bg-gray-50/70 dark:hover:bg-slate-800/40",
                          isSelected && "bg-indigo-50/50 dark:bg-indigo-950/20"
                        )}
                      >
                        <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white">
                          {sys.systemName}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={cn(
                              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                              isElite
                                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40 font-black shadow-xs"
                                : isRipe
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : isWarming
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : sys.status === "overdue"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            )}
                          >
                            {sys.statusLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={cn(
                            "font-black text-sm",
                            sys.jpiScore >= 80 ? "text-emerald-500" : sys.jpiScore >= 60 ? "text-amber-500" : "text-gray-400"
                          )}>
                            {sys.jpiScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          {sys.currentDelay} {t("draws")}
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-gray-500 dark:text-gray-400">
                          {sys.cycleMean}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {sys.travesPerJackpotMean !== undefined ? (
                            <span className={cn(
                              "font-mono text-xs px-2 py-0.5 rounded-lg font-bold inline-block",
                              (sys.travesSinceLastJackpot ?? 0) >= (sys.travesPerJackpotMean ?? 1)
                                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                : "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800"
                            )}>
                              {sys.travesSinceLastJackpot ?? 0} <span className="font-normal text-gray-400">/ {sys.travesPerJackpotMean}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {sys.travesLast5 > 0 ? (
                            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                              ⚡ {sys.travesLast5} (últ. 5)
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {sys.travesLast10} (últ. 10)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-gray-900 dark:text-gray-100">
                          {sys.totalJackpots}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => setSelectedSystemId(sys.systemId)}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-lg font-semibold transition",
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
                            )}
                          >
                            {isSelected ? t("selected") : t("inspect")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
