// Test script for rate limiter functionality
// Run with: npx tsx src/__tests__/security/test-rate-limiter.ts

import { loginRateLimiter, registerRateLimiter, RATE_LIMITS } from '@/lib/rate-limiter';

console.log('🧪 Testing Rate Limiter...\n');

// Test 1: Login Rate Limiter
console.log('Test 1: Login Rate Limiter');
console.log('Max requests:', RATE_LIMITS.LOGIN.maxRequests);
console.log('Window:', RATE_LIMITS.LOGIN.windowMs / 1000 / 60, 'minutes\n');

const testEmail = 'test@example.com';
const loginIdentifier = `login-${testEmail}`;

// Should allow first 5 requests
for (let i = 1; i <= RATE_LIMITS.LOGIN.maxRequests; i++) {
    const allowed = loginRateLimiter.check(
        loginIdentifier,
        RATE_LIMITS.LOGIN.maxRequests,
        RATE_LIMITS.LOGIN.windowMs
    );
    console.log(`  Request ${i}: ${allowed ? '✅ Allowed' : '❌ Blocked'}`);
}

// 6th request should be blocked
const blocked = loginRateLimiter.check(
    loginIdentifier,
    RATE_LIMITS.LOGIN.maxRequests,
    RATE_LIMITS.LOGIN.windowMs
);
console.log(`  Request 6: ${blocked ? '❌ FAIL - Should be blocked' : '✅ PASS - Blocked as expected'}`);

// Check time until reset
const timeUntilReset = loginRateLimiter.getTimeUntilReset(loginIdentifier);
console.log(`  Time until reset: ${Math.ceil(timeUntilReset / 1000 / 60)} minutes\n`);

// Test 2: Reset functionality
console.log('Test 2: Reset Functionality');
loginRateLimiter.reset(loginIdentifier);
const allowedAfterReset = loginRateLimiter.check(
    loginIdentifier,
    RATE_LIMITS.LOGIN.maxRequests,
    RATE_LIMITS.LOGIN.windowMs
);
console.log(`  After reset: ${allowedAfterReset ? '✅ PASS - Allowed after reset' : '❌ FAIL - Should be allowed'}\n`);

// Test 3: Register Rate Limiter (stricter limits)
console.log('Test 3: Register Rate Limiter');
console.log('Max requests:', RATE_LIMITS.REGISTER.maxRequests);
console.log('Window:', RATE_LIMITS.REGISTER.windowMs / 1000 / 60, 'minutes\n');

const registerIdentifier = `register-${testEmail}`;

for (let i = 1; i <= RATE_LIMITS.REGISTER.maxRequests; i++) {
    const allowed = registerRateLimiter.check(
        registerIdentifier,
        RATE_LIMITS.REGISTER.maxRequests,
        RATE_LIMITS.REGISTER.windowMs
    );
    console.log(`  Request ${i}: ${allowed ? '✅ Allowed' : '❌ Blocked'}`);
}

// 4th request should be blocked
const blockedRegister = registerRateLimiter.check(
    registerIdentifier,
    RATE_LIMITS.REGISTER.maxRequests,
    RATE_LIMITS.REGISTER.windowMs
);
console.log(`  Request 4: ${blockedRegister ? '❌ FAIL - Should be blocked' : '✅ PASS - Blocked as expected'}\n`);

// Test 4: Different identifiers don't affect each other
console.log('Test 4: Isolation between identifiers');
const user1 = 'user1@example.com';
const user2 = 'user2@example.com';

loginRateLimiter.check(`login-${user1}`, RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs);
const user2Allowed = loginRateLimiter.check(`login-${user2}`, RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs);

console.log(`  User 2 request: ${user2Allowed ? '✅ PASS - Independent limits' : '❌ FAIL - Should be allowed'}\n`);

console.log('✅ All rate limiter tests completed!\n');
