// Simple in-memory rate limiter for localhost/development
// For production (Vercel), consider using Upstash Redis or Vercel KV

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private requests: Map<string, RateLimitEntry> = new Map();

    /**
     * Check if request is allowed
     * @param identifier - IP address or user identifier
     * @param maxRequests - Maximum requests allowed
     * @param windowMs - Time window in milliseconds
     * @returns true if allowed, false if rate limited
     */
    check(identifier: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const entry = this.requests.get(identifier);

        // Clean up expired entries periodically (every 100 requests)
        if (this.requests.size > 100 && Math.random() < 0.01) {
            this.cleanup();
        }

        if (!entry || now > entry.resetTime) {
            // First request or window expired - reset
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + windowMs
            });
            return true;
        }

        if (entry.count < maxRequests) {
            // Within limit - increment
            entry.count++;
            return true;
        }

        // Rate limited
        return false;
    }

    /**
     * Get time until reset for identifier
     */
    getTimeUntilReset(identifier: string): number {
        const entry = this.requests.get(identifier);
        if (!entry) return 0;
        return Math.max(0, entry.resetTime - Date.now());
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.requests.entries()) {
            if (now > entry.resetTime) {
                this.requests.delete(key);
            }
        }
    }

    /**
     * Reset rate limit for identifier (useful for testing or after successful action)
     */
    reset(identifier: string): void {
        this.requests.delete(identifier);
    }
}

// Singleton instances for different rate limit types
export const loginRateLimiter = new RateLimiter();
export const registerRateLimiter = new RateLimiter();
export const apiRateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
    LOGIN: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    REGISTER: {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    API: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
} as const;

/**
 * Get client identifier from request (IP address or fallback)
 */
export function getClientIdentifier(request: Request): string {
    // Try to get real IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback to a combination of user-agent and accept-language
    // Not perfect but better than nothing for localhost
    const ua = request.headers.get('user-agent') || 'unknown';
    const lang = request.headers.get('accept-language') || 'unknown';
    return `${ua.substring(0, 50)}-${lang}`;
}
