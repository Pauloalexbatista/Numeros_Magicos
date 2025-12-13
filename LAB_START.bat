@echo off
cd /d "%~dp0"
echo ===========================================
echo 🧪 A INICIAR LABORATORIO EXPERIMENTAL...
echo ===========================================
echo.
echo A abrir o browser em http://localhost:3001 ...
start http://localhost:3001

cd laboratory
npm x -- next dev -p 3001
pause
