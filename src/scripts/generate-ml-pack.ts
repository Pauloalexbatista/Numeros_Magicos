
import { PrismaClient } from '@prisma/client';
import { rankedSystems } from '../services/ranked-systems';
import fs from 'fs';
import path from 'path';

// Fix: Explicitly define datasource for local script execution
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db',
        },
    },
});

async function main() {
    console.log('🚀 Starting ML Pack Generation (for Offline -> Online Import)...');

    // 1. Fetch History
    console.log('📊 Fetching drawing history...');
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });
    console.log(`✅ Loaded ${allDraws.length} historical draws.`);

    const output = {
        generatedAt: new Date().toISOString(),
        totalDraws: allDraws.length,
        systems: [] as any[]
    };

    // 2. Iterate Systems
    console.log(`🤖 Processing ${rankedSystems.length} systems...`);

    for (const system of rankedSystems) {
        process.stdout.write(`Processing ${system.name}... `);

        try {
            // Generate Prediction for Next Draw (Future)
            const prediction = await system.generateTop10(allDraws);

            // Generate Anti-Prediction (Numbers NOT in prediction)
            const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
            const antiPrediction = allNumbers.filter(n => !prediction.includes(n)).slice(0, 25);

            // Structure data
            const systemData = {
                name: system.name,
                description: system.description,
                prediction: prediction,
                antiPrediction: antiPrediction,
                cache: {
                    numbers: prediction, // For Cache Display
                    worstNumbers: antiPrediction // For Cache Display
                }
            };

            output.systems.push(systemData);
            console.log('OK');
        } catch (error: any) {
            console.log('ERROR');
            console.error(`Failed to process ${system.name}:`, error.message);
        }
    }

    // 3. Save to File
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, 'ml_pack.json');
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));

    console.log('\n=============================================');
    console.log(`✅ SUCCESS! Pack generated at:`);
    console.log(filePath);

    // AUTO-UPLOAD LOGIC
    const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

    if (adminSecret && appUrl) {
        console.log('\n📡 Auto-Sync Detected...');
        try {
            const response = await fetch(`${appUrl}/api/admin/sync-offline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminSecret
                },
                body: JSON.stringify(output)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log(`✅ UPLOAD SUCCESS! Server says: ${result.message}`);
            } else {
                console.error(`❌ UPLOAD FAILED: ${result.message || response.statusText}`);
            }
        } catch (err: any) {
            console.error(`❌ NETWORK ERROR: ${err.message}`);
        }
    } else {
        console.log('ℹ️ Tip: Set ADMIN_SECRET and NEXT_PUBLIC_APP_URL in .env to upload automatically next time.');
        console.log('Now go to Admin > System > Import and upload this file manually.');
    }
    console.log('=============================================');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
