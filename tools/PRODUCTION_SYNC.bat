@echo off
pushd ..
echo ========================================================
echo   NUMEROS MAGICOS - PRODUCTION SYNC (FINAL v2) 🚀
echo ========================================================
echo.
echo Este script segue a estrita sequencia:
echo 1. SQLite -> Export JSON
echo 2. Switch to Postgres Client
echo 3. Clean Production DB (using CORRECT ENV VARS)
echo 4. Import JSON -> Postgres (using CORRECT ENV VARS)
echo.

echo [PASSO 1/5] 🛠️  Gerar Prisma Client para SQLite (Local)...
call npx prisma generate
if errorlevel 1 goto error

echo.
echo [PASSO 2/5] 📦 Exportar Dados Locais (SQLite -> JSON)...
set DATABASE_URL=file:./prisma/dev.db
call npx tsx src/scripts/admin/export-local-db.ts
if errorlevel 1 goto error

echo.
echo [PASSO 3/5] 🛠️  Gerar Prisma Client para Postgres (Prod)...
call npm run db:prod:generate
if errorlevel 1 goto error

echo.
echo [PASSO 4/5] 🧹 LIMPAR Base de Dados de Producao...
REM Ler URL do .env
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /i "POSTGRES_URL_PROD"') do set PROD_URL=%%b

if "!PROD_URL!"=="" (
    echo ❌ ERRO: POSTGRES_URL_PROD nao encontrado no .env
    goto error
)

REM Set specialized Prisma Env Vars that schema.postgresql.prisma expects
set POSTGRES_PRISMA_URL=!PROD_URL!
set POSTGRES_URL_NON_POOLING=!PROD_URL!

call npx tsx src/scripts/admin/clean-production-db.ts
if errorlevel 1 goto error

echo.
echo [PASSO 5/5] 📥 Importar para Producao (JSON -> Postgres)...
call npm run db:prod:seed
if errorlevel 1 goto error

echo.
echo ========================================================
echo ✅ SINCRONIZACAO COMPLETA COM SUCESSO!
echo ========================================================
echo.
echo Quarteto Complementar deve estar online agora.
echo Verifica: https://numerosmagicos.com/ranking
echo.
popd
pause
exit /b 0

:error
echo.
echo ❌ FALHA NO PROCESSO!
echo Verifica as mensagens de erro acima.
popd
pause
exit /b 1
