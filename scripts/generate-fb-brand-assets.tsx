import React from 'react';
import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:/Users/paulo/.gemini/antigravity/brain/db6a1c11-78c9-4628-9050-c4deb03da8b1';

const GAMES = [
    {
        name: 'Euromilhões',
        region: '🇵🇹 / 🇪🇺 Europa',
        format: '50 Números + 12 Estrelas',
        cut: 'Top 25 Números • Top 4 Estrelas',
        accent: '#2563EB',
        softBg: '#EFF6FF',
        border: '#93C5FD',
        badgeBg: '#DBEAFE',
        sampleBalls: [7, 14, 23, 38, 42],
        sampleStar: '⭐ 9'
    },
    {
        name: 'Totoloto',
        region: '🇵🇹 Portugal',
        format: '49 Números + 13 Sorte',
        cut: 'Top 25 Números • Top 2 Nº Sorte',
        accent: '#16A34A',
        softBg: '#F0FDF4',
        border: '#86EFAC',
        badgeBg: '#DCFCE7',
        sampleBalls: [3, 14, 24, 27, 41],
        sampleStar: '🍀 7'
    },
    {
        name: 'EuroDreams',
        region: '🇵🇹 / 🇪🇺 Europa',
        format: '40 Números + 5 Sonhos',
        cut: 'Top 20 Números • Top 2 Sonhos',
        accent: '#9333EA',
        softBg: '#FAF5FF',
        border: '#D8B4FE',
        badgeBg: '#F3E8FF',
        sampleBalls: [5, 11, 18, 26, 33],
        sampleStar: '💤 3'
    },
    {
        name: 'Mega-Sena',
        region: '🇧🇷 Brasil',
        format: '60 Dezenas Oficiais',
        cut: 'Top 30 Dezenas (Corte 50%)',
        accent: '#D97706',
        softBg: '#FFFBEB',
        border: '#FCD34D',
        badgeBg: '#FEF3C7',
        sampleBalls: [4, 17, 28, 39, 52],
        sampleStar: '6 Dezenas'
    },
    {
        name: 'Lotofácil',
        region: '🇧🇷 Brasil (NOVO)',
        format: '25 Dezenas (15 Sorteadas)',
        cut: 'Top 20 Dezenas + Desdobramentos',
        accent: '#DB2777',
        softBg: '#FDF2F8',
        border: '#F9A8D4',
        badgeBg: '#FCE7F3',
        sampleBalls: [1, 5, 10, 14, 22],
        sampleStar: '15 Pontos',
        isNew: true
    }
];

async function generateCoverLight() {
    const width = 1640;
    const height = 924;

    const el = (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '44px 56px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 35%, #F0FDF4 68%, #FDF2F8 100%)',
            fontFamily: 'sans-serif',
            color: '#0F172A',
            position: 'relative',
        }}>
            {/* Top Bar: Brand + Value Props */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: 28,
                padding: '22px 32px',
                boxShadow: '0 14px 36px rgba(15, 23, 42, 0.06)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 830 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: 48, fontWeight: 900, color: '#0F172A', letterSpacing: -1.5 }}>
                            numeros
                        </span>
                        <span style={{ fontSize: 48, fontWeight: 900, color: '#2563EB', letterSpacing: -1.5, marginLeft: -12 }}>
                            magicos.com
                        </span>
                        <div style={{
                            display: 'flex',
                            background: '#DCFCE7',
                            border: '2px solid #86EFAC',
                            color: '#15803D',
                            fontSize: 16,
                            fontWeight: 900,
                            padding: '6px 16px',
                            borderRadius: 9999,
                            marginLeft: 8
                        }}>
                            100% GRÁTIS
                        </div>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#475569' }}>
                        Plataforma de Análise Estatística, Inteligência Artificial e Previsões para Loterias
                    </span>
                </div>

                {/* Pilares do Site */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: '#EFF6FF',
                        border: '1.5px solid #BFDBFE',
                        borderRadius: 18,
                        padding: '10px 18px'
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#1D4ED8' }}>+20 Sistemas</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Matemáticos & Redes IA</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: '#F0FDF4',
                        border: '1.5px solid #BBF7D0',
                        borderRadius: 18,
                        padding: '10px 18px'
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#15803D' }}>100% Auditável</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Histórico Real de Acertos</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: '#FDF2F8',
                        border: '1.5px solid #FBCFE8',
                        borderRadius: 18,
                        padding: '10px 18px'
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#BE185D' }}>5 Loterias</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Portugal • Europa • Brasil</span>
                    </div>
                </div>
            </div>

            {/* Secção Central: Os 5 Cartões dos Jogos com o Estilo Oficial do Site */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                margin: 'auto 0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                            fontSize: 16,
                            fontWeight: 900,
                            letterSpacing: 1.5,
                            color: '#1E293B',
                            background: '#E2E8F0',
                            padding: '6px 18px',
                            borderRadius: 9999
                        }}>
                            JOGOS DISPONÍVEIS NO SITE (MODO CLARO OFICIAL)
                        </span>
                        <span style={{ fontSize: 17, fontWeight: 700, color: '#475569' }}>
                            Cada jogo com Rankings em Tempo Real, Desdobramentos, Estatísticas Pós-Extremos e Simulador
                        </span>
                    </div>
                </div>

                {/* Grelha dos 5 Jogos Lado a Lado */}
                <div style={{
                    display: 'flex',
                    gap: 18,
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    {GAMES.map((g, i) => (
                        <div key={i} style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: '#FFFFFF',
                            border: `2.5px solid ${g.border}`,
                            borderTop: `10px solid ${g.accent}`,
                            borderRadius: 24,
                            padding: '22px 20px',
                            boxShadow: '0 14px 32px rgba(15, 23, 42, 0.06)',
                            gap: 16,
                            position: 'relative'
                        }}>
                            {/* Topo do Cartão do Jogo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 900,
                                        color: g.accent,
                                        background: g.badgeBg,
                                        padding: '4px 12px',
                                        borderRadius: 9999
                                    }}>
                                        {g.region}
                                    </span>
                                    {g.isNew && (
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 900,
                                            color: '#FFFFFF',
                                            background: '#DB2777',
                                            padding: '4px 10px',
                                            borderRadius: 9999
                                        }}>
                                            ✨ NOVO
                                        </span>
                                    )}
                                </div>

                                <span style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>
                                    {g.name}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}>
                                    {g.format}
                                </span>
                            </div>

                            {/* Mini Caixa de Sugeridos Estilo Site */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                background: g.softBg,
                                border: `1.5px solid ${g.border}`,
                                borderRadius: 16,
                                padding: '14px 12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: g.accent }}>
                                        SUGERIDOS | CORTE
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: '#0F172A' }}>
                                        {g.sampleStar}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                                    {g.sampleBalls.map((n, bIdx) => {
                                        const hit = bIdx === 1 || bIdx === 3 || bIdx === 4;
                                        return (
                                            <div key={bIdx} style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: hit ? g.accent : '#FFFFFF',
                                                color: hit ? '#FFFFFF' : '#1E293B',
                                                border: hit ? `2px solid ${g.accent}` : '1.5px solid #CBD5E1',
                                                fontSize: 15,
                                                fontWeight: 900,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: hit ? '0 3px 10px rgba(0,0,0,0.14)' : 'none'
                                            }}>
                                                <span>{n}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <span style={{ fontSize: 12, fontWeight: 800, color: '#334155', textAlign: 'center' }}>
                                    {g.cut}
                                </span>
                            </div>

                            {/* Features do Jogo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1.5px solid #F1F5F9', paddingTop: 10 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                                    ✅ Ranking de Sistemas & Acertos
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                                    ✅ Previsão Guardada Antes do Sorteio
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Barra de Funcionalidades + Rodapé Legal */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: 22,
                padding: '18px 34px',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
                        🔥 Destaques:
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#334155' }}>
                        • Separação das Águas & Tiro Certeiro
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#334155' }}>
                        • Diagonais da Matriz & Pirâmide de Pascal
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#334155' }}>
                        • Monte Carlo, Markov & SuperSistema Neuronal
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: '#2563EB' }}>
                        🌐 Aceda grátis em https://numerosmagicos.com
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                        ⚠️ Plataforma puramente estatística e informativa. Jogue com responsabilidade.
                    </span>
                </div>
            </div>
        </div>
    );

    const res = new ImageResponse(el, { width, height });
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT_DIR, 'fb_capa_5_jogos_claro.png'), buf);
    fs.writeFileSync(path.join(process.cwd(), 'public', 'fb-cover-5-games.png'), buf);
    console.log('✅ Capa 1640x924 gerada!');
}

async function generatePromoPostSquare() {
    const width = 1080;
    const height = 1080;

    const el = (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 42,
            background: 'linear-gradient(145deg, #F8FAFC 0%, #EFF6FF 40%, #FDF2F8 100%)',
            fontFamily: 'sans-serif',
            color: '#0F172A',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '2px solid #CBD5E1',
                borderRadius: 24,
                padding: '22px 30px',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 38, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>
                            numerosmagicos.com
                        </span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#475569' }}>
                        Análises Estatísticas, Inteligência Artificial e Previsões para Loterias
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: 9999,
                    fontSize: 18,
                    fontWeight: 900,
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
                }}>
                    100% GRÁTIS
                </div>
            </div>

            {/* O Que é o Site */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: 24,
                padding: '22px 28px',
                gap: 12,
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                        🚀 O que encontra em numerosmagicos.com?
                    </span>
                    <span style={{
                        fontSize: 13,
                        fontWeight: 900,
                        background: '#FCE7F3',
                        color: '#9D174D',
                        border: '1.5px solid #F9A8D4',
                        padding: '4px 14px',
                        borderRadius: 9999
                    }}>
                        ✨ AGORA COM LOTOFÁCIL!
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '12px 16px', gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#1D4ED8' }}>📊 +20 Sistemas Ativos</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Diagonais da Matriz, Separação das Águas, Tiro Certeiro, Markov e Redes Neuronais.</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '12px 16px', gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#15803D' }}>🔒 Histórico 100% Real</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Todas as previsões são geradas antes de cada sorteio e avaliadas com transparência total.</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '12px 16px', gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#9333EA' }}>🎯 Vista de Corte Oficial</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Números Sugeridos vs. Restantes e gerador automático de desdobramentos.</span>
                    </div>
                </div>
            </div>

            {/* Os 5 Jogos (2 em cima + 3 em baixo) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                    {GAMES.slice(0, 2).map((g, i) => (
                        <div key={i} style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#FFFFFF',
                            border: `2px solid ${g.border}`,
                            borderLeft: `8px solid ${g.accent}`,
                            borderRadius: 20,
                            padding: '18px 22px',
                            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.05)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: g.accent }}>{g.region}</span>
                                <span style={{ fontSize: 24, fontWeight: 900, color: '#0F172A' }}>{g.name}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{g.cut}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, background: g.softBg, padding: '10px 12px', borderRadius: 14, border: `1.5px solid ${g.border}` }}>
                                {g.sampleBalls.slice(0, 4).map((n, idx) => (
                                    <div key={idx} style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: idx % 2 === 1 ? g.accent : '#FFFFFF',
                                        color: idx % 2 === 1 ? '#FFFFFF' : '#0F172A',
                                        border: `1.5px solid ${g.accent}`,
                                        fontSize: 14,
                                        fontWeight: 900,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span>{n}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                    {GAMES.slice(2, 5).map((g, i) => (
                        <div key={i} style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: '#FFFFFF',
                            border: `2px solid ${g.border}`,
                            borderLeft: `8px solid ${g.accent}`,
                            borderRadius: 20,
                            padding: '16px 18px',
                            gap: 10,
                            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 900, color: g.accent }}>{g.region}</span>
                                {g.isNew && (
                                    <span style={{ fontSize: 10, fontWeight: 900, background: '#DB2777', color: '#FFFFFF', padding: '3px 8px', borderRadius: 9999 }}>
                                        NOVO JOGO
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: 22, fontWeight: 900, color: '#0F172A' }}>{g.name}</span>
                            <div style={{ display: 'flex', gap: 6, background: g.softBg, padding: '8px 10px', borderRadius: 12, border: `1.5px solid ${g.border}`, justifyContent: 'center' }}>
                                {g.sampleBalls.map((n, idx) => (
                                    <div key={idx} style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: idx % 2 === 0 ? g.accent : '#FFFFFF',
                                        color: idx % 2 === 0 ? '#FFFFFF' : '#0F172A',
                                        border: `1.5px solid ${g.accent}`,
                                        fontSize: 13,
                                        fontWeight: 900,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span>{n}</span>
                                    </div>
                                ))}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{g.cut}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                border: '2px solid #CBD5E1',
                borderRadius: 18,
                padding: '14px 24px',
                gap: 4
            }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#1D4ED8' }}>
                    🌐 Consulte já todas as análises e previsões 100% grátis em https://numerosmagicos.com
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                    ⚠️ Aviso Legal: Plataforma de análise estatística informativa. Não dispensa a consulta oficial das entidades organizadoras.
                </span>
            </div>
        </div>
    );

    const res = new ImageResponse(el, { width, height });
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT_DIR, 'fb_post_apresentacao_5_jogos.png'), buf);
    fs.writeFileSync(path.join(process.cwd(), 'public', 'fb-post-5-games.png'), buf);
    console.log('✅ Post Quadrado 1080x1080 gerado!');
}

async function generateCoverDarkTech() {
    const width = 1640;
    const height = 924;

    const el = (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '44px 56px',
            background: 'linear-gradient(135deg, #060D1E 0%, #0F172A 45%, #1E1B4B 100%)',
            fontFamily: 'sans-serif',
            color: '#FFFFFF',
            position: 'relative',
        }}>
            {/* Top Bar Dark */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '2px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 28,
                padding: '22px 32px',
                boxShadow: '0 14px 40px rgba(0, 0, 0, 0.45)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 830 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: 48, fontWeight: 900, color: '#38BDF8', letterSpacing: -1.5 }}>
                            numeros
                        </span>
                        <span style={{ fontSize: 48, fontWeight: 900, color: '#FFFFFF', letterSpacing: -1.5, marginLeft: -12 }}>
                            magicos.com
                        </span>
                        <div style={{
                            display: 'flex',
                            background: 'rgba(34, 197, 94, 0.2)',
                            border: '2px solid #22C55E',
                            color: '#4ADE80',
                            fontSize: 16,
                            fontWeight: 900,
                            padding: '6px 16px',
                            borderRadius: 9999,
                            marginLeft: 8
                        }}>
                            100% GRÁTIS
                        </div>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#CBD5E1' }}>
                        Análise Estatística Avançada, Inteligência Artificial e Previsões para Loterias
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1.5px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: 18,
                        padding: '10px 18px'
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#60A5FA' }}>+20 Sistemas</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>Matemáticos & Redes IA</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1.5px solid rgba(34, 197, 94, 0.5)',
                        borderRadius: 18,
                        padding: '10px 18px'
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#4ADE80' }}>100% Auditável</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>Histórico Real de Acertos</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1.5px solid rgba(236, 72, 153, 0.5)',
                        borderRadius: 18,
                        padding: '10px 18px'
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#F472B6' }}>5 Loterias</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>Portugal • Europa • Brasil</span>
                    </div>
                </div>
            </div>

            {/* 5 Jogos Suportados */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, margin: 'auto 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 120, height: 2, background: 'rgba(56, 189, 248, 0.4)' }} />
                    <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2, color: '#38BDF8' }}>
                        5 JOGOS SUPORTADOS COM PREVISÕES E RANKINGS EM TEMPO REAL
                    </span>
                    <div style={{ width: 120, height: 2, background: 'rgba(56, 189, 248, 0.4)' }} />
                </div>

                <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'space-between' }}>
                    {GAMES.map((g, i) => (
                        <div key={i} style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: 'rgba(15, 23, 42, 0.88)',
                            border: `2px solid ${g.accent}`,
                            borderTop: `10px solid ${g.accent}`,
                            borderRadius: 24,
                            padding: '22px 20px',
                            boxShadow: '0 14px 32px rgba(0, 0, 0, 0.4)',
                            gap: 16
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 900,
                                        color: '#0F172A',
                                        background: g.border,
                                        padding: '4px 12px',
                                        borderRadius: 9999
                                    }}>
                                        {g.region}
                                    </span>
                                    {g.isNew && (
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 900,
                                            color: '#FFFFFF',
                                            background: '#DB2777',
                                            padding: '4px 10px',
                                            borderRadius: 9999
                                        }}>
                                            ✨ NOVO
                                        </span>
                                    )}
                                </div>
                                <span style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', marginTop: 2 }}>
                                    {g.name}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8' }}>
                                    {g.format}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                background: '#FFFFFF',
                                border: `2px solid ${g.border}`,
                                borderRadius: 16,
                                padding: '14px 12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: g.accent }}>
                                        SUGERIDOS | CORTE
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: '#0F172A' }}>
                                        {g.sampleStar}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                                    {g.sampleBalls.map((n, bIdx) => {
                                        const hit = bIdx === 1 || bIdx === 3 || bIdx === 4;
                                        return (
                                            <div key={bIdx} style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: hit ? g.accent : '#F8FAFC',
                                                color: hit ? '#FFFFFF' : '#1E293B',
                                                border: hit ? `2px solid ${g.accent}` : '1.5px solid #CBD5E1',
                                                fontSize: 15,
                                                fontWeight: 900,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <span>{n}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#334155', textAlign: 'center' }}>
                                    {g.cut}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid rgba(148,163,184,0.2)', paddingTop: 10 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>
                                    ✅ Ranking de Sistemas & Acertos
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>
                                    ✅ Previsão Guardada Antes do Sorteio
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Dark */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 22,
                padding: '18px 34px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#38BDF8' }}>
                        🔥 Sistemas:
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>
                        • Separação das Águas & Tiro Certeiro
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>
                        • Diagonais da Matriz & Pirâmide de Pascal
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>
                        • Monte Carlo, Markov & SuperSistema Neuronal
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: '#38BDF8' }}>
                        🌐 Aceda grátis em https://numerosmagicos.com
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                        ⚠️ Análise puramente estatística. Jogue com responsabilidade.
                    </span>
                </div>
            </div>
        </div>
    );

    const res = new ImageResponse(el, { width, height });
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT_DIR, 'fb_capa_5_jogos_escura.png'), buf);
    console.log('✅ Capa Escura Tech 1640x924 gerada!');
}

async function run() {
    await generateCoverLight();
    await generateCoverDarkTech();
    await generatePromoPostSquare();
}

run().catch(console.error);
