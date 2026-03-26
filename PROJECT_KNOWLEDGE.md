# 🧠 PROJECT KNOWLEDGE: Números Mágicos (Master Document)

Este documento é a **Fonte de Verdade** do projeto. Reúne a visão, arquitetura, regras técnicas e a pesquisa científica fundamental.

---

## 📜 1. REGRAS DE OURO (GOLDEN RULES)

### 1.1 Diretrize Operacional
* **Ponto Único de Verdade:** Todas as decisões devem ser baseadas em análise histórica real, nunca em "intuição" ou processos aleatórios sem rasto.
* **No-Touch Server:** Jamais editar código diretamente na VPS. O fluxo é: **Local -> GitHub -> Pull na VPS**.
* **Tratamento de Erros:** O sistema de produção deve ser "burro" e resiliente. Se um cálculo falhar ou o cache estiver vazio, o site mostra um aviso ou fallback, mas **NUNCA** tenta calcular em runtime.

### 1.2 Limites de Recursos (VPS Hostinger)
* **Segurança de CPU:** Processos pesados (Docker ML) estão limitados a **50% de CPU** e **50% de RAM**. Os restantes 50% são exclusivos para o Website e Base de Dados.
* **Horário Vampiro:** Treinos pesados e backups ocorrem apenas entre as **03:00 e as 07:00 da manhã**.

### 1.3 Lógica de Sistemas
* **Agnosticismo de Jogo:** Os algoritmos devem funcionar para EuroMilhões, Totoloto e EuroDreams apenas alterando parâmetros (maxNumber, drawSize).

---

## 🏗️ 2. ARQUITETURA E INFRAESTRUTURA (v3.0)

### 2.1 Autonomia Total (VPS Hostinger)
O sistema foi concebido para ser 100% autónomo na VPS. Não depende de intervenções manuais para a sua operação diária.
- **Ciclo Noturno (Cron Job):**
  1. **Ingestão:** Recolha automática dos novos sorteios (via `syncMissingDraws`).
  2. **Validação:** Verificação de integridade e preenchimento de lacunas históricas.
  3. **Cálculo de Estatísticas:** Atualização de tendências e padrões estáticos.
  4. **Avaliação Silenciosa (Ranking):** O motor processa a performance de **todos** os sistemas (ativos ou não) para manter o histórico íntegro.
  5. **Regeneração de Cache:** Atualização imediata das tabelas `CachedPrediction` para exibição instantânea no frontend.

---

## 🧠 3. MACHINE LEARNING E IA

### 3.1 Regras Críticas de Treino
* **Proibido Runtime:** `model.fit()` ou `trainModel()` NUNCA devem ser chamados em rotas de API ou Server Actions.
* **Persistência:** Modelos gravam pesos e previsões em tabelas dedicadas (`MLModelTraining`, `ExclusionCache`).
* **Adapters:** A integração entre o motor e o site é feita via `NeuralPredictiveAdapter`, que garante latência zero na leitura.

---

## 🌀 4. PESQUISA RODIN E TESLA (MATEMÁTICA VORTEX)

### 4.1 Fundamentos Científicos
O projeto explora a **Redução Teosófica** (Raiz Digital 1-9) para identificar padrões em jogos de azar.
* **Oscilação Universal:** Descobriu-se que todos os pares de raízes (1-2, 3-6, 4-8, 5-7) têm uma taxa de oscilação de ~75% entre sorteios.
* **Ciclo Vortex:** 1 → 2 → 4 → 8 → 7 → 5 → 1 (Padrão de duplicação infinita).
* **Eixo 3-6-9 (Tesla):** O 3 e 6 representam polaridade, enquanto o 9 é o eixo neutro estabilizador.

### 4.2 Descobertas Práticas
* **Raiz 8:** Identificada como a mais "densa" em certas janelas temporais.
* **Matriz 9x9:** O mapeamento dos números de 1-50 numa grelha 9x9 revela diagonais secundárias 37% mais ativas.

---

## 📊 5. MANIFESTO E UX

* **"Análise, não Magia":** Vendemos dados organizados, não fórmulas de vitória.
* **Estratégia 50/50:** Sugerimos sempre 50% do pool de números para maximizar a probabilidade de impacto dentro do sistema.
* **Sistema de Pontos (Ranking):**
  - Jackpot (5/6 acertos): **1000/10000 pts**
  - 4 acertos: **100 pts**
  - 3 acertos: **1 pt**

---

**Última Atualização:** 26 de Março de 2026 (Consolidação Mestra)
**Responsável:** Antigravity (IA) via Diretrizes do Utilizador
