import { prisma } from '@/lib/prisma';

export class FacebookService {
    private static readonly PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    private static readonly PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    // Theme emojis based on the game
    private static readonly EMJ: Record<string, string> = {
        'MEGASENA': '🟢 🟡',
        'EUROMILLIONS': '🔵 🟡',
        'TOTOLOTO': '🔴 ⚪',
        'EURODREAMS': '🟣 🌸'
    };

    // Full names of the games
    private static readonly GAME_NAMES: Record<string, string> = {
        'MEGASENA': 'Mega-Sena',
        'EUROMILLIONS': 'Euromilhões',
        'TOTOLOTO': 'Totoloto',
        'EURODREAMS': 'EuroDreams'
    };

    /**
     * Publishes the results of a new draw to Facebook (Type A post)
     */
    static async publishDrawResult(drawId: number): Promise<boolean> {
        try {
            if (!this.PAGE_ID || !this.PAGE_ACCESS_TOKEN) {
                console.warn('[FacebookService] PAGE_ID or PAGE_ACCESS_TOKEN not configured. Skipping result publish.');
                return false;
            }

            const draw = await prisma.draw.findUnique({
                where: { id: drawId }
            });

            if (!draw) {
                console.error(`[FacebookService] Draw ${drawId} not found.`);
                return false;
            }

            const gameKey = draw.game.toUpperCase();
            const emojis = this.EMJ[gameKey] || '🔮';
            const gameName = this.GAME_NAMES[gameKey] || draw.game;
            
            // Format Date (DD/MM/YYYY)
            const dateObj = new Date(draw.date);
            const formattedDate = dateObj.toLocaleDateString('pt-PT');

            // Parse numbers and stars
            const numbers: number[] = JSON.parse(draw.numbers);
            const stars: number[] = JSON.parse(draw.stars);

            let message = `${emojis} **Resultados do Sorteio do ${gameName}** ${emojis}\n`;
            message += `📅 Data: ${formattedDate}\n\n`;
            
            message += `🔮 Números Sorteados: ${numbers.join(' - ')}\n`;
            if (stars.length > 0) {
                const starLabel = gameKey === 'EURODREAMS' ? 'Nº de Sonho' : 'Estrelas';
                message += `👉 ${starLabel}: ${stars.join(' - ')}\n`;
            }
            message += `\n`;

            if (draw.sequenceNumber) {
                message += `👉 Concurso: ${draw.sequenceNumber}\n`;
            }

            if (draw.jackpot) {
                const formattedJackpot = gameKey === 'MEGASENA'
                    ? `R$ ${draw.jackpot.toLocaleString('pt-BR')}`
                    : `${draw.jackpot.toLocaleString('pt-PT')} €`;
                message += `👉 Prémio Estimado: ${formattedJackpot}\n`;
            }

            message += `👉 Vencedores: ${draw.hasWinner ? 'Sim' : 'Acumulou'}\n\n`;
            message += `🔗 Consulte análises detalhadas em: https://numerosmagicos.com`;

            console.log(`[FacebookService] Publishing draw result for ${gameName} (ID: ${drawId})...`);
            return await this.sendPost(message);

        } catch (error) {
            console.error('[FacebookService] Error in publishDrawResult:', error);
            return false;
        }
    }

    /**
     * Checks if any system achieved a perfect jackpot (5/5 or 6/6 hits) and publishes a Type B post for each
     */
    static async publishJackpotPerformances(drawId: number): Promise<number> {
        try {
            if (!this.PAGE_ID || !this.PAGE_ACCESS_TOKEN) {
                console.warn('[FacebookService] PAGE_ID or PAGE_ACCESS_TOKEN not configured. Skipping jackpot checks.');
                return 0;
            }

            const draw = await prisma.draw.findUnique({
                where: { id: drawId },
                include: {
                    systemPerformances: true
                }
            });

            if (!draw) {
                console.error(`[FacebookService] Draw ${drawId} not found for jackpot check.`);
                return 0;
            }

            const gameKey = draw.game.toUpperCase();
            
            // Jackpot threshold: 6 for Mega-Sena and EuroDreams, 5 for Euromilhões and Totoloto
            const jackpotThreshold = (gameKey === 'MEGASENA' || gameKey === 'EURODREAMS') ? 6 : 5;

            // Filter performances that achieved perfect hits
            const jackpotPerformances = draw.systemPerformances.filter(p => p.hits === jackpotThreshold);

            if (jackpotPerformances.length === 0) {
                console.log(`[FacebookService] No jackpot performances found for draw ${drawId} (Threshold: ${jackpotThreshold}).`);
                return 0;
            }

            console.log(`[FacebookService] Found ${jackpotPerformances.length} jackpot performance(s) to publish!`);

            const emojis = this.EMJ[gameKey] || '🔮';
            const gameName = this.GAME_NAMES[gameKey] || draw.game;
            const dateObj = new Date(draw.date);
            const formattedDate = dateObj.toLocaleDateString('pt-PT');
            const actualNumbers: number[] = JSON.parse(draw.numbers);

            let publishedCount = 0;

            for (const perf of jackpotPerformances) {
                // Parse full predicted list and slice to standard evaluation length
                const allPredicted: number[] = JSON.parse(perf.predictedNumbers);
                const defaultPredCount = (gameKey === 'EURODREAMS') ? 20 : (gameKey === 'MEGASENA' ? 30 : 25);
                const suggestedNumbers = allPredicted.slice(0, defaultPredCount);

                // Find hit numbers (should be all actual numbers for a jackpot)
                const hitNumbers = actualNumbers.filter(n => suggestedNumbers.includes(n));

                let message = `🎯 **JACKPOT DO SISTEMA: ${perf.systemName}** 🎯\n`;
                message += `${emojis} **Acerto Total no Sorteio do ${gameName} de ${formattedDate}!** ${emojis}\n\n`;

                message += `🔮 Números Sugeridos pelo Sistema:\n`;
                message += `${suggestedNumbers.join(', ')}\n\n`;

                message += `🌟 Números ACERTADOS:\n`;
                message += `✅ ${hitNumbers.join(', ')} (Total: ${perf.hits} acertos perfeitos!)\n\n`;

                message += `🔗 Acompanhe as previsões deste sistema para o próximo concurso em: https://numerosmagicos.com`;

                console.log(`[FacebookService] Publishing jackpot post for system ${perf.systemName}...`);
                const success = await this.sendPost(message);
                if (success) {
                    publishedCount++;
                }
            }

            return publishedCount;

        } catch (error) {
            console.error('[FacebookService] Error in publishJackpotPerformances:', error);
            return 0;
        }
    }

    /**
     * Helper to make POST request to Facebook Graph API
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
                body: JSON.stringify({
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok || (data as any).error) {
                console.error('[FacebookService] Graph API error:', JSON.stringify(data));
                return false;
            }

            console.log(`[FacebookService] Posted successfully! Post ID: ${(data as any).id}`);
            return true;
        } catch (error) {
            console.error('[FacebookService] Network/Request error in sendPost:', error);
            return false;
        }
    }
}
