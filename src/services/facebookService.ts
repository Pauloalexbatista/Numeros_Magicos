import { prisma } from '@/lib/prisma';

export class FacebookService {
    private static get PAGE_ID(): string | undefined { return process.env.FACEBOOK_PAGE_ID; }
    private static get PAGE_ACCESS_TOKEN(): string | undefined { return process.env.FACEBOOK_PAGE_ACCESS_TOKEN; }

    // Emojis por jogo (unicode escapes para evitar problemas de encoding)
    private static readonly EMJ: Record<string, string> = {
        'MEGASENA':     '\uD83C\uDFB2 \uD83C\uDFB1', // ðŸŽ² ðŸŽ±
        'EUROMILLIONS': '\u2B50 \uD83C\uDF1F',         // â­ ðŸŒŸ
        'TOTOLOTO':     '\uD83C\uDFAF \uD83D\uDCB0',  // ðŸŽ¯ ðŸ’°
        'EURODREAMS':   '\uD83C\uDF19 \uD83C\uDF20'   // ðŸŒ™ ðŸŒ 
    };

    // Nomes completos dos jogos
    private static readonly GAME_NAMES: Record<string, string> = {
        'MEGASENA':     'Mega-Sena',
        'EUROMILLIONS': 'Euromilh\u00F5es',
        'TOTOLOTO':     'Totoloto',
        'EURODREAMS':   'EuroDreams'
    };

    /**
     * Publica os resultados de um novo sorteio no Facebook (Post Tipo A)
     */
    static async publishDrawResult(drawId: number): Promise<boolean> {
        try {
            if (!this.PAGE_ID || !this.PAGE_ACCESS_TOKEN) {
                console.warn('[FacebookService] PAGE_ID ou PAGE_ACCESS_TOKEN n\u00E3o configurados.');
                return false;
            }

            const draw = await prisma.draw.findUnique({ where: { id: drawId } });

            if (!draw) {
                console.error(`[FacebookService] Sorteio ${drawId} n\u00E3o encontrado.`);
                return false;
            }

            const gameKey = draw.game.toUpperCase();
            const emojis  = this.EMJ[gameKey]       || '\uD83C\uDF1F';
            const gameName = this.GAME_NAMES[gameKey] || draw.game;

            const dateObj       = new Date(draw.date);
            const formattedDate = dateObj.toLocaleDateString('pt-PT', {
                weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
            });

            const numbers: number[] = JSON.parse(draw.numbers);
            const stars:   number[] = JSON.parse(draw.stars);

            let message = `${emojis} Resultados do Sorteio do ${gameName} ${emojis}\n`;
            message += `\uD83D\uDCC5 Data: ${formattedDate}\n\n`;

            message += `\uD83D\uDD22 N\u00FAmeros Sorteados: ${numbers.join(' \u2022 ')}\n`;

            if (stars.length > 0) {
                const starLabel = gameKey === 'EURODREAMS' ? 'N\u00BA de Sonho' : 'Estrelas';
                const starEmoji = gameKey === 'EURODREAMS' ? '\uD83D\uDCA4' : '\u2B50';
                message += `${starEmoji} ${starLabel}: ${stars.join(' \u2022 ')}\n`;
            }

            message += '\n';

            if (draw.jackpot && draw.jackpot > 0) {
                let jackpotStr: string;
                if (gameKey === 'MEGASENA') {
                    jackpotStr = `R$ ${draw.jackpot.toLocaleString('pt-BR')}`;
                } else if (gameKey === 'EURODREAMS') {
                    jackpotStr = '20.000\u20AC/m\u00EAs durante 30 anos';
                } else {
                    jackpotStr = `${draw.jackpot.toLocaleString('pt-PT')} \u20AC`;
                }
                message += `\uD83D\uDCB0 Pr\u00E9mio: ${jackpotStr}\n`;
            }

            if (draw.sequenceNumber) {
                message += `\uD83C\uDFC6 Concurso n\u00BA: ${draw.sequenceNumber}\n`;
            }

            message += `\uD83D\uDD14 ${draw.hasWinner ? 'H\u00E1 vencedor(es)!' : 'Acumulou!'}\n\n`;
            message += `\uD83D\uDC49 Consulte as an\u00E1lises e previs\u00F5es detalhadas em:\nhttps://numerosmagicos.com`;

            console.log(`[FacebookService] A publicar resultado do ${gameName} (ID: ${drawId})...`);
            return await this.sendPost(message);

        } catch (error) {
            console.error('[FacebookService] Erro em publishDrawResult:', error);
            return false;
        }
    }

    /**
     * Verifica se algum sistema acertou o jackpot e publica (Post Tipo B)
     * Verifica tanto acertos de NÃšMEROS como de ESTRELAS/SONHOS
     */
    static async publishJackpotPerformances(drawId: number): Promise<number> {
        try {
            if (!this.PAGE_ID || !this.PAGE_ACCESS_TOKEN) {
                console.warn('[FacebookService] PAGE_ID ou PAGE_ACCESS_TOKEN n\u00E3o configurados.');
                return 0;
            }

            const gameKeyQuery = (await prisma.draw.findUnique({ where: { id: drawId }, select: { game: true } }))?.game?.toUpperCase();
            if (!gameKeyQuery) {
                console.error(`[FacebookService] Sorteio ${drawId} n\u00E3o encontrado.`);
                return 0;
            }

            // Buscar sorteio com performances filtradas por jogo (evitar falsos positivos)
            const draw = await prisma.draw.findUnique({
                where: { id: drawId },
                include: {
                    systemPerformances: { where: { game: gameKeyQuery } },
                    starPerformances:   { where: { game: gameKeyQuery } }
                }
            });

            if (!draw) {
                console.error(`[FacebookService] Sorteio ${drawId} n\u00E3o encontrado.`);
                return 0;
            }

            const gameKey  = draw.game.toUpperCase();
            const emojis   = this.EMJ[gameKey]        || '\uD83C\uDF1F';
            const gameName = this.GAME_NAMES[gameKey]  || draw.game;
            const formattedDate = new Date(draw.date).toLocaleDateString('pt-PT');
            const actualNumbers: number[] = JSON.parse(draw.numbers);
            const actualStars:   number[] = JSON.parse(draw.stars || '[]');

            // â”€â”€ Limiares por jogo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // NÃºmeros:  EuroDreams=6, MegaSena=6, Totoloto=6, EuroMillions=5
            const numberThreshold = (gameKey === 'EURODREAMS' || gameKey === 'MEGASENA') ? 6 : 5;
            // Estrelas: EuroDreams=1 sonho, EuroMillions=2 estrelas, Totoloto=1 nÃºmero sorte
            const starThreshold   = (gameKey === 'EUROMILLIONS') ? 2 : 1;

            // â”€â”€ Jackpots de NÃšMEROS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            const numberJackpots = draw.systemPerformances.filter(p => p.hits === numberThreshold);
            // â”€â”€ Jackpots de ESTRELAS / SONHOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            const starJackpots   = draw.starPerformances.filter(p => p.hits === starThreshold);

            const totalJackpots = numberJackpots.length + starJackpots.length;

            if (totalJackpots === 0) {
                console.log(`[FacebookService] Nenhum jackpot para sorteio ${drawId} (${gameName}).`);
                return 0;
            }

            console.log(`[FacebookService] ${numberJackpots.length} jackpot(s) de n\u00FAmeros + ${starJackpots.length} jackpot(s) de estrelas/sonhos!`);

            let publishedCount = 0;

            // â”€â”€ Publicar jackpots de NÃšMEROS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            for (const perf of numberJackpots) {
                const allPredicted: number[] = JSON.parse(perf.predictedNumbers);
                const predCount        = gameKey === 'EURODREAMS' ? 20 : gameKey === 'MEGASENA' ? 30 : 25;
                const suggestedNumbers = allPredicted.slice(0, predCount);
                const hitNumbers       = actualNumbers.filter(n => suggestedNumbers.includes(n));

                let message = `\uD83C\uDFC6 JACKPOT! Sistema "${perf.systemName}" acertou tudo! \uD83C\uDFC6\n`;
                message += `${emojis} ${gameName} \u2022 ${formattedDate} ${emojis}\n\n`;
                message += `\uD83D\uDD22 N\u00FAmeros sugeridos pelo sistema (${predCount} de ${gameKey === 'EURODREAMS' ? 40 : gameKey === 'MEGASENA' ? 60 : gameKey === 'TOTOLOTO' ? 49 : 50}):\n`;
                message += `${suggestedNumbers.join(', ')}\n\n`;
                message += `\u2705 N\u00FAmeros ACERTADOS (${perf.hits}/${numberThreshold}):\n`;
                message += `\uD83C\uDF1F ${hitNumbers.join(' \u2022 ')}\n\n`;
                message += `\uD83D\uDC49 Acompanhe as previs\u00F5es em: https://numerosmagicos.com`;

                console.log(`[FacebookService] Jackpot n\u00FAmeros: ${perf.systemName}...`);
                const success = await this.sendPost(message);
                if (success) publishedCount++;
            }

            // â”€â”€ Publicar jackpots de ESTRELAS / SONHOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            for (const perf of starJackpots) {
                const allPredicted: number[] = JSON.parse(perf.predictedStars);
                const hitStars = actualStars.filter(n => allPredicted.includes(n));

                const starLabel    = gameKey === 'EURODREAMS' ? 'Sonho' : gameKey === 'TOTOLOTO' ? 'N\u00BA da Sorte' : 'Estrelas';
                const starEmoji    = gameKey === 'EURODREAMS' ? '\uD83D\uDCA4' : '\u2B50';

                let message = `\uD83C\uDFC6 JACKPOT de ${starLabel}! Sistema "${perf.systemName}" acertou! \uD83C\uDFC6\n`;
                message += `${emojis} ${gameName} \u2022 ${formattedDate} ${emojis}\n\n`;
                message += `${starEmoji} ${starLabel} sugerido: ${allPredicted.join(', ')}\n`;
                message += `\u2705 ${starLabel} ACERTADO: ${hitStars.join(' \u2022 ')} (${perf.hits}/${starThreshold})\n\n`;
                message += `\uD83D\uDC49 Acompanhe as previs\u00F5es em: https://numerosmagicos.com`;

                console.log(`[FacebookService] Jackpot ${starLabel}: ${perf.systemName}...`);
                const success = await this.sendPost(message);
                if (success) publishedCount++;
            }

            return publishedCount;

        } catch (error) {
            console.error('[FacebookService] Erro em publishJackpotPerformances:', error);
            return 0;
        }
    }
    /**
     * Envia POST para a Facebook Graph API
     */
    private static async sendPost(message: string): Promise<boolean> {
        try {
            const url = `https://graph.facebook.com/v20.0/${this.PAGE_ID}/feed`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.PAGE_ACCESS_TOKEN}`
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json() as any;

            if (!response.ok || data.error) {
                console.error('[FacebookService] Erro Graph API:', JSON.stringify(data));
                return false;
            }

            console.log(`[FacebookService] Publicado com sucesso! Post ID: ${data.id}`);
            return true;
        } catch (error) {
            console.error('[FacebookService] Erro de rede em sendPost:', error);
            return false;
        }
    }
}

