
'use client';

import { Card } from '@/components/ui/card';

export default function StarRankingLegend() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-yellow-500/5 border-yellow-500/20 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-wider">Como funciona o Score?</h3>
                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Pontuação baseada na qualidade dos prémios (últimos 100 sorteios):</p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5 text-xs text-zinc-500">
                        <li><strong>2 Estrelas (Jackpot):</strong> 100 pontos</li>
                        <li><strong>1 Estrela:</strong> 10 pontos</li>
                        <li><strong>0 Estrelas:</strong> 0 pontos</li>
                    </ul>
                </div>
            </Card>
            <Card className="p-4 bg-yellow-500/5 border-yellow-500/20 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-wider">Win Rate (1+)</h3>
                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Percentagem de vezes que o sistema gerou pelo menos uma estrela correta.</p>
                    <p className="text-xs text-zinc-500 mt-2">
                        Uma Win Rate alta significa que o sistema acerta estrelas com maior regularidade, facilitando prémios combinados.
                    </p>
                </div>
            </Card>
        </div>
    );
}
