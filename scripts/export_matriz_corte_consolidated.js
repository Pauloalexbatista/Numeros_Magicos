const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const GAMES = [
    { game: 'EUROMILLIONS', slug: 'euromillions', pool: 25 },
    { game: 'TOTOLOTO', slug: 'totoloto', pool: 25 },
    { game: 'EURODREAMS', slug: 'eurodreams', pool: 20 },
    { game: 'MEGASENA', slug: 'megasena', pool: 30 }
];

async function exportToConsolidated() {
    console.log('Exporting Matriz de Corte from DB to data/consolidated/...');
    const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');

    for (const g of GAMES) {
        const records = await prisma.systemPrediction.findMany({
            where: {
                game: g.game,
                systemName: 'Matriz de Corte',
                domain: 'NUMBERS'
            },
            include: {
                draw: {
                    select: {
                        id: true,
                        date: true,
                        numbers: true
                    }
                }
            },
            orderBy: {
                draw: {
                    date: 'asc'
                }
            }
        });

        console.log(`Found ${records.length} records for Matriz de Corte ${g.game}`);

        const exportData = records.map(r => {
            let pred = [];
            try { pred = JSON.parse(r.prediction); } catch (e) { pred = []; }
            return {
                drawId: r.drawId,
                prediction: pred,
                cutoff: r.cutoff,
                num_hits_5: r.num_hits_5,
                num_hits_10: r.num_hits_10,
                num_hits_15: r.num_hits_15,
                num_hits_20: r.num_hits_20,
                num_hits_25: r.num_hits_25,
                num_hits_30: r.num_hits_30,
                draw: {
                    id: r.draw.id,
                    date: r.draw.date.toISOString(),
                    numbers: r.draw.numbers
                }
            };
        });

        const outPath = path.join(consolidatedDir, `matriz_corte_${g.slug}.json`);
        fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2), 'utf-8');
        console.log(`Wrote ${exportData.length} records to ${outPath}`);
    }

    // Export Stars as well
    for (const g of GAMES) {
        if (g.game === 'MEGASENA') continue;
        const records = await prisma.systemPrediction.findMany({
            where: {
                game: g.game,
                systemName: 'Matriz de Corte Estrelas',
                domain: 'STARS'
            },
            include: {
                draw: {
                    select: {
                        id: true,
                        date: true,
                        stars: true
                    }
                }
            },
            orderBy: {
                draw: {
                    date: 'asc'
                }
            }
        });

        console.log(`Found ${records.length} records for Matriz de Corte Estrelas ${g.game}`);

        const exportData = records.map(r => {
            let pred = [];
            try { pred = JSON.parse(r.prediction); } catch (e) { pred = []; }
            return {
                drawId: r.drawId,
                prediction: pred,
                cutoff: r.cutoff,
                star_hits_2: r.star_hits_2,
                star_hits_4: r.star_hits_4,
                star_hits_6: r.star_hits_6,
                star_hits_8: r.star_hits_8,
                draw: {
                    id: r.draw.id,
                    date: r.draw.date.toISOString(),
                    stars: r.draw.stars
                }
            };
        });

        const outPath = path.join(consolidatedDir, `matriz_corte_stars_${g.slug}.json`);
        fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2), 'utf-8');
        console.log(`Wrote ${exportData.length} records to ${outPath}`);
    }

    process.exit(0);
}

exportToConsolidated().catch(err => {
    console.error(err);
    process.exit(1);
});
