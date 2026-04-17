# Task List - Bolas Mágicas

## 🛠️ Emergency Update: Jan 2026 Draws (Fixing ML Hangs)

- [x] Fetch Missing Draws (Jan 13, 16, 20)
- [x] Bypass stuck ML models (`turbo-backfill`)
- [x] Recalculate Number Systems (Base & Ensemble)
- [x] Recalculate Star Systems (`force-stars-cache`)
- [x] Recalculate Medal Systems (`turbo-medals` + `force-medals-cache`)
- [x] Create Safe Update Script (`SAFE_UPDATE.bat`)
- [x] Verify Localhost and Sync Prod

## 🐛 Bug Fixes: Prediction Caching

- [x] Diagnose Missing Predictions (Anti-Systems/EuroDreams/Totoloto)
- [x] Fix System Naming Inconsistency ((EuroDreams) -> _EURODREAMS)
- [x] Register Missing Ensemble Systems (Vortex, Random, etc.)
- [x] Verify All Active Systems have Cached Predictions

## 🏗️ Architecture & Roadmap

- [x] Analyze Data Consistency/Performance Issues
- [x] Create Architecture Proposal (`ARCHITECTURE_PROPOSAL.md`)
- [x] Update `ROADMAP.md` with Offline-First Strategy
- [x] **Analyze & Cleanup `tools/` folder** (Moved obsolete to `tools/legacy`)
- [x] Implement Offline-First Architecture (Rankings first)
  - [x] Create Static Generator (`src/scripts/static-generator/generate-all.ts`)
  - [x] Create Master Script (`MASTER_UPDATE.bat`)
  - [x] Refactor Ranking Page to read Static JSON
  - [x] Refactor System Details Page to read Static JSON
  - [x] **Refine Lab Analysis** (Data Consistency Fix)
  - [x] Remove "Static Simulation" mode (Consolidated to Historical Real)
  - [x] Unify Data Source (Lab uses `SystemPerformance` just like Ranking)
  - [x] Criar script `src/scripts/analyze-system-performance.ts`
  - [x] Executar análise de performance de todos os sistemas
  - [x] Identificar sistemas fracos (accuracy < 20%)
  - [x] Identificar sistemas sem jackpots (últimos 100 sorteios)
  - [x] Marcar sistemas ML como `isActive = false` na BD
  - [x] Remover código de sistemas permanentemente eliminados
  - [x] Documentar sistemas removidos em `SYSTEMS_REMOVED.md`
  - [x] Atualizar `ranked-systems.ts` (remover imports)
  - [x] Limpar pasta 1-TOOLS (remover legacy e obsoletos)
  - [x] Define `src/systems/core/types.ts`
  - [x] Create Registry (`src/systems/index.ts`)
  - [x] Migrate initial systems (`HotNumbers`, `Markov`)
  - [x] Migrate statistical systems (`Monte Carlo`, `Clustering`)
  - [x] Migrate pyramid systems (`Pascal`, `Gaps`, `Vortex`)
  - [x] Migrate ML systems (`RandomForest`, `LSTM`)
  - [x] Migrate Ensemble systems (`Medals`)
  - [x] Create Sync Script (`src/scripts/core/sync-systems.ts`)
  - [x] Verify All Systems (`src/scripts/core/verify-all.ts`)

## 🛡️ Robustness & Recovery Tools (New Priority)

- [x] **Smart Gap Filling:** Logic to fetch missing intermediate draws automatically
- [x] **Granular Control:** Create `recalc-system.ts` CLI for single-system updates
- [x] **Star Systems Fix:** Separate evaluation logic with smart skip detection
- [ ] **Atomic Updates:** Optimize `MASTER_UPDATE.bat` to be fail-safe

## ⚡ Performance Optimization (Next Priority)

- [x] **Optimize MASTER_UPDATE (Incremental Backfill):** Stop recalculating 1900 draws every time. Only process new draws.
- [ ] **Fix ML Re-initialization:** Investigate `LSTMSystem` / `RandomForest` "Orthogonal initializer" warnings loops.
- [ ] **Separate ML Training:** Move heavy ML training out of the critical update path (maybe weekly instead of daily).

## 🌌 Universal Oscillation Lab (Active)

- [x] **Core Implementation**
  - [x] Implement "Holistic Sum Root" Strategy (Vortex Math)
  - [x] Build Transition Matrix (Heatmap UI)
  - [x] Implement "Root Saturation" Logic
- [x] **Validation & Transparency**
  - [x] Visualize "Pool Hits" (Actual Winning Numbers in Pool)
  - [x] Add "Random Baseline" (Expected hits by chance)
  - [x] Implement "Efficiency Meter" (Yield vs Random)
  - [x] Create "Story Mode" Log (Trigger -> Prediction -> Result Table)
- [ ] **Integration**
  - [ ] Explore integration with Maestro Algorithm

## 🌪️ Vortex Pyramid Verification

- [x] Add Occurrence Index to `MultiplesClient`
- [x] Add Occurrence Index to `MeanAmplitudeClient`

## 🏆 Ranking System Verification

- [x] Verify Public Ranking Page (`/ranking`)
- [x] Verify System Details Page (`/ranking/[systemName]`)
- [x] Confirm "Smart Inverse" logic in Ensemble
- [x] Automate Ranking Updates on New Draw (`EuroMillionsService`)

## 🔮 Advanced Analysis Verification

- [x] Verify Vortex Pyramid UI (`/analysis/vortex-pyramid`)
- [x] Verify Gold/Silver/Bronze UI (`/analysis/gold`, etc.)
- [x] Verify AI Models (Random Forest / LSTM)

## 🛡️ System Audit Implementation

- [x] Create Server Action `runSystemDiagnostics` (`/admin/audit/actions.ts`)
- [x] Create Client Component `AuditResultsTable`
- [x] Update Audit Page (`/admin/audit/page.tsx`)
- [x] Verify Diagnostics Execution

## ⚙️ Backfill Manager Implementation (Staging)

- [x] Create `SystemPerformanceStaging` table
- [x] Create Script `backfill-staging.ts` (Process to Staging)
- [x] Create Script `commit-staging.ts` (Staging -> Production)
- [x] Create Batch `BACKFILL_STAGING.bat`
- [x] Analyze Gold/Silver/Bronze Ensembles (Raw Coverage vs Top 25)
- [x] Implement Layered Mean System (SistMediaCamadas) - 55.00% Accuracy 🏆

## 🎨 UI Standardization (Cards)

- [x] Update `LinkCard` component (Uniform size, new variants)
- [x] Implement "Pro" theme (Dark Blue + Gold)
- [x] Update Card Data (Categories: System, Tool, Admin)
- [x] Verify Dashboard Layout

## ⚡ ML Performance Optimization (Flash AI)

- [x] Identify heavy models (Random Forest, LSTM, ML Classifier)
- [x] Create `turboTraining.ts` service for offline training
- [x] Create `ML_UPDATE.bat` for manual execution
- [x] Modify models to Read-Only (load from JSON)
- [x] Add "Atualizar AI" button to Admin Dashboard
- [x] Automate updates via Cron Job (`api/cron/update`)

## 🎟️ Wheeling Optimization

- [x] Implement Bitmask Algorithm (100x speedup)
- [x] Move to Web Worker (Background Thread)
- [x] Increase Limit to 25 Numbers
- [x] Add "Prize Analysis" (Cost vs Guarantee)
- [ ] **Smart ROI Analysis:** Calculate if high-volume bets (e.g., 300 lines) are statistically profitable (Cost vs Expected Prize)
- [x] **Smart Anti-System Optimization:** Reuse base predictions for Anti-systems (avoid re-calculation)

## UI Standardization

- [x] Set "Liga dos Campeões" default year to 2025
- [x] Standardize "Back" button (Left, `<` icon)
- [x] Update all pages to use consistent `BackButton` component

## 🌀 Rodin Map Implementation (🛑 SUSPENSO)

- [x] Phase 1: Quick Validation Probe (`rodin-probe.ts`) - ⚠️ 0% oscilação 3↔6 detectada
- [x] Phase 2: Extended Analysis (3 estratégias testadas) - ✅ Estratégia 1&3: 53% correlação
- [x] Phase 3: Matrix Visualization (`rodin-matrix-visualization.ts`) - ✅ Diagonal +37%, Linhas 3&6 +17%
- [x] Phase 4: Normalized Analysis (`rodin-matrix-normalized.ts`) - ✅ Raiz 8: 15.00, Raiz 3&6: 14.00
- [⏸️] Phase 5: System Implementation (`RodinMatrixSystem`) - PAUSADO
- [⏸️] Phase 6: UI Visualization (`/analysis/rodin`) - PAUSADO

**Resumo:** Análise completa realizada. Previsão gerada: [8, 17, 21, 33, 39]
**Documentos:** 7 artifacts em `brain/` com toda a pesquisa

## 🚀 Infrastructure & Deployment

- [x] Configure Resend Email Service (Contact, Verification, Reset, Welcome)
- [x] Integrate Resend with verified domain (`noreply@numerosmagicos.com`)
- [x] Deploy Application to Vercel
- [x] **UI Polish (Pre-Deploy):**
  - [x] Add "BETA / EM TESTES" label to Homepage
  - [x] Hide "Excluded Numbers/Stars" cards (Make Admin-Only)
  - [x] Restore Admin Access for `pauloalexbatista@gmail.com`
  - [x] Remove image before "Números Mágicos" title
  - [x] **Navigation Restructure:**
    - [x] Rename "Dashboard" to Portuguese (e.g., "Visão Geral")
    - [x] Create "Ferramentas" tab
    - [x] Move Tables, Simulator, Desdobramentos, ROI to "Ferramentas"
- [x] Configure Custom Domain on Vercel (`numerosmagicos.com`)
- [x] Configure Environment Variables on Production
- [x] Verify Production Build & Database Connection
- [x] Implement Database Backup Strategy (Automated by `PRODUCTION_SYNC.bat`)
- [x] Create 'Rescue Script' to restore critical data from backups (`PRODUCTION_SYNC.bat` restores from local)
- [x] Create **GOLDEN_RULES.md** (Agent Protocol)
- [x] Organize Operational Scripts in `tools/` folder (Numbered workflow: 1-4)
- [x] Consolidate Sync Scripts (Added Full and Quick Sync with CachedPrediction/ML data)
- [x] Cleanup Redundant Batch files from project root

## 🛡️ Data Integrity & Verification (March 2026)

- [x] **Fix Duplicated Systems:** Resolved tripled entries in EuroDreams/EuroMillions via server-side deduplication and `noStore`.
- [x] **Restore Totoloto Stars:** Fixed missing star data by updating Prisma Client and performing a full production backfill.
- [x] **Standardize System Names:** Corrected naming inconsistencies for 69 systems to ensure cross-game alignment.
- [x] **Production Schema Sync:** Synchronized PostgreSQL schema to include necessary tracking columns.
- [x] **Verification:** Confirmed fix across all live dashboards with screenshots.

## 🔮 Future Improvements (The "Dream Team")

- [ ] **SEO:** Keywords and meta tags optimization for search engines (PT/EN)
- [ ] **Translation:** Multi-language support (EN, FR, ES)
- [ ] **Exclusion Effectiveness Log:** Track efficacy of excluded numbers over time (User Request)
- [x] **Ensemble System:** "Quarteto Elite" & "Quarteto de Impacto" (Laboratory Integration)
- [x] Implement **Descriptive Naming Strategy** for Ensembles (Transparency)
- [x] Implement **Média sem as Pontas** (Trimmed Mean Algorithm)
- [ ] Create **Golden Signal** Dashboard (When all 3 agree)
- [ ] **Expansion:** Replica for other lotteries:
  - **Totoloto:** 5/49 + 1/13
  - **Euro-Dreams:** 6/40 + 1/5
