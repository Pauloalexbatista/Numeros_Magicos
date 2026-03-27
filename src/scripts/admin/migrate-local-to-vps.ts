
import { PrismaClient as PrismaSQLite } from '@prisma/client';
// @ts-ignore
import { PrismaClient as PrismaPostgres } from '../node_modules/@prisma/client-prod';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Script para migrar dados do SQLite Local para o PostgreSQL da VPS.
 * 
 * Uso:
 * 1. Garante que o PostgreSQL está a correr na VPS.
 * 2. Atualiza o .env local com a URL do Postgres da VPS.
 * 3. Executa: npx tsx src/scripts/admin/migrate-local-to-vps.ts
 */

async function migrate() {
    console.log('🚀 Iniciando Migração Local -> VPS...');

    const sqlite = new PrismaSQLite();
    const postgres = new PrismaPostgres({
        datasources: {
            db: {
                url: process.env.DATABASE_URL_VPS // Define esta variável no teu .env
            }
        }
    });

    try {
        console.log('--- Lendo Sorteios do SQLite ---');
        const draws = await sqlite.draw.findMany();
        console.log(`📊 Encontrados ${draws.length} sorteios.`);

        console.log('--- Enviando para a VPS (Postgres) ---');
        // Usamos um loop simples para evitar timeouts, mas em transação para segurança
        for (const draw of draws) {
            const { id, ...drawData } = draw;
            await postgres.draw.upsert({
                where: { 
                    game_date: { game: draw.game, date: draw.date } 
                },
                update: drawData,
                create: drawData
            });
        }
        console.log('✅ Sorteios migrados.');

        console.log('--- Migrando Sistemas Rankeados ---');
        const systems = await sqlite.rankedSystem.findMany();
        for (const system of systems) {
            const { id, ...systemData } = system;
            await postgres.rankedSystem.upsert({
                where: { name_game: { name: system.name, game: system.game } },
                update: systemData,
                create: systemData
            });
        }
        console.log('✅ Sistemas migrados.');

        // PERFORMANCE: Esta tabela pode ser grande, vamos por partes
        console.log('--- Migrando Performance (Lote de 1000) ---');
        const countPerf = await sqlite.systemPerformance.count();
        console.log(`📊 Total de registos de performance: ${countPerf}`);
        
        for (let i = 0; i < countPerf; i += 1000) {
            const batch = await sqlite.systemPerformance.findMany({
                skip: i,
                take: 1000
            });
            
            // Inserir em lote no Postgres
            for (const p of batch) {
                const { id, ...pData } = p;
                // Nota: Precisamos do drawId correto no destino. 
                // Assumindo que o ID é o mesmo ou que o draw já existe.
                await postgres.systemPerformance.upsert({
                    where: { 
                        drawId_systemName_game: { 
                            drawId: p.drawId, 
                            systemName: p.systemName, 
                            game: p.game 
                        } 
                    },
                    update: pData,
                    create: pData
                });
            }
            console.log(`   Processed ${i + batch.length}/${countPerf}`);
        }

        console.log('🏆 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');

    } catch (e: any) {
        console.error('❌ Erro na migração:', e.message);
    } finally {
        await sqlite.$disconnect();
        await postgres.$disconnect();
    }
}

migrate();
