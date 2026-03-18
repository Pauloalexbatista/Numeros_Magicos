import { prisma } from '@/lib/prisma';
import { trainMLClassifierModel } from './classifier-train-core';
import { trainRandomForestModel } from './rf-train-core';
import { RandomForestSystem } from '@/systems/ml/RandomForestSystem';
import { MLClassifierSystem } from '@/systems/ml/MLClassifierSystem';

export interface BacktestReport {
    game: string;
    model: string;
    target: string;
    samplesAnalyzed: number;
    totalPoints: number;
    logs: string[];
}

export async function runBacktest(game: string, networkType: string, sampleSize: number): Promise<{ success: boolean; data?: BacktestReport; message?: string }> {
    const logs: string[] = [];
    logs.push(`[INIT] Backtest para ${game} - Rede: ${networkType} - Amostra: ${sampleSize} sorteios`);

    try {
        console.log(`[BACKTEST] A iniciar motor para ${game} - ${networkType}. Alvo: últimos ${sampleSize} sorteios.`);
        
        // 1. Fetch History from the DB (ordered by date ASC so we can simulate the passage of time)
        const fullHistory = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        if (fullHistory.length < 150) {
            return { success: false, message: `Histórico insuficiente para backtest realístico (mín. 150 sorteios). Encontrados: ${fullHistory.length}` };
        }

        let totalPoints = 0;
        const totalDraws = fullHistory.length;
        
        // Ensure we don't try to mock more history than we have. Protect the first 100 draws for base training.
        const maxSimulations = Math.min(sampleSize, totalDraws - 100);
        if (maxSimulations <= 0) return { success: false, message: `O dataset precisa de crescer antes de poder simular este tamanho de amostra.` };

        const isStars = networkType.includes('STARS') || networkType === 'LUCKY_NUMBER';
        const isRF = networkType.includes('RF');
        const isClassifier = networkType.includes('CLASSIFIER') || networkType.includes('LSTM');

        // Identify which System Class to use for generating top 10/top 2 predictions
        let systemEngine: any;
        const maxVal = isStars ? (game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5)) : (game === 'EURODREAMS' ? 40 : 50);
        
        if (isRF) systemEngine = new RandomForestSystem(isStars ? 'stars' : 'numbers', maxVal);
        else if (isClassifier) systemEngine = new MLClassifierSystem(isStars ? 'stars' : 'numbers', maxVal);
        else return { success: false, message: 'Simulação Backtest ainda não suportada para este tipo de rede neuronal.' };

        // 3. For every draw from (End - X) to End
        const startIndex = totalDraws - maxSimulations;
        
        for (let i = startIndex; i < totalDraws; i++) {
            // The simulation boundary is index `i`. 
            // The model is allowed to see history from index 0 up to (not including) index `i`.
            // The "Reality" we will try to predict is the real draw AT index `i`.
            
            const simulatedHistoryContext = fullHistory.slice(0, i);
            const targetReality = fullHistory[i];
            
            const stringDate = targetReality.date.toISOString().split('T')[0];
            logs.push(`\n[+] Simulando a data ${stringDate} (Sorteio nº ${i})...`);
            
            // a) Train the Network specifically restricted to `simulatedHistoryContext`
            let trainResult;
            if (isRF) {
                trainResult = await trainRandomForestModel(game, isStars, isStars ? (game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5)) : (game === 'EURODREAMS' ? 40 : 50), networkType, simulatedHistoryContext);
            } else if (isClassifier) {
                trainResult = await trainMLClassifierModel(game, isStars, isStars ? (game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5)) : (game === 'EURODREAMS' ? 40 : 50), networkType, simulatedHistoryContext);
            }

            if (!trainResult || !trainResult.success) {
                logs.push(`[-] Modelo Colapsou. Treino Falhou nesta iteração.`);
                continue;
            }

            // b) Predict the result!
            let prediction: number[] = [];
            
            if (isRF || isClassifier) {
                const rawArray = await systemEngine.generateTop25(simulatedHistoryContext, isStars ? 'stars' : 'numbers', maxVal);
                if (isStars) {
                    const limit = game === 'EUROMILLIONS' ? 2 : 1;
                    prediction = rawArray.slice(0, limit);
                } else {
                    const limit = game === 'EURODREAMS' ? 6 : 5;
                    prediction = rawArray.slice(0, limit);
                }
            } else {
                if (isStars) {
                    prediction = await systemEngine.generatePrediction(simulatedHistoryContext);
                } else {
                    prediction = await systemEngine.generateTop10(simulatedHistoryContext);
                }
            }

            // c) Calculate Points against Reality
            const realResult = isStars ? JSON.parse(targetReality.stars) : JSON.parse(targetReality.numbers);
            const hits = realResult.filter((n: number) => prediction.includes(n)).length;
            
            // Points Math: 
            // Number Hits: 1 hit = 10 pts, 2 = 50, 3 = 100, 4 = 500, 5 = 5000
            // Star/Dream Hits: 1 = +50 pts, 2 = +200 pts
            let pointsGained = 0;
            if (isStars) {
                if (hits === 1) pointsGained = 50;
                if (hits === 2) pointsGained = 200;
            } else {
                if (hits === 1) pointsGained = 10;
                if (hits === 2) pointsGained = 50;
                if (hits === 3) pointsGained = 100;
                if (hits === 4) pointsGained = 500;
                if (hits === 5) pointsGained = 5000;
                if (hits === 6 && game === 'EURODREAMS') pointsGained = 10000;
            }

            totalPoints += pointsGained;
            
            const preStr = prediction.join(', ');
            const realStr = realResult.join(', ');
            logs.push(` - Previu: [${preStr}] | Saiu: [${realStr}] -> Acertou ${hits}. Ganhou +${pointsGained} pontos.`);
        }

        logs.push(`\n[=] SUMÁRIO: Rank Total = ${totalPoints} Pontos de Precisão.`);
        console.log(`[BACKTEST] Simulação Concluída. Total de Pontos: ${totalPoints}`);

        return {
            success: true,
            data: {
                game,
                model: 'Neural Lab Auto-Run',
                target: networkType,
                samplesAnalyzed: maxSimulations,
                totalPoints: totalPoints,
                logs
            }
        }
    } catch (e: any) {
         console.error('[BACKTEST_CORE] Falha catastrófica:', e);
         return { success: false, message: `Falha na execução: ${e.message}` }
    }
}
