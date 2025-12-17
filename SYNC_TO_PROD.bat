@echo off
echo ========================================================
echo   NÚMEROS MÁGICOS - SYNC TO PRODUCTION (AUTO) 🚀
echo ========================================================
echo.
echo Este script sincroniza automaticamente usando .env
echo.

REM Read Postgres URL from .env
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /i "POSTGRES_URL_PROD"') do set PROD_URL=%%b

if "%PROD_URL%"=="" (
    echo ❌ ERRO: POSTGRES_URL_PROD não encontrado no .env
    echo.
    echo Adiciona ao .env:
    echo POSTGRES_URL_PROD="postgresql://..."
    pause
    exit /b 1
)

echo ✅ Connection String encontrada no .env
echo.
pause

echo.
echo ========================================================
echo PASSO 1: LIMPAR Base de Dados de Produção
echo ========================================================
echo.
echo 🧹 A limpar BD de Produção...
set DATABASE_URL=%PROD_URL%
call npx tsx src/scripts/admin/clean-production-db.ts

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao limpar BD de Produção!
    pause
    exit /b 1
)

echo.
echo ========================================================
echo PASSO 2: Exportar Dados Locais (SQLite)
echo ========================================================
echo.
echo 📦 A exportar dados da BD Local...
set DATABASE_URL=file:./prisma/dev.db
call npx tsx src/scripts/admin/export-local-db.ts

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao exportar dados locais!
    pause
    exit /b 1
)

echo.
echo ========================================================
echo PASSO 3: Importar para Produção (PostgreSQL)
echo ========================================================
echo.
echo 📤 A importar dados para BD de Produção...
set DATABASE_URL=%PROD_URL%
call npx tsx src/scripts/database/seed-production.ts

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao importar para Produção!
    pause
    exit /b 1
)

echo.
echo ========================================================
echo ✅ SINCRONIZAÇÃO COMPLETA!
echo ========================================================
echo.
echo Quarteto Complementar agora está online! 🚀
echo.
echo Próximos passos:
echo 1. Verifica: https://numerosmagicos.com/ranking
echo 2. Procura "Quarteto Complementar" na lista
echo.
pause
