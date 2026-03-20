import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper to check the secret word
function hasValidSecret(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    return secret === 'magia2026'; // Match the admin health route
}

// GET: Retornar todos os sistemas
export async function GET(request: Request) {
    if (!hasValidSecret(request)) {
        // Fallback to checking Authorization header if sent via fetch options
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== 'Bearer magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        const systems = await prisma.rankedSystem.findMany({
            orderBy: [
                { game: 'asc' },
                { systemType: 'asc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json({ systems });
    } catch (error) {
        console.error('Error fetching systems:', error);
        return NextResponse.json({ error: 'Failed to fetch systems' }, { status: 500 });
    }
}

// PATCH: Atualizar o estado de um sistema
export async function PATCH(request: Request) {
    // Check Authorization header for PATCH requests
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== 'Bearer magia2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, isActive } = body;

        if (id === undefined || isActive === undefined) {
             return NextResponse.json({ error: 'Missing id or isActive' }, { status: 400 });
        }

        const updatedSystem = await prisma.rankedSystem.update({
            where: { id: Number(id) },
            data: { isActive: Boolean(isActive) }
        });

        return NextResponse.json({ success: true, system: updatedSystem });
    } catch (error) {
        console.error('Error updating system:', error);
        return NextResponse.json({ error: 'Failed to update system' }, { status: 500 });
    }
}
