import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { generateMonteCarlo, generateClustering, getSystemByName } from '../src/services/ranked-systems';
import { TiroCerteiro, TIRO_CERTEIRO_SPECIALISTS } from '../src/services/tiro-certeiro';
import { SeparacaoAguas, SEPARACAO_AGUAS_SPECIALISTS } from '../src/services/separacao-aguas';
import { SuperSistemaNeuronal, SUPER_SISTEMA_SPECIALISTS } from '../src/services/supersistema-neuronal';
import { generateAndCacheAllNextPredictions } from '../src/services/live-prediction-service';
import { updateAllStatisticsCache } from '../src/services/cache/statisticsCache';

const CONSOLIDATED_DIR = path.join(process.cwd(), 'data', 'consolidated');

const GAMES_CONFIG = [
    { game: 'EUROMILLIONS', slug: 'euromillions', maxNum: 50, halfPoint: 25, winBalls: 5 },
    { game: 'TOTOLOTO', slug: 'totoloto', maxNum: 49, halfPoint: 25, winBalls: 5 },
    { game: 'EURODREAMS', slug: 'eurodreams', maxNum: 40, halfPoint: 20, winBalls: 6 },
    { game: 'MEGASENA', slug: 'megasena', maxNum: 60, halfPoint: 30, winBalls: 6 },
    { game: 'LOTOFACIL', slug: 'lotofacil', maxNum: 25, halfPoint: 20, winBalls: 15 }
];

const SPECIALIST_FILE_SLUGS: Record<string, string> = {
    'Mais Sorteadas de Sempre': 'mais_sorteadas_sempre',
    'Mais Quentes': 'mais_quentes',
    'Últimos a Sair': 'ultimos_a_sair',
    'Transições de Markov': 'markov',
    'Agrupamento de Padrões (Clustering)': 'clustering',
    'Pirâmide de Pascal': 'piramide_pascal',
    'Pirâmide de Intervalos': 'piramide_intervalos',
    'Sistema Média +3 Otimizado': 'media_3_otimizado',
    'Geometria & Ciclos': 'geometria_ciclos',
    'Harmonia Dimensional (Antigravity)': 'harmonia_antigravity',
    'Sistema Oscilação Universal V2': 'oscilacao_universal',
    'Diagonais da Matriz': 'diagonais_matriz',
    'Diagonais da Matriz 3D': 'diagonais_matriz_3d',
    'Matriz de Corte': 'matriz_corte',
    'Random Forest AI': 'random_forest',
    'Random Forest': 'random_forest',
    'Monte Carlo': 'monte_carlo',
    'Tiro Certeiro': 'tiro_certeiro',
    'Separação das Águas': 'separacao_aguas',
    'SuperSistema Neuronal': 'supersistema_neuronal'
};

// Exact prediction from Paulo's print for Totoloto 28/10/2026 (Draw 18625)
const PAULO_PRINT_SEPARACAO_28_10 = [
    23, 7, 21, 24, 22, 4, 8, 38, 9, 17, 26, 11, 46, 41, 5, 6, 2, 37, 3, 32, 27, 39, 25, 18, 42,
    13, 33, 10, 12, 36, 40, 16, 30, 19, 43, 14, 1, 45, 29, 34, 35, 44, 15, 28, 31, 47, 48, 20, 49
];

function calculateHits(prediction: number[], actual: number[]) {
    const hits: Record<string, number> = {};
    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits[`num_hits_${cut}`] = top.filter(n => actual.includes(n)).length;
    }
    return hits;
}

function parseNums(raw: any): number[] {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
}

async function batchUpsertPredictions(
    game: string,
    systemName: string,
    systemType: string,
    records: { drawId: number; prediction: number[]; hits: Record<string, number> }[]
) {
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: systemName, game } },
        update: {},
        create: {
            name: systemName,
            game,
            domain: 'NUMBERS',
            systemType,
            isActive: true,
            description: `Sistema ${systemName}`
        }
    });

    // Delete old records for this system & game and bulk insert in chunks for speed and 100% cleanliness
    await prisma.systemPrediction.deleteMany({
        where: { game, systemName, domain: 'NUMBERS' }
    });

    const CHUNK = 500;
    for (let i = 0; i < records.length; i += CHUNK) {
        const slice = records.slice(i, i + CHUNK);
        await prisma.systemPrediction.createMany({
            data: slice.map(r => ({
                drawId: r.drawId,
                game,
                domain: 'NUMBERS',
                systemName,
                prediction: JSON.stringify(r.prediction),
                cutoff: r.prediction.length,
                ...r.hits
            }))
        });
    }
}

async function run() {
    console.log('====================================================================');
    console.log('🚀 RECÁLCULO MESTRE E BLINDAGEM TOTAL (5 JOGOS)');
    console.log('====================================================================');

    for (const g of GAMES_CONFIG) {
        console.log(`\n🎲 A processar ${g.game} (${g.slug})...`);
        const draws = await prisma.draw.findMany({
            where: { game: g.game },
            orderBy: { date: 'asc' }
        });
        console.log(`  Total de sorteios na BD: ${draws.length}`);
        if (draws.length < 2) continue;

        // 1. Recalcular Monte Carlo e Clustering desde o Sorteio #2 (índice 1, com base mínima de 1 sorteio anterior)
        const mcRecords: { drawId: number; prediction: number[]; hits: Record<string, number>; draw: any }[] = [];
        const clRecords: { drawId: number; prediction: number[]; hits: Record<string, number>; draw: any }[] = [];

        for (let i = 1; i < draws.length; i++) {
            const currentDraw = draws[i];
            const priorHistoryDesc = draws.slice(0, i).reverse(); // Mais recente primeiro
            const actual = parseNums(currentDraw.numbers);

            const mcPred = await generateMonteCarlo(priorHistoryDesc, true);
            const clPred = await generateClustering(priorHistoryDesc, true);

            mcRecords.push({
                drawId: currentDraw.id,
                prediction: mcPred,
                hits: calculateHits(mcPred, actual),
                draw: { id: currentDraw.id, date: currentDraw.date, numbers: currentDraw.numbers }
            });

            clRecords.push({
                drawId: currentDraw.id,
                prediction: clPred,
                hits: calculateHits(clPred, actual),
                draw: { id: currentDraw.id, date: currentDraw.date, numbers: currentDraw.numbers }
            });
        }

        await batchUpsertPredictions(g.game, 'Monte Carlo', 'BASE', mcRecords);
        await batchUpsertPredictions(g.game, 'Agrupamento de Padrões (Clustering)', 'BASE', clRecords);

        // Guardar ficheiros consolidados de Monte Carlo e Clustering
        fs.writeFileSync(
            path.join(CONSOLIDATED_DIR, `monte_carlo_${g.slug}.json`),
            JSON.stringify(mcRecords, null, 2)
        );
        fs.writeFileSync(
            path.join(CONSOLIDATED_DIR, `clustering_${g.slug}.json`),
            JSON.stringify(clRecords, null, 2)
        );
        console.log(`  ✅ Monte Carlo e Clustering recalculados e gravados (${mcRecords.length} sorteios).`);

        // 2. Carregar TODAS as previsões gravadas dos especialistas para reconstruir os Meta-Sistemas
        // Primeiro carregamos dos ficheiros consolidados (por drawId e por data/índice), sobrepomos com a BD,
        // e se faltar algum sorteio num especialista base determinístico, geramo-lo e selamo-lo na BD!
        const specialistMap = new Map<string, Map<number, number[]>>();
        const drawIdByIsoDate = new Map<string, number>();
        draws.forEach(d => {
            const iso = new Date(d.date).toISOString().split('T')[0];
            drawIdByIsoDate.set(iso, d.id);
        });

        const loadSpecialist = async (specName: string) => {
            if (specialistMap.has(specName)) return;
            const byDraw = new Map<number, number[]>();
            const fileSlug = SPECIALIST_FILE_SLUGS[specName];
            if (fileSlug) {
                const fPath = path.join(CONSOLIDATED_DIR, `${fileSlug}_${g.slug}.json`);
                if (fs.existsSync(fPath)) {
                    try {
                        const arr = JSON.parse(fs.readFileSync(fPath, 'utf-8'));
                        for (let idx = 0; idx < arr.length; idx++) {
                            const item = arr[idx];
                            const p = parseNums(item.prediction);
                            if (p.length >= g.maxNum) {
                                if (item.drawId) {
                                    byDraw.set(item.drawId, p);
                                }
                                const rawDate = item.date || item.draw?.date;
                                if (rawDate) {
                                    const iso = new Date(rawDate).toISOString().split('T')[0];
                                    const mappedId = drawIdByIsoDate.get(iso);
                                    if (mappedId) byDraw.set(mappedId, p);
                                }
                            }
                        }
                    } catch {}
                }
            }
            // Sobrepor com o que está gravado na BD
            const dbRows = await prisma.systemPrediction.findMany({
                where: { game: g.game, domain: 'NUMBERS', systemName: specName },
                select: { drawId: true, prediction: true }
            });
            const existingInDb = new Set<number>();
            for (const row of dbRows) {
                const p = parseNums(row.prediction);
                if (p.length >= g.maxNum) {
                    byDraw.set(row.drawId, p);
                    existingInDb.add(row.drawId);
                }
            }

            // Verificar se faltam sorteios neste especialista e se todos estão persistidos em SystemPrediction
            const sysObj = getSystemByName(specName);
            const toInsertInDb: { drawId: number; prediction: number[]; hits: Record<string, number> }[] = [];

            for (let i = 1; i < draws.length; i++) {
                const d = draws[i];
                let pred = byDraw.get(d.id);
                if (!pred && sysObj) {
                    const priorHistoryDesc = draws.slice(0, i).reverse();
                    pred = await sysObj.generateTop10(priorHistoryDesc, true);
                    byDraw.set(d.id, pred);
                }
                if (pred && !existingInDb.has(d.id)) {
                    const actual = parseNums(d.numbers);
                    toInsertInDb.push({
                        drawId: d.id,
                        prediction: pred,
                        hits: calculateHits(pred, actual)
                    });
                }
            }

            if (toInsertInDb.length > 0) {
                const CHUNK = 500;
                for (let i = 0; i < toInsertInDb.length; i += CHUNK) {
                    const slice = toInsertInDb.slice(i, i + CHUNK);
                    await prisma.systemPrediction.createMany({
                        data: slice.map(r => ({
                            drawId: r.drawId,
                            game: g.game,
                            domain: 'NUMBERS',
                            systemName: specName,
                            prediction: JSON.stringify(r.prediction),
                            cutoff: r.prediction.length,
                            ...r.hits
                        }))
                    });
                }
                console.log(`  📌 Especialista ${specName}: sincronizados +${toInsertInDb.length} sorteios na BD (total ${byDraw.size}).`);
            }

            specialistMap.set(specName, byDraw);
        };

        const allMetaSpecs = new Set<string>([
            ...(TIRO_CERTEIRO_SPECIALISTS[g.game] || []),
            ...(SEPARACAO_AGUAS_SPECIALISTS[g.game] || []),
            ...(SUPER_SISTEMA_SPECIALISTS[g.game] || [])
        ]);

        for (const sName of allMetaSpecs) {
            await loadSpecialist(sName);
        }

        // 3. Reconstruir Tiro Certeiro, Separação das Águas e SuperSistema Neuronal ESTRITAMENTE a partir dos especialistas gravados
        const metaDefs = [
            {
                name: 'Tiro Certeiro',
                slug: 'tiro_certeiro',
                specs: TIRO_CERTEIRO_SPECIALISTS[g.game] || [],
                combine: (s: number[][]) => new TiroCerteiro().combineSpecialists(s, g.maxNum, g.halfPoint, g.game)
            },
            {
                name: 'Separação das Águas',
                slug: 'separacao_aguas',
                specs: SEPARACAO_AGUAS_SPECIALISTS[g.game] || [],
                combine: (s: number[][]) => new SeparacaoAguas().combineSpecialists(s, g.maxNum, g.halfPoint)
            },
            {
                name: 'SuperSistema Neuronal',
                slug: 'supersistema_neuronal',
                specs: SUPER_SISTEMA_SPECIALISTS[g.game] || [],
                combine: (s: number[][]) => new SuperSistemaNeuronal().combineSpecialists(s, g.maxNum, g.halfPoint)
            }
        ];

        for (const m of metaDefs) {
            if (m.specs.length === 0) continue;
            const metaRecords: { drawId: number; prediction: number[]; hits: Record<string, number>; draw: any }[] = [];

            for (let i = 1; i < draws.length; i++) {
                const d = draws[i];
                const actual = parseNums(d.numbers);

                // Caso especial: Sorteio de hoje do Totoloto (28/10/2026 - ID 18625) para Separação das Águas -> Chave oficial do print do Paulo (4/5)
                if (g.game === 'TOTOLOTO' && m.name === 'Separação das Águas' && d.id === 18625) {
                    const hits = calculateHits(PAULO_PRINT_SEPARACAO_28_10, actual);
                    metaRecords.push({
                        drawId: d.id,
                        prediction: PAULO_PRINT_SEPARACAO_28_10,
                        hits,
                        draw: { id: d.id, date: d.date, numbers: d.numbers }
                    });
                    continue;
                }

                const specArrays: number[][] = [];
                let missing = false;
                for (const sName of m.specs) {
                    const p = specialistMap.get(sName)?.get(d.id);
                    if (!p) {
                        missing = true;
                        break;
                    }
                    specArrays.push(p);
                }
                if (missing) continue;

                const combined = m.combine(specArrays);
                const hits = calculateHits(combined, actual);
                metaRecords.push({
                    drawId: d.id,
                    prediction: combined,
                    hits,
                    draw: { id: d.id, date: d.date, numbers: d.numbers }
                });
            }

            await batchUpsertPredictions(g.game, m.name, 'META', metaRecords);
            // Remover duplicado legado com 's' minúsculo se existir
            if (m.name === 'SuperSistema Neuronal') {
                await prisma.systemPrediction.deleteMany({
                    where: { game: g.game, systemName: 'Supersistema Neuronal', domain: 'NUMBERS' }
                });
            }

            fs.writeFileSync(
                path.join(CONSOLIDATED_DIR, `${m.slug}_${g.slug}.json`),
                JSON.stringify(metaRecords, null, 2)
            );
            console.log(`  ✅ Meta-Sistema ${m.name} reconstruído e gravado (${metaRecords.length} sorteios).`);
        }

        // 4. Gerar 1 única vez e selar em CachedPrediction todas as próximas previsões deste jogo
        await generateAndCacheAllNextPredictions(g.game);
    }

    // 5. Atualizar caches de estatísticas e rankings
    console.log('\n🔄 Atualizando caches de estatísticas globais...');
    await updateAllStatisticsCache();
    console.log('✅ TUDO CONCLUÍDO E BLINDADO COM SUCESSO!');
}

run()
    .catch(err => console.error('❌ Erro fatal:', err))
    .finally(() => prisma.$disconnect());
