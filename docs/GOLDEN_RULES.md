# 🌟 GOLDEN RULES - Números Mágicos (Agente Guide)

**⚠️ CRITICAL: READ THIS BEFORE EXECUTING ANY CODE ⚠️**

This document establishes the **IMMUTABLE LAWS** of the `PRJT_Numeros_Magicos` project. Violating these rules leads to data corruption, production downtime, and confusion.

---

## 1. 🔄 Synchronization (The #1 Rule)

**Architecture:** Hybrid (Local SQLite + Production Postgres)

- **NEVER** try to connect to Postgres using `npx prisma` commands directly (unless you are 100% sure the client is generated for it).
- **NEVER** run sync scripts without cleaning production first (causes duplicate key errors).
- **ALWAYS** use the official script:

### 🎯 TWO SYNC METHODS

#### ⚡ INCREMENTAL SYNC (Daily Use - 95% of cases)

**Script:** `.\tools\3-INCREMENTAL_SYNC_PROD.bat`

**Use for:**

- Daily draw updates (Tuesday/Friday)
- New predictions
- Ranking updates

**What it does:**

- Adds ONLY new draws + performances (~137 records)
- Updates ONLY changed data (rankings ~142 records)
- Does NOT delete anything
- Time: ~5 seconds | Risk: Low

**What it syncs:**

- NEW: Draws, performances, predictions
- UPDATED: Rankings (averages!), cached predictions, ML models

---

#### 🔄 FULL SYNC (Special Cases - 5% of cases)

**Script:** `.\tools\3-FULL_SYNC_PROD.bat`

**Use for:**

- Bug fixes affecting old data
- Schema changes
- Data inconsistencies
- First-time sync

**What it does:**

- Deletes ALL data (147k records)
- Reimports ALL data
- Time: ~90 seconds | Risk: Medium

---

### ⚠️ CRITICAL SYNC RULES

1. **ALWAYS** use incremental sync for routine updates
2. **ONLY** use full sync for corrections/resets
3. **NEVER** sync without running `MASTER_UPDATE` first
4. **NEVER** sync with Prisma Studio open

### 📋 Daily Workflow (Tuesday/Friday)

```
1. .\tools\2-MASTER_UPDATE.bat       (Calculate locally)
2. git commit + push                   (Deploy code/JSONs)
3. .\tools\3-INCREMENTAL_SYNC_PROD.bat (Sync DB - FAST!)
4. Verify https://numerosmagicos.com
```

---

### 🔄 How Local → Production Sync Works

**Architecture Overview:**

- **Local Development:** SQLite database (`prisma/dev.db`)
- **Production (Vercel):** PostgreSQL database (managed by Vercel)
- **Sync Direction:** Local → Production (ONE-WAY only!)

#### 📊 The 4-Step Incremental Sync Process

**STEP 1: Identify New Draws**

- Compares last draw ID in production vs. local
- Finds all draws with `id > lastProdDrawId`
- If no new draws → sync exits early (nothing to do!)

**STEP 2: Insert NEW Data** (~137 records for 1 draw)

- **Draws:** New lottery results
- **SystemPerformance:** How each number system performed (~71 systems)
- **StarSystemPerformance:** How each star system performed (~8 systems)
- **SystemPrediction:** What each system predicted (~71 predictions)

**STEP 3: Update CHANGED Data** (~142 records)

- **SystemRanking:** Updated averages (accuracy changed!)
- **StarSystemRanking:** Updated star averages
- **CachedPrediction:** Next draw predictions (~71 systems)
- **MLModelTraining:** Retrained models (if any)
- **StatisticsCache:** Frequency data, heatmaps, etc.

**STEP 4: Check for New Systems**

- Compares `RankedSystem` table between local/prod
- If new systems found → **WARNING:** Run FULL_SYNC instead!

#### ⚡ Why Incremental is Fast

- **Full Sync:** Deletes + reimports 147,000 records (~90s)
- **Incremental:** Inserts ~137 + updates ~142 = 279 records (~5s)
- **Speed gain:** 18x faster! ⚡

#### 🔐 Database Connection Details

**Local (SQLite):**

```typescript
new PrismaClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
})
```

**Production (Postgres):**

```typescript
new PrismaClient()  // Uses POSTGRES_PRISMA_URL from .env
```

The batch file (`.bat`) automatically sets the `POSTGRES_PRISMA_URL` environment variable before running the sync script.

#### ⚠️ Important Notes

1. **Never sync without MASTER_UPDATE first** - ensures local data is complete
2. **Never sync with Prisma Studio open** - causes database locks
3. **Always verify production after sync** - check <https://numerosmagicos.com>
4. **If new systems added** - use FULL_SYNC to import their complete history

---

## 2. 🏗️ Offline-First Architecture & Efficiency

We have moved away from "Online Calculation" to "Offline Calculation".

### ⚡ Smart Calculation Rules (Efficiency)

1. **Incremental Updates:** Do NOT recalculate everything. When a new draw arrives, we only calculate the result for that specific draw.
    - *Exception:* Neural Networks (LSTM/RF) may need periodic retraining (e.g., weekly), but inference is incremental.
2. **Anti-Systems:** NEVER recalculate an Anti-System (e.g., `Anti-Vortex`).
    - **Logic:** Anti-System = `TotalNumbers - SystemNumbers`.
    - **Cost:** Zero. It's just a set operation on the display/inference side.
    - **Storage:** Store the main system result; derive the anti-result dynamically or lightweightly.

### 🔄 The "MASTER UPDATE"

* Script: `.\tools\2-MASTER_UPDATE.bat`
- **Function:** It intelligently checks what is missing. It downloads new draws, updates rankings, and processes system performances locally.

---

## 3. 🧪 Laboratory & New Systems

### 🔬 The "LABORATORY" Folder

* Use `src/app/model-lab` (or similar concept) for experimenting.
- New systems start here. They are isolated from the production ranking until proven.

### ✨ Checklist: Creating a New System

To promote a system from Lab to Production, you **MUST** register it in these 3 places:

1. **Registry:** `src/systems/index.ts` (Add class and export)
2. **Seeding:** `src/scripts/database/seed-ranked-systems.ts` (To add to `RankedSystem` table)
3. **Backfill:** `src/scripts/core/turbo-backfill.ts` (To calculate history)

*After registration, run `MASTER_UPDATE` to generate its history.*

---

## 4. 🧠 Neural Networks & ML

- **NEVER** train models in the Next.js runtime (Vercel has 10s timeout).
- **Inference:** use the pre-calculated data stored in `SystemPrediction` table or `CachedPrediction`.
- **Persistence:** Save trained models to JSON/DB so they don't reset on restart.

---

## 5. 📂 Organization (Tools & Scripts)

- **Rule:** The Root directory must be CLEAN.
- **Rule:** ALL operational scripts (`.bat`, `.sh`) must reside in the **`tools/`** folder.
- **Cleanup:** Delete any unused or legacy scripts immediately.

---

## 6. 🤖 Automation

- If you see a file named `ROADMAP.md`, **UPDATE IT** with your progress.
- If you see `task.md`, **CHECK OFF** items you completed.
- **Walkthrough:** Always verify your changes visually and screenshot them if possible.

---

**Version:** 2.0 (Dec 29, 2025) - Added Incremental Sync rules
