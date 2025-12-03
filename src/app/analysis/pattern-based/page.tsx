import PatternBasedClient from '@/components/PatternBasedClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function PatternBasedPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🎯</span> Pattern Based
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Amplitude & Pirâmide - Análise de padrões estruturais
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Pattern Based">
                        <p>
                            O <strong>Pattern Based</strong> combina análise de <strong>Amplitude</strong> (diferença entre
                            maior e menor número) e <strong>Pirâmide</strong> (distribuição triangular) para identificar padrões estruturais.
                        </p>
                        <p className="mt-2">
                            <strong>Amplitude:</strong> Analisa a dispersão dos números sorteados. Amplitudes muito baixas
                            ou muito altas são menos comuns, favorecendo valores médios.
                        </p>
                        <p className="mt-2">
                            <strong>Pirâmide:</strong> Avalia a distribuição dos números em formato piramidal,
                            identificando padrões de concentração e dispersão.
                        </p>
                        <p className="mt-2">
                            <strong>Aplicação:</strong> Identifica números que se encaixam em padrões históricos
                            de amplitude e distribuição piramidal.
                        </p>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Baseado em padrões estruturais de eventos independentes.
                            Use como ferramenta de análise complementar.
                        </p>
                    </LogicExplanation>

                    <PatternBasedClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
