@echo off
cd /d "%~dp0.."
echo =========================================================
echo        NÚMEROS MÁGICOS - MASTER OFFLINE UPDATE 🚀
echo =========================================================
echo.
echo Este processo vai:
echo 1. Atualizar a Base de Dados (Fetch Live Draw)
echo 2. Recalcular TODOS os sistemas (Heavy Calculation)
echo 3. Treinar e Atualizar Modelos de IA
echo 4. Preparar Dados para Sincronização (Sync Prep)
echo.
echo AVISO: Isto vai usar 100%% do CPU. O teu PC vai aquecer. 🔥
echo.
pause

echo.
echo [1/4] 📥 Fetching Live Draw...
set DATABASE_URL=file:./prisma/dev.db
if exist src\scripts\core\fetch-draw.ts (
    call npx tsx src/scripts/core/fetch-draw.ts
) else (
    echo ⚠️  fetch-draw.ts not found, skipping...
)

echo.
echo [2/4] 🧠 Heavy Calculation (Turbo Backfill & Stars)...
if exist src\scripts\core\turbo-backfill.ts (
    call npx tsx src/scripts/core/turbo-backfill.ts
) else (
    echo ⚠️  turbo-backfill.ts not found, skipping...
)
if exist src\scripts\core\turbo-stars.ts (
    call npx tsx src/scripts/core/turbo-stars.ts
) else (
    echo ⚠️  turbo-stars.ts not found, skipping...
)
if exist src\scripts\core\turbo-medals.ts (
    call npx tsx src/scripts/core/turbo-medals.ts
) else (
    echo ⚠️  turbo-medals.ts not found, skipping...
)

echo.
echo [3/4] 🧠 AI Training (Exclusion & ML)...
if exist src\scripts\core\turbo-ml.ts (
    call npx tsx src/scripts/core/turbo-ml.ts
) else (
    echo ⚠️  turbo-ml.ts not found, skipping...
)
if exist src\scripts\ml-training\train-exclusion.ts (
    call npx tsx src/scripts/ml-training/train-exclusion.ts
) else (
    echo ⚠️  train-exclusion.ts not found, skipping...
)

echo.
echo [4/4] 🧊 Final Consistency Check...
if exist src\scripts\static-generator\generate-all.ts (
    call npx tsx src/scripts/static-generator/generate-all.ts
) else (
    echo ⚠️  generate-all.ts not found, skipping...
)

echo.
echo [BONUS] ⭐ Update Star Rankings...
if exist src\scripts\core\update-star-rankings.ts (
    call npx tsx src/scripts/core/update-star-rankings.ts
) else (
    echo ⚠️  update-star-rankings.ts not found, skipping...
)

echo.
echo =========================================================
echo ✅ ATUALIZAÇÃO COMPLETA!
echo.
echo Agora podes sincronizar com o site usando:
echo - tools/3-FULL_SYNC_PROD.bat (Sync Total)
echo - tools/4-QUICK_SYNC_PROD.bat (Sync Rápido)
echo =========================================================
pause
