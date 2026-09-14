# Sistema: Últimos a Sair

> **Identificador**: `Últimos a Sair`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/ranked-systems.ts` (`generateRecentNumbers`)  
> **Conceito/Alma**: Recência Temporal Pura / Ordem Cronológica Reversa

---

## 1. A Alma do Sistema (Recência Temporal Pura)

O sistema **Últimos a Sair** baseia-se no princípio de ordenação por recência temporal absoluta. Modela a dinâmica de rotação das dezenas no boletim, ordenando cada número do jogo pela data e sorteio da sua última aparição.

Os números que acabaram de sair no último concurso ocupam a liderança da lista; os números que não saem há mais tempo descem gradualmente para o fundo da tabela.

---

## 2. A Janela de Análise (Sem Limite Fixo)

* **Profundidade Dinâmica**: O sistema não tem um limite artificial de 20 ou 50 sorteios.
* Percorre o histórico para trás no tempo ($T-1, T-2, T-3, \dots$) **até preencher a totalidade do boletim** ($49, 50, 40$ ou $60$ números únicos).

---

## 3. O Algoritmo de Extração Cronológica Reversa

Para prever o sorteio $T$:
1. Inicia-se uma lista ordenada de números selecionados vazia e um conjunto de controlo de números já vistos (`seen = Set`).
2. Itera-se pelos sorteios históricos estritamente anteriores a $T$, por ordem decrescente de data (do mais recente para o mais antigo):
   - Sorteio $T-1$, depois $T-2$, depois $T-3$, etc.
3. Para cada sorteio analisado:
   - Extraem-se os números sorteados e ordenam-se em ordem numérica crescente (Opção A para consistência posicional).
   - Para cada número desse sorteio: se ainda não constar em `seen`, é adicionado à lista ordenada e marcado como visto.
   - Quando a lista atinge o tamanho máximo do jogo ($maxNum$), a iteração é imediatamente interrompida.
4. **Fallback Natural**: Caso algum número nunca tenha saído em todo o histórico registado, é adicionado no fim da lista por ordem numérica crescente.

---

## 4. Critério de Desempate Fixo

* Entre números que saíram no mesmo sorteio: **Ordem numérica crescente (Opção A)**.
* **Guarda de Inversão Automática**: Garante que o histórico analisado começa impreterivelmente no concurso imediatamente anterior ($T-1$) e caminha para o passado.

---

## 5. Histórico e Imutabilidade

Uma vez calculada a previsão de cada sorteio histórico, o registo fica **imutável para sempre**. Backups consolidados são preservados em `data/consolidated/ultimos_a_sair_[jogo].json`.
