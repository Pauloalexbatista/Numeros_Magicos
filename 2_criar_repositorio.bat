@echo off
chcp 65001 >nul
echo ========================================
echo   Inicializar Repositório Git
echo ========================================
echo.
echo [1/3] Inicializando repositório...
git init
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Git não funcionou!
    echo.
    echo Solução:
    echo 1. Reinicia o computador
    echo 2. Corre o script "1_configurar_git.bat" primeiro
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Adicionando ficheiros...
git add .

echo.
echo [3/3] Criando primeiro commit...
git commit -m "Initial commit: Bolas Mágicas - Sistema de Análise EuroMilhões"

echo.
echo ========================================
echo   ✅ Repositório Criado com Sucesso!
echo ========================================
echo.
echo Próximo passo:
echo 1. Vai a https://github.com/new
echo 2. Cria um repositório chamado "bolas-magicas"
echo 3. Marca como PRIVATE
echo 4. NÃO marques nenhuma opção
echo 5. Clica "Create repository"
echo 6. Corre o script "3_enviar_para_github.bat"
echo.
pause
