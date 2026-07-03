import { prisma } from '@/lib/prisma';

export class FacebookService {
    private static readonly PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    private static readonly PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    // Emojis por jogo (unicode escapes para evitar problemas de encoding)
    private static readonly EMJ: Record<string, string> = {
        'MEGASENA':     '\uD83C\uDFB2 \uD83C\uDFB1', // 🎲 🎱
        'EUROMILLIONS': '\u2B50 \uD83C\uDF1F',         // ⭐ 🌟
        'TOTOLOTO':     '\uD83C\uDFAF \uD83D\uDCB0',  // 🎯 💰
        'EURODREAMS':   '\uD83C\uDF19 \uD83C\uDF20'   // 🌙 🌠
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
     */
    static async publishJackpotPerformances(drawId: number): Promise<number> {
        try {
            if (!this.PAGE_ID || !this.PAGE_ACCESS_TOKEN) {
                console.warn('[FacebookService] PAGE_ID ou PAGE_ACCESS_TOKEN n\u00E3o configurados.');
                return 0;
            }

            const draw = await prisma.draw.findUnique({
                where: { id: drawId },
                include: { systemPerformances: true }
            });

            if (!draw) {
                console.error(`[FacebookService] Sorteio ${drawId} n\u00E3o encontrado.`);
                return 0;
            }

            const gameKey = draw.game.toUpperCase();
            // Limiar de jackpot: 6 para Mega-Sena e EuroDreams, 5 para os outros
            const jackpotThreshold = (gameKey === 'MEGASENA' || gameKey === 'EURODREAMS') ? 6 : 5;
            const jackpotPerformances = draw.systemPerformances.filter(p => p.hits === jackpotThreshold);

            if (jackpotPerformances.length === 0) {
                console.log(`[FacebookService] Nenhum jackpot encontrado para sorteio ${drawId}.`);
                return 0;
            }

            console.log(`[FacebookService] ${jackpotPerformances.length} jackpot(s) encontrado(s)!`);

            const emojis        = this.EMJ[gameKey]       || '\uD83C\uDF1F';
            const gameName      = this.GAME_NAMES[gameKey] || draw.game;
            const formattedDate = new Date(draw.date).toLocaleDateString('pt-PT');
            const actualNumbers: number[] = JSON.parse(draw.numbers);

            let publishedCount = 0;

            for (const perf of jackpotPerformances) {
                const allPredicted: number[] = JSON.parse(perf.predictedNumbers);
                const predCount       = gameKey === 'EURODREAMS' ? 20 : gameKey === 'MEGASENA' ? 30 : 25;
                const suggestedNumbers = allPredicted.slice(0, predCount);
                const hitNumbers       = actualNumbers.filter(n => suggestedNumbers.includes(n));

                let message = `\uD83C\uDFC6 JACKPOT DO SISTEMA: ${perf.systemName} \uD83C\uDFC6\n`;
                message += `${emojis} Acerto Total no Sorteio do ${gameName} de ${formattedDate}! ${emojis}\n\n`;
                message += `\uD83D\uDD22 N\u00FAmeros Sugeridos pelo Sistema:\n${suggestedNumbers.join(', ')}\n\n`;
                message += `\u2705 N\u00FAmeros ACERTADOS:\n\uD83C\uDF1F ${hitNumbers.join(', ')} (Total: ${perf.hits} acertos!)\n\n`;
                message += `\uD83D\uDC49 Acompanhe as previs\u00F5es em: https://numerosmagicos.com`;

                console.log(`[FacebookService] A publicar jackpot para sistema ${perf.systemName}...`);
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
