# 🌡️ Estudo e Especificação Técnica: Termómetro de Sistemas & Previsão de Jackpots (JPI)

**Documento:** `docs/10_ESTUDO_TERMOMETRO_PREVISAO_JACKPOTS.md`  
**Data:** 13 de Setembro de 2026  
**Autor:** Equipa Números Mágicos (Antigravity & Paulo Batista)  
**Objetivo:** Especificar a arquitetura matemática, metodologia de backtesting e ferramenta interativa para estimar qual o próximo sistema algorítmico mais provável de atingir Jackpot (5/5 ou 6/6).

---

## 1. O Problema Fundamental: O "Meta-Modelo"

Nos jogos de sorteio aleatório com reposição independente, prever números brutos é inerentemente estocástico. Contudo, os nossos 12 sistemas algorítmicos (Pascal, Markov, Clustering, Frequência, Matriz 3D, etc.) funcionam como **filtros determinísticos e heurísticos** sobre o espaço combinatório.

Cada sistema tem a sua própria "assinatura matemática":
* Uns filtram por geometria espacial (*Diagonais da Matriz*).
* Outros filtram por memória de curto prazo (*Transições de Markov*).
* Outros por densidade acumulada (*Frequência Histórica*).

Isto cria uma pergunta científica: **Podemos modelar o comportamento temporal dos próprios sistemas para saber quando estão mais propensos a disparar um Jackpot?**

---

## 2. O Dilema: "Mais Quentes" vs "Mais Atrasados" vs "Janela de Maturação"

### A. A Fraqueza de Apostar só nos "Mais Quentes" (Momentum)
* **A "Ressaca Estatística":** Na análise empírica de 1.900 sorteios do Euromilhões, verificou-se que após um sistema fazer 5/5 no Top 25, a probabilidade de repetir o feito no sorteio seguinte ou nos 5 sorteios subsequentes é próxima de zero.
* Sistemas que acabaram de fazer jackpot entram numa fase de arrefecimento estatístico.

### B. A Fraqueza de Apostar só nos "Mais Atrasados" (Atraso Extremo)
* **A Falácia do Jogador & Descalibração:** Quando um sistema ultrapassa largamente o dobro da sua média de ciclo (ex.: está há 80 sorteios sem acertar quando a média é 35), normalmente não significa que está "prestes a sair". Significa antes que a dinâmica dos sorteios recentes está desalinhada com a hipótese matemática daquele algoritmo.

### C. A Solução Científica: O "Sweet Spot" (Janela de Maturação de Ciclo)
Ao analisar o intervalo inter-jackpot ($\Delta t$) para cada sistema:
* **Média histórica ($\mu$):** ~35 a 40 sorteios.
* **Zona Ótima (Sweet Spot):** **$0.75\mu \le \Delta t \le 1.25\mu$** (entre 28 e 45 sorteios decorridos desde o último jackpot).
* Neste intervalo, o sistema já ultrapassou a fase fria inicial pós-jackpot e encontra-se na janela temporal de máxima probabilidade empírica.

---

## 3. Os 3 Vetores do Índice JPI (Jackpot Readiness Index)

Propõe-se a criação do índice **JPI** (de 0 a 100 pontos), composto por 3 fatores quantitativos:

```
JPI = (0.40 × S_ciclo) + (0.40 × S_convergencia) + (0.20 × S_resiliencia)
```

### 1. Score de Ciclo ($S_{ciclo}$ - Peso: 40%)
Mede a distância atual do sistema face à sua média histórica:
* Se $\Delta t < 10$: $S_{ciclo} = 15$ (Frio / Recente).
* Se $10 \le \Delta t < 25$: $S_{ciclo} = 50$ (Em aquecimento).
* Se $25 \le \Delta t \le 45$: **$S_{ciclo} = 100$ (No Sweet Spot / Ponto de Rebuçado)**.
* Se $\Delta t > 60$: $S_{ciclo} = \max(20, 100 - (\Delta t - 60) \times 2)$ (Penalização gradual por anomalia).

### 2. Gradiente de Convergência ($S_{convergencia}$ - Peso: 40%)
Avalia a "pressão à trave" nos últimos 5 sorteios:
* Fez 4/5 no último sorteio? (+40 pontos).
* Fez 4/5 duas vezes nos últimos 5 sorteios? (+30 pontos).
* Densidade média de acertos nos últimos 5 sorteios superior à média global? (+30 pontos).
* *Fundamento:* Quase todos os jackpots históricos foram antecedidos por uma subida de acertos secundários (3/5 e 4/5) nos 2 a 4 sorteios prévios.

### 3. Resiliência & Estabilidade do Sistema ($S_{resiliencia}$ - Peso: 20%)
* Mede a dispersão dos ciclos anteriores (Desvio Padrão $\sigma$).
* Sistemas com menor $\sigma$ têm ciclos mais previsíveis e recebem maior pontuação de confiança.

---

## 4. Plano de Validação: Backtesting Sem Viés (Walk-Forward Analysis)

Para garantir que não é "apenas ruído" e que existe uma vantagem estatística real (*edge*), o teste deve seguir a regra de ouro: **Strict Out-of-Sample / Walk-Forward**.

### Metodologia de Teste:
1. **Passo Histórico:** Simular concurso a concurso desde o sorteio 200 até ao sorteio atual (~1.700 iterações).
2. **Sem Fuga de Dados:** Para cada sorteio $N$, calcular o JPI de todos os sistemas usando **exclusivamente** os dados até ao sorteio $N-1$.
3. **Medição de Eficácia:**
   * Qual foi a taxa de jackpots ocorridos em sistemas que estavam no Top 3 do JPI vs sistemas aleatórios?
   * O JPI reduz o tempo médio de espera até ao próximo jackpot?
   * Qual a taxa de acerto nas dezenas comuns (interseção) dos Top 2 sistemas do JPI?

---

## 5. Proposta de Interface: "Termómetro de Sistemas"

Criar uma nova ferramenta visual em `/tools/thermometer`:
1. **Mostrador Visual Tipo Tacómetro / Termómetro** para cada um dos 12 sistemas.
   * Azul: *Frio (Acabou de sair)*
   * Amarelo: *Em Aquecimento*
   * Verde / Vermelho Fogo: *No Sweet Spot (Pronto a Disparar)*
2. **Tabela de Classificação do Próximo Jackpot:**
   * Sistema, Dias/Sorteios sem Jackpot, Média Histórica, Batimentos Recentes à Trave (4/5), Score JPI.
3. **Aposta Recomendada por Interseção:**
   * Geração automática de chaves combinando as dezenas em comum dos sistemas no topo do termómetro.

---

## 6. Estado Atual & Próximos Passos
* [x] Formulada a base matemática do índice JPI.
* [x] Validação preliminar dos ciclos médios no Euromilhões (~35-38 sorteios).
* [ ] Desenvolver script de backtesting walk-forward para comparar JPI vs Aleatório.
* [ ] Implementar página e componente de UI "Termómetro de Sistemas".
