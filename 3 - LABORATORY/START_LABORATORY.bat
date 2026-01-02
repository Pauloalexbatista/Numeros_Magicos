@echo off
echo ========================================
echo   LABORATORIO EXPERIMENTAL
echo   Numeros Magicos - Star Lab
echo ========================================
echo.
echo Iniciando servidor do laboratorio...
echo.
echo A abrir browser automaticamente em 5 segundos...
echo.
echo ========================================
echo.

REM Abrir browser após 5 segundos (dar tempo ao servidor iniciar)
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3001"

npm run dev
