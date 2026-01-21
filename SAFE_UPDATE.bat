@echo off
echo ==========================================
echo    SAFE CACHE UPDATE & GENERATOR
echo    (Bypassing faulty ML models)
echo ==========================================
echo.
echo NOTE: Running this script finishes the update process manually.
echo.

echo [1/3] Updating Star Systems Cache...
call npx tsx src/scripts/force-stars-cache.ts
if errorlevel 1 goto error

echo.
echo [2/3] Updating Medal Systems Cache...
echo SKIPPED (Calculation too heavy/stuck). Using previous cache.
rem call npx tsx src/scripts/force-medals-cache.ts
rem if errorlevel 1 goto error

echo.
echo [3/3] Generating Static JSONs for Frontend...
call npx tsx src/scripts/static-generator/generate-all.ts
if errorlevel 1 goto error

echo.
echo ==========================================
echo    UPDATE COMPLETE!
echo    You can now verify localhost:3000
echo    and then run 1-TOOLS\3-INCREMENTAL_SYNC_PROD.bat
echo ==========================================
echo.
pause
exit /b 0

:error
echo.
echo ❌ ERROR OCCURRED!
pause
exit /b 1
