# Implementation Plan - Offline Architecture Migration

# Goal Description
Migrate the application from a "Hybrid/Online" architecture (real-time DB calculations) to an "Offline-First" architecture.
The goal is to pre-calculate all heavy data (Rankings, Stats, Predictions) on the local machine, generate static JSON files, and deploy these as a "Snapshot" of the database.
This ensures zero latency, consistent data across pages, and removes fragility from the serverless deployment.

## User Review Required
> [!IMPORTANT]
> This is a major structural change. The site in production will NOT receive updates via the old method (Cron Jobs) once we switch. Updates will ONLY happen when you run the `MASTER_UPDATE.bat` locally and deploy.

## Proposed Changes

### Data Layer
#### [NEW] `src/data/static/`
- Directory to hold the generated JSON files.
- Files: `rankings.json`, `draws.json`, `stats-numbers.json`.

### Scripts (The Engine)
#### [NEW] `src/scripts/static-generator/`
- `generate-all.ts`: Master script to run all generators.
- `generators/ranking-generator.ts`: Exports rankings to JSON.
- `generators/draw-generator.ts`: Exports latest draw info.
- `generators/stats-generator.ts`: Exports statistical analysis.

#### [NEW] `src/scripts/MASTER_UPDATE.bat`
- Batch script to orchestrate: DB Update -> Calc -> Generate -> Git Push.

### Frontend Components (The Consumers)
#### [MODIFY] `src/services/ranking-evaluator.ts`
- Add support for loading from JSON if available.
#### [MODIFY] `src/app/ranking/page.tsx`
- Refactor to fetch data from `src/data/static/rankings.json` instead of Prisma calls.

## Verification Plan

### Automated Tests
- Run `npm run generate:static` and verify JSON files are created in `src/data/static`.
- Validate JSON structure matches expected schema.

### Manual Verification
- Start local server `npm run dev`.
- Visit `/ranking`.
- Confirm data loads instantly and matches the DB content.
- Compare load time vs old version.
