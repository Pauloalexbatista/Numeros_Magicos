import fs from 'fs';
import path from 'path';

// This script patches all 6 LSTM service files to use the customDraws slice dynamically 
// instead of hardcoding a read from the DB for the "nextPrediction" evaluation during training.
// This is critical so that historic backfills don't taint logic with future "latest" values.

const servicesPath = path.join(process.cwd(), 'src/services/neural');

const files = [
    'euromillions-numbers-neural.ts',
    'euromillions-stars-neural.ts',
    'eurodreams-numbers-neural.ts',
    'eurodreams-dreams-neural.ts',
    'totoloto-numbers-neural.ts',
    'totoloto-lucky-neural.ts'
];

let successful = 0;

for (const file of files) {
    const fullPath = path.join(servicesPath, file);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Identify the exact prisma query being made
    const regex = /const\s+latestDrawsForPrediction\s*=\s*await\s*prisma\.draw\.findMany\(\{\s*where:\s*\{\s*game:\s*(GAME_NAME|'[^']+')\s*\},.*?(?:id|date):\s*'desc'.*?take:\s*SEQUENCE_LENGTH\s*\}\);/gs;

    if (regex.test(content)) {
        const replacement = `let latestDrawsForPrediction: any[] = [];
        if (customDraws && customDraws.length >= SEQUENCE_LENGTH) {
            latestDrawsForPrediction = [...customDraws].slice(-SEQUENCE_LENGTH).reverse();
        } else {
            latestDrawsForPrediction = await prisma.draw.findMany({
                where: { game: GAME_NAME },
                orderBy: { date: 'desc' },
                take: SEQUENCE_LENGTH
            });
        }`;
        
        content = content.replace(regex, replacement);
        fs.writeFileSync(fullPath, content);
        successful++;
        console.log(`✅ Patched: ${file}`);
    } else {
        console.log(`⚠️ Regex did not match or already patched in: ${file}`);
    }
}

console.log(`\n🎉 Process finished. ${successful} files patched.`);
