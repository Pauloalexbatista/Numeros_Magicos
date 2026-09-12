import { FacebookCardGenerator } from './facebookCardGenerator';
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
            message += `\uD83D\uDC49 Consulte as an\u00E1lises e previs\u00F5es gratuitamente em:\nhttps://numerosmagicos.com`;

            console.log(`[FacebookService] A publicar resultado do ${gameName} (ID: ${drawId})...`);
                        let cardBuffer: Buffer | null = null;
            try {
                cardBuffer = await FacebookCardGenerator.generateDrawCard({
                    gameKey,
                    gameName,
                    dateFormatted: formattedDate,
                    jackpotText: draw.jackpot ? (gameKey === 'MEGASENA' ? `R$ ${draw.jackpot.toLocaleString('pt-BR')}` : `${draw.jackpot.toLocaleString('pt-PT')} €`) : undefined,
                    sequenceNumber: draw.sequenceNumber ?? undefined,
                    numbers,
                    stars
                });
            } catch (cardErr) {
                console.warn('[FacebookService] Erro ao gerar imagem do sorteio:', cardErr);
            }

            return await this.sendPost(message, cardBuffer);

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
            const systemPredictions = await prisma.systemPrediction.findMany({ where: { drawId: draw.id } });
            const predCount = gameKey === "EURODREAMS" ? 20 : gameKey === "MEGASENA" ? 30 : 25;
            const numberJackpots = systemPredictions.filter(p => p.domain === "NUMBERS" && (p as any)[`num_hits_${predCount}`] === numberThreshold);
            // â”€â”€ Jackpots de ESTRELAS / SONHOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            const starJackpots = systemPredictions.filter(p => p.domain === "STARS" && p[`star_hits_${starThreshold}`] === starThreshold);

            const totalJackpots = numberJackpots.length + starJackpots.length;

            if (totalJackpots === 0) {
                console.log(`[FacebookService] Nenhum jackpot para sorteio ${drawId} (${gameName}).`);
                return 0;
            }

            console.log(`[FacebookService] ${numberJackpots.length} jackpot(s) de n\u00FAmeros + ${starJackpots.length} jackpot(s) de estrelas/sonhos!`);

            let publishedCount = 0;

            // â”€â”€ Publicar jackpots de NÃšMEROS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            for (const perf of numberJackpots) {
                const allPredicted: number[] = JSON.parse(perf.prediction);
                const predCount        = gameKey === 'EURODREAMS' ? 20 : gameKey === 'MEGASENA' ? 30 : 25;
                const suggestedNumbers = allPredicted.slice(0, predCount);
                const hitNumbers       = actualNumbers.filter(n => suggestedNumbers.includes(n));
                const hitsCount        = (perf as any)[`num_hits_${predCount}`] ?? hitNumbers.length;

                const formattedSuggested = suggestedNumbers.map(n => hitNumbers.includes(n) ? `[ 🟢 ${n} ]` : `[ ${n} ]`).join(' ');

                let message = `🏆 JACKPOT! Sistema "${perf.systemName}" acertou tudo! 🏆\n`;
                message += `${emojis} ${gameName} • ${formattedDate} ${emojis}\n\n`;
                message += `🔢 Números sugeridos pelo sistema (${predCount} de ${gameKey === 'EURODREAMS' ? 40 : gameKey === 'MEGASENA' ? 60 : gameKey === 'TOTOLOTO' ? 49 : 50}):\n`;
                message += `${formattedSuggested}\n\n`;
                message += `✅ Números ACERTADOS (${hitsCount}/${numberThreshold}):\n`;
                message += `🌟 ${hitNumbers.join(' • ')}\n\n`;
                message += `👉 Acompanhe as previsões gratuitamente em: https://numerosmagicos.com`;

                console.log(`[FacebookService] Jackpot números: ${perf.systemName}...`);
                                let cardBuffer: Buffer | null = null;
                try {
                    cardBuffer = await FacebookCardGenerator.generateJackpotCard({
                        gameKey,
                        gameName,
                        dateFormatted: formattedDate,
                        systemName: perf.systemName,
                        predCount,
                        totalPool: gameKey === 'EURODREAMS' ? 40 : gameKey === 'MEGASENA' ? 60 : gameKey === 'TOTOLOTO' ? 49 : 50,
                        targetHits: numberThreshold,
                        actualHits: hitsCount,
                        suggestedNumbers,
                        hitNumbers
                    });
                } catch (cardErr) {
                    console.warn('[FacebookService] Erro ao gerar imagem do jackpot de números:', cardErr);
                }

                const success = await this.sendPost(message, cardBuffer);
                if (success) publishedCount++;
            }

            // â”€â”€ Publicar jackpots de ESTRELAS / SONHOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            for (const perf of starJackpots) {
                const allPredicted: number[] = JSON.parse(perf.prediction);
                const starCount = gameKey === 'EUROMILLIONS' ? 4 : 2;
                const suggestedStars = allPredicted.slice(0, starCount);
                const hitStars = actualStars.filter(n => suggestedStars.includes(n));
                const hitsCount = (gameKey === 'EUROMILLIONS' ? perf.star_hits_4 : perf.star_hits_2) ?? hitStars.length;

                const starLabel    = gameKey === 'EURODREAMS' ? 'Sonho' : gameKey === 'TOTOLOTO' ? 'Nº da Sorte' : 'Estrelas';
                const starEmoji    = gameKey === 'EURODREAMS' ? '💤' : '⭐';

                const formattedSuggestedStars = suggestedStars.map(n => hitStars.includes(n) ? `[ 🟢 ${n} ]` : `[ ${n} ]`).join(' ');

                const article = gameKey === "EURODREAMS" ? "do" : gameKey === "TOTOLOTO" ? "do" : "das";
                const labelPlural = gameKey === "EUROMILLIONS" ? "sugeridas" : "sugerido";
                const labelAcertado = gameKey === "EUROMILLIONS" ? "ACERTADAS" : "ACERTADO";
                let message = `🏆 JACKPOT ${article} ${starLabel}! Sistema "${perf.systemName}" acertou! 🏆\n`;
                message += `${emojis} ${gameName} • ${formattedDate} ${emojis}\n\n`;
                message += `${starEmoji} ${starLabel} ${labelPlural}: ${formattedSuggestedStars}\n`;
                message += `✅ ${starLabel} ${labelAcertado}: ${hitStars.join(' • ')} (${hitsCount}/${starThreshold})\n\n`;
                message += `👉 Acompanhe as previsões gratuitamente em: https://numerosmagicos.com`;

                console.log(`[FacebookService] Jackpot ${starLabel}: ${perf.systemName}...`);
                                let cardBuffer: Buffer | null = null;
                try {
                    cardBuffer = await FacebookCardGenerator.generateStarJackpotCard({
                        gameKey,
                        gameName,
                        dateFormatted: formattedDate,
                        systemName: perf.systemName,
                        starLabel,
                        targetHits: starThreshold,
                        actualHits: hitsCount,
                        suggestedStars,
                        hitStars
                    });
                } catch (cardErr) {
                    console.warn('[FacebookService] Erro ao gerar imagem do jackpot de estrelas:', cardErr);
                }

                const success = await this.sendPost(message, cardBuffer);
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
    private static async sendPost(message: string, imageBuffer?: Buffer | null): Promise<boolean> {
        try {
            // Se estiver em ambiente local (sem COOLIFY_APP_ID ou COOLIFY) e não for explicitamente forçado
            const isProduction = !!process.env.COOLIFY_APP_ID || process.env.COOLIFY === 'true' || process.env.NODE_ENV === 'production';
            const forceLive = process.env.FACEBOOK_FORCE_LIVE === 'true';

            if (!isProduction && !forceLive) {
                console.log(`[FacebookService] 🛡️ DRY RUN (Local): Post NÃO enviado ao Facebook live:\n---\n${message}\n---`);
                return true;
            }

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

