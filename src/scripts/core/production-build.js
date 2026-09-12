const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Smart Build Setup...');

// Detect Production (Coolify, Docker, or NODE_ENV=production)
const isProduction = process.env.NODE_ENV === 'production' || process.env.COOLIFY === 'true' || !!process.env.COOLIFY_APP_ID;

if (isProduction) {
    console.log('✅ Detected Production Environment (Coolify/Docker).');

    try {
        // 1. Clean Cache
        console.log('🧹 Cleaning Prisma Client...');
        try {
            if (fs.existsSync('node_modules/.prisma')) {
                execSync('rm -rf node_modules/.prisma', { stdio: 'inherit' });
            }
        } catch (e) {
            console.log('⚠️ Failed to clean cache (ignoring)');
        }

        // 2. Prepare schema for Production (Postgres vs SQLite)
        console.log('🛠️  Preparing Database Schema...');
        
        const dbUrl = process.env.DATABASE_URL || '';
        const usePostgres = dbUrl.startsWith('postgres') || isProduction || process.env.POSTGRES_PRISMA_URL;
        
        if (usePostgres) {
            console.log('🐘 FORCING Postgres Schema (Production Mode)...');
            let schema;
            if (fs.existsSync('prisma/schema.postgresql.prisma')) {
                schema = fs.readFileSync('prisma/schema.postgresql.prisma', 'utf8');
            } else {
                // Fallback: adapt prisma/schema.prisma to postgresql provider
                schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
                schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
                schema = schema.replace(/url\s*=\s*"file:.*"/, 'url = env("DATABASE_URL")');
            }
            // Remove specific output path if present to use default node_modules
            schema = schema.replace(/output\s*=\s*".*client-prod"/g, '');
            fs.writeFileSync('prisma/schema.prisma', schema);
            console.log('✅ Schema synchronized with Postgres version.');
        } else {
            console.log('📦 Using SQLite Schema (Developer/Local Mode).');
        }

        // 3. Generate Client (use local binary first, then npx fallback)
        console.log('⚙️ Generating Prisma Client...');
        try {
            execSync('npx prisma generate', { stdio: 'inherit' });
        } catch (genErr) {
            console.warn('⚠️ npx prisma generate failed, trying direct binary path...');
            execSync('./node_modules/.bin/prisma generate', { stdio: 'inherit' });
        }

        // 4. Note about DB Push
        console.log('⏭️  Skipping DB Push during build phase (handled at runtime via entrypoint).');
        
        // 5. Set Build Mode Flag
        process.env.NEXT_PHASE = 'phase-production-build';
        process.env.IS_BUILD_STAGING = 'true';

    } catch (error) {
        console.error('❌ Production build setup failed:', error);
        process.exit(1);
    }

} else {
    console.log('💻 Detected Local Environment (Development).');
    try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('📦 Pushing Schema to Local DB...');
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Local build setup failed:', error);
        process.exit(1);
    }
}
