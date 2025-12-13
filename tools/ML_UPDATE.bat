@echo off
echo ==========================================
echo      NÚMEROS MÁGICOS - FLASH AI UPDATE
echo ==========================================
echo.

REM Navigate to project root (parent of tools folder)
cd /d "%~dp0.."

REM Set DATABASE_URL for Prisma
set DATABASE_URL=file:./prisma/dev.db

echo 1. A treinar cerebros digitais (LSTM, Logistic Regression)...
echo    Isto pode demorar 1-2 minutos. Por favor aguarde.
echo.
call npx tsx src/scripts/core/turbo-ml.ts

echo.
echo ===================================================
echo    ATUALIZACAO AI CONCLUIDA COM SUCESSO!
echo ===================================================
pause
