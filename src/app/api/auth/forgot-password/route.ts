import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email não fornecido' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Por segurança, sempre retornar sucesso mesmo se o email não existir
        // Isso evita que atacantes descubram emails válidos
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Se o email existir, você receberá as instruções em breve'
            });
        }

        // Gerar token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // Deletar tokens antigos de reset
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: email,
                type: 'PASSWORD_RESET'
            }
        });

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
                type: 'PASSWORD_RESET',
                userId: user.id
            }
        });

        // Enviar email
        const result = await sendPasswordResetEmail(email, token);

        if (!result.success) {
            console.error('Failed to send reset email:', result.error);
        }

        // Sempre retornar sucesso por segurança
        return NextResponse.json({
            success: true,
            message: 'Se o email existir, você receberá as instruções em breve'
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Erro ao processar solicitação' },
            { status: 500 }
        );
    }
}
