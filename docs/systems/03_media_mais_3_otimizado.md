# Sistema: Sistema Média +3 Otimizado

> **Identificador**: `Sistema Média +3 Otimizado`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/custom/SistMedia3Otimizado.ts`  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (Tendência Central Posicional por Casas)

O **Sistema Média +3 Otimizado** baseia-se na física da gravidade estatística de cada bola sorteada. Ao contrário de modelos que misturam todos os números como uma massa homogénea, este sistema reconhece que uma chave de lotaria é composta por **Casas Posicionais independentes** (ordenadas em ordem crescente: da bola mais baixa à bola mais alta).

### A Estrutura por Jogo:
* **Totoloto**: 5 Casas (1 a 49) $\rightarrow$ 15 números centrais base
* **EuroMillions**: 5 Casas (1 a 50) $\rightarrow$ 15 números centrais base
* **EuroDreams**: 6 Casas (1 a 40) $\rightarrow$ 18 números centrais base
* **Mega-Sena**: 6 Casas (1 a 60) $\rightarrow$ 18 números centrais base

---

## 2. A Janela e a Maturação Estatística (50 Sorteios)

* O cálculo da tendência posicional avalia rigorosamente os últimos **50 sorteios** anteriores ao sorteio a prever ($T-1$ a $T-50$).
* O sistema inicia a sua atividade formal a partir do **sorteio 50** ($T \ge 50$).

---

## 3. O Algoritmo de Cálculo Posicional

Para cada Casa $C$ ($1 \le C \le \text{numCasas}$):

### 1. Cálculo da Média Decimal
Recolhem-se os números saídos estritamente na Casa $C$ nos últimos 50 sorteios:
$$\mu_C = \frac{\sum_{i=1}^{50} X_{i,C}}{50}$$

### 2. O Centro de Gravidade Inteiro
Arredonda-se a média decimal ao número inteiro mais próximo:
$$M_C = \text{round}(\mu_C)$$

### 3. Os 3 Números Candidatos por Casa (Média + 3)
Cada Casa gera o seu trio gravitacional:
* **Centro (Tier 0)**: $M_C$
* **Vizinho Inferior (Tier 1)**: $M_C - 1$
* **Vizinho Superior (Tier 1)**: $M_C + 1$

---

## 4. Ordem de Prioridade e Preenchimento das Vagas

Para compor os números recomendados (ou a ordenação completa do boletim de 1 até ao valor máximo do jogo), aplica-se a **Varredura por Tiers de Distância Concéntrica**:

1. **Tier 0 (Coração das Médias)**: As médias centrais de cada Casa em rotação:
   $$[M_1, M_2, M_3, \dots, M_{\text{casas}}]$$
2. **Tier 1 (Vizinhos Imediatos)**: Os vizinhos de distância 1 ($\pm 1$) de cada Casa:
   $$[M_1 - 1, M_1 + 1, M_2 - 1, M_2 + 1, \dots]$$
   *(Aqui completam-se os 15 ou 18 números centrais do sistema)*
3. **Tier 2, 3, 4, ... (Expansão por Proximidade)**:
   Os números a distância $\pm 2$, depois $\pm 3$, etc., de cada casa, até cobrir 100% dos números possíveis do jogo.

### Regras de Ouro:
* **Sem Duplicações**: Se um número já tiver sido selecionado por uma Casa anterior (ex: o número 14 gerado pela Casa 1 e pela Casa 2), ele entra apenas uma vez. A segunda ocorrência é ignorada e a vaga permanece livre para o próximo candidato.
* **Limites de Fronteira**: Qualquer número gerado inferior a 1 ou superior ao máximo do jogo ($49, 50, 40, 60$) é sumariamente descartado.
* **Critério de Desempate Fixo**: Ordem numérica crescente (Opção A).
* **Guarda de Inversão Temporal Automática**: Garante que os sorteios estão ordenados do mais recente ($T-1$) para o mais antigo ($T-50$).

---

## 5. Histórico e Imutabilidade

Uma vez calculada e verificada a previsão de um sorteio com o histórico anterior, esse registo é **trancado para sempre** (Imutabilidade Absoluta). Backups consolidados são preservados em `data/consolidated/media_3_otimizado_[jogo].json`.
