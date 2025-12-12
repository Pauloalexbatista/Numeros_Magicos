'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerRateLimiter, RATE_LIMITS } from '@/lib/rate-limiter';
import { validateRegistrationData } from '@/lib/input-validator';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';


export async function registerUser(formData: FormData) {
    // Rate limiting check
    const identifier = `register-${formData.get('email')}`;
    const isAllowed = registerRateLimiter.check(
        identifier,
        RATE_LIMITS.REGISTER.maxRequests,
        RATE_LIMITS.REGISTER.windowMs
    );

    if (!isAllowed) {
        const resetTime = Math.ceil(registerRateLimiter.getTimeUntilReset(identifier) / 1000 / 60);
        return {
            error: `Demasiadas tentativas de registo. T ente novamente em ${resetTime} minutos.`
        };
    }

    // Validate and sanitize input
    const validation = validateRegistrationData(formData);
    if (!validation.valid) {
        return { error: validation.errors.join('. ') };
    }

    const { name, email, password } = validation.data!;
    const terms = formData.get('terms') === 'on';
    const newsletterOptIn = formData.get('newsletter') === 'on';

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
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                newsletterOptIn,
                role: 'USER' // Default role
            }
        });

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Delete any existing verification tokens for this user
        await prisma.verificationToken.deleteMany({
            where: {
                userId: newUser.id,
                type: 'EMAIL_VERIFICATION'
            }
        });

        // Create verification token
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: verificationToken,
                expires: expiresAt,
                type: 'EMAIL_VERIFICATION',
                userId: newUser.id
            }
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Reset rate limit on successful registration
        registerRateLimiter.reset(identifier);

        return { success: true, email: email };

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
