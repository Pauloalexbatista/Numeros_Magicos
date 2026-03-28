const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Smart Build Setup...');

// Detect Production (Vercel or Docker with VERCEL=true or NODE_ENV=production)
const isProduction = process.env.VERCEL === 'true' || process.env.NODE_ENV === 'production';

if (isProduction) {
    console.log('✅ Detected Production Environment (Docker/Vercel).');

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
        
        // Priority: If DATABASE_URL is defined, it defines the engine. 
        // If not, we check for Postgres-specific Vercel/Neon variables.
        const dbUrl = process.env.DATABASE_URL || '';
        const usePostgres = dbUrl.startsWith('postgres') || (!dbUrl && process.env.POSTGRES_PRISMA_URL);
        
        if (usePostgres && fs.existsSync('prisma/schema.postgresql.prisma')) {
            console.log('🐘 Switching to Postgres Schema...');
            let schema = fs.readFileSync('prisma/schema.postgresql.prisma', 'utf8');
            // Remove specific output path if present to use default node_modules
            schema = schema.replace(/output\s*=\s*".*client-prod"/g, '');
            fs.writeFileSync('prisma/schema.prisma', schema);
            console.log('✅ Schema synchronized with Postgres version.');
        } else {
            console.log('📦 Keeping/Using SQLite Schema (file: detected or no Postgres URL).');
        }
        
        // 3. Generate Client
        console.log('⚙️ Generating Prisma Client...');
        execSync('npx prisma@5.22.0 generate', { stdio: 'inherit' });

        // 4. Note about DB Push
        console.log('⏭️  Skipping DB Push during build phase (handled at runtime).');

    } catch (error) {
        console.error('❌ Production build setup failed:', error);
        process.exit(1);
    }

} else {
    console.log('💻 Detected Local Environment (Development).');
    // ... (rest remains similar)
    try {
        execSync('npx prisma@5.22.0 generate', { stdio: 'inherit' });
        console.log('📦 Pushing Schema to Local DB...');
        execSync('npx prisma@5.22.0 db push --accept-data-loss', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Local build setup failed:', error);
        process.exit(1);
    }
}
