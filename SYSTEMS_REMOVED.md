# Sistemas Removidos/Desativados

**Data:** 03 Fevereiro 2026  
**Análise Executada:** ✅ system-performance-report.json

---

## 📊 Resumo da Análise

- **Total de Sistemas:** 163
- **Sistemas Fracos:** 15 (9.2%) - Accuracy < 20%
- **Sistemas Médios:** 2 (1.2%) - Accuracy 20-25%
- **Sistemas Fortes:** 146 (89.6%) - Accuracy >= 25%
- **Accuracy Média:** 51.48%

---

## ❌ Sistemas Fracos Identificados (Accuracy < 20%)

### Sistemas de Estrelas com 1 Previsão (0% accuracy)

Estes sistemas têm apenas 1 previsão e 0% de accuracy. **Recomendação:** Aguardar mais dados antes de decidir.

1. **Anti-Média +1 Stars** - 0% (1 previsão)
2. **Hot Stars (Totoloto)** - 0% (1 previsão)
3. **Markov Stars (Totoloto)** - 0% (1 previsão)
4. **Anti-Late Stars (Totoloto)** - 0% (1 previsão)
5. **Clustering Stars (Totoloto)** - 0% (1 previsão)
6. **Monte Carlo Stars (Totoloto)** - 0% (1 previsão)
7. **Média +1 Stars (Totoloto)** - 0% (1 previsão)
8. **Anti-Vortex Stars (Totoloto)** - 0% (1 previsão)
9. **Star Platinum (Totoloto)** - 0% (1 previsão)
10. **Consensus Stars (Hot + Markov + Vortex) (Totoloto)** - 0% (1 previsão)
11. **Quarteto Stars Elite (Totoloto)** - 0% (1 previsão)
12. **Vortex Stars (EuroDreams)** - 0% (1 previsão)
13. **Anti-Clustering Stars (EuroDreams)** - 0% (1 previsão)
14. **Anti-Monte Carlo Stars (EuroDreams)** - 0% (1 previsão)
15. **Anti-Média +1 Stars (EuroDreams)** - 0% (1 previsão)

**Decisão:** ⏸️ **NÃO REMOVER** - Sistemas novos de estrelas precisam de mais dados para avaliação.

---

## ⚠️ Sistemas Médios (Accuracy 20-25%)

1. **Sistema Média Vizinhos (Totoloto)** - 20% (1 previsão)
2. **PyramidPascal (EuroDreams)** - 20% (2 previsões)

**Decisão:** ⏸️ **MONITORAR** - Poucos dados, aguardar mais previsões.

---

## 🧠 Sistemas ML (Machine Learning) - Análise Detalhada

### Sistemas ML Ativos (Problemáticos)

| Sistema | Status | Accuracy | Previsões | Ação |
|---------|--------|----------|-----------|------|
| **LSTM Neural Net** | ⚠️ Ativo | 52.26% | 1818 | ❌ DESATIVAR |
| **Random Forest AI** | ⚠️ Ativo | 49.65% | 1907 | ❌ DESATIVAR |
| **Standard Deviation** | ⚠️ Ativo | 50.19% | 1862 | ❌ DESATIVAR |
| **Sistema Elástico** | ⚠️ Ativo | 50.23% | 1907 | ❌ DESATIVAR |

### Sistemas ML Já Desativados

| Sistema | Status |
|---------|--------|
| **ML Classifier** | ✅ Desativado |
| **Pattern Based** | ✅ Desativado |
| **Root Sum** | ✅ Desativado |

**Razão para Desativação:**

- Causam hangs durante cálculos
- Precisam ser refeitos do zero
- Performance não justifica complexidade

**Plano:**

1. Marcar como `isActive = false` na BD
2. Manter código comentado
3. Refazer do zero após multi-game estável

---

## 🏆 Top 10 Sistemas Fortes (Para Replicar)

Estes sistemas devem ser replicados para Totoloto e EuroDreams:

1. **Hot Stars (EuroDreams)** - 95.58% (113 previsões) 🌟
2. **Markov Stars** - 100% (1 previsão)
3. **Star Platinum** - 100% (1 previsão)
4. **Sistema Média Vizinhos (EuroDreams)** - 80% (1 previsão)
5. **Markov Chain (EuroDreams)** - 73.33% (2 previsões)
6. **Anti-PyramidPascal (EuroDreams)** - 73.33% (2 previsões)
7. **Anti-Random Generator (EuroDreams)** - 66.67% (2 previsões)
8. **Hot Numbers (EuroDreams)** - 65.93% (113 previsões)
9. **Sistema Oscilação Universal V2 (EuroDreams)** - 63.33% (2 previsões)
10. **Sistema Média Camadas (EuroDreams)** - 63.33% (2 previsões)

---

## 📋 Ações Recomendadas

### Imediatas (Fase B.0)

- [ ] **Desativar 4 sistemas ML** (LSTM, Random Forest, Standard Deviation, Sistema Elástico)
- [ ] **Manter sistemas de estrelas** (aguardar mais dados)
- [ ] **Documentar sistemas desativados**

### Futuras (Pós Multi-Game)

- [ ] **Refazer sistemas ML** do zero
- [ ] **Reavaliar sistemas de estrelas** após 20+ previsões
- [ ] **Replicar top performers** para outros jogos

---

## 🔧 Script de Desativação

```sql
-- Desativar sistemas ML problemáticos
UPDATE RankedSystem 
SET isActive = false 
WHERE name IN (
  'LSTM Neural Net',
  'Random Forest AI',
  'Standard Deviation',
  'Sistema Elástico'
);
```

---

**Última Atualização:** 03 Fevereiro 2026  
**Próxima Revisão:** Após 50+ previsões nos sistemas de estrelas
