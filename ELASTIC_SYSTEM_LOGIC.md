# 🧲 Sistema Elástico: Lógica de Seleção

Este documento explica visualmente como o sistema seleciona os **25 números** finais baseando-se na teoria da "Regressão à Média".

## 1. O Conceito Visual (O "Elástico")

Imagine 5 elásticos presos a uma linha central (a Média).
Quando um número sai muito longe da média, o elástico estica.
No próximo sorteio, a força do elástico tenta puxar o número de volta.

```mermaid
graph TD
    subgraph "Passo 1: Análise da Tensão"
    A[Histórico 50 Sorteios] --> B{Calcular Médias}
    B --> C[Média Casa 1: 9.0]
    B --> D[Média Casa 2: 18.0]
    
    E[Último Sorteio] --> F{Comparar}
    
    C & E --> G[Casa 1 saiu 5 (Abaixo)]
    G --> H[Tensão: FORÇA PARA SUBIR ⬆️]
    
    D & E --> I[Casa 2 saiu 29 (Acima)]
    I --> J[Tensão: FORÇA PARA DESCER ⬇️]
    end

    subgraph "Passo 2: Simulação (Monte Carlo)"
    K[Gerar 5000 Chaves Aleatórias] --> L{Testar cada Chave}
    L --> M[Chave A: 8, 15, ...] 
    M --> N{Respeita as Forças?}
    N -- Sim (Casa 1 > 5) --> O[Dá Pontos aos Números 8, 15...]
    N -- Não (Casa 1 < 5) --> P[Zero Pontos]
    end

    subgraph "Passo 3: Ranking Final"
    O --> Q[Soma Total de Pontos por Número]
    Q --> R[Top 25 Números Mais Pontuados]
    end
```

## 2. Como selecionamos os 25 números?

Não escolhemos os números "à mão". Usamos uma simulação de computador para encontrar os números que **melhor satisfazem as condições**.

### Exemplo Prático (Simplificado)

Imagine que a **Casa 1** tem de **SUBIR** (porque saiu 5 e a média é 9).
O sistema gera milhares de chaves aleatórias.

*   **Chave 1:** `2, 10, 20...` -> O 1º número é **2**.
    *   O sistema diz: "Mau! Eu queria subir (>5) e tu deste-me 2."
    *   Pontuação: **0**

*   **Chave 2:** `8, 15, 25...` -> O 1º número é **8**.
    *   O sistema diz: "Bom! 8 é maior que 5. Respeitaste a força."
    *   Pontuação: **+1 Ponto** para o número 8.

*   **Chave 3:** `12, 22, 30...` -> O 1º número é **12**.
    *   O sistema diz: "Bom! 12 é maior que 5."
    *   Pontuação: **+1 Ponto** para o número 12.

### Resultado Final

Depois de 5000 tentativas:
*   O número **1, 2, 3, 4** terão **poucos pontos** (porque raramente satisfazem a condição de "ser maior que 5" nas chaves válidas).
*   Os números **6, 7, 8, 9...** terão **muitos pontos**.

O sistema pega na lista de todos os números (1 a 50) ordenados por pontos e fica com os **Top 25**.

Assim, garantimos que o conjunto final de 25 números está **matematicamente inclinado** para respeitar as forças de correção da média.
