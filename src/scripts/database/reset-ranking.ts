import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
    console.log("⚠️ STARTING HARD RESET OF RANKING SYSTEM ⚠️");
    console.log("This will delete all SystemPerformance and SystemRanking data.");

    try {
        // 1. Truncate Tables
        console.log("🗑️ Deleting old data...");
        await prisma.systemPerformance.deleteMany({});
        await prisma.systemRanking.deleteMany({});
        console.log("✅ Tables cleared.");

        // 2. Run Seeding Script
        console.log("🌱 Starting re-seeding process (this may take a while)...");

        // We execute the seed script as a separate process to ensure clean state
        const { stdout, stderr } = await execAsync('npx tsx src/scripts/seed-ranked-systems.ts');

        console.log(stdout);
        if (stderr) console.error(stderr);

        console.log("✅ HARD RESET COMPLETE!");

    } catch (error) {
        console.error("❌ Reset failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
