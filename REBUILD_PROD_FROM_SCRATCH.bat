@echo off
echo ========================================================
echo   NÚMEROS MÁGICOS - REBUILD PRODUCTION FROM SCRATCH
echo ========================================================
echo.
echo Este script vai:
echo 1. APAGAR TUDO da BD de Produção (PostgreSQL)
echo 2. RECALCULAR tudo de raiz (não importar!)
echo 3. Garantir ZERO duplicados
echo.
echo ⚠️  AVISO: Isto vai demorar ~10-15 minutos
echo    O site ficará sem dados durante este tempo.
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
echo ⚠️  ÚLTIMA CONFIRMAÇÃO
echo    Isto vai APAGAR TUDO e RECALCULAR de raiz!
set /p CONFIRM="Escreve SIM para continuar: "

if not "%CONFIRM%"=="SIM" (
    echo Operação cancelada.
    pause
    exit /b
)

echo.
echo ========================================================
echo PASSO 2: LIMPAR Base de Dados de Produção
echo ========================================================
echo.
set DATABASE_URL=%PROD_URL%
call npx tsx src/scripts/admin/clean-production-db.ts

if errorlevel 1 (
    echo ❌ ERRO ao limpar BD!
    pause
    exit /b
)

echo.
echo ========================================================
echo PASSO 3: Importar APENAS Sorteios (Base)
echo ========================================================
echo.
echo 📥 A exportar sorteios da BD local...
set DATABASE_URL=file:./prisma/dev.db
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); p.draw.findMany({ orderBy: { date: 'asc' } }).then(draws => { fs.writeFileSync('prisma/seeds/draws.json', JSON.stringify(draws, null, 2)); console.log('Exported', draws.length, 'draws'); }).finally(() => p.$disconnect());"

echo 📤 A importar sorteios para Produção...
set DATABASE_URL=%PROD_URL%
call npx tsx -e "const { PrismaClient } = require('@prisma/client'); const fs = require('fs'); const p = new PrismaClient(); const draws = JSON.parse(fs.readFileSync('prisma/seeds/draws.json', 'utf-8')); console.log('Importing', draws.length, 'draws...'); const batchSize = 500; (async () => { for (let i = 0; i < draws.length; i += batchSize) { const batch = draws.slice(i, i + batchSize); await p.draw.createMany({ data: batch }); process.stdout.write('.'); } console.log('\nDone!'); })().finally(() => p.$disconnect());"

echo.
echo ========================================================
echo PASSO 4: RECALCULAR Tudo de Raiz (Produção)
echo ========================================================
echo.
echo 🧠 A recalcular TODOS os sistemas...
echo    (Isto vai demorar ~10 minutos - é normal!)
echo.
set DATABASE_URL=%PROD_URL%

echo [1/4] Turbo Backfill (Números)...
call npx tsx src/scripts/core/turbo-backfill.ts

echo.
echo [2/4] Turbo Stars (Estrelas)...
call npx tsx src/scripts/core/turbo-stars.ts

echo.
echo [3/4] Turbo Medals (Rankings)...
call npx tsx src/scripts/core/turbo-medals.ts

echo.
echo [4/4] Turbo ML (Machine Learning)...
call npx tsx src/scripts/core/turbo-ml.ts

echo.
echo ========================================================
echo PASSO 5: Verificar Integridade
echo ========================================================
echo.
set DATABASE_URL=%PROD_URL%
call npx tsx check-db-status.ts

echo.
echo ========================================================
echo ✅ REBUILD COMPLETO!
echo ========================================================
echo.
echo A BD de Produção foi:
echo ✅ Completamente limpa
echo ✅ Recalculada de raiz
echo ✅ Verificada (sem duplicados)
echo.
echo Próximos passos:
echo 1. Verifica o site: https://numerosmagicos.com
echo 2. Confirma que LSTM mostra 73 jackpots
echo 3. Verifica que não há duplicados
echo.
pause
