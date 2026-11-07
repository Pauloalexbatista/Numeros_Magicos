# Registo Oficial de Estatísticas de Valor Comprovadas

Data da Auditoria: 07 de Novembro de 2026  
Metodologia: Auditoria Empírica Determinística (10.780 sorteios da Base de Dados Relacional PostgreSQL)  
Princípio: Eliminação total de ruído estatístico e especulações de "Anti-Sistema" não fundamentadas.

---

## 1. As Linhas de Base do Acaso Puro (Baselines Hipergeométricos)

Qualquer regra ou estratégia só tem valor se superar a probabilidade combinatória que o acaso produz naturalmente:

* **Euromilhões (5 em 50, Corte Top 25):**
  * Acaso num sorteio: $17.44\%$
  * Acaso numa janela de 3 sorteios ($W_3$): **$43.73\%$**
* **Totoloto (5 em 49, Corte Top 25):**
  * Acaso num sorteio: $18.71\%$
  * Acaso numa janela de 3 sorteios ($W_3$): **$46.28\%$**
* **EuroDreams (6 em 40, Corte Top 20):**
  * Acaso para $\ge 5$ acertos em $W_3$: **$24.87\%$**
  * Acaso para $\ge 4$ acertos em $W_3$: **$69.96\%$**

> **Regra de Ouro:** Qualquer sistema com taxa entre $40\%$ e $48\%$ está na Zona Neutra de Ruído e não deve gerar recomendações.

---

## 2. Critérios de Aprovação (Os 3 Filtros de Ferro)

1. **Amostra Real ($N \ge 25$):** Evento tem de ter acontecido pelo menos 25 vezes na história documentada.
2. **Superioridade Líquida (Lift $\ge +10\%$):** Taxa real de concretização em $W_3$ superior ao acaso por pelo menos $+10$ pontos percentuais.
3. **Consistência Temporal:** Comprovado tanto no histórico antigo (70%) como no histórico recente (30%).

---

## 3. Matriz de Padrões Aprovados por Jogo

### 🔵 Euromilhões
1. **Mais Quentes (Hot) — Pós-5/5:**
   * Amostra ($N$): 60 ocorrências
   * Taxa no Direto ($W_3$): **$58.3\%$** vs. Anti-Sistema: **$28.3\%$**
   * Vantagem sobre o acaso: **$+14.6\%$**
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**
2. **Mais Sorteadas de Sempre — Pós-5/5:**
   * Amostra ($N$): 52 ocorrências
   * Taxa no Direto ($W_3$): **$57.7\%$** (53.8% recente) vs. Anti-Sistema: **$36.5\%$**
   * Vantagem sobre o acaso: **$+14.0\%$**
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**
3. **Mais Atrasados — Pós-5/5:**
   * Amostra ($N$): 49 ocorrências
   * Taxa no Direto ($W_3$): **$57.1\%$** vs. Anti-Sistema: **$28.6\%$**
   * Vantagem sobre o acaso: **$+13.4\%$**
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**
4. **Tiro Certeiro — Pós-5/5:**
   * Amostra ($N$): 78 ocorrências
   * Taxa no Direto ($W_3$): **$55.1\%$** (56.0% recente) vs. Anti-Sistema: **$35.9\%$**
   * Vantagem sobre o acaso: **$+11.4\%$**
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**

### 🟢 Totoloto
1. **Geometria & Ciclos — Pós-5/5:**
   * Amostra ($N$): 43 ocorrências
   * Taxa no Direto ($W_3$): **$58.1\%$** (53.8% recente) vs. Anti-Sistema: **$37.2\%$**
   * Vantagem sobre o acaso: **$+11.8\%$**
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**
2. **SuperSistema Neuronal — Pós-5/5:**
   * Amostra ($N$): 45 ocorrências
   * Taxa no Direto ($W_3$): **$57.8\%$** (61.5% recente) vs. Anti-Sistema: **$26.7\%$**
   * Vantagem sobre o acaso: **$+11.5\%$**
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**
3. **Separação das Águas 2.0 — Pós-5/5:**
   * Amostra ($N$): 52 ocorrências
   * Taxa no Direto em $T+1$: **$26.9\%$** (o dobro do Anti-Sistema: 13.5%)
   * Taxa em $W_3$: **$50.0\%$**
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**

### 🟣 EuroDreams (314 Sorteios)
1. **Harmonia Dimensional (Antigravity) — Pós-Pico ($\ge 5$):**
   * Amostra ($N$): 39 ocorrências
   * Taxa de $\ge 5$ em $W_3$: **$38.5\%$** (45.5% recente)
   * Vantagem sobre o acaso: **$+13.6\%$** (Baseline: 24.87%)
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**
2. **Separação das Águas 2.0 — Consistência de Base ($\ge 4$):**
   * Amostra ($N$): 33 ocorrências
   * Taxa de $\ge 4$ em $W_3$: **$81.8\%$** (91.7% recente)
   * Vantagem sobre o acaso: **$+11.8\%$** (Baseline: 69.96%)
   * Ação: **MANTER NO SISTEMA PRINCIPAL (DIRETO)**

---

## 4. O Veredito sobre o "Anti-Sistema"

A teoria do "Anti-Sistema" após um evento máximo (5/5) foi matematicamente rejeitada como estratégia autônoma porque:
1. Em sistemas com inércia real, o Bloco Direto ganha mais do dobro das vezes ($58\%$ vs $28\%$).
2. Nenhum sistema na base de dados manteve uma taxa sustentada $>50\%$ no Anti-Sistema durante os anos recentes (quase todos caíram para $22\% \text{ a } 35\%$).
3. A utilidade real do Anti-Sistema reside na **Separação das Águas 2.0** como redutor de volantes (ao afastar o miolo neutro e forçar extremos), e não como regra de aposta contrária cega.
