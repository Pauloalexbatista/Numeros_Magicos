# 🏗️ Multi-Game Architecture Proposal

## 🎯 Objective

Transform "Números Mágicos" from a EuroMillions-only platform into a Multi-Lottery Hub supporting:

1. **EuroMillions** (Current): 5/50 + 2/12 (Ter, Sex)
2. **Totoloto** (New): 5/49 + 1/13 (Qua, Sáb)
3. **EuroDreams** (New): 6/40 + 1/5 (Seg, Qui)

## 📐 Database Schema Changes

### 1. Enum `GameType`

Create a database-level enum to distinguish games.

```prisma
enum GameType {
  EUROMILLIONS
  TOTOLOTO
  EURODREAMS
}
```

### 2. Table Updates

We need to partition data by game type.

**Draw Table:**

```prisma
model Draw {
  id              String   @id @default(cuid())
  game            GameType @default(EUROMILLIONS) // 👈 New discriminator
  date            DateTime
  numbers         String   // JSON [5] or [6]
  stars           String   // JSON [2] or [1] (Reuse 'stars' col for 'bonus')
  jackpot         Float?
  hasWinner       Boolean  @default(false)
  
  // Relations
  performances    SystemPerformance[]
  
  @@unique([game, date]) // 👈 Composite unique key
}
```

**System Performance & Rankings:**
All performance tables (`SystemPerformance`, `SystemRanking`, `CachedPrediction`) must include `game: GameType`.

## 🛠️ Code Architecture (The "Game Engine")

### 1. Configuration Pattern

Instead of hardcoding `50` or `12`, we use a configuration object injected at runtime.

```typescript
export interface GameConfig {
  id: GameType;
  name: string;
  slug: string; // 'euromillions', 'totoloto'
  rules: {
    mainCount: number; // 5 or 6
    mainRange: number; // 50 or 49
    bonusCount: number; // 2 or 1
    bonusRange: number; // 12 or 13 or 5
    bonusLabel: string; // 'Estrelas', 'Número da Sorte', 'Dream Number'
  };
  provider: {
    fetchLatest: () => Promise<DrawData>;
    fetchArchive: (year: number) => Promise<DrawData[]>;
  };
}
```

### 2. Abstract System Base

Refactor `BaseSystem` to be game-agnostic.

```typescript
abstract class BaseSystem {
  constructor(protected config: GameConfig) {}

  // Methods use config.rules.mainRange instead of '50'
  abstract predict(): Prediction;
}
```

### 3. Factory Pattern

A `GameFactory` returns the correct services/configs based on the URL or context.

## 🔄 One-Click Update Automation

To solve the "Engineering" goal of easy updates for multiple games:

### The "Update Orchestrator"

A single script that iterates through enabled games or accepts a target.

```bash
# Updates ALL games
npm run update:all

# Updates specific game
npm run update -- --game=totoloto
```

**Implementation:**
`src/scripts/core/master-update.ts`

1. Reads `ACTIVE_GAMES` list.
2. For each game:
    a.  **Fetch:** Calls specific provider (e.g. `TotolotoService`).
    b.  **Calc:** Instantiates Systems with GameConfig.
    c.  **Rank:** Runs RankingEvaluator passing `gameType`.
    d.  **Static:** Generates JSONs in `/data/static/[game]/`.

## 🛣️ Migration Steps

1. **Refactor DB:** Add `GameType` (default 'EUROMILLIONS') to existing rows.
2. **Genericize Services:** Update `EuroMillionsService` to implement `IGameService`.
3. **Route Groups:** Move current pages to `app/(games)/[gameSlug]/...`.
4. **Add Totoloto:** Implement `TotolotoService` and config.
