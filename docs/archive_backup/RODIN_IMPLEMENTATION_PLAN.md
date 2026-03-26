# 🗺️ Plano de Implementação: Rodin Map

**Objetivo:** Implementar e validar estratégias baseadas no Mapa de Rodin para o EuroMilhões, com foco em comunicação clara e progresso incremental.

## 📍 Fase 1: Validação Rápida (Sondagem)
*Objetivo:* Ter feedback imediato (em segundos) sobre a viabilidade, sem bloquear a máquina.

- [ ] **Criar Script de Sondagem (`rodin-probe.ts`)**
    - Analisa apenas os últimos 50 sorteios.
    - Imprime na consola sorteio a sorteio (para veres acontecer).
    - Mostra: Data, Raiz Dominante, e se houve Oscilação.
- [ ] **Executar e Analisar**
    - Discutimos os resultados imediatos.
    - Decidimos se avançamos para análise profunda.

## 📍 Fase 2: Análise Histórica (Profunda)
*Objetivo:* Validar estatisticamente com todo o histórico, mas com feedback constante.

- [ ] **Criar Script de Análise Otimizado (`rodin-full-analysis.ts`)**
    - Inclui barra de progresso (ex: "Processando ano 2020...").
    - Testa as 5 estratégias:
        1. Transição de Linhas (Oscilação 3↔6, 1↔2, etc.)
        2. Sequência de Colunas (Posição no mapa)
        3. Valores do Mapa (Multiplicação Mod 9)
        4. Clusters (Proximidade Geométrica)
        5. Sistema Combinado
- [ ] **Execução Controlada**
    - Executar o script.
    - Gerar relatório de performance (Jackpots, Precisão).

## 📍 Fase 3: Implementação do Sistema
*Objetivo:* Transformar a teoria em um sistema utilizável na app.

- [ ] **Criar Classe `RodinMapSystem`**
    - Implementar a lógica vencedora da Fase 2.
    - Integrar com a base de dados (`SystemPrediction`).
- [ ] **Integrar no Backfill**
    - Gerar previsões para o passado para entrar no Ranking.

## 📍 Fase 4: Interface (UI)
*Objetivo:* Visualizar o mapa na aplicação web.

- [ ] **Criar Página de Visualização (`/analysis/rodin`)**
    - Desenhar a grelha do Mapa de Rodin.
    - Destacar os números do último sorteio no mapa.
    - Mostrar a "próxima zona provável".

---

## 🚦 Próximo Passo Imediato

Avançar para a **Fase 1: Validação Rápida**.
Posso criar o script `rodin-probe.ts` agora?
