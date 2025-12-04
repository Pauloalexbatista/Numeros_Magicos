@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   🌪️ Verificar Vortex Pyramid
echo ========================================
echo.
echo A executar verificação...
echo.
npx tsx src/scripts/verify-vortex.ts
echo.
echo ========================================
pause
