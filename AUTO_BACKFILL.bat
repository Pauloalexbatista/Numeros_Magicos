@echo off
echo ==========================================
echo      BOLA DE CRISTAL - AUTO BACKFILL
echo ==========================================
echo.
echo Este script vai processar todo o historico automaticamente.
echo Pode minimizar esta janela e deixar a trabalhar.
echo.
echo Para parar, pressione Ctrl+C.
echo.
pause

call npx tsx src/scripts/auto-backfill-loop.ts

echo.
echo Processo terminado.
pause
