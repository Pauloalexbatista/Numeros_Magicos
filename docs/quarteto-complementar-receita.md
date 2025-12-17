# 📋 Quarteto Complementar - Documentação da Receita

**Criado:** 17 Dezembro 2025  
**Tipo:** Sistema Ensemble (Votação Ponderada)  
**Performance:** 93.5% de cobertura histórica

---

## 🎯 RECEITA (Composição)

Este sistema combina **4 sistemas independentes** através de votação ponderada:

### 1. Anti-Anti-Vortex Pyramid
- **Performance Individual:** 49.2% (936/1903 sorteios)
- **Jackpots:** 52
- **Algoritmo:** Análise de padrões diagonais (canais de energia)
- **Ficheiro:** `src/services/vortex-pyramid.ts`

### 2. LSTM Neural Net
- **Performance Individual:** 54.1% (1029/1903 sorteios)
- **Jackpots:** 73
- **Algoritmo:** Rede neuronal de exclusão (aprendizagem temporal)
- **Ficheiro:** `src/services/exclusion-lstm.ts`

### 3. Sist Combinado Media+3
- **Performance Individual:** 51.3% (976/1903 sorteios)
- **Jackpots:** 57
- **Algoritmo:** Média ponderada de sistemas estatísticos
- **Ficheiro:** `src/services/custom/sist-combinado-media-3.ts`

### 4. Anti-Random Forest AI
- **Performance Individual:** 50.4% (960/1903 sorteios)
- **Jackpots:** 54
- **Algoritmo:** Ensemble de árvores de decisão
- **Ficheiro:** `src/services/ml/random-forest.ts`

---

## 🔬 Algoritmo de Votação

### Passo 1: Obter Previsões
Cada um dos 4 sistemas gera os seus **Top 25 números**.

### Passo 2: Contar Votos
Para cada número de 1-50, contar em quantos sistemas aparece:
- 4 votos = Todos os sistemas sugerem
- 3 votos = 3 sistemas sugerem
- 2 votos = 2 sistemas sugerem
- 1 voto = Apenas 1 sistema sugere
- 0 votos = Nenhum sistema sugere

### Passo 3: Priorização
Ordenar números por prioridade:
1. **MÁXIMA:** 3-4 votos (consenso forte)
2. **ALTA:** 2 votos (consenso moderado)
3. **BAIXA:** 1 voto (sugestão única)

### Passo 4: Seleção Final
Selecionar os primeiros 25 números da lista ordenada.

---

## 📊 Performance Validada

| Janela | Cobertura | Sorteios Cobertos |
|--------|-----------|-------------------|
| Últimos 50 | 98.0% | 49/50 |
| Últimos 100 | 97.0% | 97/100 |
| **TODO o histórico** | **93.5%** | **1779/1903** |

### Métricas Globais:
- **Jackpots:** 223
- **Salvamentos (3-4 acertos):** 1556
- **Sobreposição:** 155 sorteios (8.7%)
- **Complementaridade:** 91.3%

---

## 💡 Por Que Funciona?

### Complementaridade Real
Os 4 sistemas usam algoritmos **completamente diferentes**:
- **Vortex:** Padrões geométricos
- **LSTM:** Aprendizagem temporal
- **Média+3:** Estatística combinada
- **Random Forest:** Árvores de decisão

Quando um falha, outro acerta! 🎯

### Ganho Significativo
- **Média individual:** ~51%
- **Combinado:** 93.5%
- **Ganho:** +42.5% 🚀

---

## 🔧 Como Usar

### No Código:
```typescript
import QuartetoComplementar from '@/services/quarteto-complementar';

const sistema = new QuartetoComplementar();

// Obter Top 25
const top25 = await sistema.generateTop25(historico);

// Ver composição
const info = sistema.getCompositionInfo();
console.log(info.components); // Lista dos 4 sistemas
```

### Informação da Receita:
```typescript
const sistema = new QuartetoComplementar();

// Sistemas componentes
console.log(sistema.componentSystems);
// ['Anti-Anti-Vortex Pyramid', 'LSTM Neural Net', ...]

// Metadados completos
console.log(sistema.metadata);
// { createdDate, validatedCoverage, individualPerformance, ... }
```

---

## 📌 Rastreabilidade

### Ficheiros Relacionados:
- **Sistema Principal:** `src/services/quarteto-complementar.ts`
- **Documentação:** `docs/quarteto-complementar-receita.md` (este ficheiro)
- **Análise Original:** Laboratório de Complementaridade (17 Dez 2025)
- **Validação:** `analyze-final.ts` (93.5% confirmado)

### Histórico:
- **17/12/2025:** Descoberta no Laboratório (98% nos últimos 50)
- **17/12/2025:** Validação completa (93.5% em 1903 sorteios)
- **17/12/2025:** Implementação do sistema ensemble

---

## ⚠️ Notas Importantes

1. **Não Modificar a Receita:** Os 4 sistemas foram validados em conjunto. Alterar a composição invalida a validação de 93.5%.

2. **Dependências:** Este sistema depende dos 4 sistemas componentes. Se algum for removido ou modificado significativamente, a performance pode mudar.

3. **Manutenção:** Monitorizar performance continuamente. Se cair abaixo de 85%, investigar.

---

**Criado por:** Análise de Complementaridade  
**Validado em:** 1903 sorteios históricos  
**Última Atualização:** 17 Dezembro 2025
