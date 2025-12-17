# 🌟 GOLDEN RULES - Números Mágicos (Agente Guide)

**⚠️ CRITICAL: READ THIS BEFORE EXECUTING ANY CODE ⚠️**

This document establishes the **IMMUTABLE LAWS** of the `PRJT_Numeros_Magicos` project. Violating these rules leads to data corruption, production downtime, and confusion.

---

## 1. 🔄 Synchronization (The #1 Rule)

**Architecture:** Hybrid (Local SQLite + Production Postgres)

- **NEVER** try to connect to Postgres using `npx prisma` commands directly (unless you are 100% sure the client is generated for it).
- **NEVER** run sync scripts without cleaning production first (causes duplicate key errors).
- **ALWAYS** use the official script:

### ✅ THE ONLY WAY TO SYNC:
```bash
.\PRODUCTION_SYNC.bat
```
*(This script handles the dangerous dance of switching Prisma Clients, exporting local data, cleaning production, and importing fresh data.)*

---

## 2. 🏗️ Offline-First Architecture

We moved away from "Online Calculation" to "Offline Calculation + Static Deployment".

- **Calculations:** happen LOCALLY (`MASTER_UPDATE.bat`).
- **Production:** is READ-ONLY (displays data from DB/Static JSONs).
- **Updates:**
    1. Run `MASTER_UPDATE.bat` (Local)
    2. Check localhost
    3. Run `PRODUCTION_SYNC.bat`
    4. Git Push

---

## 3. 🧠 Neural Networks & ML

- **NEVER** train models in the Next.js runtime (Vercel has 10s timeout).
- **ALWAYS** train locally using `tools/ML_UPDATE.bat` or `src/scripts/core/turbo-ml.ts`.
- **Inference:** use the pre-calculated data stored in `SystemPrediction` table or `CachedPrediction`.

---

## 4. 📝 Code & Files

- **Scripts:** Do not create new BAT files in the root. If really needed, put them in `tools/`.
- **System Registration:** To add a new system, you MUST register it in:
    1. `src/systems/index.ts`
    2. `src/scripts/database/seed-ranked-systems.ts`
    3. `src/scripts/core/turbo-backfill.ts`
- **Environment:**
    - `DATABASE_URL`: Always sqlite (`file:./prisma/dev.db`) for dev.
    - `POSTGRES_URL_PROD`: Only for the sync script.

---

## 5. 🤖 Automation

- If you see a file named `ROADMAP.md`, **UPDATE IT** with your progress.
- If you see `task.md`, **CHECK OFF** items you completed.
- **Walkthrough:** Always verify your changes visually and screenshot them if possible.

---

**Version:** 1.0 (Dec 17, 2025)
