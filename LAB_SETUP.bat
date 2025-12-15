@echo off
echo ================================================
echo 🔧 SETUP DO LABORATORIO (PRIMEIRA VEZ)
echo ================================================
echo.

cd laboratory

REM 1. Create .env
echo [1/4] A criar .env...
set LABDIR=%CD%
(
echo DATABASE_URL="file:%LABDIR%/prisma/lab.db"
) > .env
echo       [OK] .env criado com path absoluto

REM 2. Create prisma directory
echo [2/4] A criar directorio prisma...
if not exist "prisma" mkdir prisma
echo       [OK] Directorio criado

REM 3. Copy database
echo [3/4] A copiar base de dados...
copy /Y "..\prisma\dev.db" "prisma\lab.db" >nul
if exist "prisma\lab.db" (
    echo       [OK] Base de dados copiada
) else (
    echo       [ERRO] Falha ao copiar!
    pause
    exit /b 1
)

REM 4. Install and generate
echo [4/4] A instalar dependencias e gerar Prisma Client...
call npm install
call npx prisma generate

echo.
echo ================================================
echo ✅ SETUP COMPLETO!
echo ================================================
echo.
echo Agora pode correr o LAB_START.bat
echo.
pause
