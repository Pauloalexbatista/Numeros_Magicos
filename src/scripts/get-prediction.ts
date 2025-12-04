
import { prisma } from '@/lib/prisma';
import { getStarSuggestions } from '@/app/analysis/stars/actions';

async function main() {
    console.log("🔮 Generating Best Prediction...");

    // 1. Get Gold System Numbers
    const goldPred = await prisma.cachedPrediction.findUnique({
        where: { systemName: 'Sistema Ouro' }
    });

    let numbers: number[] = [];
    if (goldPred) {
        const allNumbers = JSON.parse(goldPred.numbers) as number[];
        // Gold System usually returns 25 numbers. Let's take the top 5 for a single key.
        numbers = allNumbers.slice(0, 5).sort((a, b) => a - b);
    } else {
        console.log("⚠️ No Gold System prediction found. Using fallback.");
    }

    // 2. Get Star Suggestions
    const starSuggestions = await getStarSuggestions();

    console.log("\n📋 RECOMENDAÇÃO PARA AMANHÃ:");
    console.log("-----------------------------");

    if (numbers.length > 0) {
        console.log(`🔢 NÚMEROS (Top 5 do Sistema Ouro):`);
        console.log(`   ${numbers.join(' - ')}`);
    } else {
        console.log("❌ Erro: Não foi possível obter os números do Sistema Ouro.");
    }

    console.log("\n⭐ ESTRELAS:");
    console.log(`   👑 Ouro (Histórico): ${starSuggestions.golden.pair.replace('-', ' - ')}`);
    console.log(`   🔥 Momento (Recente): ${starSuggestions.hot.pair.replace('-', ' - ')}`);
    console.log(`   🧠 Racional (Estatístico): ${starSuggestions.rational.pair.replace('-', ' - ')}`);

    console.log("\n💡 DICA:");
    console.log("Combine os 5 números acima com um dos pares de estrelas.");
}

main();
