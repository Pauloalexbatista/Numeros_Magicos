import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WINDOWS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

async function seedEliminationHistory(game = 'EUROMILLIONS', domain = 'NUMBERS') {
    console.log(`=============================================================`);
    console.log(` Iniciando Povoamento da BD de Limites & Sistema Eliminação`);
    console.log(` Jogo: ${game} | Domínio: ${domain}`);
    console.log(`=============================================================`);

    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' }
    });

    console.log(`Total de sorteios encontrados: ${draws.length}`);
    if (draws.length === 0) return;

    const maxNum = game === 'EUROMILLIONS' ? 50 : (game === 'TOTOLOTO' ? 49 : (game === 'MEGASENA' ? 60 : 40));

    // Estados e Recordes por bola (1 a maxNum)
    const curStreak: Record<number, number> = {};
    const curDrought: Record<number, number> = {};
    const maxStreak: Record<number, number> = {};
    const maxDrought: Record<number, number> = {};
    const maxInW: Record<number, Record<number, number>> = {};

    for (let n = 1; n <= maxNum; n++) {
        curStreak[n] = 0;
        curDrought[n] = 0;
        maxStreak[n] = 0;
        maxDrought[n] = 0;
    }
    for (const w of WINDOWS) {
        maxInW[w] = {};
        for (let n = 1; n <= maxNum; n++) {
            maxInW[w][n] = 0;
        }
    }

    const drawNumbers: number[][] = draws.map(d => JSON.parse(d.numbers).sort((a: number, b: number) => a - b));

    // Calibração inicial nos primeiros 100 sorteios
    const CALIBRATION_SIZE = Math.min(100, Math.floor(draws.length / 4));
    console.log(`Calibrando limites iniciais nos primeiros ${CALIBRATION_SIZE} sorteios...`);

    for (let i = 0; i < CALIBRATION_SIZE; i++) {
        const actual = new Set<number>(drawNumbers[i]);
        for (let n = 1; n <= maxNum; n++) {
            if (actual.has(n)) {
                curStreak[n]++;
                if (curStreak[n] > maxStreak[n]) maxStreak[n] = curStreak[n];
                if (curDrought[n] > maxDrought[n]) maxDrought[n] = curDrought[n];
                curDrought[n] = 0;
            } else {
                curStreak[n] = 0;
                curDrought[n]++;
                if (curDrought[n] > maxDrought[n]) maxDrought[n] = curDrought[n];
            }
        }
        for (const w of WINDOWS) {
            if (i >= w) {
                const window = drawNumbers.slice(i - w, i);
                for (let n = 1; n <= maxNum; n++) {
                    const cnt = window.filter(d => d.includes(n)).length;
                    if (cnt > maxInW[w][n]) maxInW[w][n] = cnt;
                }
            }
        }
    }

    console.log(`Processando e gravando sorteios a partir do #${CALIBRATION_SIZE + 1}...`);

    let totalEliminated = 0;
    let totalFailures = 0;
    let totalCleanDraws = 0;
    let recordsBrokenCount = 0;

    const BATCH_SIZE = 100;
    let batch = [];

    for (let i = CALIBRATION_SIZE; i < draws.length; i++) {
        const draw = draws[i];
        const actual = new Set<number>(drawNumbers[i]);

        // 1. Janelas ativas antes do sorteio i
        const curInW: Record<number, Record<number, number>> = {};
        for (const w of WINDOWS) {
            const window = drawNumbers.slice(Math.max(0, i - w), i);
            curInW[w] = {};
            for (let n = 1; n <= maxNum; n++) {
                curInW[w][n] = window.filter(d => d.includes(n)).length;
            }
        }

        // 2. Avaliação de eliminação
        const eliminatedNumbers: number[] = [];
        const eliminationReasons: Record<number, string[]> = {};

        for (let n = 1; n <= maxNum; n++) {
            const reasons: string[] = [];
            // Regra 1: Streak no limite histórico
            if (curStreak[n] >= maxStreak[n] && curStreak[n] >= 2) {
                reasons.push(`STREAK_MAX(${curStreak[n]})`);
            }
            // Regras de Janela (10, 20, 30)
            for (const w of [10, 20, 30]) {
                const thresh = w === 10 ? 4 : (w === 20 ? 6 : 8);
                if (curInW[w][n] >= maxInW[w][n] && maxInW[w][n] >= thresh) {
                    reasons.push(`MAX_W${w}(${curInW[w][n]})`);
                }
            }

            if (reasons.length > 0) {
                eliminatedNumbers.push(n);
                eliminationReasons[n] = reasons;
            }
        }

        // 3. Confrontar com sorteio real
        const failedNumbers = eliminatedNumbers.filter(n => actual.has(n));
        const wasSuccess = failedNumbers.length === 0;

        totalEliminated += eliminatedNumbers.length;
        totalFailures += failedNumbers.length;
        if (eliminatedNumbers.length > 0 && wasSuccess) {
            totalCleanDraws++;
        }

        // 4. Detetar recordes quebrados e atualizar limites
        const recordsBroken: string[] = [];
        for (let n = 1; n <= maxNum; n++) {
            if (actual.has(n)) {
                curStreak[n]++;
                if (curStreak[n] > maxStreak[n]) {
                    recordsBroken.push(`Bola ${n}: Novo Max Streak = ${curStreak[n]} (era ${maxStreak[n]})`);
                    maxStreak[n] = curStreak[n];
                }
                if (curDrought[n] > maxDrought[n]) {
                    maxDrought[n] = curDrought[n];
                }
                curDrought[n] = 0;
            } else {
                curStreak[n] = 0;
                curDrought[n]++;
                if (curDrought[n] > maxDrought[n]) {
                    maxDrought[n] = curDrought[n];
                }
            }
        }

        for (const w of WINDOWS) {
            const windowNow = drawNumbers.slice(Math.max(0, i - w + 1), i + 1);
            for (let n = 1; n <= maxNum; n++) {
                const cntNow = windowNow.filter(d => d.includes(n)).length;
                if (cntNow > maxInW[w][n]) {
                    recordsBroken.push(`Bola ${n}: Novo Max em ${w} = ${cntNow} (era ${maxInW[w][n]})`);
                    maxInW[w][n] = cntNow;
                }
            }
        }

        recordsBrokenCount += recordsBroken.length;

        // Montar registo para BD
        const recordData = {
            drawId: draw.id,
            game,
            domain,
            sequenceNumber: draw.sequenceNumber,
            drawDate: draw.date,

            maxStreakByBall: JSON.stringify(maxStreak),
            curStreakByBall: JSON.stringify(curStreak),
            maxDroughtByBall: JSON.stringify(maxDrought),
            curDroughtByBall: JSON.stringify(curDrought),

            maxIn10: JSON.stringify(maxInW[10]),
            maxIn20: JSON.stringify(maxInW[20]),
            maxIn30: JSON.stringify(maxInW[30]),
            maxIn40: JSON.stringify(maxInW[40]),
            maxIn50: JSON.stringify(maxInW[50]),
            maxIn60: JSON.stringify(maxInW[60]),
            maxIn70: JSON.stringify(maxInW[70]),
            maxIn80: JSON.stringify(maxInW[80]),
            maxIn90: JSON.stringify(maxInW[90]),
            maxIn100: JSON.stringify(maxInW[100]),

            curIn10: JSON.stringify(curInW[10]),
            curIn20: JSON.stringify(curInW[20]),
            curIn30: JSON.stringify(curInW[30]),
            curIn40: JSON.stringify(curInW[40]),
            curIn50: JSON.stringify(curInW[50]),
            curIn60: JSON.stringify(curInW[60]),
            curIn70: JSON.stringify(curInW[70]),
            curIn80: JSON.stringify(curInW[80]),
            curIn90: JSON.stringify(curInW[90]),
            curIn100: JSON.stringify(curInW[100]),

            totalEliminated: eliminatedNumbers.length,
            eliminatedNumbers: JSON.stringify(eliminatedNumbers),
            eliminationReasons: JSON.stringify(eliminationReasons),
            failedNumbers: JSON.stringify(failedNumbers),
            recordsBroken: JSON.stringify(recordsBroken),
            wasSuccess
        };

        batch.push(recordData);

        if (batch.length >= BATCH_SIZE || i === draws.length - 1) {
            for (const item of batch) {
                await prisma.drawLimitsAndElimination.upsert({
                    where: {
                        drawId_domain: {
                            drawId: item.drawId,
                            domain: item.domain
                        }
                    },
                    update: item,
                    create: item
                });
            }
            batch = [];
            process.stdout.write(`\rProcessados ${i - CALIBRATION_SIZE + 1} de ${draws.length - CALIBRATION_SIZE} sorteios...`);
        }
    }

    console.log(`\n\n=============================================================`);
    console.log(`               POVOAMENTO CONCLUÍDO COM SUCESSO!`);
    console.log(`=============================================================`);
    console.log(`Total de Sorteios na BD de Limites: ${draws.length - CALIBRATION_SIZE}`);
    console.log(`Total de Bolas Eliminadas:          ${totalEliminated}`);
    console.log(`Bolas que NÃO saíram (ACERTOS):     ${totalEliminated - totalFailures} (${((totalEliminated - totalFailures) / Math.max(1, totalEliminated) * 100).toFixed(2)}%)`);
    console.log(`Falhas (Recordes Quebrados):        ${totalFailures} (${(totalFailures / Math.max(1, totalEliminated) * 100).toFixed(2)}%)`);
    console.log(`Taxa Global de Assertividade:       ${((totalEliminated - totalFailures) / Math.max(1, totalEliminated) * 100).toFixed(2)}%`);
    console.log(`Correções / Atualizações na BD:     ${recordsBrokenCount}`);
    console.log(`=============================================================\n`);
}

seedEliminationHistory()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
