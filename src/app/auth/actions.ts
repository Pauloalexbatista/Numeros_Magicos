'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const terms = formData.get('terms') === 'on';
    const newsletterOptIn = formData.get('newsletter') === 'on';

    if (!name || !email || !password) {
        return { error: 'Por favor, preencha todos os campos obrigatórios.' };
    }

    if (!terms) {
        return { error: 'Tem de aceitar os Termos e Condições para criar conta.' };
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'Este email já está registado.' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                newsletterOptIn,
                role: 'USER' // Default role
            }
        });

        return { success: true };

    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Ocorreu um erro ao criar a conta. Tente novamente.' };
    }
}

export async function updatePassword(formData: FormData) {
    const email = formData.get('email') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!newPassword || !confirmPassword) {
        return { error: 'Preencha todos os campos.' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'As passwords não coincidem.' };
    }

    if (newPassword.length < 6) {
        return { error: 'A password deve ter pelo menos 6 caracteres.' };
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error('Password update error:', error);
        return { error: 'Erro ao atualizar a password.' };
    }
}
