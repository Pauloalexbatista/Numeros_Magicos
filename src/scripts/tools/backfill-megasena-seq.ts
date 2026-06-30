import { PrismaClient } from '@prisma/client';
import { evaluateDraw, evaluateDrawStars, updateRanking, cachePredictions } from '../../services/ranking';
import { updateAllStatisticsCache } from '../../services/cache/statisticsCache';

const prisma = new PrismaClient();

async function backfill() {
    console.log('=== STARTING MEGASENA SEQUENCE BACKFILL AND SYNC (OFFICIAL API) ===\n');

    for (let concurso = 3018; concurso <= 3030; concurso++) {
        console.log(`Checking concurso ${concurso}...`);
        try {
            const response = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${concurso}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            });

            if (response.status === 404) {
                console.log(`Concurso ${concurso} not found (404). Stopping sequence scan.`);
                break;
            }

            if (!response.ok) {
                console.log(`Failed to fetch concurso ${concurso}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();
            
            // Parse date "DD/MM/YYYY" to ISO
            const dateParts = data.dataApuracao.split('/');
            const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            const drawDate = new Date(isoDate + "T12:00:00Z");
            const startOfDay = new Date(isoDate + "T00:00:00Z");
            const endOfDay = new Date(isoDate + "T23:59:59Z");

            const numbers = data.listaDezenas.map((n: string) => parseInt(n)).sort((a: number, b: number) => a - b);
            const numbersDrawOrder = data.dezenasSorteadasOrdemSorteio.map((n: string) => parseInt(n));
            const jackpot = data.valorEstimadoProximoConcurso || 0;
            const hasWinner = !data.acumulado;

            // Search by date first
            const existingByDate = await prisma.draw.findFirst({
                where: {
                    game: 'MEGASENA',
                    date: { gte: startOfDay, lte: endOfDay }
                }
            });

            if (existingByDate) {
                if (existingByDate.sequenceNumber !== concurso) {
                    console.log(`Updating sequenceNumber for ${isoDate} to ${concurso}`);
                    await prisma.draw.update({
                        where: { id: existingByDate.id },
                        data: { sequenceNumber: concurso }
                    });
                } else {
                    console.log(`Draw for ${isoDate} already exists with correct sequence ${concurso}`);
                }
            } else {
                console.log(`Inserting missing draw ${concurso} for date ${isoDate}`);
                const newDraw = await prisma.draw.create({
                    data: {
                        game: 'MEGASENA',
                        sequenceNumber: concurso,
                        date: drawDate,
                        numbers: JSON.stringify(numbers),
                        stars: JSON.stringify([]),
                        numbersDrawOrder: JSON.stringify(numbersDrawOrder),
                        starsDrawOrder: JSON.stringify([]),
                        jackpot,
                        hasWinner
                    }
                });

                console.log(`Evaluating draw performance for ${concurso}...`);
                await evaluateDraw(newDraw.id);
                await evaluateDrawStars(newDraw.id);
            }

        } catch (err: any) {
            console.error(`Error processing concurso ${concurso}:`, err.message);
        }
    }

    console.log('\nRecalculating Rankings...');
    await updateRanking();
    console.log('Recalculating Cached Predictions...');
    await cachePredictions();
    console.log('Recalculating Statistics Cache...');
    await updateAllStatisticsCache();

    console.log('\n=== MEGASENA SYNC COMPLETED SUCCESSFULLY ===');
}

backfill()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
