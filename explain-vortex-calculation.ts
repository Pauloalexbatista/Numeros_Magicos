import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function explainVortexCalculation() {
    console.log('═'.repeat(120));
    console.log('🔍 VORTEX MULTI-CANAL: Como Calcula o Score do Número 10');
    console.log('═'.repeat(120));
    console.log();

    // Get last 10 draws for example
    const draws = await prisma.draw.findMany({
        orderBy: { id: 'desc' },
        take: 10
    });

    draws.reverse(); // Oldest first

    const candidateNumber = 10;
    const channels = 2;
    const weights = [1.0, 0.6]; // Canal 1 = 1.0, Canal 2 = 0.6

    console.log(`Número Candidato: ${candidateNumber}`);
    console.log(`Canais: ${channels}`);
    console.log(`Pesos: Canal 1 = ${weights[0]}, Canal 2 = ${weights[1]}`);
    console.log();
    console.log('Usando os últimos 10 sorteios como exemplo:');
    console.log();

    // Show the draws
    console.log('┌─────────┬──────────────┬─────────────────────────────────────────┐');
    console.log('│ Sorteio │     Data     │         Números que Saíram              │');
    console.log('├─────────┼──────────────┼─────────────────────────────────────────┤');

    for (const draw of draws) {
        const numbers = JSON.parse(draw.numbers as string);
        const numbersStr = numbers.join(', ');
        const date = draw.date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        console.log(`│ ${draw.id.toString().padStart(4)} │ ${date} │ ${numbersStr.padEnd(39)} │`);
    }

    console.log('└─────────┴──────────────┴─────────────────────────────────────────┘');
    console.log();

    // Calculate for each channel
    console.log('═'.repeat(120));
    console.log('📊 CÁLCULO DETALHADO:');
    console.log('═'.repeat(120));
    console.log();

    let totalScore = 0;

    for (let channel = 1; channel <= channels; channel++) {
        console.log(`\n🔹 CANAL ${channel} (step=${channel}, peso=${weights[channel - 1]}):`);
        console.log('─'.repeat(120));

        let channelScore = 0;

        // LEFT DIAGONAL
        console.log(`\n   Diagonal ESQUERDA (${candidateNumber} - ${channel} a cada sorteio):`);
        let currentNum = candidateNumber;

        for (let i = draws.length - 1; i >= 0; i--) {
            const draw = draws[i];
            const numbers = JSON.parse(draw.numbers as string);

            // Move left
            currentNum = currentNum - channel;
            if (currentNum < 1) currentNum += 50;

            const hit = numbers.includes(currentNum);
            if (hit) channelScore++;

            const hitMark = hit ? '✓ HIT!' : '';
            console.log(`   Sorteio ${draw.id}: Procura número ${currentNum.toString().padStart(2)} → ${hit ? '\x1b[32m' : ''}${hitMark}\x1b[0m`);
        }

        // RIGHT DIAGONAL
        console.log(`\n   Diagonal DIREITA (${candidateNumber} + ${channel} a cada sorteio):`);
        currentNum = candidateNumber;

        for (let i = draws.length - 1; i >= 0; i--) {
            const draw = draws[i];
            const numbers = JSON.parse(draw.numbers as string);

            // Move right
            currentNum = currentNum + channel;
            if (currentNum > 50) currentNum -= 50;

            const hit = numbers.includes(currentNum);
            if (hit) channelScore++;

            const hitMark = hit ? '✓ HIT!' : '';
            console.log(`   Sorteio ${draw.id}: Procura número ${currentNum.toString().padStart(2)} → ${hit ? '\x1b[32m' : ''}${hitMark}\x1b[0m`);
        }

        const weightedScore = channelScore * weights[channel - 1];
        totalScore += weightedScore;

        console.log();
        console.log(`   📊 Canal ${channel}: ${channelScore} hits × ${weights[channel - 1]} (peso) = ${weightedScore.toFixed(2)} pontos`);
    }

    console.log();
    console.log('═'.repeat(120));
    console.log(`🎯 SCORE FINAL do número ${candidateNumber}: ${totalScore.toFixed(2)} pontos`);
    console.log('═'.repeat(120));
    console.log();
    console.log('💡 NOTA:');
    console.log('   - Este cálculo é feito para TODOS os números (1-50)');
    console.log('   - Os números são ordenados por score (maior → menor)');
    console.log('   - Os top 25 são a predição final');
    console.log();

    await prisma.$disconnect();
}

explainVortexCalculation().catch(console.error);
