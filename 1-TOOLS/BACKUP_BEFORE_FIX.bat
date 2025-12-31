@echo off
echo =========================================================
echo   BACKUP CURRENT DATA BEFORE RECALCULATION
echo =========================================================
echo.

cd /d "%~dp0.."

set BACKUP_DIR=backups\before-immutable-fix-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%" 2>nul

echo.
echo Backing up current database...
copy prisma\dev.db "%BACKUP_DIR%\dev.db.backup"

echo.
echo Exporting current rankings to CSV...
npx tsx -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); const fs = require('fs'); (async () => { const perf = await prisma.systemPerformance.findMany({ orderBy: { drawId: 'desc' }, take: 1000 }); fs.writeFileSync('%BACKUP_DIR%/performance_backup.json', JSON.stringify(perf, null, 2)); const pred = await prisma.systemPrediction.findMany({ orderBy: { drawId: 'desc' }, take: 1000 }); fs.writeFileSync('%BACKUP_DIR%/predictions_backup.json', JSON.stringify(pred, null, 2)); console.log('Backup complete!'); await prisma.$disconnect(); })();"

echo.
echo =========================================================
echo   BACKUP COMPLETE: %BACKUP_DIR%
echo =========================================================
pause
