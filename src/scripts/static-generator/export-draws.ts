
import { prisma } from '../../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

const STATIC_DIR = path.join(process.cwd(), 'src/data/static');

async function main() {
    console.log('💾 Exporting ALL Draws from Local DB...');

    // Ensure directory exists
    await fs.mkdir(STATIC_DIR, { recursive: true });

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`✅ Found ${draws.length} draws.`);

    const exportPath = path.join(STATIC_DIR, 'draws-export.json');

    // Process draws to ensure generic JSON compatibility
    const processedDraws = draws.map(d => ({
        ...d,
        // Ensure strings are valid JSON strings if needed, though they usually are
    }));

    await fs.writeFile(exportPath, JSON.stringify(processedDraws, null, 2));
    console.log(`✅ Exported to ${exportPath}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
