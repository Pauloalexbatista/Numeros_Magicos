
@echo off
echo ==========================================
echo   ML CLASSIFIER - LOGISTIC REGRESSION
echo ==========================================
echo.
echo 1. A treinar APENAS o Classificador Logistico...
echo.

cd /d "%~dp0.."
set DATABASE_URL=file:./prisma/dev.db

call npx tsx src/scripts/ml-training/train-classifier-only.ts

echo.
echo ===================================================
echo    CLASSIFICADOR ATUALIZADO COM SUCESSO!
echo ===================================================
pause
