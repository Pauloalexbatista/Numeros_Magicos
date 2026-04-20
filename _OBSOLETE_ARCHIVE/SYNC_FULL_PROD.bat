
@echo off
echo ==========================================
echo      FULL PRODUCTION DATABASE RESET
echo ==========================================
echo.
echo ⚠️  WARNING: This will replace ALL production data with local data!
echo    Use this only when ID mismatches occur or data is corrupted.
echo.
pause

echo.
echo [1/3] 📦 Exporting Local Data to JSON...
call npx tsx src/scripts/admin/export-local-db.ts
if %errorlevel% neq 0 (
    echo ❌ Export failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] 🧹 Cleaning Production Database...
call npx tsx src/scripts/admin/clean-prod-safe.ts
if %errorlevel% neq 0 (
    echo ❌ Clean failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] 🚀 Importing Data to Production...
call npx tsx src/scripts/admin/import-json-to-prod.ts
if %errorlevel% neq 0 (
    echo ❌ Import failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo ✅ FULL RESET COMPLETE!
echo ==========================================
pause
