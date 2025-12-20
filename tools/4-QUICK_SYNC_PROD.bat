@echo off
setlocal enabledelayedexpansion
pushd ..
echo =========================================================
echo   NUMEROS MAGICOS - QUICK PRODUCTION SYNC (FAST) 🚀
echo =========================================================
echo.
echo Este script realiza a sincronizacao ESSENCIAL:
echo 1. Draws + Rankings + Performances
echo 2. Cached Predictions (Velocidade do site)
echo.
echo ⏭️  Pula: SystemPredictions e ML Training (Dados pesados)
echo ⚠️  Tempo estimado: 30-40 segundos
echo.

REM --- CONFIGURATION ---
for /f "tokens=1,2 delims==" %%a in ('findstr "POSTGRES_PRISMA_URL" .env') do set PROD_URL=%%b

if " %PROD_URL%"==" " (
    echo ❌ ERRO: POSTGRES_PRISMA_URL nao encontrado no .env
    popd
    pause
    exit /b 1
)

echo [PASSO 1/5] 🛠️  Preparar para Leitura Local (SQLite)...
set DATABASE_URL=file:./prisma/dev.db
call npx prisma generate
if errorlevel 1 goto error

echo.
echo [PASSO 2/5] 📦 Exportar Dados (QUICK)...
call npx tsx src/scripts/admin/export-local-db.ts --quick
if errorlevel 1 goto error

echo.
echo [PASSO 3/5] 🛠️  Gerar Prisma Client para Postgres (Prod)...
call npm run db:prod:generate
if errorlevel 1 goto error

echo.
echo [PASSO 4/5] 🧹 LIMPAR Base de Dados de Producao (QUICK)...
set DATABASE_URL=!PROD_URL!
call npx tsx src/scripts/admin/clean-production-db.ts --quick
if errorlevel 1 goto error

echo.
echo [PASSO 5/5] 📥 Importar para Producao (QUICK)...
set DATABASE_URL=!PROD_URL!
call npx tsx src/scripts/database/seed-production.ts --quick
if errorlevel 1 goto error

echo.
echo [PASSO FINAL] 🔄 Restaurar Prisma Client para Local (SQLite)...
set DATABASE_URL=file:./prisma/dev.db
call npx prisma generate
if errorlevel 1 echo ⚠️  AVISO: Falha ao restaurar client local, mas a sincronizacao foi concluida.

echo.
echo =========================================================
echo ✅ QUICK SYNC COMPLETO COM SUCESSO!
echo =========================================================
echo.
echo Site atualizado (Dados Essenciais): https://numerosmagicos.com
echo.
popd
pause
exit /b 0

:error
echo.
echo ❌ FALHA NO PROCESSO!
popd
pause
exit /b 1
