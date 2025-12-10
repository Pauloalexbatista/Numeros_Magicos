-- Add SystemPrediction table
CREATE TABLE IF NOT EXISTS SystemPrediction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drawId INTEGER NOT NULL,
    systemName TEXT NOT NULL,
    prediction TEXT NOT NULL,
    antiPrediction TEXT NOT NULL,
    hits INTEGER NOT NULL,
    antiHits INTEGER NOT NULL,
    jackpot INTEGER NOT NULL DEFAULT 0,
    antiJackpot INTEGER NOT NULL DEFAULT 0,
    calculatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drawId) REFERENCES Draw(id) ON DELETE CASCADE,
    UNIQUE(drawId, systemName)
);

CREATE INDEX IF NOT EXISTS idx_system_prediction_systemName ON SystemPrediction(systemName);
CREATE INDEX IF NOT EXISTS idx_system_prediction_drawId ON SystemPrediction(drawId);
