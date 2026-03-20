const { execSync } = require('child_process');

console.log('🚀 Starting Smart Build Setup...');

if (process.env.VERCEL) {
    console.log('✅ Detected Vercel Environment (Production).');

    try {
        // 0. Clean Cache
        console.log('🧹 Cleaning Prisma Client...');
        try {
            execSync('rm -rf node_modules/.prisma', { stdio: 'inherit' });
        } catch (e) {
            console.log('⚠️ Failed to clean cache (ignoring)');
        }

        // 2. Modify schema to output to default client for Next.js build
        console.log('🛠️  Generating Prisma Client (PostgreSQL for App)...');
        const fs = require('fs');
        let schema = fs.readFileSync('prisma/schema.postgresql.prisma', 'utf8');
        schema = schema.replace(/output\s*=\s*".*client-prod"/g, '');
        fs.writeFileSync('prisma/schema.prisma', schema);
        
        execSync('npx prisma generate', { stdio: 'inherit' });

        // NOTE: We skip 'db push' during Docker build because secrets are not available.
        // Sync happens at runtime or manually.
        console.log('⏭️  Skipping DB Push during build phase.');

    } catch (error) {
        console.error('❌ Production build setup failed:', error);
        process.exit(1);
    }

} else {
    console.log('💻 Detected Local Environment (Development).');

    try {
        // 1. Generate Client for SQLite (Default)
        console.log('🛠️  Generating Prisma Client (SQLite)...');
        execSync('npx prisma generate', { stdio: 'inherit' });

        // 2. Push Schema to Local DB
        console.log('📦 Pushing Schema to Local DB...');
        // We skip push on build locally sometimes, but let's keep consistency with original script
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

    } catch (error) {
        console.error('❌ Local build setup failed:', error);
        process.exit(1);
    }
}
