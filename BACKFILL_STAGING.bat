@echo off
chcp 65001
echo.
echo ==========================================
echo      🧪 BACKFILL STAGING (TEST MODE)
echo ==========================================
echo.
echo Este script vai correr um sistema em modo de teste.
echo Os resultados serao gravados na tabela de STAGING.
echo NAO afeta o ranking oficial.
echo.

set /p systemName="Nome do Sistema (ex: Random Forest AI): "
set /p limit="Limite de Sorteios (Enter para todos): "

if "%limit%"=="" (
    echo Correndo para TODOS os sorteios...
    call npx tsx src/scripts/backfill-staging.ts "%systemName%"
) else (
    echo Correndo para os primeiros %limit% sorteios...
    call npx tsx src/scripts/backfill-staging.ts "%systemName%" %limit%
)

echo.
pause
