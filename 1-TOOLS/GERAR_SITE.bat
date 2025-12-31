@echo off
echo ========================================================
echo        GERADOR DE SITE ESTÁTICO (RÁPIDO) ⚡
echo ========================================================
echo.
echo Apenas gera os JSONs a partir da DB atual.
echo NÃO recalcula previsões ou rankings.
echo.

call npx tsx src/scripts/static-generator/generate-all.ts

echo.
echo ✅ Ficheiros gerados em src/data/static
echo.
pause
