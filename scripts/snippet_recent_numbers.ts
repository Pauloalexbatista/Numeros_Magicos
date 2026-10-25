export async function generateRecentNumbers(history: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(history);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!history || history.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    // Garante rigorosamente que chronHistory[0] é o sorteio mais recente (T-1)
    const d0 = new Date(history[0].date).getTime();
    const dEnd = new Date(history[history.length - 1].date).getTime();
    const chronHistory = (d0 < dEnd) ? [...history].reverse() : history;

    const uniqueNumbers = new Set<number>();

    for (const draw of chronHistory) {
        if (uniqueNumbers.size >= predCount) break;
        let numbers: number[] = [];
        if (typeof draw.numbers === 'string') {
            numbers = JSON.parse(draw.numbers);
        } else if (Array.isArray(draw.numbers)) {
            numbers = draw.numbers as unknown as number[];
        }

        if (Array.isArray(numbers)) {
            // Desempate canónico Opção A: ordem numérica crescente dentro do mesmo sorteio
            const sorted = [...numbers].sort((a, b) => a - b);
            for (const num of sorted) {
                if (num >= 1 && num <= maxNum && uniqueNumbers.size < predCount) {
                    uniqueNumbers.add(num);
                }
            }
        }
    }

    // Fill any missing numbers up to predCount in natural ascending order
    for (let i = 1; i <= maxNum; i++) {
        if (uniqueNumbers.size >= predCount) break;
        uniqueNumbers.add(i);
    }

    return Array.from(uniqueNumbers);
}
