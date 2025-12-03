# 🔄 Backfill Architecture Log

## 🚀 Optimization (30/11/2025)
**Problem:** Backfill was taking ~240s per batch of 10 draws.
**Root Cause:** The system was re-calculating future predictions (`cachePredictions`) after *every* batch, which involves analyzing the entire history for every single system. This is redundant during a historical backfill.
**Solution:** 
- Modified `processBackfillBatch` in `src/app/admin/backfill-actions.ts`.
- Removed `await cachePredictions()` from the main loop.
- Added a check: `if (remaining === 0) await cachePredictions()`.
- **Result:** Future predictions are now only generated ONCE, at the very end of the entire process.
- **Expected Impact:** Batch time should drop from ~240s to <10s.

## 🛑 Disabled Systems (Speed Boost)
To further accelerate the backfill, the following heavy AI systems were temporarily disabled:

1.  **LSTM Neural Net (`LSTMModel`)**:
    *   **Reason:** Retrains a full neural network (20 epochs) for *every single historical draw*. This is mathematically rigorous but extremely slow (100s+ per batch).
    *   **Status:** Commented out in `src/services/ranked-systems.ts`.

2.  **Random Forest AI (`RandomForestModel`)**:
    *   **Status:** **KEPT ACTIVE**.
    *   **Reason:** It uses a lightweight "Simulated Forest" (Heuristic) approach, not heavy ML training. It is fast enough to keep running.

## Next Steps
- Run `AUTO_BACKFILL.bat` to process the history rapidly without the heavy LSTM load.
