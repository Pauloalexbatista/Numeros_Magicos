'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { loginRateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/rate-limiter';

export async function login(prevState: string | undefined, formData: FormData) {
    // Rate limiting check
    const email = formData.get('email') as string;
    const identifier = `login-${email}`;

    const isAllowed = loginRateLimiter.check(
        identifier,
        RATE_LIMITS.LOGIN.maxRequests,
        RATE_LIMITS.LOGIN.windowMs
    );

    if (!isAllowed) {
        const resetTime = Math.ceil(loginRateLimiter.getTimeUntilReset(identifier) / 1000 / 60);
        return `Demasiadas tentativas de login. Tente novamente em ${resetTime} minutos.`;
    }

    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/',
        });

        // Reset rate limit on successful login
        loginRateLimiter.reset(identifier);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
