import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Carregar .env
dotenv.config();

/**
 * Script de Diagnóstico de Conexão VPS
 * Objetivo: Verificar se a base de dados centralizada (Hostinger) está acessível
 */
async function testConnection() {
    const vpsUrl = process.env.DATABASE_URL_VPS;

    if (!vpsUrl) {
        console.error('❌ ERRO: DATABASE_URL_VPS não definida no ficheiro .env');
        process.exit(1);
    }

    console.log('🔍 Iniciando teste de diagnóstico de conexão...');
    console.log(`🌐 Alvo: 187.124.32.121 (PostgreSQL)`);

    // Criar um cliente temporário apontando para a VPS
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: vpsUrl,
            },
        },
    });

    try {
        const startTime = Date.now();
        console.log('⏳ Tentando conectar...');
        
        // Simples query para testar
        const result = await prisma.$queryRaw`SELECT current_database(), now()`;
        
        const duration = Date.now() - startTime;
        console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
        console.log(`⏱️ Latência: ${duration}ms`);
        console.log('📊 Resultado:', result);

        // Contar sorteios como teste de dados
        const drawCount = await prisma.draw.count();
        console.log(`🔢 Total de sorteios na produção: ${drawCount}`);

    } catch (error: any) {
        console.error('❌ ERRO DE CONEXÃO CRÍTICO:');
        console.error(`- Código: ${error.code || 'N/A'}`);
        console.error(`- Mensagem: ${error.message}`);
        
        if (error.message.includes('Can\'t reach database server')) {
            console.error('\n💡 Sugestão: A Hostinger pode estar a bloquear o IP local ou o serviço de base de dados (Docker) está parado na VPS.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
