import { prisma } from './src/lib/prisma';
import * as fs from 'fs';

async function deepCheck() {
    console.log('🔍 VERIFICAÇÃO PROFUNDA DA BD\n');

    // Check file size
    const stats = fs.statSync('./prisma/dev.db');
    console.log(`📁 Tamanho do ficheiro: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📅 Última modificação: ${stats.mtime}\n`);

    // Try raw query
    try {
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM Draw`;
        console.log('📊 Raw Query - Draws:', result);
    } catch (e: any) {
        console.error('❌ Erro raw query:', e.message);
    }

    // Check tables
    try {
        const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
        console.log('\n📋 Tabelas na BD:', tables);
    } catch (e) {
        console.error('❌ Erro listar tabelas:', e.message);
    }

    await prisma.$disconnect();
}

deepCheck();
