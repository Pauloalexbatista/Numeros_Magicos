# Sistema: Pirâmide de Pascal

> **Identificador**: `Pirâmide de Pascal`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/pyramid-pascal.ts`  
> **Conceito/Alma**: Funil de Convergência Temporal e Vórtice 3-6-9 (Pascal / Tesla)  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (Funil de Convergência Geométrica)

O sistema **Pirâmide de Pascal** modela a atração gravitacional e a ressonância das dezenas no volante da lotaria como um **Funil de Convergência Temporal ($\nabla$)**.

Em vez de olhar para o sorteio como uma entidade isolada, este sistema observa a história recente como um fluxo contínuo de energia que vai afunilando e convergindo, sorteio a sorteio, diretamente para o ponto central a ser sorteado no concurso seguinte.

Inspirado na harmonia geométrica de Pascal e na teoria dos vórtices de Nikola Tesla (3, 6, 9), o funil nasce numa base larga de **9 números** há 5 sorteios e afunila progressivamente até ao **vértice único** no sorteio imediatamente anterior ($T-1$).

---

## 2. A Geometria do Funil de Pascal (Níveis 5 a 1)

Para testar a força e a probabilidade de um dado número $N$ sair no sorteio $T$:
Constrói-se uma pirâmide invertida (funil) de 5 andares sobre os sorteios anteriores:

* **Sorteio $T-5$ (Base Larga Tesla 9)**: Amplitude de 9 números centrados em $N$:
  $$[N-4, N-3, N-2, N-1, \mathbf{N}, N+1, N+2, N+3, N+4]$$
* **Sorteio $T-4$**: Amplitude de 7 números centrados em $N$:
  $$[N-3, N-2, N-1, \mathbf{N}, N+1, N+2, N+3]$$
* **Sorteio $T-3$ (Nó Tesla 6)**: Amplitude de 5 números centrados em $N$:
  $$[N-2, N-1, \mathbf{N}, N+1, N+2]$$
* **Sorteio $T-2$ (Nó Tesla 3)**: Amplitude de 3 números centrados em $N$:
  $$[N-1, \mathbf{N}, N+1]$$
* **Sorteio $T-1$ (Vértice do Funil)**: 1 número central:
  $$[\mathbf{N}]$$

```
Sorteio T-5 (Base 9):   [ -4 ][ -3 ][ -2 ][ -1 ][ N ][ +1 ][ +2 ][ +3 ][ +4 ]  (9 números)
Sorteio T-4 (Base 7):         [ -3 ][ -2 ][ -1 ][ N ][ +1 ][ +2 ][ +3 ]        (7 números)
Sorteio T-3 (Base 5):               [ -2 ][ -1 ][ N ][ +1 ][ +2 ]              (5 números)
Sorteio T-2 (Base 3):                     [ -1 ][ N ][ +1 ]                     (3 números)
Sorteio T-1 (Vértice):                          [ N ]                          (1 número)
                                                  ↓
Sorteio T (Alvo):                            [ ALVO: N ]
```

---

## 3. O Wrap-Around Cilíndrico nas Extremidades (Sem Barreiras)

O boletim não tem paredes laterais artificiais. O sistema dobra a matriz num cilindro contínuo:
$$\text{Coluna}(k) = (((k - 1) \pmod{maxNum}) + maxNum) \pmod{maxNum} + 1$$
* **Totoloto** (49): à esquerda de 1 fica 49, e à direita de 49 fica 1.
* **EuroMillions** (50): à esquerda de 1 fica 50, e à direita de 50 fica 1.
* **EuroDreams** (40): à esquerda de 1 fica 40, e à direita de 40 fica 1.
* **Mega-Sena** (60): à esquerda de 1 fica 60, e à direita de 60 fica 1.

---

## 4. O Sistema de Pontuação por Pesos Binomiais e Proximidade

Cada bola sorteada que coincida com a área do funil acumula pontos para $N$, proporcionalmente à proximidade espacial (ao eixo central $N$) e temporal (ao sorteio $T-1$):

| Degrau Temporal | Desvio Lateral $0$ (Eixo $N$) | Desvio $\pm 1$ | Desvio $\pm 2$ | Desvio $\pm 3$ | Desvio $\pm 4$ |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Sorteio $T-1$** (Vértice) | **5.0** | — | — | — | — |
| **Sorteio $T-2$** | **4.0** | 3.0 | — | — | — |
| **Sorteio $T-3$** | **3.0** | 2.0 | 1.0 | — | — |
| **Sorteio $T-4$** | **2.0** | 1.5 | 1.0 | 0.5 | — |
| **Sorteio $T-5$** (Base) | **1.0** | 0.8 | 0.6 | 0.4 | 0.2 |

---

## 5. Critérios de Ordenação e Desempate Fixo

1. **1º Critério**: Pontuação total acumulada no funil de convergência (ordem decrescente).
2. **2º Critério de Desempate**: Em caso de pontuações idênticas, prioridade para o número que teve maior peso no sorteio mais recente ($T-1$, depois $T-2$, etc.).
3. **3º Critério Fixo Final**: Opção A (Ordem numérica crescente).
4. **Guarda de Inversão Automática**: O histórico é garantido a iniciar no concurso imediatamente anterior ($T-1$) para trás.

---

## 6. Histórico e Imutabilidade

Todas as previsões calculadas são trancadas para sempre e exportadas para o cofre consolidado em:
`data/consolidated/piramide_pascal_[jogo].json`.
