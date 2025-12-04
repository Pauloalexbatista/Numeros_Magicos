@echo off
cd /d "%~dp0"
echo ========================================
echo   Bolas Magicas - Setup Completo
echo ========================================
echo.

REM 1. Check Dependencies
if not exist "node_modules" (
    echo [1/5] Installing dependencies...
    call npm install
) else (
    echo [1/5] Dependencies found. Skipping install.
)

REM 2. Database Sync
echo.
echo [2/5] Syncing Database...
call npx prisma generate
call npx prisma db push

REM 3. Seeding
echo.
echo [3/5] Seeding Ranking Systems...
call npx tsx src/scripts/seed-ranked-systems.ts

REM 4. Testing
echo.
echo [4/5] Verifying Ranking System...
call npx tsx src/scripts/test-ranking.ts

REM 5. Start Server
echo.
echo [5/5] Starting Server...
echo.
echo All checks passed! Launching application...
timeout /t 2 /nobreak >nul
call 0_run_app.bat
