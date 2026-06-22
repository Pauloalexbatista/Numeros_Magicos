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
    private readonly BASE_URL = 'https://loteriascaixa-api.herokuapp.com/api/megasena/latest';

    async fetchLatest(): Promise<DrawData> {
        try {
            const agent = new https.Agent({ rejectUnauthorized: false });
            const response = await fetch(this.BASE_URL, {
                // @ts-ignore
                agent: agent,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();

            // data format: DD/MM/YYYY
            const dateParts = data.data.split('/');
            const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // YYYY-MM-DD

            const numbers = data.dezenas.map((n: string | number) => typeof n === 'string' ? parseInt(n) : n);
            const numbersDrawOrder = data.dezenasOrdemSorteio.map((n: string | number) => typeof n === 'string' ? parseInt(n) : n);

            return {
                date: isoDate,
                numbers,
                stars: [], // Mega-Sena doesn't have stars
                numbersDrawOrder,
                starsDrawOrder: [],
                jackpot: data.valorEstimadoProximoConcurso || 0,
                hasWinner: !data.acumulou,
                concurso: data.concurso
            };
        } catch (error) {
            console.error('Error fetching MegaSena:', error);
            throw error;
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
                    console.log(`???? [MegaSena] New draw added for ${latestDraw.date}`);
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
                console.log(`?? [MegaSena] Draw ${latestDraw.date} already exists.`);
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
