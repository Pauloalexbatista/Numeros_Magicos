import StandardDeviationClient from '@/components/StandardDeviationClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function StandardDeviationPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>📊</span> Standard Deviation
                            </h1>
                            <p className="text-muted-foreground">
                                Análise de Variação - Padrões de dispersão
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Standard Deviation">
                        <p>
                            O <strong>Standard Deviation</strong> (Desvio Padrão) mede a dispersão dos números
                            em relação à sua média, identificando padrões de variação.
                        </p>
                        <p className="mt-2">
                            O sistema analisa a variação histórica de cada número e identifica aqueles com
                            padrões de desvio específicos que podem indicar tendências.
                        </p>
                        <p className="mt-2">
                            <strong>Aplicação:</strong> Números com baixo desvio padrão aparecem de forma mais
                            consistente, enquanto alto desvio indica aparições mais esporádicas mas potencialmente
                            significativas.
                        </p>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Análise estatística de eventos independentes.
                            Use como ferramenta de análise de padrões históricos.
                        </p>
                    </LogicExplanation>

                    <StandardDeviationClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
