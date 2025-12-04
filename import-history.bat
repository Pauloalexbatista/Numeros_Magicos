@echo off
cd /d "%~dp0"
echo ========================================
echo   Importing EuroMillions History
echo ========================================
echo.
echo This will import all draws from 2004 to present.
echo This may take several minutes...
echo.
npx tsx src/scripts/seed-history.ts
echo.
echo ========================================
echo Import complete!
echo ========================================
pause
