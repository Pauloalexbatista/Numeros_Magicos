@echo off
chcp 65001 >nul
pushd ..
title 🔮 Bola de Cristal - Sistema de Previsão EuroMilhões

echo =========================================================
echo   🔮 NÚMEROS MÁGICOS - SISTEMA DE PREVISÃO 🔮
echo =========================================================
echo.

REM Check if Node.js is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo Por favor instale o Node.js primeiro:
    echo https://nodejs.org/
    echo.
    popd
    pause
    exit /b 1
)

REM Kill any process using port 3000
echo [1/4] 🧹 A libertar porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo       └─ A terminar processo PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo       ✅ Porta 3000 disponível
echo.

REM Generate Prisma Client
echo [2/4] 🗄️  A preparar base de dados local (SQLite)...
call npx prisma generate >nul 2>&1
echo       ✅ Base de dados pronta
echo.

REM Prepare to start server
echo [3/4] 🚀 A preparar servidor...
echo       └─ URL: http://localhost:3000
echo       └─ O browser vai abrir automaticamente
echo       ✅ Servidor a iniciar
echo.

echo [4/4] 🌐 A abrir browsers...
timeout /t 3 /nobreak >nul
start http://localhost:3000
start http://localhost:3000/admin/health
echo       ✅ Browsers abertos
echo.

echo =========================================================
echo   ✨ NÚMEROS MÁGICOS ESTÁ A CORRER ✨
echo =========================================================
echo.
echo 📍 App Principal: http://localhost:3000
echo 📍 Laboratório Neural: http://localhost:3000/admin/health
echo.
echo ⚠️  NÃO FECHES ESTA JANELA enquanto usares o sistema
echo ⚠️  Para parar o servidor: Pressiona Ctrl+C
echo.
echo =========================================================
echo.

REM Start the development server
npm run dev
popd
