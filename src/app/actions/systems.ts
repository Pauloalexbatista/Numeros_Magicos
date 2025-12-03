'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { rankedSystems } from '@/services/ranked-systems';
import { backfillHistory } from '@/services/backfill';

const prisma = new PrismaClient();

export async function getRegisteredSystems() {
    const systems = await prisma.rankedSystem.findMany({
        orderBy: { name: 'asc' }
    });
    return systems;
}

export async function getAvailableAlgorithms() {
    // Return algorithms from code that are NOT yet in the DB
    const registered = await prisma.rankedSystem.findMany({
        select: { name: true }
    });

    const registeredNames = new Set(registered.map((r: { name: string }) => r.name));

    return rankedSystems
        .filter(sys => !registeredNames.has(sys.name))
        .map(sys => ({
            name: sys.name,
            description: sys.description
        }));
}

export async function toggleSystemStatus(id: number, isActive: boolean) {
    await prisma.rankedSystem.update({
        where: { id },
        data: { isActive }
    });
    revalidatePath('/admin/systems');
}

export async function createSystem(name: string, description: string) {
    // Verify if algorithm exists in code
    const algo = rankedSystems.find(s => s.name === name);
    if (!algo) {
        throw new Error('Algoritmo inválido ou não encontrado no registo de código.');
    }

    await prisma.rankedSystem.create({
        data: {
            name,
            description,
            isActive: true
        }
    });

    // Auto-backfill history for the new system
    // We await this to ensure the system has data when the user sees it
    // This might take a few seconds but ensures consistency
    try {
        await backfillHistory(name);
    } catch (error) {
        console.error(`Failed to backfill history for ${name}:`, error);
        // We don't throw here to avoid rolling back the creation, 
        // but we log it. The user will see an empty system.
    }

    revalidatePath('/admin/systems');
}
