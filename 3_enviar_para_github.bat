@echo off
chcp 65001 >nul
echo ========================================
echo   Enviar para GitHub
echo ========================================
echo.
echo ⚠️  IMPORTANTE: Antes de continuar, certifica-te que:
echo.
echo 1. ✅ Criaste o repositório no GitHub
echo 2. ✅ O nome é "bolas-magicas"
echo 3. ✅ Está marcado como PRIVATE
echo.
set /p username="Digite o teu USERNAME do GitHub: "
echo.
echo [1/3] Conectando ao GitHub...
git remote add origin https://github.com/%username%/bolas-magicas.git

echo.
echo [2/3] Preparando branch principal...
git branch -M main

echo.
echo [3/3] Enviando para GitHub...
echo.
echo ⚠️  ATENÇÃO: Quando pedir password, usa o PERSONAL ACCESS TOKEN!
echo    (NÃO uses a tua password normal do GitHub)
echo.
echo Como criar o token:
echo 1. Vai a https://github.com/settings/tokens
echo 2. Clica "Generate new token" → "Classic"
echo 3. Nome: "Bolas Magicas Local"
echo 4. Marca: "repo"
echo 5. Clica "Generate token"
echo 6. COPIA o token
echo 7. Cola aqui quando pedir password
echo.
pause
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ SUCESSO! Projeto no GitHub!
    echo ========================================
    echo.
    echo Verifica em: https://github.com/%username%/bolas-magicas
    echo.
) else (
    echo.
    echo ❌ Algo correu mal!
    echo.
    echo Possíveis problemas:
    echo - Username errado
    echo - Repositório não foi criado no GitHub
    echo - Token inválido
    echo.
)
pause
