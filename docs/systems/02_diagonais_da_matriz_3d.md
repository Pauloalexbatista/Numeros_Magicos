# Sistema: Diagonais da Matriz 3D (Cilíndrico / Wrap-Around)

> **Identificador**: `Diagonais da Matriz 3D`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/diagonais-matriz-3d.ts`  
> **Origem**: Evolução tridimensional do sistema Diagonais da Matriz (2D) concebida pelo Paulo Alexandre Batista.

---

## 1. A Alma do Sistema (Do Plano ao Tubo Cilíndrico)

O sistema **Diagonais da Matriz 3D** é a evolução geométrica natural do sistema 2D original.

No sistema 2D plano, as diagonais encontram "paredes" artificiais (a coluna 1 à esquerda e a coluna máxima à direita) e param aos 50 sorteios de profundidade.

No modelo 3D:
1. A matriz de sorteios é dobrada num **cilindro virtual contínuo** (unindo a última coluna à primeira).
2. Não existem paredes:
   * Quando uma diagonal sobe para a esquerda e passa da coluna 1, ela faz **wrap-around** e reaparece na coluna máxima (ex: 50 no EuroMillions, 49 no Totoloto, 40 no EuroDreams, 60 na Mega-Sena) continuando o seu percurso ascendente.
   * Quando uma diagonal sobe para a direita e passa da coluna máxima, ela faz **wrap-around** e reaparece na coluna 1 continuando a subir.
3. **Profundidade Total Histórica**: O fluxo de diagonais não pára aos 50 sorteios; percorre **todo o histórico acumulado desde o sorteio imediatamente anterior ($T-1$) até ao concurso nº 1 da história do jogo**.

---

## 2. A Regra do "Sorteio 50" (Maturação Estatística)

Para que a ressonância tubular 3D tenha densidade e massa crítica suficiente, o sistema requer um período mínimo de aquecimento histórico:
* Nos primeiros 49 sorteios da vida de uma lotaria, o histórico ainda é curto.
* A avaliação estatística formal de previsões do sistema arranca a partir do **sorteio 50** ($T \ge 50$).

---

## 3. O Algoritmo Matemático

Para cada número candidato $N$ ($1 \le N \le \text{maxNum}$):

### A. Vértice / Ponto de Partida $(T-1, N)$
O cálculo parte da coluna $N$ no sorteio imediatamente anterior ($d=1$).
* **Regra de Repetição Imediata (Bónus 2x)**:
  À semelhança do 2D, a célula $(T-1, N)$ é o vértice de partida de ambos os fluxos helicoidais. Se o número $N$ saiu no sorteio anterior, ele pontua em ambas as diagonais (+2 pontos), reforçando a tendência de repetição imediata.

### B. Diagonal Cilíndrica da Esquerda (Sobe-Esquerda com Wrap-Around)
Para cada atraso $d$ de $1$ até ao tamanho total do histórico ($\text{totalHistory}$):
$$\text{coluna}_{\text{esquerda}} = \left( (N - d) \pmod{\text{maxNum}} + \text{maxNum} \right) \pmod{\text{maxNum}} + 1$$
Se o número nessa coluna saiu no sorteio $d$, incrementa o acumulador da esquerda.

### C. Diagonal Cilíndrica da Direita (Sobe-Direita com Wrap-Around)
Para cada atraso $d$ de $1$ até ao tamanho total do histórico ($\text{totalHistory}$):
$$\text{coluna}_{\text{direita}} = (N + d - 2) \pmod{\text{maxNum}} + 1$$
Se o número nessa coluna saiu no sorteio $d$, incrementa o acumulador da direita.

### D. Pontuação Final
$$\text{Score}(N) = \text{Soma}_{\text{Esquerda}} + \text{Soma}_{\text{Direita}}$$

---

## 4. Critério de Ordenação e Desempate (Opção A)

1. **Critério Principal**: Pontuação descendente (`b.score - a.score`).
2. **Critério de Desempate Estrito (Opção A)**:
   Em caso de empate no score acumulado, o desempate é feito por **ordem numérica crescente** (`a.num - b.num`).

---

## 5. Regras Sagradas de Implementação

1. **Ordem Decrescente Obrigatória**: O array de histórico recebido deve ter sempre na posição `0` o sorteio mais recente ($T-1$). O código deve possuir guarda de inversão automática.
2. **Cálculo Progressivo**: A cada novo concurso semanal, a nova linha é calculada sobre o passado acumulado. O passado consolidado é estritamente **imutável**.
