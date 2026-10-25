import Link from 'next/link';
import { Waves, FlaskConical, Compass, Sparkles, Activity, Shield, ArrowLeft, Wrench, ExternalLink } from 'lucide-react';
import UnifiedCard from '@/components/ui/UnifiedCard';

export const metadata = {
    title: 'Backoffice & Laboratório Experimental | Números Mágicos',
    description: 'Ferramentas em análise interna e validação algorítmica'
};

export default function AdminPage() {
    const experimentalTools = [
        {
            title: 'Sismologia de Jackpots (Nazaré)',
            description: 'Monitorização de tensão tectónica e dos 4 abalos premonitórios que antecipam o Jackpot (Janela de 25).',
            href: '/tools/sismologia',
            icon: Waves,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'EM ANÁLISE'
        },
        {
            title: 'Laboratório de Meta-Sistemas',
            description: 'Pesquisa algorítmica e simulação de ensembles por Polarização Extrema e Separação das Águas.',
            href: '/tools/laboratorio',
            icon: FlaskConical,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'LAB EXP'
        },
        {
            title: 'Cruzador Inteligente',
            description: 'Cruze sistemas maduros com a Matriz de Corte V2 e decida com a Bússola entre Direto e Anti-Sistema.',
            href: '/tools/cruzador',
            icon: Compass,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'EM TESTES'
        },
        {
            title: 'Bússola & Separação de Extremos',
            description: 'Separação de frequências altas e baixas (Extremos) e polaridade Direto vs Espelho.',
            href: '/tools/separacao-extremos',
            icon: Compass,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'POLARIDADE'
        },
        {
            title: 'Previsões Próximo Sorteio',
            description: 'Top sugestões de números calculadas pela Bússola em Modo Direto e Modo Espelho.',
            href: '/previsoes/proximo-sorteio',
            icon: Sparkles,
            variant: 'premium' as const,
            gridSpan: 2 as const,
            badge: 'BÚSSOLA T-1'
        }
    ];

    const adminUtilities = [
        {
            title: 'Diagnóstico & Saúde do Sistema',
            description: 'Métricas de cache, integridade da base de dados e estado dos cron jobs.',
            href: '/admin/health',
            icon: Activity,
            variant: 'free' as const,
            gridSpan: 2 as const,
            badge: 'SISTEMA'
        }
    ];

    return (
        <div className="min-h-screen bg-surface-1 text-foreground p-4 md:p-8 font-sans">
            <div className="mx-auto max-w-7xl space-y-10">
                <header className="space-y-4">
                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar a Ferramentas</span>
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-border pb-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-surface-2 p-3.5 border border-border">
                                <Shield className="w-8 h-8 text-[var(--accent)]" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    Backoffice & Laboratório
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        Área Reservada
                                    </span>
                                </h1>
                                <p className="mt-1 text-sm md:text-base text-muted-foreground">
                                    Ferramentas retiradas do público para análise técnica, validação estatística e discussão antes do deploy.
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Secção de Ferramentas em Análise */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-[var(--accent)]" />
                                Ferramentas em Quarentena / Análise Técnica
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Estas 5 ferramentas foram removidas do menu público e mantidas aqui 100% operacionais para inspeção.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {experimentalTools.map((card) => (
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

                {/* Secção de Utilitários de Gestão */}
                <section className="space-y-4 pt-6 border-t border-border">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                        Diagnóstico & Infraestrutura
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {adminUtilities.map((card) => (
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
