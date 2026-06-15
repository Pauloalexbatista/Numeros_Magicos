import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface SystemHits {
    name: string;
    draws: number[];
    totalHits: number;
    jackpots: number;
}

interface Combination {
    systems: string[];
    complementarity: number;
    totalCoverage: number;
    overlap: number;
    combinedJackpots: number;
    systemDraws: number[][]; // Array of draw arrays for each system
}

// Generate all combinations of size N
function* generateCombinations<T>(array: T[], size: number): Generator<T[]> {
    if (size === 1) {
        for (const item of array) {
            yield [item];
        }
        return;
    }

    for (let i = 0; i <= array.length - size; i++) {
        for (const combo of generateCombinations(array.slice(i + 1), size - 1)) {
            yield [array[i], ...combo];
        }
    }
}

// Calculate N-way complementarity
function calculateComplementarity(systems: SystemHits[]): {
    totalCoverage: number;
    overlap: number;
    complementarity: number;
    combinedJackpots: number;
} {
    // Union of all draws
    const allDraws = new Set<number>();
    systems.forEach(s => s.draws.forEach(d => allDraws.add(d)));

    // Intersection (draws where ALL systems hit)
    const commonDraws = systems[0].draws.filter(d =>
        systems.every(s => s.draws.includes(d))
    );

    const totalCoverage = allDraws.size;
    const overlap = commonDraws.length;
    const complementarity = totalCoverage > 0
        ? ((totalCoverage - overlap) / totalCoverage) * 100
        : 0;

    const combinedJackpots = systems.reduce((sum, s) => sum + s.jackpots, 0);

    return {
        totalCoverage,
        overlap,
        complementarity: Math.round(complementarity * 10) / 10,
        combinedJackpots
    };
}

// GET /api/admin/system-complementarity
export async function GET(request: Request) {
    try {
        // Check authentication
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas administradores.' },
                { status: 403 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const minHits = parseInt(searchParams.get('minHits') || '4');
        const combinationSize = parseInt(searchParams.get('combinationSize') || '2');
        const maxCombinations = parseInt(searchParams.get('maxCombinations') || '50');

        // Validate combination size
        if (combinationSize < 2 || combinationSize > 4) {
            return NextResponse.json(
                { error: 'Tamanho de combinação deve ser entre 2 e 4' },
                { status: 400 }
            );
        }

        // Step 1: Get all performances with minHits+ hits from SystemPerformance
        const gameParam = new URL(request.url).searchParams.get('game') || 'EUROMILLIONS';
        const predictions = await prisma.systemPerformance.findMany({
            where: {
                hits: { gte: minHits },
                draw: { game: gameParam }
            },
            select: {
                systemName: true,
                drawId: true,
                hits: true,
            },
            orderBy: {
                drawId: 'desc'
            }
        });

        // Step 2: Group by system
        const systemsMap = new Map<string, SystemHits>();

        predictions.forEach(pred => {
            // Determine jackpot level based on game
            const isEuroDreams = gameParam === 'EURODREAMS' || gameParam === 'MEGASENA';
            const jpLevel = isEuroDreams ? 6 : 5;

            // Process normal predictions
            if (pred.hits >= minHits) {
                const key = pred.systemName;
                if (!systemsMap.has(key)) {
                    systemsMap.set(key, {
                        name: key,
                        draws: [],
                        totalHits: 0,
                        jackpots: 0
                    });
                }
                const system = systemsMap.get(key)!;
                system.draws.push(pred.drawId);
                system.totalHits++;
                if (pred.hits >= jpLevel) system.jackpots++;
            }
        });


        // Convert to array and sort by total hits
        const systems = Array.from(systemsMap.values())
            .sort((a, b) => b.totalHits - a.totalHits);

        // Step 3: Generate N-way combinations
        const combinations: Combination[] = [];

        for (const systemCombo of generateCombinations(systems, combinationSize)) {
            const stats = calculateComplementarity(systemCombo);

            combinations.push({
                systems: systemCombo.map(s => s.name),
                complementarity: stats.complementarity,
                totalCoverage: stats.totalCoverage,
                overlap: stats.overlap,
                combinedJackpots: stats.combinedJackpots,
                systemDraws: systemCombo.map(s => s.draws)
            });
        }

        // Step 4: Sort by COVERAGE first (descending), then by OVERLAP (ascending)
        combinations.sort((a, b) => {
            // Primary: Maximum coverage
            if (b.totalCoverage !== a.totalCoverage) {
                return b.totalCoverage - a.totalCoverage;
            }
            // Secondary: Minimum overlap
            if (a.overlap !== b.overlap) {
                return a.overlap - b.overlap;
            }
            // Tertiary: Maximum complementarity
            return b.complementarity - a.complementarity;
        });

        // Step 5: Remove duplicates (same systems in different order)
        const uniqueCombinations = new Map<string, Combination>();

        combinations.forEach(combo => {
            // Create a unique key by sorting system names
            const key = [...combo.systems].sort().join('|');

            // Only keep if we haven't seen this combination before
            // OR if this one has better stats (higher coverage, lower overlap)
            if (!uniqueCombinations.has(key)) {
                uniqueCombinations.set(key, combo);
            } else {
                const existing = uniqueCombinations.get(key)!;
                // Replace if this one is better (higher coverage or lower overlap)
                if (combo.totalCoverage > existing.totalCoverage ||
                    (combo.totalCoverage === existing.totalCoverage && combo.overlap < existing.overlap)) {
                    uniqueCombinations.set(key, combo);
                }
            }
        });

        // Convert back to array
        const filteredCombinations = Array.from(uniqueCombinations.values());

        // Limit results
        const topCombinations = filteredCombinations.slice(0, maxCombinations);

        // Calculate stats
        const perfectCombinations = combinations.filter(c => c.overlap === 0).length;

        return NextResponse.json({
            success: true,
            systems: systems.map(s => ({
                name: s.name,
                totalHits: s.totalHits,
                jackpots: s.jackpots,
                drawsCovered: s.draws.length
            })),
            combinations: topCombinations,
            stats: {
                totalSystems: systems.length,
                totalCombinations: combinations.length,
                perfectCombinations,
                avgComplementarity: combinations.length > 0
                    ? Math.round(combinations.reduce((sum, c) => sum + c.complementarity, 0) / combinations.length * 10) / 10
                    : 0,
                avgCoverage: combinations.length > 0
                    ? Math.round(combinations.reduce((sum, c) => sum + c.totalCoverage, 0) / combinations.length)
                    : 0
            }
        });

    } catch (error: any) {
        console.error('[API] System complementarity error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao analisar complementaridade',
                details: error.message
            },
            { status: 500 }
        );
    }
}
