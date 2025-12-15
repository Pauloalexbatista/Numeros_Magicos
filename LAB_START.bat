@echo off
cd /d "%~dp0"
echo ===========================================
echo 🧪 A INICIAR LABORATORIO EXPERIMENTAL...
echo ===========================================
echo.

cd laboratory

REM Check if .env exists
if not exist ".env" (
    echo ❌ ERRO: .env nao encontrado!
    echo.
    echo Por favor, corra primeiro o LAB_SETUP.bat
    echo.
    pause
    exit /b 1
)

echo ✅ .env encontrado
echo ✅ A abrir browser...
start http://localhost:3001

echo ✅ A iniciar servidor...
echo.
npm run dev
pause
