@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo =========================================================
echo   NUMEROS MAGICOS - INCREMENTAL SYNC (FAST) 🚀
echo =========================================================
echo.
echo Este script sincroniza APENAS dados novos/alterados:
echo - Novos sorteios + performances
echo - Rankings atualizados (médias)
echo - Previsões cache (próximo sorteio)
echo.
echo ⚡ Tempo estimado: 5-10 segundos
echo.
echo Use este script para:
echo   ✅ Atualizações diárias (Terça/Sexta)
echo   ✅ Novos sorteios
echo   ✅ Atualizar previsões
echo.
echo Use FULL_SYNC para:
echo   🔧 Correção de bugs em dados antigos
echo   🔧 Mudanças no schema
echo   🔧 Inconsistências detetadas
echo.

REM --- CONFIGURATION ---
for /f "tokens=1,2 delims==" %%a in ('findstr "POSTGRES_PRISMA_URL" .env') do set PROD_URL=%%b

if " %PROD_URL%"==" " (
    echo ❌ ERRO: POSTGRES_PRISMA_URL não encontrado no .env
    pause
    exit /b 1
)

echo [PASSO 1/3] 🛠️  Gerar Prisma Client para Postgres...
call npm run db:prod:generate
if errorlevel 1 goto error

echo.
echo [PASSO 2/3] 🔄 Executar Sync Incremental...
set DATABASE_URL=!PROD_URL!
call npx tsx src/scripts/admin/incremental-sync-prod.ts
if errorlevel 1 goto error

echo.
echo [PASSO 3/3] 🔄 Restaurar Prisma Client para Local (SQLite)...
set DATABASE_URL=file:./prisma/dev.db
call npx prisma generate
if errorlevel 1 echo ⚠️  AVISO: Falha ao restaurar client local, mas sync foi concluído.

echo.
echo =========================================================
echo ✅ SYNC INCREMENTAL CONCLUÍDO!
echo =========================================================
echo.
echo Site atualizado: https://numerosmagicos.com
echo.
pause
exit /b 0

:error
echo.
echo ❌ FALHA NO SYNC INCREMENTAL!
echo Verifica as mensagens de erro acima.
pause
exit /b 1
