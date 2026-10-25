const fs = require('fs');
let content = fs.readFileSync('src/services/ranked-systems.ts', 'utf8');

const target = `export async function generateRecentNumbers(history: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(history);
    const predCount = returnFullPool ? maxNum : defaultPredCount;
    const uniqueNumbers = new Set<number>();

    for (const draw of history) {
        if (uniqueNumbers.size >= predCount) break;
        const numbers = typeof draw.numbers === 'string' ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) : draw.numbers;
        if (Array.isArray(numbers)) {
            for (const num of numbers) {
                if (uniqueNumbers.size < predCount) {
                    uniqueNumbers.add(num);
                }
            }
        }
    }

    // Fill any missing numbers up to predCount
    for (let i = 1; i <= maxNum; i++) {
        if (uniqueNumbers.size >= predCount) break;
        uniqueNumbers.add(i);
    }

    return Array.from(uniqueNumbers);
}`;

const replacement = `export async function generateRecentNumbers(history: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(history);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!history || history.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
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
            const sorted = [...numbers].sort((a, b) => a - b);
            for (const num of sorted) {
                if (num >= 1 && num <= maxNum && uniqueNumbers.size < predCount) {
                    uniqueNumbers.add(num);
                }
            }
        }
    }

    for (let i = 1; i <= maxNum; i++) {
        if (uniqueNumbers.size >= predCount) break;
        uniqueNumbers.add(i);
    }

    return Array.from(uniqueNumbers);
}`;

// Normalize line endings for replacement
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
    console.error('Target not found!');
    process.exit(1);
}

fs.writeFileSync('src/services/ranked-systems.ts', normContent.replace(normTarget, normReplacement), 'utf8');
console.log('Successfully replaced generateRecentNumbers');
