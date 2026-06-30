import { IGameService } from './interfaces/gameService';
import { prisma } from '@/lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions, evaluateDrawStars } from './ranking';
import { updateAllStatisticsCache } from './cache/statisticsCache';
import https from 'https';

interface DrawData {
    date: string;
    numbers: number[];
    stars: number[];
    numbersDrawOrder: number[];
    starsDrawOrder: number[];
    jackpot: number;
    hasWinner: boolean;
    concurso?: number;
}

export class MegaSenaService implements IGameService {
    private readonly BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';

    async fetchLatest(): Promise<DrawData> {
        try {
            const response = await fetch(this.BASE_URL, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch from Caixa API: ${response.statusText}`);
            }

            const data = await response.json();

            // dataApuracao format: DD/MM/YYYY
            const dateParts = data.dataApuracao.split('/');
            const isoDate = `${dateParts[2]}-\d{2}-\d{2}`.includes('-') ? '' : `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // YYYY-MM-DD (safeguard)
            const finalIsoDate = isoDate || `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            const numbers = data.listaDezenas.map((n: string) => parseInt(n));
            const numbersDrawOrder = data.dezenasSorteadasOrdemSorteio.map((n: string) => parseInt(n));

            return {
                date: finalIsoDate,
                numbers: [...numbers].sort((a, b) => a - b),
                stars: [], // Mega-Sena doesn't have stars
                numbersDrawOrder: numbersDrawOrder,
                starsDrawOrder: [],
                jackpot: data.valorEstimadoProximoConcurso || 0,
                hasWinner: !data.acumulado,
                concurso: data.numero
            };
        } catch (error) {
            console.error('Error fetching MegaSena:', error);
            throw error;
        }
    }

    async updateDatabase(force: boolean = false): Promise<boolean> {
        try {
            // We could add gap filling here for Mega-Sena if needed in the future
            let gapFilledCount = 0;

            const latestDraw = await this.fetchLatest();
            const drawDate = new Date(latestDraw.date.split('T')[0] + "T12:00:00Z");
            const startOfDay = new Date(latestDraw.date.split('T')[0] + "T00:00:00Z");
            const endOfDay = new Date(latestDraw.date.split('T')[0] + "T23:59:59Z");

            const existing = await prisma.draw.findFirst({
                where: {
                    game: 'MEGASENA',
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
            });

            if (!existing || gapFilledCount > 0) {
                let newDrawId = existing?.id;

                if (!existing) {
                    const newDraw = await prisma.draw.create({
                        data: {
                            game: 'MEGASENA',
                            sequenceNumber: latestDraw.concurso,
                            date: drawDate,
                            numbers: JSON.stringify(latestDraw.numbers),
                            stars: JSON.stringify(latestDraw.stars),
                            numbersDrawOrder: JSON.stringify(latestDraw.numbersDrawOrder),
                            starsDrawOrder: JSON.stringify(latestDraw.starsDrawOrder),
                            jackpot: latestDraw.jackpot,
                            hasWinner: latestDraw.hasWinner,
                        },
                    });
                    newDrawId = newDraw.id;
                    console.log(`🎲 [MegaSena] New draw added for ${latestDraw.date} (Concurso: Ref{${latestDraw.concurso}})`);
                }

                if (newDrawId && !existing) {
                    await evaluateDraw(newDrawId);
                    await evaluateDrawStars(newDrawId);
                }

                await updateRanking();
                await cachePredictions();
                await updateAllStatisticsCache();

                return true;
            } else {
                console.log(`ℹ️ [MegaSena] Draw ${latestDraw.date} already exists.`);
                return false;
            }
        } catch (error) {
            console.error('Failed to update MegaSena database:', error);
            return false;
        }
    }

    async seedFromArchive(year: number): Promise<number> {
        // Will be implemented later via a scraper script
        return 0;
    }
}
