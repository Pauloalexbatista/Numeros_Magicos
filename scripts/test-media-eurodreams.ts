import { SistMedia3Otimizado } from '../src/services/custom/SistMedia3Otimizado';
import { Draw } from '@prisma/client';

async function testEurodreams() {
    const sys = new SistMedia3Otimizado();
    const mockDraws: any[] = [];
    const baseDate = new Date('2026-09-10');
    
    for (let i = 0; i < 55; i++) {
        const d = new Date(baseDate.getTime() - i * 86400000 * 3);
        // EuroDreams: 6 balls (1 to 40)
        mockDraws.push({
            id: `draw_ed_${i}`,
            game: 'EURODREAMS',
            date: d,
            numbers: JSON.stringify([
                3 + (i % 2),
                9 + (i % 3),
                16 + (i % 2),
                22 + (i % 3),
                29 + (i % 2),
                36 + (i % 3)
            ])
        });
    }

    const topPool = await sys.generateTop10(mockDraws as Draw[], true);
    console.log("EuroDreams Pool Length:", topPool.length);
    console.log("EuroDreams Pool Unique:", new Set(topPool).size);
    console.log("Min num:", Math.min(...topPool), "Max num:", Math.max(...topPool));
    console.log("First 18 numbers (Tiers 0 + 1):", topPool.slice(0, 18));
}

testEurodreams();
