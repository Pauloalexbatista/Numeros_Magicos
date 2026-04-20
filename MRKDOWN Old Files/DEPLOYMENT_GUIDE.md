# Guia de Deployment: Nova Configuração de Previsões

**Data:** 06/02/2026  
**Versão:** 2.0 - Multi-Game Dynamic Predictions

---

## 📋 Resumo das Mudanças

### Código Alterado

1. `src/services/ranked-systems.ts` - Funções helper para previsões dinâmicas
2. `src/services/star-systems.ts` - getPredictionCount atualizado
3. `src/services/new-star-systems.ts` - AntiStarSystem corrigido
4. `src/scripts/core/backfill-all-systems.ts` - Usa getMaxNumber()
5. `src/scripts/core/update-system-predictions.ts` - Usa getMaxNumber()

### Impacto em Produção

- ✅ **EUROMILLIONS:** Funciona perfeitamente (já testado localmente)
- ✅ **TOTOLOTO/EURODREAMS:** Código pronto, mas jogos não existem em produção
- ✅ **Backward Compatible:** Não quebra funcionalidade existente

---

## 🚀 Passos para Deploy

### 1. Commit e Push para GitHub

```bash
# Verificar mudanças
git status

# Adicionar ficheiros modificados
git add src/services/ranked-systems.ts
git add src/services/star-systems.ts
git add src/services/new-star-systems.ts
git add src/scripts/core/backfill-all-systems.ts
git add src/scripts/core/update-system-predictions.ts

# Commit
git commit -m "feat: Dynamic prediction counts for multi-game support

- Add getNumberPredictionCount() for dynamic number predictions (15/15/18)
- Add getNumbersDrawn() for accurate accuracy calculations (5/5/6)
- Update getPredictionCount() for star predictions (6/6/3)
- Fix AntiStarSystem to return ALL non-predicted numbers
- Update InverseSystem to return ALL non-predicted numbers
- Ensure 100% coverage without overlap for all games
- Fix EURODREAMS accuracy calculation bug

BREAKING: Anti-systems now predict different counts
- EUROMILLIONS: 35 numbers (was 25), 6 stars (was 6)
- TOTOLOTO: 34 numbers (was 25), 7 stars (was 6)
- EURODREAMS: 22 numbers (was 25), 2 stars (was 3)

Tested: All games show System + Anti = 100% accuracy"

# Push
git push origin main
```

### 2. Deploy para Vercel (Produção)

**Opção A: Auto-Deploy (Recomendado)**

- Vercel detecta push no GitHub
- Deploy automático em ~2 minutos
- Verificar em: <https://seu-site.vercel.app>

**Opção B: Manual Deploy**

```bash
vercel --prod
```

### 3. Sincronizar Base de Dados

**IMPORTANTE:** A BD de produção precisa ser recalculada com o novo código!

#### Opção A: Full Sync (Recomendado para esta atualização)

```bash
# Executar localmente
tools\3-FULL_SYNC_PROD.bat
```

**O que faz:**

- Copia TODA a BD local para produção
- Inclui todos os recálculos com nova lógica
- Tempo: ~5-10 minutos
- **Recomendado:** Primeira vez após mudança de lógica

#### Opção B: Incremental Sync (Para atualizações futuras)

```bash
# Executar localmente
tools\3-INCREMENTAL_SYNC_PROD.bat
```

**O que faz:**

- Copia apenas novos sorteios
- Mais rápido (~1 minuto)
- **Usar:** Para atualizações diárias normais

---

## ✅ Verificação Pós-Deploy

### 1. Verificar Website

- [ ] Abrir <https://seu-site.vercel.app>
- [ ] Verificar dashboard carrega
- [ ] Verificar sistemas aparecem corretamente

### 2. Verificar Previsões

- [ ] Ir para página de sistemas
- [ ] Verificar que sistemas preveem 15 números (EUROMILLIONS)
- [ ] Verificar que anti-sistemas preveem 35 números
- [ ] Verificar que accuracy soma ~100%

### 3. Verificar Estrelas

- [ ] Ir para análise de estrelas
- [ ] Verificar que sistemas preveem 6 estrelas
- [ ] Verificar que anti-sistemas preveem 6 estrelas
- [ ] Verificar que accuracy soma ~100%

### 4. Verificar Logs (Vercel Dashboard)

- [ ] Sem erros 500
- [ ] Queries de BD funcionam
- [ ] Tempo de resposta normal

---

## 🔄 Workflow Futuro (Atualizações Diárias)

### Quando há novo sorteio

```bash
# 1. Buscar novos sorteios (local)
npx tsx src/scripts/core/fetch-draw.ts

# 2. Calcular previsões (local)
npx tsx src/scripts/core/update-system-predictions.ts EUROMILLIONS
npx tsx src/scripts/core/turbo-stars.ts 0 EUROMILLIONS

# 3. Atualizar rankings (local)
npx tsx src/scripts/core/update-star-rankings.ts

# 4. Sincronizar com produção
tools\3-INCREMENTAL_SYNC_PROD.bat
```

---

## ⚠️ Notas Importantes

### 1. Primeira Sincronização

- **Usar FULL SYNC** na primeira vez após este deploy
- Garante que toda a BD está com nova lógica
- Depois, usar incremental sync normalmente

### 2. Sistemas Medal

- Podem mostrar 0% temporariamente após deploy
- Auto-corrigem após próximo sorteio
- Normal e esperado

### 3. TOTOLOTO/EURODREAMS

- Código está pronto
- Quando adicionares em produção, funcionará automaticamente
- Não precisa mudanças adicionais

### 4. Rollback (Se necessário)

```bash
# Reverter commit
git revert HEAD
git push origin main

# Vercel faz auto-deploy da versão anterior
# Depois fazer full sync da BD antiga
```

---

## 📊 Mudanças de Comportamento

### Antes (Versão Antiga)

```
EUROMILLIONS:
- Sistema: 25 números
- Anti: 25 números
- Coverage: 50/50 (não cobria tudo)
- Accuracy soma: ~50%
```

### Depois (Versão Nova)

```
EUROMILLIONS:
- Sistema: 15 números (30%)
- Anti: 35 números (70%)
- Coverage: 50/50 (100% cobertura!)
- Accuracy soma: 100% ✅
```

---

## 🎯 Checklist Final

- [ ] Código commitado para GitHub
- [ ] Push feito com sucesso
- [ ] Vercel deploy concluído
- [ ] Full sync da BD executado
- [ ] Website verificado
- [ ] Previsões verificadas
- [ ] Accuracy soma ~100% confirmado
- [ ] Logs sem erros

---

## 📞 Suporte

Se algo correr mal:

1. Verificar logs no Vercel Dashboard
2. Verificar BD em produção (Prisma Studio)
3. Fazer rollback se necessário
4. Contactar suporte

**Última atualização:** 06/02/2026
