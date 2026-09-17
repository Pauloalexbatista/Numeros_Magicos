"use client";

import { useState, useEffect, useMemo } from "react";
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
  Search
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
  jpiScore: number;
  status: "ripe" | "warming" | "green" | "overdue";
  statusLabel: string;
  timelineEvents: TimelineEvent[];
}

interface RadarApiResponse {
  game: string;
  totalDraws: number;
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
  { id: "MEGASENA", label: "Mega-Sena", flag: "🇧🇷" }
];

export default function RadarSystems() {
  const t = useTranslations("Tools.Radar");
  const searchParams = useSearchParams();
  const initialGame = searchParams.get("game")?.toUpperCase() || "EUROMILLIONS";

  const [activeGame, setActiveGame] = useState<string>(
    GAMES.some(g => g.id === initialGame) ? initialGame : "EUROMILLIONS"
  );
  const [data, setData] = useState<RadarApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timelineRange, setTimelineRange] = useState<"all" | "modern" | "recent">("all");
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRadarData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tools/radar?game=${activeGame}`);
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
  }, [activeGame]);

  const systems = data?.systems || [];
  const totalDraws = data?.totalDraws || 1;

  const filteredSystems = useMemo(() => {
    if (statusFilter === "all") return systems;
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
                onClick={() => setActiveGame(g.id)}
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
          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3">
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
                const isRipe = sys.status === "ripe";
                const isWarming = sys.status === "warming";

                return (
                  <div
                    key={sys.systemId}
                    onClick={() => setSelectedSystemId(sys.systemId)}
                    className={cn(
                      "cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between shadow-sm",
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900 shadow-md scale-[1.01]"
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
                              isRipe
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("timeline_subtitle", {
                      jackpots: selectedSystem.totalJackpots,
                      traves: selectedSystem.totalTraves,
                      mean: selectedSystem.cycleMean
                    })}
                  </p>
                </div>

                {/* Botões de Filtro Temporal Dinâmicos */}
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

              {/* Barra da Linha Temporal */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 pb-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 inline-block"></span>
                      <strong className="text-gray-700 dark:text-gray-200">Jackpot ({data.baseline.maxHits}/{data.baseline.maxHits})</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block"></span>
                      <span>{t("trave_hit")} ({data.baseline.maxHits - 1}/{data.baseline.maxHits})</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-500 rotate-45 inline-block"></span>
                      <span>{t("current_position")}</span>
                    </span>
                  </div>

                  <span className="text-[11px] font-mono">
                    {t("showing_draws")}: {timelineStart} - {timelineEnd}
                  </span>
                </div>

                {/* Visual Track */}
                <div className="relative w-full h-16 bg-slate-900 dark:bg-slate-950 rounded-xl border border-gray-300 dark:border-slate-800 flex items-center overflow-hidden px-2 shadow-inner">
                  <div className="absolute left-0 right-0 h-0.5 bg-slate-750"></div>

                  {visibleTimelineEvents.map((ev, idx) => {
                    const range = Math.max(1, timelineEnd - timelineStart);
                    const pct = ((ev.drawId - timelineStart) / range) * 100;
                    if (pct < 0 || pct > 100) return null;

                    const isJackpot = ev.type === "jackpot";

                    return (
                      <div
                        key={`${ev.drawId}-${ev.type}-${idx}`}
                        onMouseEnter={() => setHoveredEvent(ev)}
                        onMouseLeave={() => setHoveredEvent(null)}
                        style={{ left: `${pct}%` }}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform cursor-pointer",
                          isJackpot
                            ? "w-3.5 h-3.5 rounded-full bg-emerald-500 hover:scale-150 z-20 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                            : "w-2 h-2 rounded-full bg-amber-400/60 hover:scale-125 z-10"
                        )}
                      />
                    );
                  })}

                  <div
                    style={{ left: "100%" }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-full w-3.5 h-3.5 bg-blue-500 rotate-45 z-30 shadow-[0_0_10px_rgba(59,130,246,0.9)]"
                    title={`${t("current_draw")}: ${timelineEnd}`}
                  />
                </div>

                {/* Tooltip / Info Box */}
                <div className="min-h-[42px] p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60 text-xs flex items-center justify-between">
                  {hoveredEvent ? (
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "font-bold",
                        hoveredEvent.type === "jackpot" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                      )}>
                        {hoveredEvent.type === "jackpot" ? `🎉 Jackpot (${data.baseline.maxHits}/${data.baseline.maxHits})` : `⚡ Bola na Trave (${data.baseline.maxHits - 1}/${data.baseline.maxHits})`}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {t("draw_number")} <strong>{hoveredEvent.drawId}</strong> ({hoveredEvent.date})
                      </span>
                      {hoveredEvent.interval !== undefined && hoveredEvent.interval > 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          • {t("interval_from_last")}: <strong>{hoveredEvent.interval} {t("draws")}</strong>
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      💡 {t("hover_hint")}
                    </span>
                  )}

                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {t("system_status")}: <strong className="text-indigo-600 dark:text-indigo-400">{selectedSystem.statusLabel}</strong>
                  </div>
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
                    <th className="pb-3 px-3 text-center">{t("table_recent_traves")}</th>
                    <th className="pb-3 px-3 text-right">{t("table_total_jackpots")}</th>
                    <th className="pb-3 px-3 text-center">{t("table_action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {filteredSystems.map(sys => {
                    const isSelected = selectedSystem?.systemId === sys.systemId;
                    const isRipe = sys.status === "ripe";
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
                              isRipe
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
