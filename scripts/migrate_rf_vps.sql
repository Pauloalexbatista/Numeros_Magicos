BEGIN;

-- 1. Totoloto: migrate legacy "Random Forest" to "Random Forest AI" where drawId does not already have "Random Forest AI"
UPDATE "SystemPrediction" sp
SET "systemName" = 'Random Forest AI'
WHERE "systemName" = 'Random Forest'
  AND "game" = 'TOTOLOTO'
  AND NOT EXISTS (
    SELECT 1 FROM "SystemPrediction" sp2
    WHERE sp2."game" = sp."game"
      AND sp2."drawId" = sp."drawId"
      AND sp2."systemName" = 'Random Forest AI'
  );

-- 2. Delete remaining duplicate "Random Forest" predictions across all games
DELETE FROM "SystemPrediction" WHERE "systemName" = 'Random Forest';

-- 3. Delete performance, ranking, cache for legacy "Random Forest"
DELETE FROM "system_performance" WHERE "systemName" = 'Random Forest';
DELETE FROM "system_performance_full_pool" WHERE "systemName" = 'Random Forest';
DELETE FROM "system_performance_staging" WHERE "systemName" = 'Random Forest';
DELETE FROM "system_ranking" WHERE "systemName" = 'Random Forest';
DELETE FROM "cached_predictions" WHERE "systemName" = 'Random Forest';
DELETE FROM "ranked_systems" WHERE "name" = 'Random Forest';

-- 4. Clear statistics cache to force recalculation of rankings with canonical names
DELETE FROM "statistics_cache";

COMMIT;

-- Verification
SELECT "game", "systemName", count(*) FROM "SystemPrediction" WHERE "systemName" LIKE '%Random Forest%' GROUP BY "game", "systemName" ORDER BY "game";
SELECT "game", "name" FROM "ranked_systems" WHERE "name" LIKE '%Random Forest%' ORDER BY "game";
