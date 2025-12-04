@echo off
cd /d "%~dp0"
title Bolas Magicas - A Iniciar...
echo ========================================================
echo   A INICIAR BOLAS MAGICAS...
echo ========================================================
echo.

REM Kill port 3000 if in use
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo A libertar porta 3000 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo A preparar servidor...
echo O site vai abrir automaticamente no seu browser.
echo.

REM Open browser after 3 seconds
timeout /t 3 /nobreak >nul
start http://localhost:3000

REM Start server
npm run dev
