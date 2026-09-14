# Sistema: Mais Sorteadas de Sempre

> **Identificador**: `Mais Sorteadas de Sempre`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/ranked-systems.ts` (`generateHotNumbers`)  
> **Conceito/Alma**: Frequência Cumulativa Global Absoluta desde o Concurso nº 1  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (A Gravidade Histórica Acumulada)

O sistema **Mais Sorteadas de Sempre** baseia-se na lei dos grandes números e no registo documental total da história de cada jogo.

Enquanto outros sistemas privilegiam a velocidade das oscilações recentes, este sistema ancora-se na **massa crítica de longo prazo**: identifica quais as dezenas que, ao longo de décadas e milhares de concursos, demonstraram maior densidade de aparição em cada lotaria.

---

## 2. A Janela de Análise (Histórico Total desde o 1º Concurso)

* A contagem abrange rigorosamente todos os sorteios registados desde o **sorteio inaugural (Concurso nº 1)** até ao concurso imediatamente anterior ao previsto ($T-1$).
* Para cada número $k$ de 1 até ao máximo do jogo ($maxNum$), calcula-se:
  $$\text{Freq}_{\text{Total}}(k) = \sum_{t=1}^{T-1} \mathbb{I}(k \in \text{Sorteio}_t)$$

---

## 3. Critérios de Ordenação e Desempate Canónico

1. **1º Critério**: Maior frequência acumulada global $\text{Freq}_{\text{Total}}(k)$ (ordem decrescente).
2. **2º Critério de Desempate (Números com rigorosamente a mesma contagem histórica)**:
   - Maior frequência nos últimos 20 sorteios anteriores ($\text{Freq}_{20}$). Dá prioridade à dezena que, estando empatada na história geral, apresenta maior atividade recente.
3. **3º Critério Fixo Final**:
   - Opção A (Ordem numérica crescente).
4. **Guarda de Inversão Temporal Automática**:
   - Assegura que o histórico é filtrado estritamente para concursos anteriores a $T$ ($t < T$).

---

## 4. Histórico e Imutabilidade

Todas as previsões calculadas são trancadas para sempre e exportadas para o cofre consolidado em:
`data/consolidated/mais_sorteadas_sempre_[jogo].json`.
