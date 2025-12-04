@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   🏆 Verificar Ranking dos Sistemas
echo ========================================
echo.
echo A executar verificação...
echo.
npx tsx src/scripts/check-ranking.ts
echo.
echo ========================================
pause
