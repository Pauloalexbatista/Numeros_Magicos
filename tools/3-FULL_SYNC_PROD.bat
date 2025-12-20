@echo off
setlocal enabledelayedexpansion
pushd ..
echo =========================================================
echo   NUMEROS MAGICOS - FULL PRODUCTION SYNC (COMPLETE) 🚀
echo =========================================================
echo.
echo Este script realiza a sincronizacao TOTAL:
echo 1. Draws + Rankings + Performances
echo 2. Cached Predictions (Velocidade do site)
echo 3. ML Models + Exclusion Cache
echo.
echo ⚠️  Tempo estimado: 2-3 minutos
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
echo [PASSO 2/5] 📦 Exportar Dados (Local -> JSON)...
call npx tsx src/scripts/admin/export-local-db.ts
if errorlevel 1 goto error

echo.
echo [PASSO 3/5] 🛠️  Gerar Prisma Client para Postgres (Prod)...
call npm run db:prod:generate
if errorlevel 1 goto error

echo.
echo [PASSO 4/5] 🧹 LIMPAR Base de Dados de Producao (FULL)...
set DATABASE_URL=!PROD_URL!
call npx tsx src/scripts/admin/clean-production-db.ts
if errorlevel 1 goto error

echo.
echo [PASSO 5/5] 📥 Importar para Producao (JSON -> Postgres)...
set DATABASE_URL=!PROD_URL!
call npm run db:prod:seed
if errorlevel 1 goto error

echo.
echo [PASSO FINAL] 🔄 Restaurar Prisma Client para Local (SQLite)...
set DATABASE_URL=file:./prisma/dev.db
call npx prisma generate
if errorlevel 1 echo ⚠️  AVISO: Falha ao restaurar client local, mas a sincronizacao foi concluida.

echo.
echo =========================================================
echo ✅ SINCRONIZACAO COMPLETA COM SUCESSO!
echo =========================================================
echo.
echo Site atualizado: https://numerosmagicos.com (Draw 1904)
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
