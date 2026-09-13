import { prisma } from '@/lib/prisma';
import { FacebookCardGenerator } from './facebookCardGenerator';

export class FacebookService {
    private static readonly PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    private static readonly PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    /**
     * Publica o resultado do sorteio (Post Tipo A)
     */
    static async publishDrawResult(drawId: number): Promise<boolean> {
        try {
            if (!this.PAGE_ID || !this.PAGE_ACCESS_TOKEN) {
                console.warn('[FacebookService] PAGE_ID ou PAGE_ACCESS_TOKEN não configurados.');
                return false;
            }

            const draw = await prisma.draw.findUnique({
                where: { id: drawId }
            });

            if (!draw) {
                console.error(`[FacebookService] Sorteio ${drawId} não encontrado.`);
                return false;
            }

            const gameKey = draw.game.toUpperCase();
            const numbers: number[] = JSON.parse(draw.numbers);
            const stars: number[] = JSON.parse(draw.stars);

            const gameNames: Record<string, string> = {
                EUROMILLIONS: 'Euromilhões',
                EURODREAMS: 'EuroDreams',
                TOTOLOTO: 'Totoloto',
                MEGASENA: 'Mega-Sena'
            };

            const gameEmojis: Record<string, string> = {
                EUROMILLIONS: '⭐ 💰',
                EURODREAMS: '💤 🌟',
                TOTOLOTO: '🎯 💰',
                MEGASENA: '🎲 🎱'
            };

            const gameName = gameNames[gameKey] || draw.game;
            const emojis = gameEmojis[gameKey] || '🎉';

            console.log(`[FacebookService] A publicar resultado do ${gameName} (ID: ${drawId})...`);

            const dateOptions: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: 'Europe/Lisbon'
            };
            const formattedDate = new Intl.DateTimeFormat('pt-PT', dateOptions).format(new Date(draw.date));

            let message = `${emojis} Resultados do Sorteio do ${gameName} ${emojis}\n`;
            message += `📅 Data: ${formattedDate}\n\n`;
            message += `🔢 Números Sorteados: ${numbers.join(' • ')}\n`;

            if (stars && stars.length > 0) {
                const starLabel = gameKey === 'EURODREAMS' ? 'Sonho' : gameKey === 'TOTOLOTO' ? 'Estrelas' : 'Estrelas';
                const starEmoji = gameKey === 'EURODREAMS' ? '💤' : '⭐';
                message += `${starEmoji} ${starLabel}: ${stars.join(' • ')}\n`;
            }

            if (draw.jackpot && draw.jackpot > 0) {
                const formattedJackpot = gameKey === 'MEGASENA'
                    ? `R$ ${draw.jackpot.toLocaleString('pt-BR')}`
                    : `${draw.jackpot.toLocaleString('pt-PT')} €`;
                message += `\n💰 Prémio: ${formattedJackpot}\n`;
            } else {
                message += `\n🔔 Acumulou!\n`;
            }

            message += `\n👉 Consulte as análises e previsões gratuitamente em:\nhttps://numerosmagicos.com`;

            // Gerar imagem do cartão visual do sorteio
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
     * Verifica tanto acertos de NÚMEROS como de ESTRELAS/SONHOS
     */
    static async publishJackpotPerformances(drawId: number): Promise<number> {
        try {
            if (!this.PAGE_ID || !this.PAGE_ACCESS_TOKEN) {
                console.warn('[FacebookService] PAGE_ID ou PAGE_ACCESS_TOKEN não configurados.');
                return 0;
            }

            const gameKeyQuery = (await prisma.draw.findUnique({ where: { id: drawId }, select: { game: true } }))?.game?.toUpperCase();
            if (!gameKeyQuery) {
                console.error(`[FacebookService] Sorteio ${drawId} não encontrado.`);
                return 0;
            }

            // Buscar sorteio com performances filtradas por jogo (evitar falsos positivos)
            const draw = await prisma.draw.findUnique({
                where: { id: drawId },
                include: {
                    systemPredictions: {
                        where: { game: gameKeyQuery }
                    }
                }
            });

            if (!draw) {
                console.error(`[FacebookService] Sorteio ${drawId} não encontrado.`);
                return 0;
            }

            const gameKey = draw.game.toUpperCase();
            const actualNumbers: number[] = JSON.parse(draw.numbers);
            const actualStars: number[] = JSON.parse(draw.stars);

            const gameNames: Record<string, string> = {
                EUROMILLIONS: 'Euromilhões',
                EURODREAMS: 'EuroDreams',
                TOTOLOTO: 'Totoloto',
                MEGASENA: 'Mega-Sena'
            };

            const gameEmojis: Record<string, string> = {
                EUROMILLIONS: '⭐ 💰',
                EURODREAMS: '💤 🌟',
                TOTOLOTO: '🎯 💰',
                MEGASENA: '🎲 🎱'
            };

            const gameName = gameNames[gameKey] || draw.game;
            const emojis = gameEmojis[gameKey] || '🎉';

            // Critérios de acerto total por jogo
            // Números:  EuroDreams=6, MegaSena=6, Totoloto=5, EuroMillions=5
            // Estrelas: EuroDreams=1, Totoloto=1, EuroMillions=2
            const numberThreshold = (gameKey === 'EURODREAMS' || gameKey === 'MEGASENA') ? 6 : 5;
            const starThreshold   = gameKey === 'EUROMILLIONS' ? 2 : 1;

            const systemPredictions = draw.systemPredictions || [];

            // Filtrar jackpots de NÚMEROS
            // Totoloto/Euromilhões: num_hits_25; EuroDreams: num_hits_20; MegaSena: num_hits_30
            const numberJackpots = systemPredictions.filter(p => {
                if (p.domain !== "NUMBERS") return false;
                if (gameKey === 'EURODREAMS') return p.num_hits_20 === numberThreshold;
                if (gameKey === 'MEGASENA')   return p.num_hits_30 === numberThreshold;
                return p.num_hits_25 === numberThreshold;
            });

            // Filtrar jackpots de ESTRELAS/SONHOS
            // Totoloto/EuroDreams: star_hits_2 (avaliado no Top 2); EuroMillions: star_hits_4 (avaliado no Top 4)
            const starJackpots = systemPredictions.filter(p => {
                if (p.domain !== "STARS") return false;
                if (gameKey === 'EUROMILLIONS') return p.star_hits_4 === starThreshold;
                return p.star_hits_2 === starThreshold;
            });

            const totalJackpots = numberJackpots.length + starJackpots.length;

            if (totalJackpots === 0) {
                console.log(`[FacebookService] Nenhum jackpot para sorteio ${drawId} (${gameName}).`);
                return 0;
            }

            console.log(`[FacebookService] ${numberJackpots.length} jackpot(s) de números + ${starJackpots.length} jackpot(s) de estrelas/sonhos!`);

            const dateOptions: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: 'Europe/Lisbon'
            };
            const formattedDate = new Intl.DateTimeFormat('pt-PT', dateOptions).format(new Date(draw.date));

            let publishedCount = 0;

            // ─── Publicar jackpots de NÚMEROS ──────────────────────────────────────────
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

            // ─── Publicar jackpots de ESTRELAS / SONHOS ──────────────────────────────
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
     * Envia POST para a Facebook Graph API.
     * Se imageBuffer for fornecido, publica através do endpoint /photos.
     * Caso contrário ou se falhar, publica através do feed de texto simples.
     */
    static async sendPost(message: string, imageBuffer?: Buffer | null): Promise<boolean> {
        try {
            // Se estiver em ambiente local (sem COOLIFY_APP_ID ou COOLIFY) e não for explicitamente forçado
            const isProduction = !!process.env.COOLIFY_APP_ID || process.env.COOLIFY === 'true' || process.env.NODE_ENV === 'production';
            const forceLive = process.env.FACEBOOK_FORCE_LIVE === 'true';

            if (!isProduction && !forceLive) {
                console.log(`[FacebookService] 🛡️ DRY RUN (Local): Post NÃO enviado ao Facebook live (buffer: ${imageBuffer ? imageBuffer.length : 0} bytes):\n---\n${message}\n---`);
                return true;
            }

            // 1. Tentar upload de imagem (endpoint /photos) se houver buffer de imagem
            if (imageBuffer && imageBuffer.length > 0) {
                try {
                    console.log(`[FacebookService] A enviar cartão gráfico (${imageBuffer.length} bytes) para o Facebook...`);
                    const formData = new FormData();
                    const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
                    formData.append('source', blob, 'cartao-resultado.png');
                    formData.append('caption', message);
                    formData.append('access_token', this.PAGE_ACCESS_TOKEN!);

                    const photoUrl = `https://graph.facebook.com/v20.0/${this.PAGE_ID}/photos`;
                    const photoResponse = await fetch(photoUrl, {
                        method: 'POST',
                        body: formData
                    });

                    const photoData = await photoResponse.json() as any;

                    if (photoResponse.ok && !photoData.error) {
                        console.log(`[FacebookService] Foto publicada com sucesso! ID: ${photoData.post_id || photoData.id}`);
                        return true;
                    }

                    console.warn('[FacebookService] Erro ao enviar foto para Graph API. Detalhes:', JSON.stringify(photoData));
                    console.log('[FacebookService] A tentar fallback em post de texto no feed...');
                } catch (photoErr) {
                    console.warn('[FacebookService] Falha na chamada da foto. A recorrer a texto simples:', photoErr);
                }
            }

            // 2. Fallback: Publicação de texto simples no feed
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

            console.log(`[FacebookService] Publicado com sucesso no feed! Post ID: ${data.id}`);
            return true;
        } catch (error) {
            console.error('[FacebookService] Erro de rede em sendPost:', error);
            return false;
        }
    }
}
