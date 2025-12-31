@echo off
cd /d "%~dp0.."
echo ===========================================
echo   ATUALIZACAO DE SISTEMAS DE MEDALHA
echo   (Ouro, Prata, Bronze, Platina)
echo ===========================================

call npx tsx src/scripts/core/turbo-medals.ts

echo.
echo ===========================================
echo   PROCESSO CONCLUIDO!
echo ===========================================
pause
