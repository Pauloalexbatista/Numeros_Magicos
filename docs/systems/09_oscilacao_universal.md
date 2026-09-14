# Sistema: Sistema Oscilação Universal V2

> **Identificador**: `Sistema Oscilação Universal V2`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/universal-oscillation-v2-system.ts`  
> **Conceito/Alma**: Matemática do Vórtice, Raízes Digitais (Tesla) e Princípio de Alternância de Fases  
> **Origem**: Investigação empírica de correlação e dispersão de raízes digitais por Paulo Alexandre Batista.

---

## 1. A Alma do Sistema (A Lei do Vórtice e a Taxa de Oscilação de 74%)

O **Sistema Oscilação Universal V2** fundamenta-se na matemática do vórtice e na redução teosófica/digital dos números ao seu núcleo arquetípico de 1 a 9.

### A Redução à Raiz Digital (Digital Root):
Qualquer número de lotaria pertence estritamente a uma de 9 Famílias Radicais, obtida pela soma contínua dos seus algarismos:
$$\text{Raiz}(N) = ((N - 1) \pmod 9) + 1$$
* Exemplos: $07 \rightarrow 7$, $16 \rightarrow 7$, $25 \rightarrow 7$, $34 \rightarrow 7$, $43 \rightarrow 7$.

### O Princípio da Alternância de Fases:
Num sorteio de lotaria, quando uma família radical concentra múltiplas saídas no mesmo concurso (a **Raiz Dominante**), essa família atinge uma saturação energética transitória.
O estudo empírico fundador comprovou que em **mais de 74% das ocorrências**, no concurso imediatamente a seguir a energia do vórtice **oscila para longe da família saturada**, ativando as famílias complementares.

---

## 2. O Algoritmo de Identificação e Ponderação

Para prever o concurso $T$:

### 1. Deteção da Raiz Dominante do Sorteio Anterior ($T-1$)
Calcula-se a raiz digital de cada uma das bolas saídas no concurso imediatamente anterior ($T-1$):
* Conta-se a frequência de cada raiz de 1 a 9.
* A raiz (ou raízes) com maior número de saídas em $T-1$ é classificada como **Raiz Dominante**.

### 2. Ponderação Base por Frequência Histórica
Cada número $k$ de 1 a $maxNum$ tem uma pontuação base proporcional à sua frequência nos últimos 1000 sorteios (ou histórico disponível):
$$\text{BaseScore}(k) = \text{Freq}_{1000}(k)$$

### 3. Aplicação do Filtro de Oscilação (O Boost de Tesla)
Ajusta-se o peso de cada número em função da sua pertença à família dominante:
* **Se a raiz de $k$ NÃO é dominante** (Rota de Oscilação Favorável):
  $$\text{FinalScore}(k) = \text{BaseScore}(k) \times 1.5 \quad (+50\% \text{ Boost})$$
* **Se a raiz de $k$ É dominante** (Família Saturada em Repouso):
  $$\text{FinalScore}(k) = \text{BaseScore}(k) \times 0.5 \quad (-50\% \text{ Penalização})$$

---

## 3. Critérios de Ordenação e Desempate Canónico

1. **1º Critério**: Maior pontuação final ajustada $\text{FinalScore}$ (ordem decrescente).
2. **2º Critério de Desempate**: Em caso de pontuações idênticas, maior frequência recente nos últimos 20 sorteios ($\text{Freq}_{20}$).
3. **3º Critério Fixo Final**: Opção A (Ordem numérica crescente).
4. **Guarda de Inversão Temporal Automática**: Garante que o sorteio $T-1$ é rigorosamente o concurso anterior e o histórico é lido na cronologia correta.

---

## 4. Histórico e Imutabilidade

Todas as previsões calculadas são trancadas para sempre e exportadas para o cofre consolidado em:
`data/consolidated/oscilacao_universal_[jogo].json`.
