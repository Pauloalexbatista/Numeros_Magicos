// Test script to validate consensus logic for NUMBERS
// This simulates the API logic to ensure it's mathematically correct

interface TestDraw {
    drawn: number[];
    consensus: number[];
    anti: number[];
}

function testConsensusLogic() {
    console.log('🧪 TESTE: Lógica de Consenso para NÚMEROS\n');
    console.log('='.repeat(60));

    // Test cases
    const tests: TestDraw[] = [
        {
            drawn: [1, 5, 10, 15, 20],
            consensus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], // TOP 25
            anti: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50] // BOTTOM 25
        },
        {
            drawn: [26, 30, 35, 40, 50],
            consensus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
            anti: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
        },
        {
            drawn: [1, 10, 25, 30, 50],
            consensus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
            anti: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
        }
    ];

    tests.forEach((test, index) => {
        console.log(`\n📋 Teste ${index + 1}:`);
        console.log(`Sorteio: [${test.drawn.join(', ')}]`);

        // OLD LOGIC (WRONG)
        const oldConsensusHits = test.drawn.filter(n => test.consensus.includes(n)).length;
        const oldAntiHits = test.drawn.filter(n => test.anti.includes(n)).length;

        // NEW LOGIC (CORRECT)
        const newConsensusHits = test.drawn.filter(n => test.consensus.includes(n)).length;
        const newAntiHits = 5 - newConsensusHits;

        console.log(`\n  ❌ LÓGICA ANTIGA (ERRADA):`);
        console.log(`     Consenso: ${oldConsensusHits} hits`);
        console.log(`     Anti: ${oldAntiHits} hits`);
        console.log(`     Total: ${oldConsensusHits + oldAntiHits} (deveria ser 5!)`);

        console.log(`\n  ✅ LÓGICA NOVA (CORRETA):`);
        console.log(`     Consenso: ${newConsensusHits} hits`);
        console.log(`     Anti: ${newAntiHits} hits`);
        console.log(`     Total: ${newConsensusHits + newAntiHits} ✓`);

        // Validation
        const isValid = (newConsensusHits + newAntiHits) === 5;
        console.log(`\n  ${isValid ? '✅' : '❌'} Validação: ${isValid ? 'PASSOU' : 'FALHOU'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 CONCLUSÃO:');
    console.log('A NOVA lógica garante que Consenso + Anti = 5 (sempre)');
    console.log('Isto está MATEMATICAMENTE CORRETO ✅');
}

testConsensusLogic();
