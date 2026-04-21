import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        if (searchParams.get('secret') !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Try a simple query
        const startTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - startTime;

        // 2. Get obfuscated DB URL from lib/prisma
        // We'll just report if it's external or internal
        const dbUrl = process.env.DATABASE_URL || 'UNDEFINED';
        const isInternal = dbUrl.includes('172.16') || dbUrl.includes('localhost');

        return NextResponse.json({ 
            success: true, 
            message: 'VPS Conetada com sucesso à Base de Dados!',
            responseTime: `${duration}ms`,
            isInternal,
            env: process.env.NODE_ENV
        });

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: 'A VPS NÃO consegue ligar-se à Base de Dados.',
            details: error.message,
            hint: 'Verifica se a DATABASE_URL no Coolify/Docker está correta e se a base de dados está ativa.'
        }, { status: 500 });
    }
}
