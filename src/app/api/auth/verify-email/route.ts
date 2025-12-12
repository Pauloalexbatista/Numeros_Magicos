import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Token não fornecido' },
                { status: 400 }
            );
        }

        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!verificationToken) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 400 }
            );
        }

        if (verificationToken.expires < new Date()) {
            // Deletar token expirado
            await prisma.verificationToken.delete({
                where: { token }
            });

            return NextResponse.json(
                { error: 'Token expirado' },
                { status: 400 }
            );
        }

        if (verificationToken.type !== 'EMAIL_VERIFICATION') {
            return NextResponse.json(
                { error: 'Token inválido para verificação de email' },
                { status: 400 }
            );
        }

        // Atualizar user
        await prisma.user.update({
            where: { id: verificationToken.userId! },
            data: { emailVerified: new Date() }
        });

        // Deletar token usado
        await prisma.verificationToken.delete({
            where: { token }
        });

        return NextResponse.json({
            success: true,
            message: 'Email verificado com sucesso!'
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Erro ao verificar email' },
            { status: 500 }
        );
    }
}
