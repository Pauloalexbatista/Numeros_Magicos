
import PrimeNumbersClient from '@/components/PrimeNumbersClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function PrimeNumbersPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🔢</span> Números Primos
                            </h1>
                            <p className="text-muted-foreground">
                                Distribuição e frequência de números primos nos sorteios.
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica dos Números Primos">
                        <p>
                            Um <strong>número primo</strong> é divisível apenas por 1 e por ele próprio.
                            Entre 1-50, existem 15 números primos: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47.
                        </p>
                        <p className="mt-2">
                            Esta ferramenta analisa quantos números primos aparecem em cada sorteio e a sua distribuição histórica.
                            <strong>Nota:</strong> Não há evidência matemática de que números primos tenham maior ou menor probabilidade de sair.
                        </p>
                    </LogicExplanation>

                    <PrimeNumbersClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
