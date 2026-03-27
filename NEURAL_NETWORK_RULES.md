# ⚠️ NEURAL NETWORK TRAINING RULES

**CRITICAL DOCUMENT - ALL AGENTS MUST FOLLOW THESE RULES**

---

## 🚨 THE GOLDEN RULE

> **NEURAL NETWORKS MUST NEVER TRAIN IN RUNTIME**
> 
> Training = 5-60 seconds at 80-100% CPU = PC OVERLOAD

---

## 📋 MANDATORY RULES FOR ALL NEURAL NETWORK MODELS

### ❌ NEVER DO THIS

1. ❌ **NEVER** train models in API routes (`/api/*`)
2. ❌ **NEVER** train models in Server Actions
3. ❌ **NEVER** train models in response to user actions
4. ❌ **NEVER** create buttons that trigger training directly
5. ❌ **NEVER** call `model.fit()` or `trainModel()` in runtime code
6. ❌ **NEVER** auto-train when cache is missing/invalid

### ✅ ALWAYS DO THIS

1. ✅ **ALWAYS** train via offline scripts in `src/scripts/`
2. ✅ **ALWAYS** create a `.bat` file in `tools/` for manual execution
3. ✅ **ALWAYS** save trained models to cache tables
4. ✅ **ALWAYS** read from cache in production code
5. ✅ **ALWAYS** throw error if cache missing (don't train!)
6. ✅ **ALWAYS** add model to Admin Dashboard control panel

---

## 🏗️ ARCHITECTURE PATTERN

All neural network models MUST follow this architecture:

```
┌─────────────────────────────────────────┐
│  OFFLINE TRAINING (Manual Execution)   │
│  ├─ Script: src/scripts/train-*.ts     │
│  ├─ Batch: tools/*_UPDATE.bat          │
│  ├─ Duration: 5-60 seconds              │
│  ├─ CPU: 80-100% (NORMAL!)              │
│  └─ Output: Cache table updated         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  RUNTIME USAGE (Instant)                │
│  ├─ Read from cache table               │
│  ├─ Duration: < 10ms                    │
│  ├─ CPU: < 5%                           │
│  └─ NEVER trains!                       │
└─────────────────────────────────────────┘
```

---

## 📝 ADDING A NEW NEURAL NETWORK MODEL

Follow these steps **EXACTLY**:

### Step 1: Create Service File

**File:** `src/services/[model-name].ts`

```typescript
/**
 * ⚠️ CRITICAL: This model follows OFFLINE TRAINING pattern
 * See: NEURAL_NETWORK_RULES.md
 */

import { prisma } from '@/lib/prisma';

/**
 * Get prediction (READ-ONLY - NO TRAINING)
 */
export async function get[ModelName]Prediction() {
    const cache = await prisma.[cacheTable].findFirst({
        orderBy: { updatedAt: 'desc' }
    });

    if (!cache) {
        throw new Error(
            'Model not trained. Run tools/[MODEL]_UPDATE.bat'
        );
    }

    return JSON.parse(cache.prediction);
}

/**
 * Train model (OFFLINE ONLY - Called by scripts)
 */
export async function train[ModelName]Model(): Promise<void> {
    console.log('[MODEL] Starting OFFLINE training...');
    
    // 1. Load data
    const data = await loadTrainingData();
    
    // 2. Train model
    const model = createModel();
    await model.fit(data.xs, data.ys, {
        epochs: 20,
        batchSize: 8
    });
    
    // 3. Generate prediction
    const prediction = await model.predict(latestData);
    
    // 4. Save to cache
    await prisma.[cacheTable].create({
        data: {
            prediction: JSON.stringify(prediction),
            confidence: calculateConfidence(),
            lastDrawId: latestDraw.id
        }
    });
    
    // 5. Cleanup
    model.dispose();
    
    console.log('✅ Model trained successfully!');
}
```

---

### Step 2: Create Training Script

**File:** `src/scripts/train-[model-name].ts`

```typescript
import { train[ModelName]Model } from '../services/[model-name]';

async function main() {
    console.log('🧠 ========================================');
    console.log('   [MODEL NAME] - OFFLINE TRAINING');
    console.log('========================================\n');

    try {
        const start = Date.now();
        await train[ModelName]Model();
        const duration = ((Date.now() - start) / 1000).toFixed(1);
        
        console.log('\n========================================');
        console.log('✅ TRAINING COMPLETE!');
        console.log(`⏱️  Duration: ${duration}s`);
        console.log('========================================\n');
        
    } catch (error) {
        console.error('\n❌ Training failed:', error);
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => process.exit(0));
```

---

### Step 3: Create Batch File

**File:** `tools/[MODEL]_UPDATE.bat`

```batch
@echo off
echo ==========================================
echo   [MODEL NAME] - OFFLINE TRAINING
echo ==========================================
echo.
echo AVISO: Este processo vai:
echo  - Treinar modelo de IA
echo  - Demorar [X] segundos
echo  - Usar 80-100%% do CPU (ISTO E NORMAL!)
echo.
echo Nao feche esta janela durante o processo.
echo.
pause

cd /d "%~dp0.."
call npx tsx src/scripts/train-[model-name].ts

echo.
echo ===================================================
echo    TREINO CONCLUIDO COM SUCESSO!
echo ===================================================
echo.
pause
```

---

### Step 4: Add to Admin Dashboard

**File:** `src/components/admin/NeuralNetworkControl.tsx`

Add to the models array:

```typescript
{
    name: '[Model Display Name]',
    type: '[MODEL_TYPE]',
    trained: true/false,
    lastTrained: lastTrainedDate,
    daysSinceTraining: calculateDays(),
    recommendedFrequency: 7, // or 30 for monthly
    scriptCommand: 'tools\\[MODEL]_UPDATE.bat',
    estimatedTime: '[X] seg'
}
```

---

### Step 5: Add to Status API

**File:** `src/app/api/admin/neural-status/route.ts`

Add status check logic for your model.

---

### Step 6: Update Cache Schema

**File:** `prisma/schema.prisma`

If needed, create cache table:

```prisma
model [ModelName]Cache {
  id          String   @id @default(cuid())
  prediction  String   // JSON
  confidence  Float
  lastDrawId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🎯 EXISTING MODELS (Reference)

### ✅ Correctly Implemented

1. **LSTM Neural Net** (`src/services/ml/lstm.ts`)
   - ✅ Loads from `lstm_weights.json`
   - ✅ Throws error if not found
   - ✅ Never trains in runtime

2. **Star LSTM** (`src/services/ml/star-lstm.ts`)
   - ✅ Loads from `star_lstm_weights.json`
   - ✅ Fallback to frequency analysis
   - ✅ Never trains in runtime

3. **Exclusion LSTM** (`src/services/exclusion-lstm.ts`)
   - ✅ Reads from `ExclusionCache` table
   - ✅ Throws error if cache missing
   - ✅ Separate `trainExclusionModel()` for offline use

---

## 🚦 TRAINING FREQUENCY GUIDELINES

### Weekly Models (7 days)
- Exclusion LSTM (Numbers)
- Exclusion LSTM (Stars)
- **Trigger:** 10+ new draws OR 7+ days

### Monthly Models (30 days)
- LSTM Neural Net (Numbers)
- Star LSTM (Stars)
- **Trigger:** 50+ new draws OR 30+ days

---

## 🔍 VERIFICATION CHECKLIST

Before merging code with neural networks, verify:

- [ ] Model NEVER trains in API routes
- [ ] Model NEVER trains in Server Actions
- [ ] Training script exists in `src/scripts/`
- [ ] Batch file exists in `tools/`
- [ ] Cache table exists in schema
- [ ] Service throws error if cache missing
- [ ] Model added to Admin Dashboard
- [ ] Status API updated
- [ ] Documentation updated

---

## 📚 RELATED DOCUMENTATION

- `README.md` - Performance rules (line 16-22)
- `lstm_complete_explanation.md` - Technical deep dive
- `walkthrough.md` - Implementation walkthrough

---

## ⚠️ FOR FUTURE AGENTS

**READ THIS BEFORE TOUCHING NEURAL NETWORKS:**

1. This document is **LAW**
2. Breaking these rules = PC overload
3. User has been burned by this before
4. **ALWAYS** follow the pattern above
5. **NEVER** create shortcuts or "improvements"
6. When in doubt, ask the user

---

**Last Updated:** 2025-12-06  
**Status:** ACTIVE - MANDATORY FOR ALL AGENTS
