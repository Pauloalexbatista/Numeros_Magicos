# 📋 CHECKLIST OBRIGATÓRIO: Atualização de Sorteios

## ⚠️ REGRA DE OURO

**NUNCA** considere uma atualização completa sem passar por TODOS os itens desta checklist.

---

## 1️⃣ Buscar Sorteios

- [ ] Executar `npm run db:update`
- [ ] Verificar logs: "New draw added" ou "Gap filled"
- [ ] Confirmar data do último sorteio

---

## 2️⃣ Verificar Sistemas de NÚMEROS

- [ ] Executar `npx tsx src/scripts/debug/verify-update.ts`
- [ ] Confirmar: `System Performance Records > 0`
- [ ] Verificar exemplos de acertos (Hot Numbers, Markov, etc.)

**Se falhar:**

```bash
npx tsx src/scripts/debug/quick-eval.ts
```

---

## 3️⃣ Verificar Sistemas de ESTRELAS ⭐

- [ ] Executar `npx tsx src/scripts/debug/verify-stars.ts`
- [ ] Confirmar: `Star System Performances Found > 0`
- [ ] Verificar exemplos (Hot Stars, Markov Stars, etc.)

**Se falhar:**

```bash
npx tsx src/scripts/debug/eval-stars-only.ts
```

---

## 4️⃣ Atualizar Rankings

- [ ] Executar `npm run force-ranking` (se necessário)
- [ ] Verificar que rankings foram atualizados

---

## 5️⃣ Gerar Ficheiros Estáticos

- [ ] Executar `npx tsx src/scripts/static-generator/generate-all.ts`
- [ ] Verificar que JSONs foram criados em `src/data/static/`

---

## 6️⃣ Verificação Visual (Localhost)

- [ ] Abrir `localhost:3000/ranking`
- [ ] Confirmar que dados estão atualizados
- [ ] Abrir `localhost:3000/analysis/stars`
- [ ] **CRÍTICO:** Confirmar que estrelas aparecem (não "Nenhum sistema acertou")

---

## 7️⃣ Sincronizar Produção (Opcional)

- [ ] Executar `1-TOOLS/3-INCREMENTAL_SYNC_PROD.bat`
- [ ] Verificar que produção foi atualizada

---

## ✅ Verificação Final Automática

```bash
npm run verify:all
```

**Só avance se TODOS os checks passarem!**

---

## 🚨 Se Algo Falhar

### Números não calculados

```bash
npx tsx src/scripts/debug/quick-eval.ts
```

### Estrelas não calculadas

```bash
npx tsx src/scripts/debug/eval-stars-only.ts
```

### Gap detectado

```bash
npm run db:update
# Aguardar conclusão
npm run verify:all
```

---

## 📝 Histórico de Uso

| Data | Sorteio | Números | Estrelas | Observações |
|------|---------|---------|----------|-------------|
| 2026-01-25 | 2026-01-23 | ✅ 24 | ✅ 16 | Primeira vez com checklist |

**Instruções:** Preencher esta tabela após cada atualização bem-sucedida.
