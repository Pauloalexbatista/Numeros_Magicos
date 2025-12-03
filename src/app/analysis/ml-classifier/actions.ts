'use server';

import { prisma } from '@/lib/prisma';
import { getSystemByName } from '@/services/ranked-systems';

export async function getMLClassifierPrediction(): Promise<number[]> {
    try {
        // 1. Fetch history
        const history = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        if (history.length === 0) return [];

        // 2. Get System
        const system = getSystemByName('Machine Learning (Regressão Logística)');
        if (!system) throw new Error('Sistema ML Classifier não encontrado');

        // 3. Generate Prediction
        const predicted = await system.generateTop10(history);

        // Ensure exactly 25 numbers
        return predicted.slice(0, 25);

    } catch (error) {
        console.error('Failed to get ML Classifier prediction:', error);
        throw new Error('Falha na previsão ML Classifier');
    }
}
