# Sistema: Monte Carlo

> **Identificador**: `Monte Carlo`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/ranked-systems.ts` (`generateMonteCarlo`)  
> **Conceito/Alma**: Simulações Estocásticas Massivas com Semente Determinística (Seeded RNG)  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (Simulação Estocástica de Grandes Números)

O método de **Monte Carlo** fundamenta-se na computação probabilística iterativa. Em vez de deduzir a chave por uma fórmula matemática fechada, o sistema gera **10.000 sorteios virtuais em computador** sob a distribuição de densidade de probabilidade histórica do jogo.

As dezenas que mais frequentemente emergem no conjunto das milhares de extrações simuladas são selecionadas como os números com maior atração estocástica para o concurso real seguinte.

---

## 2. A Semente Determinística (Seeded RNG) e Reprodutibilidade

Numa plataforma profissional e auditável, uma simulação de Monte Carlo **não pode ser aleatória instável** (o utilizador não pode ver uma chave agora e outra diferente se recarregar a página 5 segundos depois).

* O algoritmo utiliza um **Gerador Pseudo-Aleatório com Semente Criptográfica/Determinística (Seeded RNG)**.
* A semente (*Seed*) é ancorada rigorosamente no identificador, data e números do concurso anterior ($T-1$).
* Desta forma, para o mesmo histórico, a simulação dos 10.000 sorteios produz **exatamente os mesmos resultados a cada execução (Determinismo Perfeito)**.

---

## 3. O Algoritmo de Simulação

Para prever o concurso $T$:

1. **Distribuição Ponderada**:
   - Calcula-se a frequência histórica de cada número até $T-1$.
   - A probabilidade de seleção de cada número é diretamente proporcional ao seu histórico:
     $$P(k) = \frac{\text{Freq}(k)}{\text{Total de Bolas Sorteadas}}$$
2. **Ciclo de Simulação**:
   - Realizam-se 10.000 sorteios simulados.
   - Em cada sorteio simulado, extraem-se as bolas do jogo sem reposição (5 bolas no Totoloto/EuroMillions; 6 bolas no EuroDreams/Mega-Sena).
   - Cada vez que um número é sorteado numa simulação, soma $+1$ ao seu contador de acertos: $\text{SimCount}(k)$.

---

## 4. Critérios de Ordenação e Desempate Canónico

1. **1º Critério**: Maior número de vitórias nas simulações $\text{SimCount}(k)$ (ordem decrescente).
2. **2º Critério de Desempate (se houver empate no número de vitórias)**:
   - Maior frequência nos últimos 20 sorteios anteriores ($\text{Freq}_{20}$).
3. **3º Critério Fixo Final**:
   - Opção A (Ordem numérica crescente).
4. **Guarda de Inversão Temporal Automática**:
   - Garante que a semente e as probabilidades são calculadas com o histórico lido corretamente do mais recente para o mais antigo.

---

## 5. Histórico e Imutabilidade

Todas as previsões calculadas são trancadas para sempre e exportadas para o cofre consolidado em:
`data/consolidated/monte_carlo_[jogo].json`.
