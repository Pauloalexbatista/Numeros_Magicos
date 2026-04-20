# EuroDreams Backfill - Memory-Optimized Approach

## Problem

Standard backfill fails due to JavaScript heap memory limits when processing 113 draws × 50 systems.

## Solution

Run with increased Node.js heap size:

```bash
node --max-old-space-size=8192 node_modules/tsx/dist/cli.mjs src/scripts/core/fast-backfill-eurodreams.ts
```

## Alternative: Manual Incremental Approach

If memory issues persist, process in smaller chunks:

### Step 1: Process first 30 draws

```typescript
// Modify fast-backfill-eurodreams.ts line 30:
const draws = await prisma.draw.findMany({
    where: { game: 'EURODREAMS' },
    orderBy: { date: 'asc' },
    take: 30  // Add this line
});
```

### Step 2: Process next 30 draws

```typescript
const draws = await prisma.draw.findMany({
    where: { game: 'EURODREAMS' },
    orderBy: { date: 'asc' },
    skip: 30,  // Add this line
    take: 30
});
```

### Step 3: Process remaining draws

```typescript
const draws = await prisma.draw.findMany({
    where: { game: 'EURODREAMS' },
    orderBy: { date: 'asc' },
    skip: 60
});
```

## Why This Happens

Each draw evaluation:

1. Loads full history (up to 113 draws)
2. Runs 50 prediction algorithms
3. Stores results in memory before committing

Total memory: ~113 draws × 50 systems × history data = exceeds default 4GB limit

## Recommendation

Use the increased heap size command above. It should complete in ~10-15 minutes.
