@echo off
echo ==========================================
echo   EXPORTAR BASE DE DADOS PARA PRODUCAO
echo ==========================================
echo.
echo Este script cria uma copia da BD local para upload.
echo.

REM Ir para a raiz do projeto (pai da pasta tools)
cd /d "%~dp0.."

REM Criar pasta de export se nao existir
if not exist "export" mkdir export

REM Copiar BD atual
echo 1. A copiar base de dados...
copy /Y "prisma\dev.db" "export\production.db"

REM Criar timestamp
echo 2. A criar backup com timestamp...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%b%%a)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
copy /Y "prisma\dev.db" "export\backup_%mydate%_%mytime%.db"

echo.
echo ===================================================
echo   EXPORTACAO CONCLUIDA!
echo ===================================================
echo.
echo Ficheiros criados:
echo   - export\production.db (para upload)
echo   - export\backup_%mydate%_%mytime%.db (backup)
echo.
echo PROXIMO PASSO:
echo 1. Fazer upload de 'export\production.db' para o servidor
echo 2. Substituir a BD em producao
echo.
pause
