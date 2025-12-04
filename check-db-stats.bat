@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   📊 Verificar Estatísticas da BD
echo ========================================
echo.
echo A executar verificação...
echo.
npx tsx src/scripts/check-db-stats.ts
echo.
echo ========================================
pause
