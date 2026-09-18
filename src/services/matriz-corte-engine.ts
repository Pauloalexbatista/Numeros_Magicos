import { prisma } from '@/lib/prisma';

export interface GameConfig {
    name: string;
    totalBalls: number;
    pickSize: number;
    targetEliminate: number;
    tenRanges: { name: string; min: number; max: number }[];
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
    EUROMILLIONS: {
        name: 'Euromilhões',
        totalBalls: 50,
        pickSize: 5,
        targetEliminate: 25,
        tenRanges: [
            { name: '1-10', min: 1, max: 10 },
            { name: '11-20', min: 11, max: 20 },
            { name: '21-30', min: 21, max: 30 },
            { name: '31-40', min: 31, max: 40 },
            { name: '41-50', min: 41, max: 50 },
        ]
    },
    TOTOLOTO: {
        name: 'Totoloto',
        totalBalls: 49,
        pickSize: 5,
        targetEliminate: 24,
        tenRanges: [
            { name: '1-10', min: 1, max: 10 },
            { name: '11-20', min: 11, max: 20 },
            { name: '21-30', min: 21, max: 30 },
            { name: '31-40', min: 31, max: 40 },
            { name: '41-49', min: 41, max: 49 },
        ]
    },
    EURODREAMS: {
        name: 'EuroDreams',
        totalBalls: 40,
        pickSize: 6,
        targetEliminate: 20,
        tenRanges: [
            { name: '1-10', min: 1, max: 10 },
            { name: '11-20', min: 11, max: 20 },
            { name: '21-30', min: 21, max: 30 },
            { name: '31-40', min: 31, max: 40 },
        ]
    },
    MEGASENA: {
        name: 'Mega-Sena',
        totalBalls: 60,
        pickSize: 6,
        targetEliminate: 30,
        tenRanges: [
            { name: '1-10', min: 1, max: 10 },
            { name: '11-20', min: 11, max: 20 },
            { name: '21-30', min: 21, max: 30 },
            { name: '31-40', min: 31, max: 40 },
            { name: '41-50', min: 41, max: 50 },
            { name: '51-60', min: 51, max: 60 },
        ]
    }
};

export interface BallMatrixBreakdown {
    ball: number;
    maxProximityPct: number;
    compositeScore: number;
    matrix1CasasRejected: boolean;
    matrix2DnaAlert: boolean;
    matrix2DnaPattern?: string;
    matrix2DnaOccurrences?: number;
    matrix3DezenaAlert: boolean;
    matrix3DezenaName?: string;
    matrix4JanelasMaxPct: number;
    matrix4JanelaDetails: string[];
    matrix5RitmoMaxPct: number;
    matrix5RitmoDetails: string[];
    reasons: string[];
}

export interface MatrizCorteResult {
    game: string;
    gameName: string;
    totalBalls: number;
    pickSize: number;
    targetEliminate: number;
    drawIndex: number;
    totalDraws: number;
    targetDrawDate?: string;
    previousDraw: number[];
    actualWinningNumbers?: number[];
    jackpotIntact?: boolean;
    winningNumbersCut?: number[];
    winningNumbersSurvived?: number[];
    exact25CutoffPct: number;
    balls: BallMatrixBreakdown[];
    matrixSummary: {
        casasCutsCount: number;
        dnaCutsCount: number;
        dezenasCutsCount: number;
        janelas100CutsCount: number;
        ritmo100CutsCount: number;
    };
    recentDrawsList: { index: number; date: string; numbers: number[] }[];
}

const WINDOWS = [3, 5, 7, 10, 20, 30, 50, 100];

export async function calculateMatrizCorte(
    gameKey: string,
    targetDrawIndex?: number,
    providedDraws?: { id?: number; date: Date | string; numbers: number[] | string }[]
): Promise<MatrizCorteResult> {
    const config = GAME_CONFIGS[gameKey.toUpperCase()] || GAME_CONFIGS.EUROMILLIONS;
    const game = Object.keys(GAME_CONFIGS).find(k => k === gameKey.toUpperCase()) || 'EUROMILLIONS';

    let drawsDb: any[] = providedDraws || [];
    if (!drawsDb || drawsDb.length === 0) {
        drawsDb = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' },
            select: { id: true, date: true, numbers: true }
        });
    }

    if (!drawsDb || drawsDb.length < 15) {
        throw new Error(`Dados insuficientes para o jogo ${game}. Mínimo 15 sorteios.`);
    }

    const allDraws = drawsDb.map((d, idx) => {
        let nums: number[] = [];
        try {
            nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : (Array.isArray(d.numbers) ? d.numbers : []);
        } catch {
            nums = [];
        }
        nums.sort((a: number, b: number) => a - b);
        const dateStr = d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date).slice(0, 10);
        return {
            index: idx + 1,
            date: dateStr,
            numbers: nums
        };
    }).filter(d => d.numbers.length >= config.pickSize);
    const totalDraws = allDraws.length;
    const isPastAudit = targetDrawIndex !== undefined && targetDrawIndex >= 10 && targetDrawIndex <= totalDraws;
    const cutoffDrawIndex = isPastAudit ? targetDrawIndex! - 1 : totalDraws;
    const history = allDraws.slice(0, cutoffDrawIndex);

    if (history.length < 10) {
        throw new Error('Histórico insuficiente para cálculo.');
    }

    const previousDraw = history[history.length - 1].numbers;
    const actualWinningNumbers = isPastAudit ? allDraws[targetDrawIndex! - 1].numbers : undefined;
    const targetDrawDate = isPastAudit ? allDraws[targetDrawIndex! - 1].date : undefined;

    const ballSeries: Record<number, number[]> = {};
    const ballHitIndices: Record<number, number[]> = {};

    for (let b = 1; b <= config.totalBalls; b++) {
        ballSeries[b] = new Array(history.length).fill(0);
        ballHitIndices[b] = [];
    }

    for (let i = 0; i < history.length; i++) {
        for (const num of history[i].numbers) {
            if (num >= 1 && num <= config.totalBalls) {
                ballSeries[num][i] = 1;
                ballHitIndices[num].push(i);
            }
        }
    }

    // 1. MATRIZ #1: DISPERSÃO POR CASAS (N1 a Nk)
    const houseTransitions: Record<number, Set<number>> = {};
    for (let k = 0; k < config.pickSize; k++) {
        houseTransitions[k] = new Set<number>();
    }

    for (let i = 0; i < history.length - 1; i++) {
        const dCurr = history[i].numbers;
        const dNxt = history[i + 1].numbers;
        for (let k = 0; k < config.pickSize; k++) {
            if (dCurr[k] === previousDraw[k] && dNxt[k] !== undefined) {
                houseTransitions[k].add(dNxt[k]);
            }
        }
    }

    const houseMinBound: Record<number, number> = {};
    const houseMaxBound: Record<number, number> = {};
    for (let k = 0; k < config.pickSize; k++) {
        const physMin = k + 1;
        const physMax = config.totalBalls - (config.pickSize - 1 - k);
        let empMin = config.totalBalls;
        let empMax = 1;
        for (let i = 0; i < history.length; i++) {
            const v = history[i].numbers[k];
            if (v < empMin) empMin = v;
            if (v > empMax) empMax = v;
        }
        houseMinBound[k] = Math.max(physMin, empMin);
        houseMaxBound[k] = Math.min(physMax, empMax);
    }

    // 2. MATRIZ #2: DNA DE ESTADOS (L=6)
    const dnaLength = 6;
    const dnaAlerts: Record<number, { pattern: string; occurrences: number }> = {};

    for (let b = 1; b <= config.totalBalls; b++) {
        const s = ballSeries[b];
        if (s.length >= dnaLength + 5) {
            const currDna = s.slice(s.length - dnaLength).join('');
            let occ = 0;
            let nxt = 0;
            for (let i = 0; i <= s.length - dnaLength - 1; i++) {
                const sub = s.slice(i, i + dnaLength).join('');
                if (sub === currDna) {
                    occ++;
                    if (s[i + dnaLength] === 1) nxt++;
                }
            }
            if (occ >= 5 && nxt === 0) {
                dnaAlerts[b] = { pattern: currDna, occurrences: occ };
            }
        }
    }

    // 3. MATRIZ #3: SATURAÇÃO DE DEZENAS (Coupon Collector)
    const dezenaAlerts: Record<number, string> = {};
    const wRecent = history.slice(-4);
    for (const range of config.tenRanges) {
        const setRange = new Set<number>();
        for (let num = range.min; num <= range.max; num++) setRange.add(num);
        const uniqueDrawn = new Set<number>();
        for (const draw of wRecent) {
            for (const n of draw.numbers) {
                if (setRange.has(n)) uniqueDrawn.add(n);
            }
        }
        const saturationRate = uniqueDrawn.size / setRange.size;
        if (saturationRate >= 0.8 && uniqueDrawn.size >= Math.min(8, setRange.size - 1)) {
            for (let num = range.min; num <= range.max; num++) {
                if (!uniqueDrawn.has(num)) {
                    dezenaAlerts[num] = `Dezena ${range.name} Hipersaturada (${uniqueDrawn.size}/${setRange.size} em 4 sorteios)`;
                }
            }
        }
    }

    // 4. MATRIZ #4: DENSIDADE E VELOCIDADE (Tetos Multi-Janela)
    const windowMax: Record<number, Record<number, number>> = {};
    const windowCur: Record<number, Record<number, number>> = {};
    const windowPct: Record<number, Record<number, number>> = {};

    for (let b = 1; b <= config.totalBalls; b++) {
        windowMax[b] = {};
        windowCur[b] = {};
        windowPct[b] = {};
        const s = ballSeries[b];

        for (const w of WINDOWS) {
            if (history.length < w) continue;
            let m = 0;
            let curSum = 0;
            for (let i = 0; i < w; i++) curSum += s[i];
            if (curSum > m) m = curSum;
            for (let i = w; i < s.length; i++) {
                curSum += s[i] - s[i - w];
                if (curSum > m) m = curSum;
            }
            windowMax[b][w] = m;
            let actSum = 0;
            for (let i = s.length - w; i < s.length; i++) actSum += s[i];
            windowCur[b][w] = actSum;
            windowPct[b][w] = m > 0 ? (actSum / m) * 100 : 0;
        }
    }

    // 5. MATRIZ #5: RITMO E REPOUSO (Streaks, Ping-Pong, Cooldowns)
    const ritmoMaxStreak: Record<number, number> = {};
    const ritmoCurStreak: Record<number, number> = {};
    const ritmoMaxPingPong: Record<number, number> = {};
    const ritmoCurPingPong: Record<number, number> = {};
    const ritmoBurstCooldown: Record<number, { actDrought: number; minRest: number }> = {};
    const ritmoDoubleStreakRisk: Record<number, boolean> = {};

    for (let b = 1; b <= config.totalBalls; b++) {
        const s = ballSeries[b];
        let maxS = 0;
        let curS = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] === 1) {
                curS++;
                if (curS > maxS) maxS = curS;
            } else {
                curS = 0;
            }
        }
        ritmoMaxStreak[b] = maxS;
        let actS = 0;
        for (let i = s.length - 1; i >= 0; i--) {
            if (s[i] === 1) actS++;
            else break;
        }
        ritmoCurStreak[b] = actS;

        let maxPp = 0;
        let i = 0;
        while (i < s.length - 2) {
            if (s[i] === 1 && s[i + 1] === 0 && s[i + 2] === 1) {
                let ppLen = 3;
                let idx = i + 2;
                while (idx + 2 < s.length && s[idx + 1] === 0 && s[idx + 2] === 1) {
                    ppLen += 2;
                    idx += 2;
                }
                const saidas = Math.floor((ppLen + 1) / 2);
                if (saidas > maxPp) maxPp = saidas;
                i = idx;
            } else {
                i++;
            }
        }
        ritmoMaxPingPong[b] = maxPp;

        let actPp = 0;
        if (s.length >= 3 && s[s.length - 1] === 0 && s[s.length - 2] === 1) {
            let ppC = 1;
            let idx = s.length - 2;
            while (idx >= 2 && s[idx - 1] === 0 && s[idx - 2] === 1) {
                ppC++;
                idx -= 2;
            }
            actPp = ppC;
        }
        ritmoCurPingPong[b] = actPp;

        const hitIndices = ballHitIndices[b];
        const rests: number[] = [];
        for (let j = 0; j < hitIndices.length - 2; j++) {
            const span = hitIndices[j + 2] - hitIndices[j] + 1;
            if (span <= 6 && j + 3 < hitIndices.length) {
                rests.push(hitIndices[j + 3] - hitIndices[j + 2] - 1);
            }
        }
        const minRest = rests.length > 0 ? Math.min(...rests) : 0;
        let actDrought = 0;
        for (let k = s.length - 1; k >= 0; k--) {
            if (s[k] === 1) break;
            actDrought++;
        }
        if (hitIndices.length >= 3 && minRest > 0) {
            const spanRec = hitIndices[hitIndices.length - 1] - hitIndices[hitIndices.length - 3] + 1;
            if (spanRec <= 6 && actDrought < minRest) {
                ritmoBurstCooldown[b] = { actDrought, minRest };
            }
        }

        if (s.length >= 4 && s[s.length - 1] === 1 && s[s.length - 2] === 0 && s[s.length - 3] === 1 && s[s.length - 4] === 1) {
            ritmoDoubleStreakRisk[b] = true;
        } else {
            ritmoDoubleStreakRisk[b] = false;
        }
    }

    const ballEvaluations: BallMatrixBreakdown[] = [];
    let casasCuts = 0;
    let dnaCuts = 0;
    let dezenasCuts = 0;
    let janelas100Cuts = 0;
    let ritmo100Cuts = 0;

    for (let b = 1; b <= config.totalBalls; b++) {
        const pcts: number[] = [];
        const reasons: string[] = [];

        let allowedHouses = 0;
        for (let k = 0; k < config.pickSize; k++) {
            const inRange = b >= houseMinBound[k] && b <= houseMaxBound[k];
            const inTrans = houseTransitions[k].size === 0 || houseTransitions[k].has(b);
            if (inRange && inTrans) allowedHouses++;
        }
        const isCasasRejected = allowedHouses === 0;
        if (isCasasRejected) {
            pcts.push(100.0);
            reasons.push('Rejeição Consenso Total das Casas (' + config.pickSize + '/' + config.pickSize + ')');
            casasCuts++;
        }

        const dna = dnaAlerts[b];
        const isDnaAlert = !!dna;
        if (isDnaAlert) {
            pcts.push(100.0);
            reasons.push(`DNA L=6 (0 saídas em ${dna.occurrences}x no passado)`);
            dnaCuts++;
        }

        const dezAlert = dezenaAlerts[b];
        const isDezenaAlert = !!dezAlert;
        if (isDezenaAlert) {
            pcts.push(90.9);
            reasons.push(dezAlert);
            dezenasCuts++;
        }

        const janelaDetails: string[] = [];
        let maxJanelaP = 0;
        for (const w of WINDOWS) {
            const p = windowPct[b][w];
            if (p !== undefined) {
                if (p > maxJanelaP) maxJanelaP = p;
                if (p >= 100) {
                    janelaDetails.push(`Teto W=${w} (${windowCur[b][w]}/${windowMax[b][w]})`);
                    janelas100Cuts++;
                } else if (p >= 80) {
                    janelaDetails.push(`Janela W=${w} (${windowCur[b][w]}/${windowMax[b][w]} = ${p.toFixed(0)}%)`);
                }
            }
        }
        if (maxJanelaP > 0) {
            pcts.push(maxJanelaP);
            janelaDetails.forEach(d => reasons.push(d));
        }

        const ritmoDetails: string[] = [];
        let maxRitmoP = 0;
        if (ritmoMaxStreak[b] > 0) {
            const pS = (ritmoCurStreak[b] / ritmoMaxStreak[b]) * 100;
            if (pS > maxRitmoP) maxRitmoP = pS;
            if (pS >= 100) {
                ritmoDetails.push(`MaxStreak (${ritmoCurStreak[b]}/${ritmoMaxStreak[b]})`);
                ritmo100Cuts++;
            }
        }
        if (ritmoMaxPingPong[b] > 0 && ritmoCurPingPong[b] > 0) {
            const pPp = (ritmoCurPingPong[b] / ritmoMaxPingPong[b]) * 100;
            if (pPp > maxRitmoP) maxRitmoP = pPp;
            if (pPp >= 100) {
                ritmoDetails.push(`PingPong (${ritmoCurPingPong[b]}/${ritmoMaxPingPong[b]})`);
                ritmo100Cuts++;
            }
        }
        if (ritmoBurstCooldown[b]) {
            maxRitmoP = 100.0;
            ritmoDetails.push(`Descanso Pós-Pico (${ritmoBurstCooldown[b].actDrought}/${ritmoBurstCooldown[b].minRest})`);
            ritmo100Cuts++;
        }
        if (ritmoDoubleStreakRisk[b]) {
            if (maxRitmoP < 99) maxRitmoP = 99.0;
            ritmoDetails.push('Duplo Streak Colado [2-0-1]');
        }
        if (maxRitmoP > 0) {
            pcts.push(maxRitmoP);
            ritmoDetails.forEach(d => reasons.push(d));
        }

        const maxP = pcts.length > 0 ? Math.max(...pcts) : 0;
        const avgP = pcts.length > 0 ? pcts.reduce((a, c) => a + c, 0) / pcts.length : 0;

        let score = maxP * 100.0;
        if (isCasasRejected) score += 1000.0;
        if (isDnaAlert) score += 750.0;
        if (isDezenaAlert) score += 800.0;
        if (maxJanelaP >= 100) score += 900.0;
        if (maxRitmoP >= 100) score += 950.0;
        score += avgP;

        ballEvaluations.push({
            ball: b,
            maxProximityPct: Math.round(maxP * 10) / 10,
            compositeScore: Math.round(score * 10) / 10,
            matrix1CasasRejected: isCasasRejected,
            matrix2DnaAlert: isDnaAlert,
            matrix2DnaPattern: dna?.pattern,
            matrix2DnaOccurrences: dna?.occurrences,
            matrix3DezenaAlert: isDezenaAlert,
            matrix3DezenaName: dezAlert,
            matrix4JanelasMaxPct: Math.round(maxJanelaP * 10) / 10,
            matrix4JanelaDetails: janelaDetails,
            matrix5RitmoMaxPct: Math.round(maxRitmoP * 10) / 10,
            matrix5RitmoDetails: ritmoDetails,
            reasons: Array.from(new Set(reasons))
        });
    }

    ballEvaluations.sort((a, b) => b.compositeScore - a.compositeScore);

    const targetIdx = config.targetEliminate - 1;
    const exact25CutoffPct = ballEvaluations[targetIdx]?.maxProximityPct || 60.0;

    let jackpotIntact = false;
    let winningNumbersCut: number[] = [];
    let winningNumbersSurvived: number[] = [];
    if (actualWinningNumbers && actualWinningNumbers.length > 0) {
        const eliminatedTop = new Set(ballEvaluations.slice(0, config.targetEliminate).map(b => b.ball));
        winningNumbersCut = actualWinningNumbers.filter(num => eliminatedTop.has(num));
        winningNumbersSurvived = actualWinningNumbers.filter(num => !eliminatedTop.has(num));
        jackpotIntact = winningNumbersCut.length === 0;
    }

    const recentDrawsList = allDraws.slice(-15).reverse().map(d => ({
        index: d.index,
        date: d.date,
        numbers: d.numbers
    }));

    return {
        game,
        gameName: config.name,
        totalBalls: config.totalBalls,
        pickSize: config.pickSize,
        targetEliminate: config.targetEliminate,
        drawIndex: isPastAudit ? targetDrawIndex! : totalDraws + 1,
        totalDraws,
        targetDrawDate,
        previousDraw,
        actualWinningNumbers,
        jackpotIntact,
        winningNumbersCut,
        winningNumbersSurvived,
        exact25CutoffPct,
        balls: ballEvaluations,
        matrixSummary: {
            casasCutsCount: casasCuts,
            dnaCutsCount: dnaCuts,
            dezenasCutsCount: dezenasCuts,
            janelas100CutsCount: janelas100Cuts,
            ritmo100CutsCount: ritmo100Cuts
        },
        recentDrawsList
    };
}
