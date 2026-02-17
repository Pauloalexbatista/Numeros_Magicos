
import { execSync } from 'child_process';

const steps = [
    { game: 'EUROMILLIONS', domain: 'NUMBERS' },
    { game: 'EUROMILLIONS', domain: 'STARS' },
    { game: 'TOTOLOTO', domain: 'NUMBERS' },
    { game: 'TOTOLOTO', domain: 'STARS' },
    { game: 'EURODREAMS', domain: 'NUMBERS' },
    { game: 'EURODREAMS', domain: 'STARS' },
];

console.log("🚀 STARTING FULL RECALCULATION SEQUENCE (2026 PREDICTION UPDATE)");
console.log("===============================================================");

for (const step of steps) {
    console.log(`\n👉 Executing: ${step.game} - ${step.domain}`);
    try {
        execSync(`npx tsx src/scripts/recalc-granular.ts ${step.game} ${step.domain}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ Failed Step: ${step.game} ${step.domain}`);
        process.exit(1);
    }
}

console.log("\n🔮 Generating Final Predictions Cache...");
try {
    // We can use a script for this or just rely on the last step of recalc-granular if I enabled it.
    // Since I didn't enable it in recalc-granular, I should call a script that does cachePredictions().
    execSync(`npx tsx src/scripts/backfill/force-cache-update.ts`, { stdio: 'inherit' });
    console.log("\n🌟 Regenerating Star Cache...");
    execSync(`npx tsx src/scripts/backfill/regenerate-star-cache.ts`, { stdio: 'inherit' });
} catch (error) {
    console.error(`❌ Failed Cache Update`);
}

console.log("\n✅ ALL SYSTEMS GO! Full recalculation complete.");
