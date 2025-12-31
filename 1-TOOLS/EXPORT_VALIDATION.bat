@echo off
REM ========================================
REM EXPORTAR VALIDAÇÃO TEMPORAL
REM ========================================
REM
REM Gera Excel com validação temporal mostrando:
REM - Números sorteados
REM - Previsão feita ANTES do sorteio
REM - Acertos obtidos
REM - Próxima previsão
REM
REM Útil para validar que cálculos estão corretos
REM ========================================

echo.
echo ========================================
echo   VALIDACAO TEMPORAL DE PREVISOES
echo ========================================
echo.
echo Este script gera um Excel com validacao temporal
echo mostrando previsoes vs resultados reais.
echo.
echo Tempo estimado: 10-15 segundos
echo.
pause

npx tsx src/scripts/admin/generate-validation-excel.ts

echo.
echo ========================================
echo   VALIDACAO CONCLUIDA!
echo ========================================
echo.
echo Ficheiro gerado: validacao_temporal_YYYY-MM-DD.xlsx
echo.
pause
