import React from 'react';
import { ImageResponse } from 'next/og';

export interface CardDrawOptions {
    gameKey: string;
    gameName: string;
    dateFormatted: string;
    jackpotText?: string;
    sequenceNumber?: number;
    numbers: number[];
    stars: number[];
}

export interface CardJackpotOptions {
    gameKey: string;
    gameName: string;
    dateFormatted: string;
    systemName: string;
    predCount: number;
    totalPool: number;
    targetHits: number;
    actualHits: number;
    suggestedNumbers: number[];
    hitNumbers: number[];
}

export interface CardStarJackpotOptions {
    gameKey: string;
    gameName: string;
    dateFormatted: string;
    systemName: string;
    starLabel: string;
    targetHits: number;
    actualHits: number;
    suggestedStars: number[];
    hitStars: number[];
}

export class FacebookCardGenerator {
    /**
     * Gera o cartão visual com os números e estrelas sorteadas (Post Tipo A)
     */
    static async generateDrawCard(opts: CardDrawOptions): Promise<Buffer | null> {
        try {
            const isMega = opts.gameKey === 'MEGASENA';
            const isDreams = opts.gameKey === 'EURODREAMS';
            const bgGrad = isMega 
                ? 'radial-gradient(circle at 80% 20%, #14532d, #041208)'
                : isDreams 
                ? 'radial-gradient(circle at 80% 20%, #4338ca, #09091f)'
                : 'radial-gradient(circle at 80% 20%, #1e3a8a, #060913)';

            const element = (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 40,
                    background: bgGrad,
                    color: '#ffffff',
                    fontFamily: 'sans-serif',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                🔮
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 20, fontWeight: 900 }}>Números Mágicos</span>
                                    <span style={{ background: '#1877F2', color: '#fff', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                                        f Facebook
                                    </span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8' }}>numerosmagicos.com</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: 9999, fontSize: 16, fontWeight: 800 }}>
                            {opts.gameName}
                        </div>
                    </div>

                    {/* Centro: Título e Bolas Sorteadas */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: 'auto 0', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ display: 'flex', fontSize: 32, fontWeight: 900 }}>
                                {`Sorteio do ${opts.gameName}`}
                            </div>
                            <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8', fontWeight: 600 }}>
                                {`${opts.dateFormatted}${opts.sequenceNumber ? ` - Concurso ${opts.sequenceNumber}` : ''}`}
                            </div>
                        </div>

                        {opts.jackpotText && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#fde047', padding: '10px 28px', borderRadius: 9999, fontSize: 20, fontWeight: 900 }}>
                                {`💰 Prémio: ${opts.jackpotText}`}
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 10 }}>
                            {opts.numbers.map((n, i) => (
                                <div key={i} style={{ width: 62, height: 62, borderRadius: '50%', background: '#ffffff', color: '#0f172a', fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                                    <span>{n}</span>
                                </div>
                            ))}

                            {opts.stars && opts.stars.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <span style={{ fontSize: 28, fontWeight: 900, color: '#94a3b8', margin: '0 4px' }}>+</span>
                                    {opts.stars.map((s, i) => (
                                        <div key={i} style={{ width: 62, height: 62, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#000000', fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fef08a', boxShadow: '0 8px 16px rgba(245,158,11,0.5)' }}>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Legal */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
                            {`⚠️ Aviso Legal: Análise estatística informativa. Não dispensa a consulta oficial das entidades organizadoras.`}
                        </span>
                    </div>
                </div>
            );

            const res = new ImageResponse(element, { width: 800, height: 800 });
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            console.error('[FacebookCardGenerator] Erro ao gerar DrawCard:', error);
            return null;
        }
    }

    /**
     * Gera o cartão visual de comemoração de Jackpot de NÚMEROS (Post Tipo B)
     */
    static async generateJackpotCard(opts: CardJackpotOptions): Promise<Buffer | null> {
        try {
            const isMega = opts.gameKey === 'MEGASENA';
            const bgGrad = isMega 
                ? 'radial-gradient(circle at 50% 0%, #15803d, #04140b)' 
                : 'radial-gradient(circle at 50% 0%, #1e3a8a, #070e1e)';

            const element = (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 35,
                    background: bgGrad,
                    color: '#ffffff',
                    fontFamily: 'sans-serif',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                                🔮
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 19, fontWeight: 900 }}>Números Mágicos</span>
                                    <span style={{ background: '#1877F2', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                                        f Facebook
                                    </span>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>numerosmagicos.com</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 9999, fontSize: 15, fontWeight: 800 }}>
                            {opts.gameName}
                        </div>
                    </div>

                    {/* Centro: Destaque do Sistema e Acertos */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: 'auto 0', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f59e0b', color: '#000000', fontSize: 15, fontWeight: 900, padding: '6px 20px', borderRadius: 9999, letterSpacing: 1 }}>
                            🏆 JACKPOT TOTAL 100%
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <div style={{ display: 'flex', fontSize: 26, fontWeight: 900 }}>
                                {`Sistema: ${opts.systemName}`}
                            </div>
                            <div style={{ display: 'flex', fontSize: 15, fontWeight: 700, color: '#4ade80' }}>
                                {`${opts.dateFormatted} • Acertou ${opts.targetHits} dezenas no Top ${opts.predCount} sugerido!`}
                            </div>
                        </div>

                        {/* Grelha dos Números Sugeridos */}
                        <div style={{
                            background: '#ffffff',
                            color: '#1e293b',
                            borderRadius: 20,
                            padding: 20,
                            width: 540,
                            boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                            border: '3px solid #bfdbfe',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: 8 }}>
                                <span style={{ fontSize: 14, fontWeight: 900, color: '#d97706' }}>
                                    {`SUGERIDOS (TOP ${opts.predCount})`}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 900, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', padding: '3px 12px', borderRadius: 9999 }}>
                                    {`${opts.actualHits}/${opts.targetHits} ACERTADOS`}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                {opts.suggestedNumbers.map((n, i) => {
                                    const isHit = opts.hitNumbers.includes(n);
                                    return (
                                        <div key={i} style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: '50%',
                                            fontSize: 16,
                                            fontWeight: isHit ? 900 : 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isHit ? '#f59e0b' : '#ffffff',
                                            color: isHit ? '#000000' : '#475569',
                                            border: isHit ? '2px solid #b45309' : '1.5px solid #cbd5e1',
                                            boxShadow: isHit ? '0 0 12px rgba(245,158,11,0.8)' : 'none',
                                        }}>
                                            <span>{n}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#64748b', fontWeight: 700 }}>
                                <span>Chave sorteada:</span>
                                <span style={{ color: '#15803d', fontWeight: 900 }}>{opts.hitNumbers.join(' • ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Legal */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
                            {`⚠️ Aviso Legal: Análise estatística algorítmica. Não dispensa a conferência oficial no site das entidades organizadoras.`}
                        </span>
                    </div>
                </div>
            );

            const res = new ImageResponse(element, { width: 800, height: 800 });
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            console.error('[FacebookCardGenerator] Erro ao gerar JackpotCard:', error);
            return null;
        }
    }

    /**
     * Gera o cartão visual de comemoração de Jackpot de ESTRELAS ou SONHO (Post Tipo B)
     */
    static async generateStarJackpotCard(opts: CardStarJackpotOptions): Promise<Buffer | null> {
        try {
            const element = (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 35,
                    background: 'radial-gradient(circle at 50% 10%, #854d0e, #0e0a1f)',
                    color: '#ffffff',
                    fontFamily: 'sans-serif',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                                🔮
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 19, fontWeight: 900 }}>Números Mágicos</span>
                                    <span style={{ background: '#1877F2', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                                        f Facebook
                                    </span>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>numerosmagicos.com</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.4)', color: '#fde047', padding: '6px 16px', borderRadius: 9999, fontSize: 15, fontWeight: 800 }}>
                            {opts.gameName}
                        </div>
                    </div>

                    {/* Centro: Destaque das Estrelas */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: 'auto 0', gap: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eab308', color: '#000000', fontSize: 15, fontWeight: 900, padding: '6px 22px', borderRadius: 9999, letterSpacing: 1 }}>
                            {`⭐ JACKPOT DAS ${opts.starLabel.toUpperCase()}`}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ display: 'flex', fontSize: 28, fontWeight: 900 }}>
                                {`Sistema: ${opts.systemName}`}
                            </div>
                            <div style={{ display: 'flex', fontSize: 16, fontWeight: 700, color: '#fde047' }}>
                                {`${opts.dateFormatted} • Acertou as ${opts.targetHits} ${opts.starLabel} sugeridas!`}
                            </div>
                        </div>

                        {/* Cartão Branco com as Estrelas */}
                        <div style={{
                            background: '#ffffff',
                            color: '#1e293b',
                            borderRadius: 22,
                            padding: 24,
                            width: 500,
                            boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                            border: '3px solid #fef08a',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '2px solid #f1f5f9', paddingBottom: 10 }}>
                                <span style={{ fontSize: 14, fontWeight: 900, color: '#d97706' }}>
                                    {`${opts.starLabel.toUpperCase()} SUGERIDAS (TOP ${opts.suggestedStars.length})`}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 900, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', padding: '3px 12px', borderRadius: 9999 }}>
                                    {`${opts.actualHits}/${opts.targetHits} ACERTADAS`}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
                                {opts.suggestedStars.map((s, i) => {
                                    const isHit = opts.hitStars.includes(s);
                                    return (
                                        <div key={i} style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            fontSize: 24,
                                            fontWeight: 900,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isHit ? 'linear-gradient(135deg, #fbbf24, #d97706)' : '#ffffff',
                                            color: isHit ? '#000000' : '#64748b',
                                            border: isHit ? '2px solid #fef08a' : '1.5px solid #cbd5e1',
                                            boxShadow: isHit ? '0 0 16px rgba(245,158,11,0.9)' : 'none',
                                        }}>
                                            <span>{s}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#64748b', fontWeight: 700 }}>
                                <span>Chave sorteada continha:</span>
                                <span style={{ color: '#b45309', fontWeight: 900 }}>{opts.hitStars.join(' e ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Legal */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
                            {`⚠️ Aviso Legal: Esta publicação tem fins meramente informativos e estatísticos. Não dispensa a confirmação da chave sorteada no site oficial da entidade organizadora.`}
                        </span>
                    </div>
                </div>
            );

            const res = new ImageResponse(element, { width: 800, height: 800 });
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            console.error('[FacebookCardGenerator] Erro ao gerar StarJackpotCard:', error);
            return null;
        }
    }
}
