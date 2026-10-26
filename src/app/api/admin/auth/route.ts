import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();
    const validSecret = process.env.ADMIN_SECRET || 'magia2026';

    if (secret === validSecret) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_secret', secret, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Chave mestra inválida.' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
