import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, taskName, totalSteps } = body;

        if (action === 'CREATE') {
            const task = await prisma.aITask.upsert({
                where: { taskName },
                update: { status: 'IDLE', currentStep: 0, totalSteps, lastError: null },
                create: { taskName, status: 'IDLE', currentStep: 0, totalSteps }
            });
            return NextResponse.json({ success: true, task });
        }

        if (action === 'UPDATE_STEP') {
            const { step, metadata } = body;
            const task = await prisma.aITask.update({
                where: { taskName },
                data: { 
                    currentStep: step,
                    metadata: JSON.stringify(metadata),
                    status: step >= (await prisma.aITask.findUnique({ where: { taskName } }))?.totalSteps! ? 'COMPLETED' : 'PAUSED'
                }
            });
            return NextResponse.json({ success: true, task });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const taskName = searchParams.get('taskName');

    if (!taskName) {
        const tasks = await prisma.aITask.findMany();
        return NextResponse.json({ success: true, tasks });
    }

    const task = await prisma.aITask.findUnique({ where: { taskName } });
    return NextResponse.json({ success: true, task });
}
