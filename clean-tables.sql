-- Clean SystemPrediction and SystemPerformance tables
-- This will allow full recalculation with the new correct logic

DELETE FROM SystemPrediction;
DELETE FROM SystemPerformance;

-- Verify tables are empty
SELECT COUNT(*) as prediction_count FROM SystemPrediction;
SELECT COUNT(*) as performance_count FROM SystemPerformance;
