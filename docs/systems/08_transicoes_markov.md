# Sistema: Transições de Markov

> **Identificador**: `Transições de Markov`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/ranked-systems.ts` (`generateMarkovChain`)  
> **Conceito/Alma**: Cadeias Estocásticas de Markov e Matriz de Transição Condicional  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (Cadeias Estocásticas de Probabilidade Condicional)

O sistema **Transições de Markov** baseia-se na teoria das Cadeias de Markov de 1ª ordem, modelando a dinâmica da lotaria através das probabilidades de transição entre estados sucessivos.

O princípio fundamental assume que a probabilidade de uma determinada dezena $Y$ ser sorteada no concurso $T$ é influenciada pelo conjunto de dezenas que foram sorteadas no concurso imediatamente anterior ($T-1$):
$$P(Y \in \text{Sorteio}_T \mid X \in \text{Sorteio}_{T-1})$$

Se historicamente a aparição de um número $X$ tem forte correlação e precede com frequência a aparição do número $Y$, a transição $X \rightarrow Y$ acumula uma força estocástica elevada.

---

## 2. A Construção da Matriz de Transições

Percorrendo todo o histórico acumulado de concursos consecutivos:
* Para cada par de sorteios vizinhos no tempo $(\text{Sorteio}_{k-1} \rightarrow \text{Sorteio}_k)$:
  - Para cada número $X$ presente no sorteio anterior e para cada número $Y$ presente no sorteio seguinte:
    $$\text{Matriz}[X][Y] = \text{Matriz}[X][Y] + 1$$

A matriz quadrada $N \times N$ resultante armazena o mapa completo de ressonância estocástica de todo o jogo.

---

## 3. Projeção e Pontuação para o Próximo Sorteio

Para prever o concurso $T$:
1. Identificam-se as bolas saídas no sorteio imediatamente anterior ($T-1$): $X_1, X_2, \dots, X_m$.
2. Para cada número candidato $Y$ de 1 até ao máximo do jogo ($maxNum$):
   Soma-se a pontuação acumulada de transição disparada pelas bolas de $T-1$:
   $$\text{Score}(Y) = \sum_{X \in \text{Sorteio}_{T-1}} \text{Matriz}[X][Y]$$

---

## 4. Critérios de Ordenação e Desempate Canónico

1. **1º Critério**: Maior pontuação total de transição condicional $\text{Score}(Y)$ (ordem decrescente).
2. **2º Critério de Desempate (Números com o mesmo Score de transição)**:
   - Maior frequência nos últimos 20 sorteios anteriores ($\text{Freq}_{20}$).
3. **3º Critério Fixo Final**:
   - Opção A (Ordem numérica crescente).
4. **Guarda de Inversão Temporal Automática**:
   - Garante que a matriz de transições e o sorteio de partida $T-1$ são lidos com ordenação temporal estrita.

---

## 5. Histórico e Imutabilidade

Todas as previsões calculadas são trancadas para sempre e exportadas para o cofre consolidado em:
`data/consolidated/markov_[jogo].json`.
