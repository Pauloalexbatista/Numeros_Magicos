import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (body.secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check if RF Engine is already running
        const cacheRaw = await prisma.statisticsCache.findUnique({
             where: { key: 'RF_PROGRESS' }
        });
        
        if (cacheRaw && cacheRaw.data) {
             const data = (typeof cacheRaw.data === "string" ? JSON.parse(cacheRaw.data) : cacheRaw.data);
             if (data.isRunning === true) {
                 return NextResponse.json({ success: false, error: 'O Motor RF já se encontra em Execução.' }, { status: 400 });
             }
        }

        // 2. Identify paths
        const tsxPath = path.join(process.cwd(), 'node_modules/.bin/tsx');
        const scriptPath = path.join(process.cwd(), 'src/scripts/titan-rf.ts');

        console.log(`🚀 [API] DISPARANDO MOTOR RF: ${scriptPath}`);
        
        if (!fs.existsSync(tsxPath)) {
            console.error('❌ TSX BINARY NOT FOUND AT:', tsxPath);
            return NextResponse.json({ success: false, error: 'Binário de execução (tsx) não encontrado no servidor.' }, { status: 500 });
        }

        // 3. Spawn process
        const child = spawn(tsxPath, [scriptPath], {
            detached: true,
            stdio: 'ignore', // Ignore for detached, but we could pipe to file for logs
            env: { ...process.env }
        });

        child.on('error', (err) => {
            console.error('❌ FAILED TO SPAWN RF PROCESS:', err);
        });

        child.unref();

        // 4. Record the start attempt in cache for immediate UI feedback
        await prisma.statisticsCache.upsert({
            where: { key: 'RF_PROGRESS' },
            update: { data: JSON.stringify({ isRunning: true, game: 'STARTING', domain: 'INITIALIZING', pct: 0, updatedAt: new Date() }) },
            create: { key: 'RF_PROGRESS', data: JSON.stringify({ isRunning: true, game: 'STARTING', domain: 'INITIALIZING', pct: 0 }) }
        });

        return NextResponse.json({
            success: true,
            message: 'Comando enviado! O Motor Random Forest deve aparecer no painel em breves instantes.',
        });

    } catch (error: any) {
        console.error('Trigger RF Engine error:', error);
        return NextResponse.json(
            { success: false, error: 'Falha crítica ao disparar o motor RF: ' + error.message },
            { status: 500 }
        );
    }
}
