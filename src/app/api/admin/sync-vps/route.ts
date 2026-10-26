import { NextResponse } from 'next/server';
import { syncFromVPS } from '@/services/vps-sync-service';

export const dynamic = 'force-dynamic';

function hasValidAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  return authHeader === 'Bearer magia2026';
}

export async function POST(request: Request) {
  if (!hasValidAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const days = body.days ? Number(body.days) : 90;

    const result = await syncFromVPS(days);

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error('Error in /api/admin/sync-vps:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
