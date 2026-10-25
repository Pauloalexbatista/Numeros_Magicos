import { IGameService } from './interfaces/gameService';
import { prisma } from '@/lib/prisma';
import { evaluateDraw } from './evaluationService';
import { updateAllStatisticsCache } from './cache/statisticsCache';

interface DrawData {
    date: string;
    numbers: number[];
    stars: number[];
    jackpot: number;
    concurso?: number;
}

export class LotofacilService implements IGameService {
    private readonly BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil';

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
        } catch (error: any) {
            console.warn('[Lotofacil] Official Caixa API failed. Trying Fallback 1 (loteriascaixa-api)...', error.message || error);
            try {
                const fb1 = await fetch('https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest', {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (fb1.ok) {
                    const fb1Data = await fb1.json();
                    console.log('[Lotofacil] Fallback 1 (loteriascaixa-api) successful.');
                    return this.parseDrawData(fb1Data);
                }
            } catch (fb1Err) {
                console.warn('[Lotofacil] Fallback 1 failed:', fb1Err);
            }

            throw new Error('[Lotofacil] All APIs failed to fetch latest draw.');
        }
    }

    private parseDrawData(data: any): DrawData {
        // Formato Caixa Oficial
        if (data.dataApuracao && data.listaDezenas) {
            const dateParts = data.dataApuracao.split('/');
            const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            const numbers = data.listaDezenas
                .map((n: string) => parseInt(n, 10))
                .filter((n: number) => !isNaN(n) && n >= 1 && n <= 25)
                .sort((a: number, b: number) => a - b);

            return {
                date: isoDate,
                numbers,
                stars: [],
                jackpot: data.valorEstimadoProximoConcurso || 0,
                concurso: data.numero
            };
        }
        // Formato Fallback LoteriasCaixa API
        else if (data.data && data.dezenas) {
            const dateParts = data.data.split('/');
            const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            const numbers = data.dezenas
                .map((n: string) => parseInt(n, 10))
                .filter((n: number) => !isNaN(n) && n >= 1 && n <= 25)
                .sort((a: number, b: number) => a - b);

            let jackpot = 0;
            if (data.valorEstimadoProximoConcurso || data.valorEstimadoProxConcurso) {
                const val = data.valorEstimadoProximoConcurso || data.valorEstimadoProxConcurso;
                const cleaned = typeof val === 'string' ? val.replace(/\./g, '').replace(',', '.') : val;
                jackpot = parseFloat(cleaned) || 0;
            }

            return {
                date: isoDate,
                numbers,
                stars: [],
                jackpot,
                concurso: data.concurso
            };
        } else {
            throw new Error('[Lotofacil] Unknown data format: ' + JSON.stringify(data).substring(0, 100));
        }
    }

    async updateDatabase(force: boolean = false): Promise<boolean> {
        try {
            const latestDraw = await this.fetchLatest();
            const dateStr = latestDraw.date.split('T')[0];
            const drawDate = new Date(`${dateStr}T20:00:00Z`);
            const startOfDay = new Date(`${dateStr}T00:00:00Z`);
            const endOfDay = new Date(`${dateStr}T23:59:59Z`);

            const existing = await prisma.draw.findFirst({
                where: {
                    game: 'LOTOFACIL',
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            if (!existing || force) {
                let newDrawId = existing?.id;

                if (!existing) {
                    const newDraw = await prisma.draw.create({
                        data: {
                            game: 'LOTOFACIL',
                            sequenceNumber: latestDraw.concurso,
                            date: drawDate,
                            numbers: JSON.stringify(latestDraw.numbers),
                            stars: JSON.stringify([]),
                            numbersDrawOrder: JSON.stringify(latestDraw.numbers),
                            starsDrawOrder: JSON.stringify([]),
                            jackpot: latestDraw.jackpot
                        }
                    });
                    newDrawId = newDraw.id;
                    console.log(`🎲 [Lotofacil] Novo sorteio adicionado para ${latestDraw.date} (Concurso #${latestDraw.concurso})`);
                }

                if (newDrawId) {
                    await evaluateDraw(newDrawId);
                }

                await updateAllStatisticsCache();
                return true;
            } else {
                console.log(`ℹ️ [Lotofacil] Sorteio ${latestDraw.date} já existe na BD.`);
                return false;
            }
        } catch (error) {
            console.error('Falha ao atualizar a Lotofácil:', error);
            return false;
        }
    }

    async seedFromArchive(year: number): Promise<number> {
        return 0;
    }
}
