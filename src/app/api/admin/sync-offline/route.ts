
import { NextResponse } from 'next/server';
import { uploadPredictionPack } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('x-admin-secret');
        const secret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;

        if (!secret || authHeader !== secret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Use the existing logic from server action (but we can't call Server Action directly from API Route easily if it expects FormData or similar, 
        // but uploadPredictionPack expects a STRING (jsonString)).
        // Wait, server actions are simple async functions.

        const jsonString = JSON.stringify(data);
        const result = await uploadPredictionPack(jsonString);

        if (result.success) {
            return NextResponse.json({ success: true, message: result.message });
        } else {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Sync failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
