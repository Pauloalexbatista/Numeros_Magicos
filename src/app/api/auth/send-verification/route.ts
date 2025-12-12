import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { message: 'Email já verificado' },
                { status: 200 }
            );
        }

        // Gerar token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // Deletar tokens antigos
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: email,
                type: 'EMAIL_VERIFICATION'
            }
        });

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
                type: 'EMAIL_VERIFICATION',
                userId: user.id
            }
        });

        // Enviar email
        const result = await sendVerificationEmail(email, token);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Erro ao enviar email' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Email de verificação enviado' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Erro ao enviar email' },
            { status: 500 }
        );
    }
}
