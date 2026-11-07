'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface PredictionItem {
  id: number;
  drawId: number;
  date: string;
  calculatedAt: string | null;
  drawNumbers: number[];
  predictedNumbers: number[];
  hits: number;
}

interface Props {
  predictions: PredictionItem[];
  game: string;
  systemName: string;
  accentColor: string;
  maxNumbers: number;
  halfPoint: number;
}

export default function SystemHistoryTable({
  predictions,
  game,
  systemName,
  accentColor,
  maxNumbers,
  halfPoint
}: Props) {
  return (
    <Card 
      className="glass-card overflow-hidden rounded-2xl" 
      style={{ 
        boxShadow: `-4px 0px 15px -3px color-mix(in srgb, ${accentColor} 40%, transparent)`, 
        borderLeft: `2px solid ${accentColor}` 
      }}
    >
      <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Histórico de Previsões</h2>
        <span className="text-xs sm:text-sm text-muted-foreground font-semibold px-2.5 py-1 rounded-lg bg-surface-1 border border-border">
          Últimos 50 Sorteios
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-1/50 text-muted-foreground uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Sorteio Real</th>
              <th className="p-4">Previsão (Top {halfPoint})</th>
              <th className="p-4 text-center">Acertos</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {predictions.slice(0, 50).map((pred) => {
              const predicted = pred.predictedNumbers;
              const actual = pred.drawNumbers;
              const isLive = pred.calculatedAt && (new Date(pred.calculatedAt).getTime() < new Date(pred.date).getTime());

              return (
                <tr key={pred.id} className="hover:bg-surface-2/30 transition-colors">
                  {/* Data e Selo */}
                  <td className="p-4 text-foreground font-semibold whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span>{new Date(pred.date).toLocaleDateString('pt-PT')}</span>
                      {isLive ? (
                        <span 
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                          title={`Previsão selada antes do sorteio em: ${new Date(pred.calculatedAt!).toLocaleString('pt-PT')}`}
                        >
                          🛡️ Live Selada
                        </span>
                      ) : (
                        <span 
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-surface-2 text-muted-foreground border border-border"
                          title="Simulação histórica / Backtest de calibração"
                        >
                          🏷️ Backtest
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Sorteio Real */}
                  <td className="p-4">
                    <div className={actual.length === 15 ? "grid grid-cols-5 gap-1 w-max" : "flex gap-1 flex-wrap max-w-xs sm:max-w-none"}>
                      {actual.map((n: number) => (
                        <span 
                          key={n} 
                          className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold shadow-xs border border-white/10" 
                          style={{ backgroundColor: accentColor }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Previsão com Corte */}
                  <td className="p-4">
                    {(() => {
                      const sugNumbers = predicted.slice(0, halfPoint);
                      const remNumbers = predicted.slice(halfPoint);
                      const sugHits = sugNumbers.filter((n: number) => actual.includes(n)).length;
                      const remHits = remNumbers.filter((n: number) => actual.includes(n)).length;

                      return (
                        <div className="flex items-center gap-2.5 w-fit">
                          {/* Grupo 1: Sugeridos (Top HalfPoint) */}
                          <div className="flex flex-col gap-1 p-1.5 rounded-xl bg-surface-2/50 border border-[var(--accent)]/35 shadow-xs">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: accentColor }}>
                                Sugeridos (Top {halfPoint})
                              </span>
                              <span className="text-[9px] font-bold text-muted-foreground">
                                {sugHits}/{actual.length}
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {sugNumbers.map((n: number, idx: number) => {
                                const isHit = actual.includes(n);
                                return (
                                  <span
                                    key={`sug-${idx}`}
                                    className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                                      isHit
                                        ? 'text-white border border-white/20 shadow-md font-black scale-105'
                                        : 'bg-card/90 border border-border text-foreground'
                                    }`}
                                    style={isHit ? { backgroundColor: accentColor, boxShadow: `0 0 10px color-mix(in srgb, ${accentColor} 60%, transparent)` } : {}}
                                    title={`Sugerido #${idx + 1}: ${n}${isHit ? ' (Acertou no Top ' + halfPoint + '!)' : ''}`}
                                  >
                                    {n}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Divisor Visual de Corte */}
                          <div className="flex flex-col items-center justify-center self-stretch px-0.5">
                            <div className="w-0.5 h-full bg-border border-l border-dashed border-border flex items-center justify-center relative min-h-[120px]">
                              <span className="absolute text-[8px] uppercase tracking-wider font-black text-muted-foreground/70 bg-card px-1 py-0.5 rounded border border-border rotate-90 whitespace-nowrap shadow-xs">
                                CORTE
                              </span>
                            </div>
                          </div>

                          {/* Grupo 2: Restantes Números do Pool */}
                          {remNumbers.length > 0 && (
                            <div className="flex flex-col gap-1 p-1.5 rounded-xl bg-surface-1/30 border border-border/60 opacity-80 hover:opacity-100 transition-opacity">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Restantes ({remNumbers.length})
                                </span>
                                {remHits > 0 && (
                                  <span className="text-[9px] font-medium text-muted-foreground">
                                    {remHits} fora
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-5 gap-1">
                                {remNumbers.map((n: number, idx: number) => {
                                  const isHit = actual.includes(n);
                                  return (
                                    <span
                                      key={`rem-${idx}`}
                                      className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-semibold ${
                                        isHit
                                          ? 'border-2 font-bold shadow-xs'
                                          : 'bg-card/50 border border-border/50 text-muted-foreground/70'
                                      }`}
                                      style={isHit ? {
                                        borderColor: accentColor,
                                        color: accentColor,
                                        backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`
                                      } : {}}
                                      title={`Restante #${halfPoint + idx + 1}: ${n}${isHit ? ' (Sorteado, mas fora do corte)' : ''}`}
                                    >
                                      {n}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Acertos */}
                  <td className="p-4 text-center">
                    <span 
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${
                        pred.hits === maxNumbers 
                          ? 'text-white border-0' 
                          : pred.hits === maxNumbers - 1 
                            ? 'border bg-transparent shadow-xs' 
                            : 'bg-transparent text-game-badge-low-text border border-game-badge-low-border'
                      }`}
                      style={
                        pred.hits === maxNumbers 
                          ? { backgroundColor: accentColor, boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 60%, transparent)` } 
                          : pred.hits === maxNumbers - 1 
                            ? { color: accentColor, borderColor: accentColor } 
                            : {}
                      }
                    >
                      {pred.hits}/{maxNumbers}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
