@echo off
echo ==========================================
echo      BOLA DE CRISTAL - FLASH AI UPDATE
echo ==========================================
echo.
echo 1. A treinar cerebros digitais (Random Forest, LSTM, ML)...
echo    Isto pode demorar 1-2 minutos. Por favor aguarde.
echo.
call npx tsx src/scripts/turbo-ml.ts

echo.
echo ===================================================
echo    ATUALIZACAO AI CONCLUIDA COM SUCESSO!
echo ===================================================
pause
