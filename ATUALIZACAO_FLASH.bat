@echo off
echo ==========================================
echo      BOLA DE CRISTAL - TURBO BACKFILL
echo ==========================================
echo.
echo 1. A iniciar processo ultra-rapido (Numeros)...
call npx tsx src/scripts/turbo-backfill.ts

echo.
echo 2. A calcular historico dos Sistemas de Medalhas (Ensembles)...
call npx tsx src/scripts/turbo-medals.ts

echo.
echo 3. ATUALIZACAO DE ESTRELAS (Star Wars)
call npx tsx src/scripts/turbo-stars.ts

echo.
echo ===================================================
echo    ATUALIZACAO FLASH CONCLUIDA COM SUCESSO!
echo ===================================================
pause
