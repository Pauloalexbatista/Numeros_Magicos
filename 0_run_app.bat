@echo off
cd /d "%~dp0"
echo ========================================
echo   Bolas Magicas - Startup
echo ========================================
echo.

REM Check if port 3000 is in use
echo Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Port 3000 is in use by PID %%a
    echo Killing process %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo Port 3000 is now available.
echo.
echo Starting Bolas Magicas...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Wait a moment before opening browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

REM Start the development server
npm run dev
