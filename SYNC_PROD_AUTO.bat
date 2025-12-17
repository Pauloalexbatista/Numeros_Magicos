@echo off
echo ========================================================
echo   NÚMEROS MÁGICOS - AUTO SYNC PRODUCTION 🚀
echo ========================================================
echo.
echo Este script lê a Connection String do .env automaticamente.
echo.
pause

echo.
echo [1/3] 📤 Exportando dados locais...
set DATABASE_URL=file:./prisma/dev.db
call npx tsx src/scripts/admin/export-local-db.ts

echo.
echo [2/3] 🧹 Limpando tabelas de produção...
set DATABASE_URL=postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

echo Limpando SystemPerformance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.systemPerformance.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo Limpando StarSystemPerformance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.starSystemPerformance.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo Limpando SystemRanking...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.systemRanking.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo Limpando StarSystemRanking...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.starSystemRanking.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo.
echo [3/3] 📥 Importando dados atualizados...

echo Importando System Performance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/system_performances.json', 'utf-8')); console.log('Importing', data.length, 'records...'); const batchSize = 1000; (async () => { for (let i = 0; i < data.length; i += batchSize) { const batch = data.slice(i, i + batchSize); await p.systemPerformance.createMany({ data: batch }); process.stdout.write('.'); } console.log('\nDone!'); })().finally(() => p.$disconnect());"

echo Importando Star Performance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/star_system_performance.json', 'utf-8')); console.log('Importing', data.length, 'records...'); p.starSystemPerformance.createMany({ data }).then(() => console.log('Done!')).finally(() => p.$disconnect());"

echo Importando System Rankings...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/system_rankings.json', 'utf-8')); console.log('Importing', data.length, 'records...'); p.systemRanking.createMany({ data }).then(() => console.log('Done!')).finally(() => p.$disconnect());"

echo Importando Star Rankings...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/star_system_ranking.json', 'utf-8')); console.log('Importing', data.length, 'records...'); p.starSystemRanking.createMany({ data }).then(() => console.log('Done!')).finally(() => p.$disconnect());"

echo.
echo ========================================================
echo ✅ SINCRONIZAÇÃO COMPLETA!
echo ========================================================
echo.
echo Quarteto Complementar agora está online! 🚀
echo.
pause
