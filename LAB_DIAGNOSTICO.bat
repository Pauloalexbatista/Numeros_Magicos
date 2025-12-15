@echo off
echo ================================================
echo 🔍 DIAGNOSTICO DO LABORATORIO
echo ================================================
echo.

cd laboratory

echo [CHECK 1] Verificar .env...
if exist ".env" (
    echo   ✅ .env existe
    echo   Conteudo:
    type .env
) else (
    echo   ❌ .env NAO existe
)

echo.
echo [CHECK 2] Verificar directorio prisma...
if exist "prisma" (
    echo   ✅ prisma\ existe
) else (
    echo   ❌ prisma\ NAO existe
)

echo.
echo [CHECK 3] Verificar base de dados lab.db...
if exist "prisma\lab.db" (
    echo   ✅ prisma\lab.db existe
    for %%A in ("prisma\lab.db") do echo   Tamanho: %%~zA bytes
) else (
    echo   ❌ prisma\lab.db NAO existe
)

echo.
echo [CHECK 4] Verificar base de dados original...
if exist "..\prisma\dev.db" (
    echo   ✅ ..\prisma\dev.db existe
    for %%A in ("..\prisma\dev.db") do echo   Tamanho: %%~zA bytes
) else (
    echo   ❌ ..\prisma\dev.db NAO existe
)

echo.
echo [CHECK 5] Verificar node_modules...
if exist "node_modules" (
    echo   ✅ node_modules existe
) else (
    echo   ❌ node_modules NAO existe
)

echo.
echo [CHECK 6] Verificar Prisma Client...
if exist "node_modules\.prisma" (
    echo   ✅ Prisma Client gerado
) else (
    echo   ❌ Prisma Client NAO gerado
)

echo.
echo ================================================
echo FIM DO DIAGNOSTICO
echo ================================================
pause
