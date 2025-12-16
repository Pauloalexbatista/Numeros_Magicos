@echo off
echo ========================================================
echo        NÚMEROS MÁGICOS - SYNC JSON TO DB 🔄
echo ========================================================
echo.
echo Este script vai ler os ficheiros JSON estáticos e atualizar 
echo a Base de Dados configurada no .env (Local ou Prod).
echo.
echo [!] ATENCAO: Isto pode demorar alguns minutos.
echo.
pause

call npx tsx src/scripts/admin/sync-json-to-db.ts

echo.
echo ========================================================
echo ✅ Sincronização Concluída!
echo ========================================================
pause
