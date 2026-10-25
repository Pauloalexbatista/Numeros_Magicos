import { SistMedia3Otimizado } from '../src/services/custom/SistMedia3Otimizado';
import { Draw } from '@prisma/client';

async function testSystem() {
    const sys = new SistMedia3Otimizado();
    
    // Create 50 mock draws for Totoloto (5 numbers between 1 and 49)
    const mockDraws: any[] = [];
    const baseDate = new Date('2026-09-12');
    
    for (let i = 0; i < 55; i++) {
        const d = new Date(baseDate.getTime() - i * 86400000 * 3);
        // Varying numbers around 5, 15, 25, 35, 45
        mockDraws.push({
            id: `draw_${i}`,
            game: 'TOTOLOTO',
            date: d,
            numbers: JSON.stringify([
                4 + (i % 3),
                14 + (i % 4),
                24 + (i % 3),
                33 + (i % 5),
                44 + (i % 3)
            ])
        });
    }

    const top10 = await sys.generateTop10(mockDraws as Draw[]);
    console.log("Top 10 Predictions:", top10);
    console.log("Unique count in Top 10:", new Set(top10).size);

    const fullPool = await sys.generateTop10(mockDraws as Draw[], true);
    console.log("Full Pool Length:", fullPool.length);
    console.log("Full Pool Unique:", new Set(fullPool).size);
    console.log("Min num:", Math.min(...fullPool), "Max num:", Math.max(...fullPool));

    // Test reverse order input (guard test)
    const reversedMock = [...mockDraws].reverse();
    const top10Rev = await sys.generateTop10(reversedMock as Draw[]);
    console.log("Reverse guard match:", JSON.stringify(top10) === JSON.stringify(top10Rev));
}

testSystem();
