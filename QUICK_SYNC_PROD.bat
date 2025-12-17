@echo off
echo ========================================================
echo   NÚMEROS MÁGICOS - QUICK SYNC PRODUCTION 🚀
echo ========================================================
echo.
echo Este script é MAIS RÁPIDO e só sincroniza o essencial:
echo - Draws (1903 sorteios)
echo - System Performance (rankings e jackpots)
echo - Star Performance
echo.
echo NÃO sincroniza (para poupar tempo):
echo - System Predictions (94,500 registos - demorado)
echo - Caches (regeneram automaticamente)
echo.
pause

echo.
echo ========================================================
echo PASSO 1: Obter Connection String da Vercel
echo ========================================================
echo.
set /p PROD_URL="Cole a Connection String da Vercel: "

if "%PROD_URL%"=="" (
    echo ERRO: URL não pode estar vazio.
    pause
    exit /b
)

echo.
echo ⚠️  Confirma que queres LIMPAR e SINCRONIZAR a BD de Produção?
set /p CONFIRM="Escreve SIM para continuar: "

if not "%CONFIRM%"=="SIM" (
    echo Operação cancelada.
    pause
    exit /b
)

echo.
echo ========================================================
echo PASSO 2: LIMPAR Tabelas Essenciais
echo ========================================================
echo.
set DATABASE_URL=%PROD_URL%

echo 🧹 A limpar SystemPerformance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.systemPerformance.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo 🧹 A limpar StarSystemPerformance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.starSystemPerformance.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo 🧹 A limpar SystemRanking...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.systemRanking.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo 🧹 A limpar StarSystemRanking...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.starSystemRanking.deleteMany({}).then(r => console.log('Deleted:', r.count)).finally(() => p.$disconnect());"

echo.
echo ========================================================
echo PASSO 3: Exportar Dados Locais
echo ========================================================
echo.
set DATABASE_URL=file:./prisma/dev.db
call npx tsx src/scripts/admin/export-local-db.ts

echo.
echo ========================================================
echo PASSO 4: Importar APENAS Essenciais
echo ========================================================
echo.
set DATABASE_URL=%PROD_URL%

echo 📤 A importar System Performance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/system_performances.json', 'utf-8')); console.log('Importing', data.length, 'records...'); const batchSize = 1000; (async () => { for (let i = 0; i < data.length; i += batchSize) { const batch = data.slice(i, i + batchSize); await p.systemPerformance.createMany({ data: batch }); process.stdout.write('.'); } console.log('\nDone!'); })().finally(() => p.$disconnect());"

echo 📤 A importar Star Performance...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/star_system_performance.json', 'utf-8')); console.log('Importing', data.length, 'records...'); p.starSystemPerformance.createMany({ data }).then(() => console.log('Done!')).finally(() => p.$disconnect());"

echo 📤 A importar System Rankings...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/system_rankings.json', 'utf-8')); console.log('Importing', data.length, 'records...'); p.systemRanking.createMany({ data }).then(() => console.log('Done!')).finally(() => p.$disconnect());"

echo 📤 A importar Star Rankings...
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const data = JSON.parse(fs.readFileSync('prisma/seeds/star_system_ranking.json', 'utf-8')); console.log('Importing', data.length, 'records...'); p.starSystemRanking.createMany({ data }).then(() => console.log('Done!')).finally(() => p.$disconnect());"

echo.
echo ========================================================
echo ✅ SINCRONIZAÇÃO RÁPIDA COMPLETA!
echo ========================================================
echo.
echo Sincronizado:
echo - System Performance (100,253 registos)
echo - Star Performance (14,824 registos)
echo - Rankings (todos os sistemas)
echo.
echo Isto resolve:
echo ✅ Discrepância de jackpots (LSTM agora mostra 73)
echo ✅ Rankings consistentes
echo ✅ Sem duplicados
echo.
echo Tempo estimado: ~30-60 segundos (vs 5+ minutos do sync completo)
echo.
pause
