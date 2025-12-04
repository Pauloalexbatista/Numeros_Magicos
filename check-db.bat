@echo off
cd /d "%~dp0"
echo Checking database status...
echo.
npx tsx src/scripts/inspect-row.ts
pause
