@echo off
echo ==========================================
echo   EXCLUSION LSTM - TREINO OFFLINE
echo ==========================================
echo.
echo AVISO: Este processo vai:
echo  - Treinar 2 modelos de IA (NUMBERS e STARS)
echo  - Demorar 10-20 segundos
echo  - Usar 80-100%% do CPU (ISTO E NORMAL!)
echo.
echo Nao feche esta janela durante o processo.
echo.
pause

cd /d "%~dp0.."
call npx tsx src/scripts/train-exclusion.ts

echo.
echo ===================================================
echo    TREINO CONCLUIDO COM SUCESSO!
echo ===================================================
echo.
echo Os modelos foram treinados e guardados em cache.
echo O sistema esta pronto para uso.
echo.
pause
