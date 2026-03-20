const fs = require('fs');

const files = [
    'src/services/neural/euromillions-numbers-neural.ts',
    'src/services/neural/euromillions-stars-neural.ts',
    'src/services/neural/eurodreams-numbers-neural.ts',
    'src/services/neural/eurodreams-dreams-neural.ts',
    'src/services/neural/totoloto-numbers-neural.ts',
    'src/services/neural/totoloto-lucky-neural.ts'
];

for (const file of files) {
    if (!fs.existsSync(file)) {
        console.log("Not found:", file);
        continue;
    }
    let code = fs.readFileSync(file, 'utf8');

    // 1. Fix imports
    if(!code.includes('preparePredictionInput')) {
        code = code.replace(
            /(import\s+\{\s*?prepareTimeSequences\s*?\}\s+from\s+['"].\/tensor-core['"];)/g,
            "import { prepareTimeSequences, preparePredictionInput, denormalizeData } from './tensor-core';"
        );
    }

    // 2. Inject prediction logic before upsert
    if(!code.includes('latestDrawsForPrediction')) {
        const injectStr = `        const latestDrawsForPrediction = await prisma.draw.findMany({
            where: { game: GAME_NAME },
            orderBy: { id: 'desc' },
            take: SEQUENCE_LENGTH
        });
        
        const inputTensor = preparePredictionInput(latestDrawsForPrediction, extractFn, MAX_VAL, SEQUENCE_LENGTH);
        let nextPrediction: number[] | null = null;
        
        if (inputTensor) {
            const predTensor = model.predict(inputTensor) as tf.Tensor;
            const predArray = await predTensor.data();
            nextPrediction = Array.from(predArray).map(v => denormalizeData(v, MAX_VAL));
            nextPrediction = nextPrediction.map(v => Math.max(1, Math.min(MAX_VAL, v)));
            
            inputTensor.dispose();
            predTensor.dispose();
        }
        
        await prisma.mLModelTraining.upsert({`;
        
        code = code.replace(/await\s+prisma\.mLModelTraining\.upsert\s*\(\{/g, injectStr);
    }

    // 3. Add nextPrediction to JSON.stringify in the modelData payload
    code = code.replace(/JSON\.stringify\(\{ loss: finalLoss, accuracy: calcAcc, version: 1, epochs: EPOCHS \}\)/g, 
                       'JSON.stringify({ loss: finalLoss, accuracy: calcAcc, version: 1, epochs: EPOCHS, nextPrediction })');

    fs.writeFileSync(file, code);
    console.log('Patched ' + file);
}
