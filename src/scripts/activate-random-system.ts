import { PrismaClient } from '@prisma/client';
import { backfillHistory } from '../services/backfill';

const prisma = new PrismaClient();

async function activateRandomSystem() {
    console.log('🐒 Activating Random Generator System...');

    try {
        const systemName = 'Random Generator';

        // 1. Ensure system is registered in DB
        const existing = await prisma.rankedSystem.findUnique({
            where: { name: systemName }
        });

        if (!existing) {
            console.log('Creating system record...');
            await prisma.rankedSystem.create({
                data: {
                    name: systemName,
                    description: 'Gerador Aleatório Puro (Baseline Real)',
                    isActive: true
                }
            });
        } else {
            console.log('System already exists. Ensuring it is active...');
            if (!existing.isActive) {
                await prisma.rankedSystem.update({
                    where: { name: systemName },
                    data: { isActive: true }
                });
            }
        }

        // 2. Trigger Backfill
        console.log('Triggering historical backfill...');
        await backfillHistory(systemName);

        console.log('✅ Random System activated and backfilled!');

    } catch (error) {
        console.error('❌ Error activating system:', error);
    } finally {
        await prisma.$disconnect();
    }
}

activateRandomSystem();
