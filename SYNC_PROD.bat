@echo off
echo ========================================================
echo      NÚMEROS MÁGICOS - SYNC TO PRODUCTION 🚀
echo ========================================================
echo.
echo Este script vai sincronizar os dados locais (JSONs)
echo diretamente com a Base de Dados de Produção (Vercel).
echo.
echo Para continuar, precisa da "Connection String" da Vercel.
echo (Começa por: postgres://default:...)
echo.
set /p PROD_URL="[Cole aqui a Connection String e carregue Enter]: "

if "%PROD_URL%"=="" (
    echo ERRO: URL não pode estar vazio.
    pause
    exit /b
)

echo.
echo A ligar à Base de Dados Remota...
echo (Isto vai ignorar o .env local temporariamente)
echo.

set DATABASE_URL=%PROD_URL%
call npx tsx src/scripts/admin/sync-json-to-db.ts

echo.
echo ========================================================
echo ✅ Sincronização com Produção Concluída!
echo ========================================================
pause
