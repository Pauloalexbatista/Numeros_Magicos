import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function registerLSTM() {
    console.log('🧠 A Registar a LSTM Neural Network na Switchboard DB...');

    const game = 'EUROMILLIONS';

    // 1. Principal
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: 'LSTM Neural Network', game: game } },
        update: { isActive: true, systemType: 'NEURAL' },
        create: { 
            name: 'LSTM Neural Network', 
            game: game, 
            description: `Recurrent Neural Network para Séries Temporais (Deep Learning puro). Memória Longa.`, 
            systemType: 'NEURAL', 
            domain: 'NUMBERS', 
            isActive: true 
        }
    });

    // Dummy performance to force it into the Leaderboard (JSON requires SystemRanking to exist)
    await prisma.systemRanking.upsert({
        where: { systemName_game: { systemName: 'LSTM Neural Network', game: game } },
        update: {},
        create: { 
            systemName: 'LSTM Neural Network', 
            game: game,
            avgAccuracy: 0, 
            totalPredictions: 0, 
            lastUpdated: new Date() 
        }
    });

    // 2. Stars
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: 'LSTM Neural Network (Estrelas)', game: game } },
        update: { isActive: true, systemType: 'NEURAL' },
        create: { 
            name: 'LSTM Neural Network (Estrelas)', 
            game: game, 
            description: `Recurrent Neural Network (LSTM) direcionada exclusivamente a Estrelas.`, 
            systemType: 'NEURAL', 
            domain: 'STARS', 
            isActive: true 
        }
    });

    await prisma.systemRanking.upsert({
        where: { systemName_game: { systemName: 'LSTM Neural Network (Estrelas)', game: game } },
        update: {},
        create: { 
            systemName: 'LSTM Neural Network (Estrelas)', 
            game: game,
            avgAccuracy: 0, 
            totalPredictions: 0, 
            lastUpdated: new Date()
        }
    });

    console.log(`✅ LSTM registada à força no Gestor de Sistemas.`);
}

registerLSTM()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
