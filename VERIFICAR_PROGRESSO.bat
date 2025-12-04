@echo off
echo ==========================================
echo      VERIFICAR PROGRESSO DO BACKFILL
echo ==========================================
echo.
call npx tsx src/scripts/check-backfill-progress.ts
echo.
echo ==========================================
pause
