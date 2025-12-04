@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   🎴 Atualizar Cards do Dashboard
echo ========================================
echo.
echo A executar seed de cards...
echo.
npx tsx src/scripts/seed-cards.ts
echo.
echo ========================================
pause
