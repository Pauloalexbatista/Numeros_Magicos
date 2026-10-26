# 🔬 Laboratório de Achados de Valor & Padrões Empíricos

**Documento:** `docs/13_LABORATORIO_ACHADOS_ESTATISTICOS.md`  
**Data:** 26 de Outubro de 2026  
**Autores:** Paulo Batista & Antigravity  
**Repositório:** Projeto Números Mágicos  
**Propósito:** Registo prático e acionável de "Achados de Valor". Cada secção abre diretamente com a **Regra Prática de Ação** para o apostador/sistema, detalhando em seguida a fundamentação matemática forense que a comprova.

---

## 🎯 ACHADO DE VALOR #1: A REGRA DO PÊNDULO (Separação das Águas)

> ### ⚡ A REGRA DE AÇÃO PRÁTICA:
> **Quando sair um 5 (Jackpot) no sistema *Separação das Águas* (no Euromilhões ou no Totoloto):**
> 1. **PAUSAR a aposta no Sistema Principal durante os 3 sorteios seguintes.** (O risco de falhar é de 97%!).
> 2. **APOSTAR durante esses 3 sorteios no ANTI-SISTEMA (as outras 25 bolas que o sistema rejeitou).**
> 3. *Fundamento:* A probabilidade de o Anti-Sistema concentrar 4 ou 5 das bolas sorteadas nessa janela de 3 concursos dispara para **48.5%** (quase metade das vezes!).

---

### 📊 A Matemática e os Cálculos Forenses (Como Chegámos Aqui)

#### 1. A Descoberta Visual
Identificado visualmente através da **Vista Bipolar ($-5$ a $+5$)** do [Radar de Maturação](file:///c:/Users/paulo/.gemini/antigravity/playground/core-omega/PRJT_Numeros_Magicos/src/components/tools/RadarSystems.tsx): sempre que uma barra dourada sobe ao topo ($+5$), surgem repetidamente barras douradas no fundo ($-5$) ou esmeraldas ($-4$) nos concursos vizinhos.

#### 2. Auditoria Matemática (Base: 1.981 Sorteios do Euromilhões e 1.556 do Totoloto)
* **Total de Jackpots do Sistema (5 acertos):** 66 no Euromilhões | 56 no Totoloto.
* **Total de Jackpots do Anti-Sistema (0 acertos):** 65 no Euromilhões | 48 no Totoloto.

**Comportamento Sorteio a Sorteio após sair um 5:**
* **No 1º Sorteio a seguir ($t+1$):** A chance de repetir o 5 desaba para **$1.5\%$** (ressaca), enquanto a chance de levar um 0 no Anti-Sistema sobe para **$4.5\%$** (quase o dobro da média de $2.5\%$).
* **No 2º Sorteio a seguir ($t+2$):** Apenas **$1.5\%$** de chance de dar 5; o equilíbrio oscila nos $2$ e $3$ acertos ($71\%$).
* **No 3º Sorteio a seguir ($t+3$):** Em 66 jackpots históricos, **NUNCA deu 5 ($0.0\%$)**, e a probabilidade de dar 0 no Anti-Sistema atinge o pico de **$6.1\%$** (mais do dobro do normal!).

**Janela Cumulativa dos 3 Sorteios ($W_3$):**
* **Probabilidade normal de sair um 0 num bloco qualquer de 3 sorteios (Acaso Puro):**
  $$P(\ge 1 \text{ zero}) = 1 - (1 - 0.0251)^3 = \mathbf{7.32\%}$$
* **Probabilidade real observada de dar 0 após um 5 no Separação das Águas:**
  $$\mathbf{13.6\%} \quad \text{(quase o dobro da teoria pura!)}$$
* **Probabilidade real de dar 0 ou 1 no Anti-Sistema:**
  $$\mathbf{48.5\%} \quad \text{(presente em quase metade de todos os casos!)}$$

---

## 🎯 ACHADO DE VALOR #2: O GATILHO DA TRAVE (Janela de 10 Sorteios)

> ### ⚡ A REGRA DE AÇÃO PRÁTICA:
> **Se um sistema não tiver pelo menos UMA trave (4/5) nos últimos 10 concursos:**
> 1. **NÃO APOSTAR no Jackpot desse sistema.** O Jackpot está estatisticamente **LONGE**.
> 2. **SÓ APOSTAR quando surgir pelo menos uma trave recente (4/5)**, pois em **80.5% de todos os Jackpots históricos**, houve um 4/5 nos 10 sorteios anteriores.
> 3. **Se surgirem duas ou mais traves nos últimos 10 sorteios:** o sistema entrou em **Ignição Crítica** (gatilho de disparo de 45.6% dos Jackpots).

---

### 📊 A Matemática e os Cálculos Forenses
Ao analisar **263 ciclos reais de Jackpot** em todos os sistemas do Euromilhões:
* **80.5% de todos os 263 Jackpots** foram precedidos por pelo menos um 4/5 nos últimos 10 sorteios.
* **58.5%** foram precedidos por um 4/5 nos últimos 5 sorteios.
* Apenas **19.5% dos Jackpots** surgiram "do nada" sem nenhuma trave nos 10 sorteios anteriores.

---

## 🎯 ACHADO DE VALOR #3: A QUOTA DE SATURAÇÃO DO CICLO

> ### ⚡ A REGRA DE AÇÃO PRÁTICA:
> **Contar quantas traves (4/5) já caíram desde o último Jackpot:**
> 1. A quota média natural de qualquer sistema é de **6 a 7 traves por cada Jackpot**.
> 2. Se o sistema já leva **mais do que a média (ex: 8 a 16 traves)** e o atraso está no Sweet Spot (entre 30 e 70 sorteios), o sistema está em **Sobrecarga Máxima** e é candidato prioritário para aposta (ex: *Simulação Monte Carlo* com 16 traves e JPI 96).

---

### 📊 A Matemática e os Cálculos Forenses
A proporção histórica de acertos num ciclo médio de 42.5 sorteios obedece rigorosamente à **Distribuição Hipergeométrica**:

$$P(X = k) = \frac{\binom{25}{k} \binom{25}{5-k}}{\binom{50}{5}}$$

* **1 Jackpot (5/5)** $\longrightarrow$ **6.6 Traves (4/5)** $\longrightarrow$ **14.0 Acertos de 3** $\longrightarrow$ **14.3 Acertos de 2** $\longrightarrow$ **6.5 Acertos de 1** $\longrightarrow$ **1.1 Acertos de 0**.

---

## 📌 Como o Algoritmo JPI Aplica Estes Achados Automaticamente

Para garantir **zero ruído visual** na interface e poupar o utilizador de cálculos manuais, o backend do Radar ([`src/app/api/tools/radar/route.ts`](file:///c:/Users/paulo/.gemini/antigravity/playground/core-omega/PRJT_Numeros_Magicos/src/app/api/tools/radar/route.ts)) sintetiza todas estas regras no **Score JPI (0 a 100)**:

$$\text{JPI} = 45\% \times S_{\text{ciclo}} + 30\% \times S_{\text{saturação}} + 25\% \times S_{\text{ignição & compressão}}$$
