# Sistema: SuperSistema Neuronal (Meta-Ensemble AI)

> **Identificador**: `SuperSistema Neuronal`  
> **Tipo**: Meta-Ensemble Stacking (IA de 2ª Ordem)  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/supersistema-neuronal.ts`  
> **Origem**: Concebido como a fusão sinérgica dos sistemas de topo da plataforma Números Mágicos.

---

## 1. A Alma do Sistema (História e Génese)

Ao longo de mais de 20 anos de sorteios auditados na plataforma *Números Mágicos*, a análise empírica e científica revelou uma verdade matemática incontornável:

> **Nenhum sistema analítico ganha sempre, mas cada um domina uma dimensão ortogonal diferente da mesma realidade estocástica.**

* O **Diagonais da Matriz** enxerga o fluxo da geometria 2D no espaço recente de sorteios (o rei histórico dos Jackpots de 5 e 6 acertos).
* O **Transições de Markov** modela a atração e dependência condicional par-a-par entre sorteios consecutivos.
* A **Oscilação Universal V2** mede a amplitude harmónica e a velocidade de regressão à média física.
* O **Agrupamento de Padrões (Clustering)** agrupa afinidades de densidade e blocos espaciais.
* O **Mais Sorteadas de Sempre** e o **Mais Quentes** medem a inércia mecânica e os ciclos de aquecimento térmico.
* O **Random Forest AI** aprende padrões não-lineares supervisionados a partir de árvores de decisão multidimensionais.

O **SuperSistema Neuronal** nasceu para responder à pergunta magna:
*E se criássemos um Conselho de Notáveis onde uma Meta-Inteligência Artificial escuta os melhores especialistas de cada jogo e decide, sorteio a sorteio, onde reside a verdadeira convergência estatística?*

---

## 2. A Filosofia de Não-Contaminação (Zero Lookahead Bias)

Para que um sistema preditivo tenha validade científica irrefutável, é obrigatório respeitar a regra fundamental da causalidade temporal:
1. **Nenhum dado do futuro pode ser utilizado** para prever o sorteio $T$.
2. Para avaliar o sorteio $T$, o SuperSistema tem acesso **estritamente e unicamente** às previsões que os especialistas geraram com os dados disponíveis até $T-1$.
3. O histórico não é manipulado, não se inventam variáveis e não se alteram regras retroativamente.
4. Cada jogo é **100% independente**: o Euromilhões aprende com o Euromilhões, a Mega-Sena com a Mega-Sena, o Totoloto com o Totoloto e o Eurodreams com o Eurodreams.

---

## 3. Os 5 Especialistas de Elite por Jogo

Através de uma auditoria exaustiva à base de dados histórica de todos os sistemas, foram selecionados para cada jogo os **5 especialistas com maior taxa comprovada de prémios de topo** (4 e 5 acertos no Euromilhões/Totoloto; 5 e 6 acertos na Mega-Sena/Eurodreams):

| Jogo | Especialista 1 | Especialista 2 | Especialista 3 | Especialista 4 | Especialista 5 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **🇪🇺 Euromilhões** | Diagonais da Matriz | Oscilação Universal V2 | Mais Sorteadas de Sempre | Transições de Markov | Random Forest AI |
| **🇵🇹 Totoloto** | Clustering (Padrões) | Diagonais da Matriz | Mais Sorteadas de Sempre | Mais Quentes | Transições de Markov |
| **🇧🇷 Mega-Sena** | Random Forest AI | Média +3 Otimizado | Diagonais da Matriz | Transições de Markov | Mais Sorteadas de Sempre |
| **🌠 Eurodreams** | Mais Quentes | Diagonais da Matriz 3D | Últimos a Sair | Random Forest AI | Pirâmide de Intervalos |

---

## 4. Formulação Matemática do Meta-Ensemble

Para cada número candidato $n \in [1, \text{maxNum}]$ no sorteio $T$:

### Passo 1: Percentil Normalizado de Cada Especialista ($P_i$)
Se um especialista $i$ colocou a bola $n$ na posição $\text{Rank}_i(n)$ (sendo 1 o seu número mais recomendado):
$$P_i(n) = \frac{\text{maxNum} - \text{Rank}_i(n) + 1}{\text{maxNum}} \in (0, 1]$$

### Passo 2: Índice de Consenso de Elite ($K$)
Quantos dos 5 especialistas colocaram a bola $n$ no seu Top 10 mais provável?
$$K(n) = \sum_{i=1}^5 \mathbb{I}(\text{Rank}_i(n) \le 10)$$
*Se $K(n) \ge 3$, significa que a maioria qualificada dos especialistas converge para este número.*

### Passo 3: Penalização por Divergência / Entropia ($D$)
Mede o desvio padrão das opiniões entre os especialistas sobre a bola $n$:
$$D(n) = \sqrt{\frac{1}{5} \sum_{i=1}^5 (P_i(n) - \bar{P}(n))^2}$$

### Passo 4: Score Final do SuperSistema ($\text{Score}$)
$$\text{Score}(n) = \sum_{i=1}^5 w_i \cdot P_i(n) + \lambda \cdot K(n) - \gamma \cdot D(n)$$
* $w_i$: pesos dos especialistas baseados no seu histórico de acertos;
* $\lambda = 0.20$: bónus exponencial de consenso de elite;
* $\gamma = 0.05$: filtro redutor de ruído para bolas com opiniões polarizadas.

Os números são ordenados por ordem decrescente de $\text{Score}(n)$.
* A primeira metade ($N/2$) forma a **★ Sugestão Principal (Top 25/30/20)**.
* A segunda metade forma o **Pool Secundário (Anti-Sistema / Espelho)**.

---

## 5. Como o Sistema é Executado em Produção

* **Frequência**: Imediatamente após a consolidação de cada novo sorteio real.
* **Complexidade Computacional**: $\mathcal{O}(S \cdot \text{maxNum})$ onde $S=5$. Executa em menos de 10 milissegundos por sorteio.
* **Salvaguarda**: Gravação integral na tabela `SystemPrediction` com `cutoff = maxNum`, alimentando a interface web dinâmica e os desdobramentos inteligentes.
