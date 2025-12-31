@echo off
echo =========================================================
echo   CLEAN TABLES AND RECALCULATE WITH NEW LOGIC
echo =========================================================
echo.
echo This will:
echo 1. DELETE all SystemPrediction data
echo 2. DELETE all SystemPerformance data  
echo 3. Recalculate EVERYTHING with correct predict-for-next logic
echo.
echo WARNING: This will change historical rankings!
echo.
pause

cd /d "%~dp0.."

echo.
echo [1/2] Cleaning tables...
npx prisma db execute --file=clean-tables.sql --schema=prisma/schema.prisma

echo.
echo [2/2] Recalculating with new logic...
call .\tools\ATUALIZACAO_FLASH.bat

echo.
echo =========================================================
echo   RECALCULATION COMPLETE!
echo =========================================================
pause
