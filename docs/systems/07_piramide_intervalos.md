# Sistema: Pirâmide de Intervalos

> **Identificador**: `Pirâmide de Intervalos`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/pyramid-gaps.ts`  
> **Conceito/Alma**: Pirâmide de Diferenças Absolutas e Projeção Harmónica de Saltos  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (A Tensão Harmónica dos Saltos)

O sistema **Pirâmide de Intervalos** modela a física do sorteio de lotaria não como pontos estáticos, mas como uma **corda vibrante de intervalos e tensões elásticas**.

A distância entre duas bolas consecutivas (o *Gap* ou intervalo) revela a taxa de aceleração e dispersão do sorteio anterior. Ao construir uma pirâmide de diferenças sucessivas até ao vértice, extraem-se os **intervalos primordiais** que funcionam como molas propulsoras para a projeção das dezenas no sorteio seguinte.

---

## 2. A Construção da Pirâmide de Diferenças (Sorteio $T-1$)

A partir das bolas ordenadas do último concurso ($[B_1, B_2, B_3, \dots]$):

* **Nível 1 (Base)**: Os números reais sorteados.
* **Nível 2 (Intervalos de 1ª Ordem - Gaps Diretos)**:
  Diferenças absolutas entre bolas adjacentes:
  $$G_{1, i} = B_{i+1} - B_i$$
* **Nível 3 (Intervalos de 2ª Ordem - Variação dos Gaps)**:
  Diferenças entre gaps adjacentes:
  $$G_{2, i} = |G_{1, i+1} - G_{1, i}|$$
* **Níveis Superiores até ao Vértice**:
  O processo repete-se degrau a degrau até restar um único número no topo: o **Intervalo Primordial do Vértice**.

---

## 3. A Projeção dos Próximos Números por Ressonância

Para cada bola $B$ do sorteio anterior, disparam-se projeções nos dois sentidos da matriz (salto à frente e salto atrás) para cada intervalo $g$ da pirâmide:
$$\text{Alvo}_{+} = \text{Wrap}(B + g), \quad \text{Alvo}_{-} = \text{Wrap}(B - g)$$

### Wrap-Around Cilíndrico Contínuo:
$$\text{Wrap}(k) = (((k - 1) \pmod{maxNum}) + maxNum) \pmod{maxNum} + 1$$
Não existem barreiras: as extremidades 1 e $maxNum$ tocam-se de forma contínua.

---

## 4. O Sistema de Pontuação e Hierarquia de Importância

Cada número do jogo (1 a $maxNum$) acumula pontos de atração geométrica:
* **Intervalo do Vértice (Nível Superior)**: Peso de impacto **5.0**
* **Intervalos de 3ª Ordem**: Peso de impacto **3.5**
* **Intervalos de 2ª Ordem**: Peso de impacto **2.5**
* **Intervalos de 1ª Ordem (Gaps base)**: Peso de impacto **1.5**

### Fenómeno de Convergência:
Quando um número é atingido simultaneamente por múltiplos saltos de diferentes bolas e diferentes níveis, a sua pontuação soma-se cumulativamente, disparando para o **Top de Importância**.

---

## 5. Critérios de Ordenação e Desempate Fixo

1. **1º Critério**: Maior pontuação total de ressonância por intervalos (ordem decrescente).
2. **2º Critério de Desempate (Números em empate ou com 0 pontos na cauda)**:
   - Maior frequência de saídas nos últimos 20 sorteios ($\text{Freq}_{20}$).
3. **3º Critério Fixo Final**: Opção A (Ordem numérica crescente).
4. **Guarda de Inversão Automática**: Garante que o sorteio de cálculo é rigorosamente o concurso anterior ($T-1$).

---

## 6. Histórico e Imutabilidade

Todas as previsões calculadas são trancadas para sempre e exportadas para o cofre consolidado em:
`data/consolidated/piramide_intervalos_[jogo].json`.
