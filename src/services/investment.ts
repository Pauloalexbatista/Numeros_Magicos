
import { Draw } from '@/models/types';
import { FullKey } from './wheeling';
import { getRulesForDate, isValidKeyForDate } from './rules';

export interface InvestmentResult {
    totalInvested: number;
    totalWon: number;
    roi: number; // Percentage
    balance: number; // Won - Invested
    bestPrize: {
        tier: string;
        amount: number;
        date: string;
        drawId?: number;
    } | null;
    history: InvestmentHistoryPoint[];
    winCounts: { [tier: string]: number };
}

export interface InvestmentHistoryPoint {
    date: string;
    balance: number; // Cumulative balance
    dailyProfit: number; // Won - Invested for that day
}

// Estimated Prize Values (when real data is missing)
// Based on average EuroMillions payouts
export const ESTIMATED_PRIZES: { [key: string]: number } = {
    '5+2': 50_000_000, // Fallback if jackpot missing
    '5+1': 200_000,
    '5+0': 20_000,
    '4+2': 1_500,
    '4+1': 120,
    '3+2': 60,
    '4+0': 40,
    '2+2': 15,
    '3+1': 10,
    '3+0': 9,
    '1+2': 7,
    '2+1': 5,
    '2+0': 4,
};

export const TIER_ORDER = [
    '5+2', '5+1', '5+0', '4+2', '4+1', '3+2', '4+0', '2+2', '3+1', '3+0', '1+2', '2+1', '2+0'
];

export function getTier(n: number, s: number): string | null {
    const key = `${n}+${s}`;
    if (ESTIMATED_PRIZES[key] !== undefined) return key;
    return null;
}

export function calculateROI(
    keys: FullKey[],
    history: Draw[],
    costPerBetOverride?: number,
    startDate?: Date,
    endDate?: Date
): InvestmentResult {
    // Filter history by date range
    const relevantDraws = history.filter(d => {
        const drawDate = new Date(d.date);
        if (startDate && drawDate < startDate) return false;
        if (endDate && drawDate > endDate) return false;
        return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ascending order for chart

    let totalInvested = 0;
    let totalWon = 0;
    let cumulativeBalance = 0;
    let bestPrize: { tier: string; amount: number; date: string; drawId?: number } = { tier: '', amount: 0, date: '' };
    const winCounts: { [tier: string]: number } = {};
    const chartHistory: InvestmentHistoryPoint[] = [];

    // Initialize win counts
    TIER_ORDER.forEach(t => winCounts[t] = 0);

    // Iterate through draws
    for (const draw of relevantDraws) {
        const drawDateStr = new Date(draw.date).toISOString().split('T')[0];
        const drawNumbers = draw.numbers;
        const drawStars = draw.stars;

        // Determine Cost
        const rules = getRulesForDate(draw.date);
        const cost = costPerBetOverride !== undefined ? costPerBetOverride : rules.costPerBet;

        // Filter valid keys for this epoch
        const validKeys = keys.filter(k => isValidKeyForDate(k.numbers, k.stars, draw.date));

        const dailyCost = validKeys.length * cost;
        totalInvested += dailyCost;

        let dailyWinnings = 0;

        // Check each valid key
        for (const key of validKeys) {
            const nMatches = key.numbers.filter(n => drawNumbers.includes(n)).length;
            const sMatches = key.stars.filter(s => drawStars.includes(s)).length;

            const tier = getTier(nMatches, sMatches);

            if (tier) {
                winCounts[tier]++;
                let prizeAmount = 0;

                // Use real jackpot if available and tier is 5+2
                if (tier === '5+2' && (draw as any).jackpot) {
                    prizeAmount = (draw as any).jackpot;
                } else {
                    prizeAmount = ESTIMATED_PRIZES[tier];
                }

                dailyWinnings += prizeAmount;

                // Update best prize
                if (prizeAmount > bestPrize.amount) {
                    bestPrize = {
                        tier,
                        amount: prizeAmount,
                        date: drawDateStr,
                        drawId: (draw as any).id
                    };
                }
            }
        }

        totalWon += dailyWinnings;
        cumulativeBalance += (dailyWinnings - dailyCost);

        chartHistory.push({
            date: drawDateStr,
            balance: cumulativeBalance,
            dailyProfit: dailyWinnings - dailyCost
        });
    }

    const roi = totalInvested > 0 ? ((totalWon - totalInvested) / totalInvested) * 100 : 0;

    return {
        totalInvested,
        totalWon,
        roi,
        balance: totalWon - totalInvested,
        bestPrize: bestPrize.amount > 0 ? bestPrize : null,
        history: chartHistory,
        winCounts
    };
}
