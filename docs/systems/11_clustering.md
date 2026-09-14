# Sistema: Agrupamento de Padrões (Clustering)

> **Identificador**: `Agrupamento de Padrões (Clustering)`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/ranked-systems.ts` (`generateClustering`)  
> **Conceito/Alma**: Análise de Densidade Espacial por Dezenas / Clusters (Últimos 50 Sorteios)  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (A Densidade Espacial por Dezenas)

O sistema **Agrupamento de Padrões (Clustering)** modela o boletim da lotaria não como dezenas soltas, mas como **bairros / blocos espaciais de 10 números**:
* **Cluster 1**: Números de 1 a 10
* **Cluster 2**: Números de 11 a 20
* **Cluster 3**: Números de 21 a 30
* **Cluster 4**: Números de 31 a 40
* **Cluster 5**: Números de 41 a 50 (ou 49 no Totoloto)
* **Cluster 6**: Números de 51 a 60 (Mega-Sena)

Em ciclos médios de sorteios, as bolas não se distribuem de forma plana: certas faixas do volante concentram **aglomerados densos de atividade (clusters quentes)**, enquanto outras faixas arrefecem temporariamente.

---

## 2. A Janela de Análise (Últimos 50 Sorteios)

* **Maturação Estável**: O sistema analisa rigorosamente os últimos **50 sorteios** anteriores ao concurso a prever ($T-1$ a $T-50$).
* Inicia a sua avaliação a partir do **sorteio 50** ($T \ge 50$).

---

## 3. O Algoritmo de Classificação Hierárquica

1. **Atividade Total do Cluster**:
   Para cada cluster $c$, soma-se o total de bolas sorteadas pertencentes a esse intervalo nos últimos 50 sorteios:
   $$\text{Atividade}(c) = \sum_{t=1}^{50} \text{Bolas}(t) \cap \text{Cluster}_c$$
   Os clusters são ordenados da **maior atividade para a menor atividade**.

2. **Ordenação Interna de Cada Cluster (Hierarquia de Importância)**:
   Os números entram no ranking agrupados pela ordem de força do seu cluster:
   - Primeiro, todos os números do **Cluster Mais Ativo**, ordenados internamente por frequência nos últimos 50 sorteios.
   - De seguida, todos os números do **Segundo Cluster Mais Ativo**, ordenados internamente.
   - E assim sucessivamente até esgotar todos os clusters e números do volante ($49, 50, 40$ ou $60$).

---

## 4. Critérios de Desempate Canónico

1. **Entre Clusters com a mesma atividade**: Menor identificador de cluster (ordem natural do volante).
2. **Entre Números dentro do mesmo Cluster com a mesma frequência de 50 sorteios**:
   - Maior frequência histórica acumulada total.
3. **Desempate Fixo Final**:
   - Opção A (Ordem numérica crescente).
4. **Guarda de Inversão Temporal Automática**:
   - Garante que a leitura dos 50 sorteios é estritamente retrospetiva a partir de $T-1$.

---

## 5. Histórico e Imutabilidade

Todas as previsões calculadas são trancadas para sempre e exportadas para o cofre consolidado em:
`data/consolidated/clustering_[jogo].json`.
