import dotenv from 'dotenv';
dotenv.config();
import { prisma as prismaLocal } from '../../lib/prisma';
import { PrismaClient as PrismaProd } from '@prisma/client-prod';
import { MegaSenaService } from '../../services/megaSenaService';

const prodUrl = process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@172.16.16.6:5432/numeros_magicos_prod?connection_limit=1';
const prodPrisma = new PrismaProd({ datasources: { db: { url: prodUrl } } });

async function run() {
    console.log('================================================');
    console.log('  MEGA-SENA DIAGNOSTIC & SYNC TOOL');
    console.log('================================================\n');

    console.log('1. Checking Local DB...');
    const localMs = await prismaLocal.draw.findFirst({
        where: { game: 'MEGASENA' },
        orderBy: { date: 'desc' }
    });
    console.log('   Local Latest Date:', localMs?.date.toISOString().split('T')[0], '| Concurso:', localMs?.sequenceNumber, '| Numbers:', localMs?.numbers);

    console.log('\n2. Checking Production VPS DB...');
    try {
        const prodMs = await prodPrisma.draw.findFirst({
            where: { game: 'MEGASENA' },
            orderBy: { date: 'desc' }
        });
        console.log('   Prod Latest Date:', prodMs?.date.toISOString().split('T')[0], '| Concurso:', prodMs?.sequenceNumber, '| Numbers:', prodMs?.numbers);
    } catch (e: any) {
        console.error('   Prod DB Error:', e.message);
    }

    console.log('\n3. Fetching Latest Mega-Sena Draw online from API...');
    const msService = new MegaSenaService();
    try {
        const onlineDraw = await msService.fetchLatest();
        console.log('   Online API Latest Date:', onlineDraw.date, '| Concurso:', onlineDraw.concurso, '| Numbers:', onlineDraw.numbers);

        console.log('\n4. Executing updateDatabase() for Mega-Sena...');
        const updated = await msService.updateDatabase();
        console.log('   updateDatabase() Result:', updated ? 'NEW DRAW ADDED & PROCESSED! ✅' : 'ALREADY UP TO DATE ⏩');
    } catch (e: any) {
        console.error('   API Fetch Error:', e.message);
    }

    console.log('\n================================================\n');
}

run().catch(console.error);
