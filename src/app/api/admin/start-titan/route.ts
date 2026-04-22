import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

let isTitanRunning = false;

export async function POST(request: Request) {
    try {
        const { secret } = await request.json();
        if (secret !== 'magia2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (isTitanRunning) return NextResponse.json({ error: 'O Titan já está em andamento na VPS (pode demorar dias).' }, { status: 400 });
        
        const tsxPath = path.join(process.cwd(), 'node_modules/.bin/tsx');
        const scriptPath = path.join(process.cwd(), 'src/scripts/titan-light.ts');

        console.log(`🚀 [API] DISPARANDO MOTOR TITAN: ${scriptPath}`);
        
        if (!fs.existsSync(tsxPath)) {
             return NextResponse.json({ error: 'Binário tsx não encontrado.' }, { status: 500 });
        }

        const child = spawn(tsxPath, [scriptPath], {
            detached: true,
            stdio: 'ignore',
            env: { ...process.env }
        });

        child.on('error', (err) => console.error('❌ Titan Spawn Error:', err));
        child.unref();

        await prisma.statisticsCache.upsert({
            where: { key: 'TITAN_PROGRESS' },
            update: { data: JSON.stringify({ isRunning: true, game: 'STARTING', domain: 'INITIALIZING', pct: 0, updatedAt: new Date() }) },
            create: { key: 'TITAN_PROGRESS', data: JSON.stringify({ isRunning: true, game: 'STARTING', domain: 'INITIALIZING', pct: 0 }) }
        });

        return NextResponse.json({ success: true, message: 'Motor Titan (Classifier) arrancou em segundo plano na VPS!' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
