@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   🧹 Limpar Duplicados no Ranking
echo ========================================
echo.
echo A executar limpeza...
echo.
npx tsx src/scripts/cleanup-duplicates.ts
echo.
echo ========================================
pause
