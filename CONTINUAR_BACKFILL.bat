@echo off
echo ==========================================
echo      CONTINUAR BACKFILL (LOTE DE 50)
echo ==========================================
echo.
echo A processar os proximos 50 sorteios...
echo Isto pode demorar 1-2 minutos.
echo.
call npx tsx src/scripts/backfill-missing-systems-incremental.ts
echo.
echo ==========================================
echo Lote concluido! Pode correr novamente para processar mais.
pause
