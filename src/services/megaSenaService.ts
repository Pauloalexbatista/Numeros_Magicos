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
            return this.parseDrawData(data);
        } catch (error) {
            console.warn('[MegaSena] Official Caixa API failed. Trying fallback GitHub API...', error.message || error);
            try {
                const fallbackResponse = await fetch('https://raw.githubusercontent.com/maickon/free-apiloterias/refs/heads/master/database/megasena/_ultimo.json', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    }
                });

                if (!fallbackResponse.ok) {
                    throw new Error(`Fallback API failed: ${fallbackResponse.statusText}`);
                }

                const fallbackData = await fallbackResponse.json();
                console.log('[MegaSena] Fallback request successful. Parsing data...');
                return this.parseDrawData(fallbackData);
            } catch (fallbackError) {
                console.error('[MegaSena] Both official API and fallback API failed:', fallbackError.message || fallbackError);
                throw fallbackError;
            }
        }
    }

    private parseDrawData(data: any): DrawData {
        // Format A: Official Caixa API format (also used by recent free-apiloterias raw files)
        if (data.dataApuracao && data.listaDezenas) {
            const dateParts = data.dataApuracao.split('/');
            const isoDate = `${dateParts[2]}-\d{2}-\d{2}`.includes('-') ? '' : `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            const finalIsoDate = isoDate || `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            const numbers = data.listaDezenas.map((n: string) => parseInt(n));
            const numbersDrawOrder = data.dezenasSorteadasOrdemSorteio 
                ? data.dezenasSorteadasOrdemSorteio.map((n: string) => parseInt(n)) 
                : [...numbers];

            return {
                date: finalIsoDate,
                numbers: [...numbers].sort((a, b) => a - b),
                stars: [],
                numbersDrawOrder: numbersDrawOrder,
                starsDrawOrder: [],
                jackpot: data.valorEstimadoProximoConcurso || 0,
                hasWinner: !data.acumulado,
                concurso: data.numero
            };
        }
        // Format B: Older free-apiloterias custom format
        else if (data.data && data.dezenas) {
            const dateParts = data.data.split('/');
            const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            const numbers = data.dezenas.map((n: string) => parseInt(n));
            let jackpot = 0;
            if (data.valorEstimadoProxConcurso) {
                const cleanedJackpot = typeof data.valorEstimadoProxConcurso === 'string'
                    ? data.valorEstimadoProxConcurso.replace(/\./g, '').replace(',', '.')
                    : data.valorEstimadoProxConcurso;
                jackpot = parseFloat(cleanedJackpot) || 0;
            }

            return {
                date: isoDate,
                numbers: [...numbers].sort((a, b) => a - b),
                stars: [],
                numbersDrawOrder: numbers,
                starsDrawOrder: [],
                jackpot: jackpot || 0,
                hasWinner: !data.acumulou,
                concurso: data.concurso
            };
        } else {
            throw new Error('Unknown Mega-Sena data format: ' + JSON.stringify(data).substring(0, 100));
        }
    }

    async updateDatabase(force: boolean = false): Promise<boolean> {
        try {
            // We could add gap filling here for Mega-Sena if needed in the future
            let gapFilledCount = 0;

            let isLatestDrawNew = false;
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


            isLatestDrawNew = !existing;

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

                if (newDrawId && isLatestDrawNew) {
                    // 1. Publicar resultado do sorteio imediatamente (Post Tipo A)
                    try {
                        const { FacebookService } = await import('./facebookService');
                        await FacebookService.publishDrawResult(newDrawId);
                    } catch (fbErr) {
                        console.error('[FacebookService] Erro ao publicar resultado do Mega-Sena:', fbErr);
                    }

                    // 2. Avaliar performances dos sistemas
                    await evaluateDraw(newDrawId);
                    await evaluateDrawStars(newDrawId);

                    // 3. Publicar jackpots dos sistemas (Post Tipo B)
                    try {
                        const { FacebookService } = await import('./facebookService');
                        await FacebookService.publishJackpotPerformances(newDrawId);
                    } catch (fbErr) {
                        console.error('[FacebookService] Erro ao publicar jackpots do Mega-Sena:', fbErr);
                    }
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
