#!/usr/bin/env node
/**
 * MASTER VERIFICATION SCRIPT
 * Runs ALL verification checks to ensure nothing is forgotten
 * 
 * Usage: npm run verify:all
 */

import { execSync } from 'child_process';

const checks = [
    {
        name: '1. Database Connection',
        command: 'npx tsx src/scripts/debug/test-db-connection.ts',
        critical: true
    },
    {
        name: '2. Latest Draw Exists',
        command: 'npx tsx src/scripts/debug/verify-update.ts',
        critical: true
    },
    {
        name: '3. Number Systems Calculated',
        command: 'npx tsx src/scripts/debug/verify-update.ts',
        critical: true
    },
    {
        name: '4. Star Systems Calculated',
        command: 'npx tsx src/scripts/debug/verify-stars.ts',
        critical: true
    },
    {
        name: '5. Cached Predictions Exist',
        command: 'npx tsx src/scripts/monitoring/check-cached-predictions.ts',
        critical: false
    },
    {
        name: '6. Rankings Updated',
        command: 'npx tsx src/scripts/check-rankings.ts',
        critical: false
    }
];

console.log('🔍 MASTER VERIFICATION CHECKLIST');
console.log('='.repeat(60));
console.log();

let passed = 0;
let failed = 0;
let warnings = 0;

for (const check of checks) {
    process.stdout.write(`${check.name}... `);

    try {
        execSync(check.command, { stdio: 'pipe' });
        console.log('✅ PASS');
        passed++;
    } catch (error) {
        if (check.critical) {
            console.log('❌ FAIL (CRITICAL)');
            failed++;
        } else {
            console.log('⚠️ WARNING');
            warnings++;
        }
    }
}

console.log();
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️ Warnings: ${warnings}`);
console.log('='.repeat(60));

if (failed > 0) {
    console.error('\n🚨 CRITICAL FAILURES DETECTED!');
    process.exit(1);
}

console.log('\n✨ All critical checks passed!');
