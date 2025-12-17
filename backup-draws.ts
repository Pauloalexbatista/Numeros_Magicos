/**
 * Backup da tabela Draw (Sorteios)
 * Exporta todos os sorteios para JSON como segurança
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function backupDraws() {
    console.log('📦 Creating backup of Draw table...\n');

    try {
        // Get all draws
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        console.log(`Found ${draws.length} draws to backup`);

        // Create backup directory if it doesn't exist
        const backupDir = path.join(process.cwd(), 'backups');
        await fs.mkdir(backupDir, { recursive: true });

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `draws-backup-${timestamp}.json`;
        const filepath = path.join(backupDir, filename);

        // Save to file
        await fs.writeFile(filepath, JSON.stringify(draws, null, 2), 'utf-8');

        console.log(`\n✅ Backup saved to: ${filepath}`);
        console.log(`   Total draws: ${draws.length}`);
        console.log(`   Date range: ${draws[0]?.date} to ${draws[draws.length - 1]?.date}`);

    } catch (error) {
        console.error('❌ Error creating backup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

backupDraws();
