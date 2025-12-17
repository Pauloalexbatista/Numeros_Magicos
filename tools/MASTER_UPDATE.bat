@echo off
pushd ..
echo ========================================================
echo        NÚMEROS MÁGICOS - MASTER OFFLINE UPDATE 🚀
echo ========================================================
echo.
echo Este processo vai:
echo 1. Atualizar a Base de Dados (Fetch Live Draw)
echo 2. Recalcular TODOS os sistemas (Heavy Calculation)
echo 3. Gerar os ficheiros JSON Estáticos (Golden State)
echo.
echo AVISO: Isto vai usar 100%% do CPU. O teu PC vai aquecer. 🔥
echo.
pause

echo.
echo [1/4] 📥 Fetching Live Draw...
set DATABASE_URL=file:./prisma/dev.db
call npx tsx src/scripts/core/fetch-draw.ts
rem echo (Skipping fetch implementation for now - assuming Manual Update or Auto-Update ran)

echo.
echo [2/4] 🧠 Heavy Calculation (Turbo Backfill)...
rem We use the existing turbo-backfill which calculates Numbers + Rankings + Stats
call npx tsx src/scripts/core/turbo-backfill.ts

echo.
echo [3/4] 🧠 Heavy Calculation (Stars, ML, Medals)...
call npx tsx src/scripts/core/turbo-stars.ts
call npx tsx src/scripts/core/turbo-medals.ts
call npx tsx src/scripts/core/turbo-ml.ts
call npx tsx src/scripts/ml-training/train-exclusion.ts

echo.
echo [4/4] 🧊 Freezing Data (Static Generation)...
call npx tsx src/scripts/static-generator/generate-all.ts

echo.
echo ========================================================
echo ✅ ATUALIZAÇÃO COMPLETA!
echo.
echo Os ficheiros em 'src/data/static' estão prontos.
echo Próximo passo: Git Commit e Push para Deploy.
echo ========================================================
popd
pause
