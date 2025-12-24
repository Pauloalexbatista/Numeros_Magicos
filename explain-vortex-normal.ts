import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function explainVortexNormal() {
    console.log('═'.repeat(120));
    console.log('🌀 VORTEX NORMAL (Pirâmide): Como Funciona');
    console.log('═'.repeat(120));
    console.log();

    // Get last 5 draws for simple example
    const draws = await prisma.draw.findMany({
        orderBy: { id: 'desc' },
        take: 5
    });

    draws.reverse(); // Oldest first

    console.log('Últimos 5 sorteios (exemplo):');
    console.log();
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

    console.log('═'.repeat(120));
    console.log('📊 REGRA DO VORTEX NORMAL:');
    console.log('═'.repeat(120));
    console.log();
    console.log('Para cada número candidato (1-50):');
    console.log('  1. Começa no número candidato');
    console.log('  2. Para cada sorteio (do mais recente para o mais antigo):');
    console.log('     - Move 1 posição para a ESQUERDA (número - 1)');
    console.log('     - Se encontrar esse número no sorteio → +1 ponto');
    console.log('  3. Repete para a DIREITA (número + 1)');
    console.log('  4. Soma os pontos de ambas as direções');
    console.log();

    // Example with number 10
    const candidateNumber = 10;
    console.log(`Exemplo com número ${candidateNumber}:`);
    console.log();

    let leftScore = 0;
    let rightScore = 0;

    console.log('🔹 Diagonal ESQUERDA:');
    let currentNum = candidateNumber;
    for (let i = draws.length - 1; i >= 0; i--) {
        const draw = draws[i];
        const numbers = JSON.parse(draw.numbers as string);

        currentNum = currentNum - 1;
        if (currentNum < 1) currentNum = 50;

        const hit = numbers.includes(currentNum);
        if (hit) leftScore++;

        console.log(`   Sorteio ${draw.id}: ${candidateNumber} → ${currentNum} ${hit ? '✅ HIT!' : '❌'}`);
    }

    console.log();
    console.log('🔹 Diagonal DIREITA:');
    currentNum = candidateNumber;
    for (let i = draws.length - 1; i >= 0; i--) {
        const draw = draws[i];
        const numbers = JSON.parse(draw.numbers as string);

        currentNum = currentNum + 1;
        if (currentNum > 50) currentNum = 1;

        const hit = numbers.includes(currentNum);
        if (hit) rightScore++;

        console.log(`   Sorteio ${draw.id}: ${candidateNumber} → ${currentNum} ${hit ? '✅ HIT!' : '❌'}`);
    }

    const totalScore = leftScore + rightScore;

    console.log();
    console.log(`📊 Score Esquerda: ${leftScore}`);
    console.log(`📊 Score Direita: ${rightScore}`);
    console.log(`🎯 SCORE TOTAL: ${totalScore}`);
    console.log();
    console.log('Este cálculo é feito para todos os números 1-50, depois ordenados por score!');
    console.log();

    await prisma.$disconnect();
}

explainVortexNormal().catch(console.error);
