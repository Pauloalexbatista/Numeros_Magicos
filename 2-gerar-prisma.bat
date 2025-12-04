@echo off
cd /d "%~dp0"
echo Gerando Prisma Client...
npx prisma generate
echo.
echo Concluido!
pause
