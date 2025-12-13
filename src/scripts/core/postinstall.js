const { execSync } = require('child_process');

console.log('🔄 Running Post-Install Script...');

if (process.env.VERCEL) {
    console.log('✅ Detected Vercel Environment.');
    console.log('🚀 Generating Prisma Client for PostgreSQL (Production)...');
    try {
        execSync('npx prisma generate --schema=prisma/schema.postgresql.prisma', { stdio: 'inherit' });
        console.log('✨ Prisma Client generated successfully for Production.');
    } catch (error) {
        console.error('❌ Failed to generate Prisma Client for Production:', error);
        process.exit(1);
    }
} else {
    console.log('💻 Detected Local Environment.');
    console.log('🛠️  Generating Prisma Client for Default Schema (SQLite)...');
    try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✨ Prisma Client generated successfully for Development.');
    } catch (error) {
        console.error('❌ Failed to generate Prisma Client for Development:', error);
        process.exit(1);
    }
}
