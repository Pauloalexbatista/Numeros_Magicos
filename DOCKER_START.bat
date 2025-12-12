@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 🐳 Numeros Magicos - Docker Start

echo ========================================================
echo   🐳 NÚMEROS MÁGICOS - DOCKER START 🐳
echo ========================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Docker não está a correr!
    echo.
    echo Por favor inicie o Docker Desktop primeiro.
    echo.
    pause
    exit /b 1
)

echo [1/3] 🛑 A parar contentores antigos...
docker compose down

echo [2/3] 🔨 A construir e iniciar (isto pode demorar)...
docker compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Falha ao iniciar o Docker.
    echo Verifique se a porta 3001 está livre ou se há erros no build.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] 🌐 A abrir browser...
timeout /t 5 /nobreak >nul
start http://localhost:3001

echo.
echo ========================================================
echo   ✨ SISTEMA A CORRER NO DOCKER ✨
echo ========================================================
echo.
echo 📍 Acede em: http://localhost:3001
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
