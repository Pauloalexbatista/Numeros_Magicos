@echo off
chcp 65001 >nul
echo ========================================
echo   Configurar Git - Bolas Mágicas
echo ========================================
echo.
echo Olá Paulo! Vou configurar o Git para ti...
echo.

REM Configurar nome e email
echo [1/3] Configurando nome...
git config --global user.name "Paulo Alexandre Carvalho Batista"
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Git não foi encontrado!
    echo.
    echo Por favor:
    echo 1. Reinicia o computador
    echo 2. Corre este script novamente
    echo.
    pause
    exit /b 1
)

echo [2/3] Configurando email...
git config --global user.email "pauloalexbatista@gmail.com"

echo [3/3] Verificando configuração...
echo.
echo ✅ Nome: 
git config --global user.name
echo ✅ Email: 
git config --global user.email
echo.
echo ========================================
echo   ✅ Git Configurado com Sucesso!
echo ========================================
echo.
echo Pressiona qualquer tecla para continuar...
pause >nul
