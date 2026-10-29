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
    remainingNumbers?: number[];
    hitNumbers: number[];
    actualNumbers?: number[];
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

interface GameLightTheme {
    accent: string;
    accentDark: string;
    accentSoftBg: string;
    accentSoftBorder: string;
    pageBg: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
}

const LIGHT_THEMES: Record<string, GameLightTheme> = {
    EUROMILLIONS: {
        accent: '#3B82F6',
        accentDark: '#1D4ED8',
        accentSoftBg: '#EFF6FF',
        accentSoftBorder: '#93C5FD',
        pageBg: 'linear-gradient(145deg, #F8FAFC 0%, #EFF6FF 100%)',
        badgeBg: '#DBEAFE',
        badgeText: '#1E40AF',
        glow: '0 0 14px rgba(59, 130, 246, 0.55)'
    },
    TOTOLOTO: {
        accent: '#22C55E',
        accentDark: '#15803D',
        accentSoftBg: '#F0FDF4',
        accentSoftBorder: '#86EFAC',
        pageBg: 'linear-gradient(145deg, #F8FAFC 0%, #F0FDF4 100%)',
        badgeBg: '#DCFCE7',
        badgeText: '#166534',
        glow: '0 0 14px rgba(34, 197, 94, 0.55)'
    },
    EURODREAMS: {
        accent: '#A855F7',
        accentDark: '#7E22CE',
        accentSoftBg: '#FAF5FF',
        accentSoftBorder: '#D8B4FE',
        pageBg: 'linear-gradient(145deg, #F8FAFC 0%, #FAF5FF 100%)',
        badgeBg: '#F3E8FF',
        badgeText: '#6B21A8',
        glow: '0 0 14px rgba(168, 85, 247, 0.55)'
    },
    MEGASENA: {
        accent: '#F59E0B',
        accentDark: '#B45309',
        accentSoftBg: '#FFFBEB',
        accentSoftBorder: '#FCD34D',
        pageBg: 'linear-gradient(145deg, #F8FAFC 0%, #FFFBEB 100%)',
        badgeBg: '#FEF3C7',
        badgeText: '#92400E',
        glow: '0 0 14px rgba(245, 158, 11, 0.55)'
    },
    LOTOFACIL: {
        accent: '#DB2777',
        accentDark: '#9D174D',
        accentSoftBg: '#FDF2F8',
        accentSoftBorder: '#F9A8D4',
        pageBg: 'linear-gradient(145deg, #F8FAFC 0%, #FDF2F8 100%)',
        badgeBg: '#FCE7F3',
        badgeText: '#9D174D',
        glow: '0 0 14px rgba(219, 39, 119, 0.55)'
    }
};

function getTheme(gameKey: string): GameLightTheme {
    return LIGHT_THEMES[gameKey.toUpperCase()] || LIGHT_THEMES.EUROMILLIONS;
}

export class FacebookCardGenerator {
    /**
     * Gera o cartão visual com os números e estrelas sorteadas em Modo Claro (Post Tipo A)
     */
    static async generateDrawCard(opts: CardDrawOptions): Promise<Buffer | null> {
        try {
            const theme = getTheme(opts.gameKey);
            const isLotofacil = opts.gameKey === 'LOTOFACIL' || opts.numbers.length > 8;

            const element = (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 36,
                    background: theme.pageBg,
                    color: '#0F172A',
                    fontFamily: 'sans-serif',
                }}>
                    {/* Header Limpo Sem Bola e Sem Repetição */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        border: `2px solid ${theme.accentSoftBorder}`,
                        borderRadius: 20,
                        padding: '16px 26px',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 24, fontWeight: 900, color: theme.accentDark, letterSpacing: -0.5 }}>
                                numerosmagicos.com
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                                Análises Estatísticas e Previsões 100% Grátis
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: theme.badgeBg,
                            border: `1.5px solid ${theme.accentSoftBorder}`,
                            color: theme.badgeText,
                            padding: '8px 22px',
                            borderRadius: 9999,
                            fontSize: 18,
                            fontWeight: 900
                        }}>
                            {opts.gameName}
                        </div>
                    </div>

                    {/* Cartão Central Branco com Chave Oficial */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#FFFFFF',
                        border: `2px solid ${theme.accentSoftBorder}`,
                        borderLeft: `8px solid ${theme.accent}`,
                        borderRadius: 28,
                        padding: isLotofacil ? '26px 32px' : '38px 36px',
                        boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)',
                        margin: 'auto 0',
                        gap: isLotofacil ? 18 : 22,
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                display: 'flex',
                                fontSize: 13,
                                fontWeight: 900,
                                letterSpacing: 1.5,
                                color: theme.accentDark,
                                background: theme.badgeBg,
                                padding: '4px 16px',
                                borderRadius: 9999
                            }}>
                                RESULTADO OFICIAL DO SORTEIO
                            </div>
                            <div style={{ display: 'flex', fontSize: 34, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>
                                {`Sorteio do ${opts.gameName}`}
                            </div>
                            <div style={{ display: 'flex', fontSize: 16, color: '#475569', fontWeight: 700 }}>
                                {`${opts.dateFormatted}${opts.sequenceNumber ? ` • Concurso ${opts.sequenceNumber}` : ''}`}
                            </div>
                        </div>

                        {opts.jackpotText && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: theme.accentSoftBg,
                                border: `1.5px solid ${theme.accentSoftBorder}`,
                                color: theme.accentDark,
                                padding: '8px 26px',
                                borderRadius: 9999,
                                fontSize: 19,
                                fontWeight: 900
                            }}>
                                {`💰 Prémio: ${opts.jackpotText}`}
                            </div>
                        )}

                        {/* Bolas Sorteadas (Grelha 3x5 para Lotofácil ou Linha para os restantes) */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: isLotofacil ? 12 : 14,
                            maxWidth: isLotofacil ? 400 : 700,
                            marginTop: 6
                        }}>
                            {opts.numbers.map((n, i) => (
                                <div key={i} style={{
                                    width: isLotofacil ? 62 : 66,
                                    height: isLotofacil ? 62 : 66,
                                    borderRadius: '50%',
                                    background: theme.accent,
                                    color: '#FFFFFF',
                                    fontSize: isLotofacil ? 24 : 26,
                                    fontWeight: 900,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: theme.glow,
                                    border: '2px solid #FFFFFF'
                                }}>
                                    <span>{n}</span>
                                </div>
                            ))}

                            {opts.stars && opts.stars.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <span style={{ fontSize: 30, fontWeight: 900, color: '#64748B', margin: '0 4px' }}>+</span>
                                    {opts.stars.map((s, i) => (
                                        <div key={i} style={{
                                            width: 66,
                                            height: 66,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                            color: '#FFFFFF',
                                            fontSize: 26,
                                            fontWeight: 900,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2.5px solid #FEF08A',
                                            boxShadow: '0 0 14px rgba(245, 158, 11, 0.55)'
                                        }}>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Publicitário + Aviso Legal Claro */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#FFFFFF',
                        border: `1.5px solid ${theme.accentSoftBorder}`,
                        borderRadius: 16,
                        padding: '12px 20px',
                        gap: 4
                    }}>
                        <span style={{ fontSize: 14, color: theme.accentDark, fontWeight: 900, textAlign: 'center' }}>
                            🌐 Consulte análises estatísticas e desdobramentos 100% grátis em https://numerosmagicos.com
                        </span>
                        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
                            ⚠️ Aviso Legal: Análise estatística informativa. Não dispensa a consulta oficial das entidades organizadoras.
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
     * Gera o cartão visual de Jackpot de NÚMEROS no estilo Light Mode do site (Sugeridos | CORTE | Restantes)
     */
    static async generateJackpotCard(opts: CardJackpotOptions): Promise<Buffer | null> {
        try {
            const theme = getTheme(opts.gameKey);
            const allPool = Array.from({ length: opts.totalPool }, (_, idx) => idx + 1);
            const remaining = opts.remainingNumbers && opts.remainingNumbers.length > 0
                ? opts.remainingNumbers
                : allPool.filter(n => !opts.suggestedNumbers.includes(n));
            const actualDraw = opts.actualNumbers && opts.actualNumbers.length > 0
                ? opts.actualNumbers
                : opts.hitNumbers;

            const isLotofacil = opts.gameKey === 'LOTOFACIL';
            const ballSize = opts.totalPool >= 60 ? 36 : 40;
            const fontSize = opts.totalPool >= 60 ? 14 : 15;

            const element = (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 32,
                    background: theme.pageBg,
                    color: '#0F172A',
                    fontFamily: 'sans-serif',
                }}>
                    {/* Header Limpo Sem Bola e Sem Repetição */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        border: `2px solid ${theme.accentSoftBorder}`,
                        borderRadius: 18,
                        padding: '14px 22px',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 22, fontWeight: 900, color: theme.accentDark, letterSpacing: -0.5 }}>
                                numerosmagicos.com
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                                Análises Estatísticas e Previsões 100% Grátis
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                background: theme.badgeBg,
                                border: `1.5px solid ${theme.accentSoftBorder}`,
                                color: theme.badgeText,
                                padding: '6px 16px',
                                borderRadius: 9999,
                                fontSize: 15,
                                fontWeight: 900
                            }}>
                                {opts.gameName}
                            </div>
                            <div style={{
                                background: theme.accent,
                                color: '#FFFFFF',
                                padding: '6px 18px',
                                borderRadius: 9999,
                                fontSize: 15,
                                fontWeight: 900,
                                boxShadow: theme.glow
                            }}>
                                {`${opts.actualHits}/${opts.targetHits} ACERTOS`}
                            </div>
                        </div>
                    </div>

                    {/* Cartão Principal estilo "Histórico de Previsões" Light Mode */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#FFFFFF',
                        border: `2px solid ${theme.accentSoftBorder}`,
                        borderLeft: `7px solid ${theme.accent}`,
                        borderRadius: 24,
                        padding: '22px 24px',
                        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.07)',
                        gap: 16,
                        margin: 'auto 0'
                    }}>
                        {/* Cabeçalho: Data + Sistema ... + Sorteio Real */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1.5px solid #F1F5F9',
                            paddingBottom: 14
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>
                                    {`📅 ${opts.dateFormatted}`}
                                </span>
                                <div style={{ display: 'flex', fontSize: 23, fontWeight: 900, color: '#0F172A' }}>
                                    {`Sistema ${opts.systemName}`}
                                </div>
                            </div>

                            {/* Bolas do Sorteio Real */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: 0.5 }}>
                                    SORTEIO REAL
                                </span>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 5,
                                    justifyContent: 'flex-end',
                                    maxWidth: isLotofacil ? 250 : 320
                                }}>
                                    {actualDraw.map((n, i) => (
                                        <div key={i} style={{
                                            width: isLotofacil ? 26 : 32,
                                            height: isLotofacil ? 26 : 32,
                                            borderRadius: '50%',
                                            background: theme.accent,
                                            color: '#FFFFFF',
                                            fontSize: isLotofacil ? 12 : 14,
                                            fontWeight: 900,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                                        }}>
                                            <span>{n}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Duas Caixas Lado a Lado: SUGERIDOS (TOP X) | CORTE | RESTANTES (Y) */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            padding: '4px 0'
                        }}>
                            {/* Caixa 1: Sugeridos (Top HalfPoint) */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                padding: 16,
                                borderRadius: 20,
                                background: theme.accentSoftBg,
                                border: `2px solid ${theme.accentSoftBorder}`,
                                width: 256,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                                    <span style={{ fontSize: 12, fontWeight: 900, color: theme.accentDark }}>
                                        {`SUGERIDOS (TOP ${opts.predCount})`}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 900, color: '#0F172A' }}>
                                        {`${opts.actualHits}/${opts.targetHits}`}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6,
                                    justifyContent: 'flex-start',
                                    width: 224
                                }}>
                                    {opts.suggestedNumbers.map((n, idx) => {
                                        const isHit = opts.hitNumbers.includes(n);
                                        return (
                                            <div key={idx} style={{
                                                width: ballSize,
                                                height: ballSize,
                                                borderRadius: '50%',
                                                fontSize,
                                                fontWeight: isHit ? 900 : 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: isHit ? theme.accent : '#FFFFFF',
                                                color: isHit ? '#FFFFFF' : '#1E293B',
                                                border: isHit ? `2px solid ${theme.accentDark}` : '1.5px solid #CBD5E1',
                                                boxShadow: isHit ? theme.glow : 'none'
                                            }}>
                                                <span>{n}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Divisor Vertical: CORTE */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 220,
                                width: 32,
                            }}>
                                <div style={{ width: 2, flex: 1, background: '#CBD5E1' }} />
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#FFFFFF',
                                    border: '1.5px solid #CBD5E1',
                                    color: '#64748B',
                                    fontSize: 9,
                                    fontWeight: 900,
                                    padding: '6px 5px',
                                    borderRadius: 6,
                                    lineHeight: 1.15
                                }}>
                                    <span>C</span>
                                    <span>O</span>
                                    <span>R</span>
                                    <span>T</span>
                                    <span>E</span>
                                </div>
                                <div style={{ width: 2, flex: 1, background: '#CBD5E1' }} />
                            </div>

                            {/* Caixa 2: Restantes (Fora do Corte) */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                padding: 16,
                                borderRadius: 20,
                                background: '#F8FAFC',
                                border: '1.5px solid #E2E8F0',
                                width: 256,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>
                                        {`RESTANTES (${remaining.length})`}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                                        0 fora
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6,
                                    justifyContent: 'flex-start',
                                    width: 224
                                }}>
                                    {remaining.map((n, idx) => (
                                        <div key={idx} style={{
                                            width: ballSize,
                                            height: ballSize,
                                            borderRadius: '50%',
                                            fontSize,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#FFFFFF',
                                            color: '#94A3B8',
                                            border: '1px solid #E2E8F0'
                                        }}>
                                            <span>{n}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Publicitário + Aviso Legal Claro */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#FFFFFF',
                        border: `1.5px solid ${theme.accentSoftBorder}`,
                        borderRadius: 16,
                        padding: '10px 18px',
                        gap: 3
                    }}>
                        <span style={{ fontSize: 13, color: theme.accentDark, fontWeight: 900, textAlign: 'center' }}>
                            🌐 Consulte análises estatísticas e previsões 100% grátis em https://numerosmagicos.com
                        </span>
                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
                            ⚠️ Aviso Legal: Análise estatística algorítmica. Não dispensa a conferência oficial no site das entidades organizadoras.
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
     * Gera o cartão visual de Jackpot de ESTRELAS / Nº DA SORTE / SONHO em Modo Claro (Post Tipo B)
     */
    static async generateStarJackpotCard(opts: CardStarJackpotOptions): Promise<Buffer | null> {
        try {
            const theme = getTheme(opts.gameKey);

            const element = (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 36,
                    background: theme.pageBg,
                    color: '#0F172A',
                    fontFamily: 'sans-serif',
                }}>
                    {/* Header Limpo Sem Bola e Sem Repetição */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        border: `2px solid ${theme.accentSoftBorder}`,
                        borderRadius: 20,
                        padding: '14px 24px',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 22, fontWeight: 900, color: theme.accentDark, letterSpacing: -0.5 }}>
                                numerosmagicos.com
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                                Análises Estatísticas e Previsões 100% Grátis
                            </span>
                        </div>
                        <div style={{
                            background: theme.badgeBg,
                            border: `1.5px solid ${theme.accentSoftBorder}`,
                            color: theme.badgeText,
                            padding: '6px 18px',
                            borderRadius: 9999,
                            fontSize: 16,
                            fontWeight: 900
                        }}>
                            {opts.gameName}
                        </div>
                    </div>

                    {/* Centro Claro */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        background: '#FFFFFF',
                        border: `2px solid ${theme.accentSoftBorder}`,
                        borderLeft: `8px solid ${theme.accent}`,
                        borderRadius: 28,
                        padding: '36px 32px',
                        boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)',
                        margin: 'auto 0',
                        gap: 20
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: theme.accent,
                            color: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 900,
                            padding: '6px 22px',
                            borderRadius: 9999,
                            letterSpacing: 1,
                            boxShadow: theme.glow
                        }}>
                            {`⭐ PLENO: ${opts.starLabel.toUpperCase()} (${opts.actualHits}/${opts.targetHits})`}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ display: 'flex', fontSize: 28, fontWeight: 900, color: '#0F172A' }}>
                                {`Sistema ${opts.systemName}`}
                            </div>
                            <div style={{ display: 'flex', fontSize: 15, fontWeight: 700, color: '#64748B' }}>
                                {`📅 ${opts.dateFormatted}`}
                            </div>
                        </div>

                        <div style={{
                            background: theme.accentSoftBg,
                            border: `2px solid ${theme.accentSoftBorder}`,
                            borderRadius: 22,
                            padding: 24,
                            width: 480,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1.5px solid #E2E8F0', paddingBottom: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 900, color: theme.accentDark }}>
                                    {`SUGERIDAS (TOP ${opts.suggestedStars.length})`}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 900, color: '#15803D', background: '#DCFCE7', border: '1px solid #86EFAC', padding: '3px 12px', borderRadius: 9999 }}>
                                    {`${opts.actualHits}/${opts.targetHits} ACERTADAS`}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', padding: '8px 0' }}>
                                {opts.suggestedStars.map((s, i) => {
                                    const isHit = opts.hitStars.includes(s);
                                    return (
                                        <div key={i} style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            fontSize: 26,
                                            fontWeight: 900,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isHit ? theme.accent : '#FFFFFF',
                                            color: isHit ? '#FFFFFF' : '#64748B',
                                            border: isHit ? `2.5px solid ${theme.accentDark}` : '1.5px solid #CBD5E1',
                                            boxShadow: isHit ? theme.glow : 'none',
                                        }}>
                                            <span>{s}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer Publicitário + Aviso Legal Claro */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#FFFFFF',
                        border: `1.5px solid ${theme.accentSoftBorder}`,
                        borderRadius: 16,
                        padding: '10px 18px',
                        gap: 3
                    }}>
                        <span style={{ fontSize: 13, color: theme.accentDark, fontWeight: 900, textAlign: 'center' }}>
                            🌐 Consulte análises estatísticas e previsões 100% grátis em https://numerosmagicos.com
                        </span>
                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
                            ⚠️ Aviso Legal: Análise estatística informativa. Não dispensa a confirmação oficial.
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
