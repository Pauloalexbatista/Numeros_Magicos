@echo off
echo ===================================================
echo      GERADOR DE PACOTE ML (OFFLINE - PC)
echo ===================================================
echo.
echo Este script vai:
echo 1. Ler o historico da base de dados LOCAL.
echo 2. Calcular previsoes para TODOS os sistemas (ML incl.).
echo 3. Gerar um ficheiro 'ml_pack.json' na pasta output.
echo.
echo ⚠️  Certifique-se que o Docker esta a correr (para ler a BD local)!
echo.
pause

call npx tsx src/scripts/generate-ml-pack.ts

echo.
echo Pressione qualquer tecla para sair...
pause >nul
