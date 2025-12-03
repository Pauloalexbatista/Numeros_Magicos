'use server';

import { prisma } from '@/lib/prisma';
import { getSystemByName } from '@/services/ranked-systems';

export async function getLSTMPrediction(): Promise<number[]> {
    try {
        // 1. Fetch history
        const history = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        if (history.length === 0) return [];

        // 2. Get System
        const system = getSystemByName('LSTM Neural Net');
        if (!system) throw new Error('Sistema LSTM não encontrado');

        // 3. Generate Prediction
        const predicted = await system.generateTop10(history);

        // Ensure exactly 25 numbers
        return predicted.slice(0, 25);

    } catch (error) {
        console.error('Failed to get LSTM prediction:', error);
        throw new Error('Falha na previsão LSTM');
    }
}
