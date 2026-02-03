'use server';

import { prisma } from '@/lib/prisma';

export async function getSystemsGrouped() {
    const systems = await prisma.rankedSystem.findMany({
        orderBy: [
            { game: 'asc' },
            { systemType: 'asc' },
            { domain: 'asc' },
            { priority: 'asc' }
        ]
    });

    // Group by game
    const grouped: Record<string, typeof systems> = {
        EUROMILLIONS: [],
        TOTOLOTO: [],
        EURODREAMS: []
    };

    systems.forEach(s => {
        if (grouped[s.game]) {
            grouped[s.game].push(s);
        }
    });

    return grouped;
}

export async function toggleSystemActive(systemId: number, isActive: boolean) {
    await prisma.rankedSystem.update({
        where: { id: systemId },
        data: { isActive }
    });
}

export async function updateSystemPriority(systemId: number, priority: number) {
    await prisma.rankedSystem.update({
        where: { id: systemId },
        data: { priority }
    });
}

export async function bulkToggleSystems(filters: {
    game?: string;
    systemType?: string;
    domain?: string;
}, isActive: boolean) {
    const where: any = {};

    if (filters.game) where.game = filters.game;
    if (filters.systemType) where.systemType = filters.systemType;
    if (filters.domain) where.domain = filters.domain;

    const result = await prisma.rankedSystem.updateMany({
        where,
        data: { isActive }
    });

    return result.count;
}
