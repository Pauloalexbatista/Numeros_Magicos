@echo off
cd /d "%~dp0"
echo ========================================
echo   EuroMillions Auto-Update
echo ========================================
echo.
echo Checking for new draws...
echo.
npx tsx src/scripts/auto-update.ts
echo.
pause
