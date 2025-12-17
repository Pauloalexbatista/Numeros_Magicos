@echo off
echo ========================================================
echo   NÚMEROS MÁGICOS - CLEAN AND SYNC PRODUCTION DB 🧹
echo ========================================================
echo.
echo Este script vai:
echo 1. LIMPAR COMPLETAMENTE a BD de Produção (PostgreSQL)
echo 2. Exportar dados limpos da BD Local (SQLite)
echo 3. Importar dados limpos para Produção
echo.
echo ⚠️  AVISO: Isto vai APAGAR TODOS os dados da BD de Produção!
echo    Certifica-te que tens backup se necessário.
echo.
pause

echo.
echo ========================================================
echo PASSO 1: Obter Connection String da Vercel
echo ========================================================
echo.
echo Vai a: https://vercel.com/pauloalexbatista/numeros-magicos/stores
echo Clica na tua BD PostgreSQL
echo Copia a "Connection String" (começa com postgres://default:...)
echo.
set /p PROD_URL="Cole aqui a Connection String e carrega Enter: "

if "%PROD_URL%"=="" (
    echo ERRO: URL não pode estar vazio.
    pause
    exit /b
)

echo.
echo ========================================================
echo PASSO 2: LIMPAR Base de Dados de Produção
echo ========================================================
echo.
echo ⚠️  ÚLTIMA CONFIRMAÇÃO: Isto vai APAGAR TUDO da BD de Produção!
set /p CONFIRM="Tens a certeza? (escreve SIM em maiúsculas): "

if not "%CONFIRM%"=="SIM" (
    echo Operação cancelada.
    pause
    exit /b
)

echo.
echo 🧹 A limpar BD de Produção...
set DATABASE_URL=%PROD_URL%
call npx tsx src/scripts/admin/clean-production-db.ts

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao limpar BD de Produção!
    pause
    exit /b
)

echo.
echo ========================================================
echo PASSO 3: Exportar Dados Locais (SQLite)
echo ========================================================
echo.
echo 📦 A exportar dados da BD Local...
set DATABASE_URL=file:./prisma/dev.db
call npx tsx src/scripts/admin/export-local-db.ts

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao exportar dados locais!
    pause
    exit /b
)

echo.
echo ========================================================
echo PASSO 4: Importar para Produção (PostgreSQL)
echo ========================================================
echo.
echo 📤 A importar dados para BD de Produção...
set DATABASE_URL=%PROD_URL%
call npx tsx src/scripts/database/seed-production.ts

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao importar para Produção!
    pause
    exit /b
)

echo.
echo ========================================================
echo ✅ SINCRONIZAÇÃO COMPLETA!
echo ========================================================
echo.
echo A BD de Produção está agora limpa e sincronizada com a Local.
echo.
echo Próximos passos:
echo 1. Verifica o site: https://numerosmagicos.com
echo 2. Confirma que os dados estão corretos
echo 3. Verifica que não há duplicados
echo.
pause
