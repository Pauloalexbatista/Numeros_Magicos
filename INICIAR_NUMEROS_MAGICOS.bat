@echo off
cd /d "%~dp0"

echo ==========================================
echo   BOLAS MAGICAS - INICIAR
echo ==========================================
echo.
echo A criar log de arranque (startup_log.txt)...
echo INICIO > startup_log.txt

echo 1. A verificar Node.js...
where npm >> startup_log.txt 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo ERRO: Node.js nao encontrado! >> startup_log.txt
    pause
    exit /b
)
echo OK.

echo 2. A libertar porta 3000...
REM Tenta matar processos node.exe para garantir que a porta esta livre
taskkill /F /IM node.exe >> startup_log.txt 2>&1
echo OK.

echo 3. A preparar base de dados...
call npx prisma generate >> startup_log.txt 2>&1
echo OK.

echo 4. A iniciar servidor...
echo O site vai abrir em 3 segundos...
timeout /t 3 >nul
start http://localhost:3000

echo A executar servidor...
echo Verifique startup_log.txt se houver erros.
call npm run dev >> startup_log.txt 2>&1

if %errorlevel% neq 0 (
    echo.
    echo ERRO CRITICO: O servidor foi abaixo.
    echo Verifique o ficheiro startup_log.txt para ver o erro.
    pause
)

pause
