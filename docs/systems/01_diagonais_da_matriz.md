# Sistema: Diagonais da Matriz (2D)

> **Identificador**: `Diagonais da Matriz`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/diagonais-matriz.ts`  
> **Origem**: Criado pelo Paulo Alexandre Batista em folhas de cálculo Excel.

---

## 1. A Alma do Sistema (História e Génese)

Este foi o **sistema fundador** que deu origem a todo o projeto *Números Mágicos*.

Nasceu da intuição geométrica de que as bolas sorteadas não são eventos puramente isolados no tempo, mas propagam "ondas" diagonais através de uma matriz de sorteios. Quando dobramos a análise no tempo e no espaço, linhas diagonais que cruzam vários números em semanas sucessivas formam fluxos de ressonância.

![Matriz em V original no Excel](../assets/systems/diagonais-matriz/excel_diagonais_matriz_v_shape.png)

### O Caso Histórico da Semana 10 vs Semana 11
Na folha de Excel original:
1. Até à Semana 10 (Sorteio 213), o Paulo calculou os somatórios das diagonais nas linhas 215 e 216.
2. A soma total (linha 217) identificou com força >= 7 os seguintes números:
   `13, 21, 25, 32, 33, 34, 39, 42, 44, 48`
3. O Paulo jogou na Semana 10 e não obteve prémio. Deitou o boletim fora e não jogou na semana seguinte por falta de tempo para recalcular.
4. Na **Semana 11**, os números oficiais sorteados foram:
   `13, 21, 25, 35, 48` (com estrelas 4 e 8) — **4 acertos diretos na chave principal**!
5. **A lição matemática**: Tendo a informação até à semana $T-1$, as somas das diagonais projetam com precisão a estrutura do sorteio seguinte $T$.

![Histórico Semana 10 e 11](../assets/systems/diagonais-matriz/excel_diagonais_matriz_historico_semana11.png)

---

## 2. A Matriz de Sorteios

A matriz de trabalho é formada por:
* **Linhas**: Sorteios cronológicos, onde o sorteio imediatamente anterior é $T-1$ (atraso $d=1$), o anterior $T-2$ ($d=2$), etc.
* **Colunas**: Todos os números possíveis do jogo:
  * **Totoloto**: 1 a 49 (49 colunas)
  * **EuroDreams**: 1 a 40 (40 colunas)
  * **EuroMillions**: 1 a 50 (50 colunas)
  * **Mega-Sena**: 1 a 60 (60 colunas)
* **Células**: `1` se o número saiu nesse sorteio; `0` se não saiu.

---

## 3. O Algoritmo Matemático das Diagonais

Para cada número candidato $N$ ($1 \le N \le \text{maxNum}$):

### A. Vértice / Ponto de Partida $(T-1, N)$
O cálculo parte da coluna $N$ no sorteio imediatamente anterior ($d=1$).
* **Regra de Repetição Imediata (Bónus 2x)**:
  Como a célula $(T-1, N)$ é a raiz comum de onde nascem ambas as diagonais (esquerda e direita), se o número $N$ saiu no sorteio anterior ele pontua em **ambas** as diagonais (+1 à esquerda e +1 à direita, totalizando +2). Isso valoriza naturalmente a tendência física de repetição de números quentes.

### B. Diagonal da Esquerda (Sobe e recua para a esquerda)
* Parte de $(T-1, N)$, passa por $(T-2, N-1)$, $(T-3, N-2)$, etc.
* **Fronteira**: Pára obrigatoriamente quando atinge a **Coluna 1** (borda esquerda da matriz) ou a profundidade máxima de **50 sorteios** passados.
* Passos: $\min(N, 50)$.

### C. Diagonal da Direita (Sobe e avança para a direita)
* Parte de $(T-1, N)$, passa por $(T-2, N+1)$, $(T-3, N+2)$, etc.
* **Fronteira**: Pára obrigatoriamente quando atinge a **Coluna maxNum** (borda direita: 49 no Totoloto, 50 no EuroMillions, etc.) ou a profundidade máxima de **50 sorteios** passados.
* Passos: $\min(\text{maxNum} - N + 1, 50)$.

### D. Pontuação Final
$$\text{Score}(N) = \text{Soma}_{\text{Esquerda}} + \text{Soma}_{\text{Direita}}$$

---

## 4. Critério de Ordenação e Desempate (Opção A)

1. **Critério Principal**: Pontuação descendente (`b.score - a.score`).
2. **Critério de Desempate Estrito (Opção A - Excel)**:
   Se dois números obtiverem o mesmo score nas diagonais, o desempate é feito por **ordem numérica crescente** (`a.num - b.num`).
   *Exemplo*: Se o número 13 e o número 21 tiverem ambos score 8, o 13 surge primeiro, replicando com exatidão a leitura da esquerda para a direita da folha de Excel.

---

## 5. Regras Sagradas de Implementação

1. **Ordem Decrescente Obrigatória**: O array de histórico recebido deve ter sempre na posição `0` o sorteio mais recente ($T-1$). Se por engano vier por ordem crescente, o código deve inverter automaticamente.
2. **Imutabilidade**: O histórico passado, uma vez calculado e gravado na base de dados, **nunca mais pode ser recalculado ou sobrescrito**. O passado é imutável.
