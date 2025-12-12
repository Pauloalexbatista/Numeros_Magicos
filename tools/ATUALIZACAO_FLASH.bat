@echo off
echo ==========================================
echo      BOLA DE CRISTAL - TURBO BACKFILL
echo ==========================================
echo.
echo 1. A iniciar processo ultra-rapido (Numeros)...
echo    Processando TODOS os sorteios (1900+)...
call npx tsx src/scripts/core/turbo-backfill.ts

echo.
echo 2. A calcular historico dos Sistemas de Medalhas (Ensembles)...
call npx tsx src/scripts/core/turbo-medals.ts

echo.
echo 3. ATUALIZACAO DE ESTRELAS (Star Wars)
call npx tsx src/scripts/core/turbo-stars.ts

echo.
echo ===================================================
echo    ATUALIZACAO FLASH CONCLUIDA COM SUCESSO!
echo ===================================================
pause
