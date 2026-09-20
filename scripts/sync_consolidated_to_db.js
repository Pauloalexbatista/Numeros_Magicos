const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const GAMES = [
    { game: 'EUROMILLIONS', slug: 'euromillions', maxNum: 50, predCount: 25, maxHits: 5 },
    { game: 'TOTOLOTO', slug: 'totoloto', maxNum: 49, predCount: 25, maxHits: 5 },
    { game: 'EURODREAMS', slug: 'eurodreams', maxNum: 40, predCount: 20, maxHits: 6 },
    { game: 'MEGASENA', slug: 'megasena', maxNum: 60, predCount: 30, maxHits: 6 }
];

const SYSTEMS_TO_SYNC = [
    {
        name: 'Tiro Certeiro',
        slug: 'tiro_certeiro',
        description: 'Meta-sistema de máxima precisão combinando os melhores especialistas por jogo'
    },
    {
        name: 'Separação das Águas',
        slug: 'separacao_aguas',
        description: 'Estratégia de polaridade e separação em zonas quentes e frias'
    },
    {
        name: 'Supersistema Neuronal',
        slug: 'supersistema_neuronal',
        description: 'Ensemble ponderado por pesos sinápticos e convergência de tendências'
    },
    {
        name: 'Random Forest',
        slug: 'random_forest',
        description: 'Floresta de decisão aleatória treinada em variáveis estatísticas multi-dimensionais'
    }
];

function calculateHits(prediction, actual) {
    const hits = {};
    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits['num_hits_' + cut] = top.filter(n => actual.includes(n)).length;
    }
    return hits;
}

async function main() {
    console.log('🚀 Starting synchronization of consolidated systems to Database...');
    const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');

    for (const g of GAMES) {
        console.log('\n============================================================');
        console.log('🎯 PROCESSING GAME: ' + g.game);
        console.log('============================================================');

        const draws = await prisma.draw.findMany({
            where: { game: g.game },
            orderBy: { date: 'asc' }
        });
        console.log('Total draws in DB for ' + g.game + ': ' + draws.length);

        for (const sys of SYSTEMS_TO_SYNC) {
            console.log('\n--- System: ' + sys.name + ' (' + sys.slug + ') ---');

            await prisma.rankedSystem.upsert({
                where: {
                    name_game: {
                        name: sys.name,
                        game: g.game
                    }
                },
                update: {
                    description: sys.description,
                    domain: 'NUMBERS',
                    systemType: 'ensemble'
                },
                create: {
                    name: sys.name,
                    game: g.game,
                    description: sys.description,
                    domain: 'NUMBERS',
                    systemType: 'ensemble'
                }
            });

            const fileName = sys.slug + '_' + g.slug + '.json';
            const filePath = path.join(consolidatedDir, fileName);

            if (!fs.existsSync(filePath)) {
                console.warn('⚠️ File ' + fileName + ' not found. Skipping.');
                continue;
            }

            const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(rawData) || rawData.length === 0) {
                console.warn('⚠️ File ' + fileName + ' is empty. Skipping.');
                continue;
            }

            console.log('Found ' + rawData.length + ' predictions in ' + fileName);

            const deleted = await prisma.systemPrediction.deleteMany({
                where: {
                    game: g.game,
                    systemName: sys.name,
                    domain: 'NUMBERS'
                }
            });
            if (deleted.count > 0) {
                console.log('Deleted ' + deleted.count + ' old records for ' + sys.name);
            }

            const recordsToInsert = [];
            let jackpotsCount = 0;
            const predCutKey = 'num_hits_' + g.predCount;

            const countToProcess = Math.min(draws.length, rawData.length);
            const offset = rawData.length - countToProcess;

            for (let i = 0; i < countToProcess; i++) {
                const item = rawData[offset + i];
                const draw = draws[i];

                if (!item || !draw) continue;

                let prediction = [];
                if (Array.isArray(item.prediction)) {
                    prediction = item.prediction;
                } else if (typeof item.prediction === 'string') {
                    try { prediction = JSON.parse(item.prediction); } catch (e) { prediction = []; }
                }

                if (prediction.length === 0) continue;

                let actual = [];
                if (typeof draw.numbers === 'string') {
                    try { actual = JSON.parse(draw.numbers); } catch (e) { actual = []; }
                } else if (Array.isArray(draw.numbers)) {
                    actual = draw.numbers;
                }

                let hits = {};
                if (item.num_hits_25 !== undefined && item.num_hits_5 !== undefined && item.num_hits_30 !== undefined) {
                    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
                        hits['num_hits_' + cut] = item[`num_hits_${cut}`] ?? 0;
                    }
                } else {
                    hits = calculateHits(prediction, actual);
                }

                if (hits[predCutKey] === g.maxHits) {
                    jackpotsCount++;
                }

                recordsToInsert.push({
                    drawId: draw.id,
                    game: g.game,
                    domain: 'NUMBERS',
                    systemName: sys.name,
                    prediction: JSON.stringify(prediction),
                    cutoff: g.maxNum,
                    ...hits,
                    calculatedAt: new Date()
                });
            }

            console.log('Inserting ' + recordsToInsert.length + ' records in batches... (Jackpots: ' + jackpotsCount + ')');

            const chunkSize = 200;
            for (let b = 0; b < recordsToInsert.length; b += chunkSize) {
                const chunk = recordsToInsert.slice(b, b + chunkSize);
                await prisma.systemPrediction.createMany({
                    data: chunk
                });
            }

            if (recordsToInsert.length > 0) {
                const totalAccuracy = recordsToInsert.reduce(
                    (sum, r) => sum + (((r[predCutKey] ?? 0) / g.maxHits) * 100),
                    0
                );
                const avgAccuracy = totalAccuracy / recordsToInsert.length;

                await prisma.systemRanking.upsert({
                    where: {
                        systemName_game: {
                            systemName: sys.name,
                            game: g.game
                        }
                    },
                    update: {
                        avgAccuracy,
                        totalPredictions: recordsToInsert.length,
                        lastUpdated: new Date()
                    },
                    create: {
                        game: g.game,
                        systemName: sys.name,
                        avgAccuracy,
                        totalPredictions: recordsToInsert.length,
                        lastUpdated: new Date()
                    }
                });
            }

            console.log('✅ ' + sys.name + ' for ' + g.game + ' synced!');
        }
    }

    console.log('\n🎉 ALL SYSTEMS SYNCHRONIZED SUCCESSFULLY TO DATABASE!');
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
