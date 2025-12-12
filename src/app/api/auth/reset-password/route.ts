import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token e senha são obrigatórios' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Senha deve ter no mínimo 6 caracteres' },
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
                { error: 'Token expirado. Solicite um novo link de recuperação.' },
                { status: 400 }
            );
        }

        if (verificationToken.type !== 'PASSWORD_RESET') {
            return NextResponse.json(
                { error: 'Token inválido para reset de senha' },
                { status: 400 }
            );
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Atualizar senha do usuário
        await prisma.user.update({
            where: { id: verificationToken.userId! },
            data: { password: hashedPassword }
        });

        // Deletar token usado
        await prisma.verificationToken.delete({
            where: { token }
        });

        // Deletar todas as sessões do usuário por segurança
        await prisma.session.deleteMany({
            where: { userId: verificationToken.userId! }
        });

        return NextResponse.json({
            success: true,
            message: 'Senha redefinida com sucesso!'
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Erro ao redefinir senha' },
            { status: 500 }
        );
    }
}
