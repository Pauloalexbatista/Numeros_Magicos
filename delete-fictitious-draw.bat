@echo off
cd /d "%~dp0"
echo Apagando sorteio ficticio...
echo.
npx tsx src/scripts/delete-draw.ts
echo.
pause
