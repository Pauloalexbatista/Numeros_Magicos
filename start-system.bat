@echo off
echo ==========================================
echo      Bolas Magicas - Sistema de Arranque
echo ==========================================
echo.

echo [1/3] A verificar dependencias (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] A gerar cliente da base de dados (prisma generate)...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] A iniciar servidor (npm run dev)...
echo.
echo ========================================================
echo   SERVIDOR A INICIAR... AGUARDE...
echo   O site vai abrir automaticamente no seu browser.
echo   Se der erro de conexao, aguarde 5 segundos e faça Refresh (F5).
echo   NAO FECHE ESTA JANELA ENQUANTO QUISER USAR O SITE.
echo ========================================================
echo.

REM Tenta abrir o browser (pode abrir antes do servidor estar 100% pronto, por isso o aviso acima)
start http://localhost:3000

call npm run dev

pause
