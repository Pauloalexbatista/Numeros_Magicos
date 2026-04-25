import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), 'backups');

async function backupDraws() {
    try {
        console.log(`[BACKUP] A iniciar exportação da Base de Dados (Tabela Draws)...`);
        
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const date = new Date();
        const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const backupFilename = `data_BD_Sorteios_${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupFilename);

        const allDraws = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        console.log(`[BACKUP] Encontrados ${allDraws.length} sorteios.`);
        
        fs.writeFileSync(backupPath, JSON.stringify(allDraws, null, 2), 'utf-8');
        
        console.log(`✅ [BACKUP] Sucesso! Guardado em: ${backupPath}`);
        
        // Cleanup old backups (keep last 4 weeks)
        const files = fs.readdirSync(BACKUP_DIR);
        const backupFiles = files.filter(f => f.startsWith('data_BD_Sorteios_') && f.endsWith('.json'))
                                 .sort((a, b) => b.localeCompare(a)); // Descending
                                 
        if (backupFiles.length > 4) {
            for (let i = 4; i < backupFiles.length; i++) {
                const oldFile = path.join(BACKUP_DIR, backupFiles[i]);
                fs.unlinkSync(oldFile);
                console.log(`[BACKUP] Limpo backup antigo: ${backupFiles[i]}`);
            }
        }

    } catch (error) {
        console.error('❌ [BACKUP] Falha:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

backupDraws();
