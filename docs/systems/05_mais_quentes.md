# Sistema: Mais Quentes

> **Identificador**: `Mais Quentes`  
> **Tipo**: Base System  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/ranked-systems.ts` (`generateHotRecentNumbers`)  
> **Conceito/Alma**: Frequência Recente com Desempate por Expansão Temporal Restrita ao Escalão  
> **Autor/Conceito**: Paulo Alexandre Batista

---

## 1. A Alma do Sistema (Momento de Forma e Energia Recente)

O sistema **Mais Quentes** baseia-se no princípio estatístico das *sequências de repetição* e no *momento de forma* (momentum) das dezenas no curto prazo.

Em qualquer jogo de lotaria, embora a probabilidade teórica pura no infinito seja uniforme, no mundo real e em janelas curtas os números não saem com distribuição plana: existem números que entram em fases de alta atividade ("chama" / quentes) e outros que arrefecem temporariamente. O sistema **Mais Quentes** captura essa energia térmica dos números.

---

## 2. A Janela Base (20 Sorteios)

* **Âncora Temporal**: O sistema analisa primordialmente os últimos **20 sorteios** anteriores ao concurso a prever ($T-1$ até $T-20$).
* **Maturação Estatística**: Inicia a sua avaliação a partir do **sorteio 20** ($T \ge 20$).
* Para cada número $k$ de 1 até ao máximo do jogo ($49, 50, 40$ ou $60$), calcula-se a sua contagem de saídas nessa janela:
  $$\text{Freq}_{20}(k) = \sum_{i=1}^{20} \mathbb{I}(k \in \text{Sorteio}_{T-i})$$

---

## 3. O Algoritmo de Ordenação e a Regra da Inviolabilidade do Escalão

Muitos sistemas cometem o erro de baralhar as contagens quando tentam desempatar. No nosso modelo canónico, a regra é estrita e inviolável:

### 🛡️ Regra da Inviolabilidade do Escalão:
> **Um número com maior frequência na janela base de 20 sorteios NUNCA pode ser ultrapassado por um número com menor frequência**, independentemente do que aconteceu nos sorteios mais antigos!
> 
> A expansão para janelas mais profundas (25, 30, 35...) é usada **EXCLUSIVAMENTE** como árbitro para desempatar números que estejam exatamente empatados no mesmo nível de frequência recente.

### Exemplo Prático:
* O Número **14** saiu **5 vezes** nos últimos 20 sorteios.
* O Número **27** e o Número **33** saíram **3 vezes** nos últimos 20 sorteios.
* O Número **08** saiu **2 vezes** nos últimos 20 sorteios.

1. O Número **14** fica **intocável no 1º lugar**, porque 5 saídas é superior a 3 e 2.
2. Entre o **27** e o **33** (ambos empatados com 3 saídas), o sistema precisa de desempatar:
   - Olha para os últimos **25 sorteios**: se o 33 tiver 4 saídas e o 27 tiver 3, o **33 ganha a prioridade** e fica à frente do 27.
   - Se continuassem empatados aos 25, olhava para os últimos **30**, **35**, **40**... até encontrar diferença histórica.
3. O Número **08** fica sempre atrás do 27 e do 33, pois 2 saídas nunca superam 3 saídas.

---

## 4. O Algoritmo Completo de Comparação entre dois números A e B:

1. **1º Critério Absoluto (Janela 20)**:
   Se $\text{Freq}_{20}(A) > \text{Freq}_{20}(B) \implies A$ precede $B$.
2. **2º Critério de Desempate (Expansão Temporal em Blocos de 5)**:
   Se $\text{Freq}_{20}(A) == \text{Freq}_{20}(B)$:
   - Compara-se a frequência na janela de 25 sorteios: $\text{Freq}_{25}(A)$ vs $\text{Freq}_{25}(B)$.
   - Se persistir o empate, compara-se nos últimos 30, 35, 40, ... até esgotar todo o histórico registado.
3. **3º Critério de Desempate Fixo Final**:
   Se após esgotar toda a história do jogo continuarem absolutamente empatados:
   - **Opção A (Ordem numérica crescente)**: o número menor precede o maior.

---

## 5. Guarda de Inversão Temporal Automática

O algoritmo inclui uma guarda programática ativa que verifica as datas dos sorteios recebidos:
* Se o histórico vier em ordem cronológica ($T_0 < T_N$), o vetor é invertido automaticamente para garantir que a posição `[0]` é rigorosamente o concurso mais recente ($T-1$).

---

## 6. Histórico e Imutabilidade

Todas as previsões históricas calculadas e auditadas são trancadas em definitivo (Imutabilidade Absoluta). Backups consolidados são guardados no cofre do repositório em:
`data/consolidated/mais_quentes_[jogo].json`.
