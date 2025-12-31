@echo off
REM ========================================
REM EXPORTAR PREVISÕES COMPLETAS
REM ========================================
REM
REM Gera Excel com TODAS as previsões de TODOS os sistemas
REM Inclui:
REM - Previsões atuais (Top 5, 10, 15, 20, 25)
REM - Ranking de performance
REM - Últimos 10 sorteios
REM - Comparação Top 20 sistemas
REM - Resumo geral
REM ========================================

echo.
echo ========================================
echo   EXPORTACAO COMPLETA DE PREVISOES
echo ========================================
echo.
echo Este script gera um Excel com TODAS as previsoes
echo de TODOS os sistemas ativos.
echo.
echo Tempo estimado: 15-20 segundos
echo.
pause

npx tsx src/scripts/admin/generate-predictions-complete.ts

echo.
echo ========================================
echo   EXPORTACAO CONCLUIDA!
echo ========================================
echo.
echo Ficheiro gerado: previsoes_completas_YYYY-MM-DD.xlsx
echo.
pause
