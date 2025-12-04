import VortexPyramidClient from '@/components/VortexPyramidClient';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function VortexPyramidPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🌪️</span> Vortex Pyramid
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Cálculo Toroidal Temporal - Análise de ressonância vortex
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Vortex Pyramid">
                        <p>
                            O <strong>Vortex Pyramid</strong> é um sistema avançado que aplica conceitos de geometria toroidal
                            ao histórico de sorteios. O algoritmo traça "linhas vortex" (diagonais) através do tempo,
                            criando uma estrutura tridimensional de análise.
                        </p>
                        <p className="mt-2">
                            Para cada número candidato (1-50), o sistema avalia a sua <strong>ressonância</strong> ao longo
                            destas linhas vortex, identificando padrões de recorrência que transcendem a análise linear tradicional.
                        </p>
                        <p className="mt-2">
                            <strong>Características:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Análise toroidal/cilíndrica do histórico temporal</li>
                            <li>Avaliação de ressonância para cada número (1-50)</li>
                            <li>Identificação de padrões vortex multidimensionais</li>
                            <li>Retorna Top 25 números com maior score de ressonância</li>
                        </ul>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Como todos os sistemas preditivos, assume padrões em eventos
                            matematicamente independentes. Use apenas como ferramenta de análise estatística.
                        </p>
                    </LogicExplanation>

                    <VortexPyramidClient />

                    <ResponsibleGamingWarning />
                    <ResponsibleGamingFooter />
                </div>
            </div>
        </div>
    );
}
