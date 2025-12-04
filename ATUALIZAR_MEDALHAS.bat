@echo off
chcp 65001 > nul
echo ========================================
echo   🏅 Atualizar Sistemas de Medalhas
echo ========================================
echo.
echo A iniciar o processo de backfill (cálculo de histórico)...
echo Isto pode demorar alguns minutos.
echo O processo é feito em lotes para não bloquear o sistema.
echo.
cd numeros
call npx tsx src/scripts/backfill-medal-systems.ts
echo.
echo ========================================
echo   ✅ Processo Concluído!
echo ========================================
pause
