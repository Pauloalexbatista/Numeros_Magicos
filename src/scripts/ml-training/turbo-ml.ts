import { trainMLClassifierModel } from '../../services/neural/classifier-train-core';
import { trainRandomForestModel } from '../../services/neural/rf-train-core';
import { trainEuromillionsNumbers } from '../../services/neural/euromillions-numbers-neural';
import { trainEuromillionsStars } from '../../services/neural/euromillions-stars-neural';
import { trainTotolotoNumbers } from '../../services/neural/totoloto-numbers-neural';
import { trainTotolotoLucky } from '../../services/neural/totoloto-lucky-neural';
import { trainEuroDreamsNumbers } from '../../services/neural/eurodreams-numbers-neural';
import { trainEuroDreamsDreams } from '../../services/neural/eurodreams-dreams-neural';

async function runTurboML() {
    const gameArg = process.argv[2] || 'EUROMILLIONS';
    const game = gameArg.toUpperCase();
    console.log(`\n========================================`);
    console.log(`🚀 [TURBO-ML] DANDO ARRANQUE AO TREINO NEURONAL DE PRODUÇÃO`);
    console.log(`⏱️  JOGO ALVO: ${game}`);
    console.log(`========================================\n`);

    let maxVal = 50;
    let maxStar = 12;
    if (game === 'EURODREAMS') { maxVal = 40; maxStar = 5; }
    if (game === 'TOTOLOTO') { maxVal = 49; maxStar = 13; }

    try {
        console.log('\n[TURBO] 1/3 :: Treinando Florestas Aleatórias (Random Forest)...');
        await trainRandomForestModel(game, false, maxVal, `RF_${game}_NUMBERS`);
        await trainRandomForestModel(game, true, maxStar, `RF_${game}_${game === 'EURODREAMS' ? 'DREAMS' : 'STARS'}`);

        console.log('\n[TURBO] 2/3 :: Treinando Deep Learning Denso (ML Classifier)...');
        await trainMLClassifierModel(game, false, maxVal, `CLASSIFIER_${game}_NUMBERS`);
        await trainMLClassifierModel(game, true, maxStar, `CLASSIFIER_${game}_${game === 'EURODREAMS' ? 'DREAMS' : 'STARS'}`);

        console.log('\n[TURBO] 3/3 :: Treinando Deep Learning Temporal (LSTM)...');
        if (game === 'EUROMILLIONS') {
            await trainEuromillionsNumbers();
            await trainEuromillionsStars();
        } else if (game === 'TOTOLOTO') {
            await trainTotolotoNumbers();
            await trainTotolotoLucky();
        } else if (game === 'EURODREAMS') {
            await trainEuroDreamsNumbers();
            await trainEuroDreamsDreams();
        }

        console.log(`\n✅ [TURBO-ML] SUCESSO ABSOLUTO! Todas as chaves geradas em Memória (O-Latency) para a UI.`);
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ [TURBO-ML] Erro cataclísmico durante o treino de produção:`, error);
        process.exit(1);
    }
}

runTurboML();
