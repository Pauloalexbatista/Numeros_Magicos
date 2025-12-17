# 📖 PRODUCTION WORKFLOW - Números Mágicos

> **Última atualização:** 17 Dez 2025  
> **Arquitetura:** SQLite (Local) → Postgres (Vercel)

---

## 🎯 Workflow Completo (Novo Sistema ou Sorteio)

### Passo 1: Desenvolvimento Local

#### A. Criar/Atualizar Sistema
```bash
# Se for sistema novo: criar em src/services/
# Se for sorteio novo: executar MASTER_UPDATE.bat
.\MASTER_UPDATE.bat
```

**O que faz:**
1. Fetch novo sorteio (se houver)
2. Calcula TODOS os sistemas (turbo-backfill)
3. Treina ML (se necessário - smart skip)
4. Gera JSONs estáticos

**Tempo:** ~5 minutos (ou ~30s se não houver sorteio novo)

---

### Passo 2: Verificação Local

```bash
# Iniciar servidor local
.\NUMEROS_MAGICOS.bat
```

**Verificar em http://localhost:3000:**
- ✅ Último sorteio está correto?
- ✅ Novo sistema aparece no ranking?
- ✅ Previsões estão a funcionar?

---

### Passo 3: Sincronização com Produção

⚠️ **IMPORTANTE: Fechar Prisma Studio primeiro!**

#### 3.1. Fechar Prisma Studio
- Ir aos terminais em execução
- Ctrl+C em TODAS as instâncias do Prisma Studio

#### 3.2. Executar Sync Automático
```bash
.\SYNC_PROD_AUTO.bat
```

**O que faz:**
1. Exporta dados locais (SQLite → JSON)
2. Limpa tabelas na Postgres (Vercel)
3. Importa dados atualizados

**Tempo:** ~60 segundos

**Connection String:** Lê automaticamente do `.env` (variável `POSTGRES_URL_PROD`)

---

### Passo 4: Deploy do Código (se houver mudanças)

```bash
git add .
git commit -m "feat: [descrição]"
git push
```

**Quando fazer:**
- ✅ Criaste novo sistema
- ✅ Mudaste lógica de código
- ❌ **NÃO** fazer só para dados (sync já enviou)

---

### Passo 5: Verificação Online

Ir a https://numerosmagicos.com e verificar:
- ✅ Novo sistema aparece?
- ✅ Último sorteio está atualizado?
- ✅ Rankings estão corretos?

---

## 🔄 Cenários Comuns

### Cenário A: Sorteio Novo (Terça/Sexta)
```bash
1. .\MASTER_UPDATE.bat          # ~5 min
2. Verificar localhost
3. Fechar Prisma Studio
4. .\SYNC_PROD_AUTO.bat         # ~60s
5. Verificar numerosmagicos.com
```

**Total:** ~7 minutos

---

### Cenário B: Sistema Novo (como Quarteto)
```bash
1. Criar sistema em src/services/
2. Adicionar a ranked-systems.ts
3. Adicionar a turbo-backfill.ts
4. .\MASTER_UPDATE.bat          # ~5 min (calcula histórico)
5. Verificar localhost
6. Fechar Prisma Studio
7. .\SYNC_PROD_AUTO.bat         # ~60s
8. git add . && git commit && git push
9. Aguardar Vercel deploy       # ~2-3 min
10. Verificar numerosmagicos.com
```

**Total:** ~10 minutos

---

### Cenário C: Só Código (sem dados)
```bash
1. Fazer mudanças no código
2. git add . && git commit && git push
3. Aguardar Vercel deploy       # ~2-3 min
```

**Total:** ~3 minutos  
**Nota:** NÃO precisa de sync se não mudaste dados!

---

## ⚠️ REGRAS DE OURO

### 1. **SEMPRE Fechar Prisma Studio Antes do Sync**
❌ **Erro comum:** Tentar sync com Studio aberto  
✅ **Correto:** Ctrl+C em todos os Prisma Studio primeiro

### 2. **Sync vs Deploy - Quando Fazer Cada Um**

| Mudança | Sync Necessário? | Deploy Necessário? |
|---------|------------------|-------------------|
| Sorteio novo | ✅ SIM | ❌ NÃO |
| Sistema novo | ✅ SIM | ✅ SIM |
| Fix de bug (código) | ❌ NÃO | ✅ SIM |
| Recalcular dados | ✅ SIM | ❌ NÃO |

### 3. **Connection String Guardada**
- Está no `.env` (variável `POSTGRES_URL_PROD`)
- **NÃO** commitar o `.env` (está no `.gitignore`)
- Se perderes, ir buscar à Vercel Dashboard

### 4. **Ordem Importa!**
```
CORRETO:  MASTER_UPDATE → Verificar Local → Sync → Deploy Código
ERRADO:   Deploy Código → MASTER_UPDATE → Sync
```

---

## 🛠️ Scripts Disponíveis

| Script | Quando Usar | Tempo |
|--------|-------------|-------|
| `MASTER_UPDATE.bat` | Sorteio novo ou sistema novo | ~5 min |
| `SYNC_PROD_AUTO.bat` | Enviar dados para produção | ~60s |
| `NUMEROS_MAGICOS.bat` | Testar localmente | Instantâneo |

---

## 🔍 Troubleshooting

### Erro: "Prisma Client locked"
**Causa:** Prisma Studio está aberto  
**Solução:** Fechar TODOS os Prisma Studio (Ctrl+C)

### Erro: "Connection String vazia"
**Causa:** `.env` não tem `POSTGRES_URL_PROD`  
**Solução:** Adicionar ao `.env`:
```
POSTGRES_URL_PROD="postgresql://..."
```

### Site não atualiza após sync
**Causa:** Mudaste código mas não fizeste deploy  
**Solução:** `git push` para fazer deploy

### Sync demora muito (>5 min)
**Causa:** Está a sincronizar Predictions (94k registos)  
**Solução:** Usar `SYNC_PROD_AUTO.bat` que salta Predictions

---

## 📊 Arquitetura Atual

```
┌─────────────────┐
│   PC (Local)    │
│   SQLite DB     │ ← MASTER_UPDATE calcula aqui
└────────┬────────┘
         │
         │ SYNC_PROD_AUTO.bat
         │ (Export → Import)
         ↓
┌─────────────────┐
│ Vercel (Prod)   │
│  Postgres DB    │ ← Site lê daqui
└─────────────────┘
```

**Vantagens:**
- ✅ Cálculos pesados no PC (sem timeouts)
- ✅ Produção só lê dados (rápido)
- ✅ Controlo total (vês tudo localmente primeiro)

---

**Próxima atualização:** Quando houver mudanças no workflow
