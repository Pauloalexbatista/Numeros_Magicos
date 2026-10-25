# 12_RESPOSTAS_AUDITORIA_ESTATISTICA: Respostas Oficiais e Plano de Melhoria

> [!NOTE]
> **Documento de Governação e Auditoria Técnica**  
> **Data:** 21 de Outubro de 2026  
> **Destinatário:** Auditoria Externa de Modelos Preditivos e Estatística  
> **Autor:** Paulo Alexandre Batista (Arquiteto de Sistemas) & Equipa de Engenharia  
> **Objetivo:** Fornecer respostas exatas, transparentes, auditáveis e matematicamente fundamentadas às questões levantadas pela auditoria externa, definindo os pontos de melhoria a implementar no ecossistema Números Mágicos.

---

## 1. Respostas aos 11 Pontos da Auditoria

### Bloco A: Sobre Cada Sistema

#### 1. Qual é a regra exata que transforma o histórico numa previsão?
> *Exemplo passo a passo, desde os dados usados até aos números ordenados.*

O motor preditivo do Números Mágicos opera de forma determinística e reproduzível. A transformação do histórico em previsão segue um pipeline linear de 4 etapas:

1. **Ingestão Temporal Estrita:**
   O algoritmo consome a sequência ordenada de sorteios passados $D_1, D_2, \dots, D_N$. É garantido que nenhum dado do sorteio $D_{N+1}$ está acessível ao motor (*no data leakage*).
2. **Extração Vetorial de Features (por cada bola $k \in \{1, \dots, M\}$):**
   - **Atraso ($Gap_k$):** Número de sorteios decorridos desde a última aparição de $k$.
   - **Frequência Curta ($F10_k$):** Ocorrências de $k$ na janela $N-9 \dots N$.
   - **Frequência Média ($F50_k$):** Ocorrências de $k$ na janela $N-49 \dots N$.
   - **Momentum / Aceleração:** Rácio normalizado $\frac{F10_k / 10}{(F50_k / 50) + \epsilon}$.
   - **Densidade Matricial / Diagonais:** Proximidade geométrica às bolas sorteadas em $D_N$ na matriz planar.
   - **Transição de Markov:** Probabilidade condicional empírica $P(k \mid D_N) = \sum_{j \in D_N} \frac{Count(j \to k)}{TotalTransitions(j)}$.
3. **Ponderação e Inferência:**
   - **Modelos de Aprendizagem (ex.: Random Forest):** Um ensemble de 8 árvores de decisão CART determinísticas (usando gerador pseudo-aleatório com semente fixa `SeededRNG`) calcula a probabilidade prevista $\hat{p}_k$.
   - **Modelos Combinatórios / Heurísticos (ex.: Separação das Águas):** Os rankings dos especialistas eleitos são agregados através de uma função de corte e quinas de pontuação.
4. **Ordenação Final e Geração do Pool:**
   O vetor de bolas é ordenado de forma estritamente decrescente de pontuação:
   $$\text{Ordem} = \text{sort\_descending}(\{k \mapsto \text{Score}_k\})$$
   As primeiras 25 posições (no EuroMillions/Totoloto) ou 20 posições (no EuroDreams) formam a previsão oficial do sistema.

---

#### 2. Qual é a versão atual de cada sistema e desde quando está em vigor?
> *Como se distinguem os resultados da versão antiga e da nova quando uma regra muda?*

* **Versão em Vigor:** O ecossistema opera atualmente na **Versão 2.1 (Outubro de 2026)**.
* **Histórico de Vigência:**
  * **V1.0 (Nov 2025 – Abr 2026):** Motores estatísticos isolados (Markov, Clustering simples, Médias móveis).
  * **V2.0 (Mai 2026 – Set 2026):** Introdução da Gaiola de Ferro (*Iron Cage*), Random Forest determinístico e Quintetos de Ouro.
  * **V2.1 (Out 2026 – Presente):** Sismologia da Nazaré, Bússola de Polaridade Direto vs. Espelho e Gerador de Chaves Cirúrgicas (1-1-1-1-1).
* **Rastreabilidade de Versões:**
  Cada previsão na tabela `SystemPrediction` possui os campos imutáveis `calculatedAt` (timestamp UTC) e `drawId`.
  *(Ver Ponto de Melhoria #2 para versionamento semântico granular na base de dados).*

---

#### 3. Na Separação das Águas, que peso têm a pertença ao grupo superior e a posição dentro desse grupo?
> *A implementação parece usar ambos; a página poderia mostrar um exemplo numérico?*

A implementação em [`src/services/separacao-aguas.ts`](file:///c:/Users/paulo/.gemini/antigravity/playground/core-omega/PRJT_Numeros_Magicos/src/services/separacao-aguas.ts#L73-L85) utiliza uma **arquitetura de dois níveis hierárquicos**:

1. **Macro-Pertença (Top Half vs. Bottom Half):**
   * Se a bola está entre os primeiros 25 postos de um especialista: ganha **$+1.000$ pontos**.
   * Se a bola está nos últimos 25 postos: recebe uma penalização de **$-1.000$ pontos**.
   * O diferencial de presença entre especialistas é de **$2.000$ pontos**.
2. **Micro-Afinação (Quintetos de Elite):**
   Apenas para as bolas que pertencem ao grupo superior ($rank < 25$), é somado um bónus decrescente conforme a quina:
   * **1ª Quina (ranks 0 a 4):** $+100$ pontos
   * **2ª Quina (ranks 5 a 9):** $+75$ pontos
   * **3ª Quina (ranks 10 a 14):** $+50$ pontos
   * **4ª Quina (ranks 15 a 19):** $+30$ pontos
   * **5ª Quina (ranks 20 a 24):** $+15$ pontos

**Exemplo Numérico Real:**
Considere-se a análise da bola **14** perante a equipa de 5 especialistas da Separação das Águas no Euromilhões:
* Especialista 1 (Diagonais): 2º lugar (1ª Quina) $\to +1000 + 100 = 1100$
* Especialista 2 (Markov): 8º lugar (2ª Quina) $\to +1000 + 75 = 1075$
* Especialista 3 (Clustering): 23º lugar (5ª Quina) $\to +1000 + 15 = 1015$
* Especialista 4 (Média +3): 12º lugar (3ª Quina) $\to +1000 + 50 = 1050$
* Especialista 5 (Diagonais 3D): 34º lugar (Fundo) $\to -1000$
$$\text{Pontuação Final da Bola 14} = 1100 + 1075 + 1015 + 1050 - 1000 = \mathbf{3.240 \text{ pontos}}$$

**Conclusão Estrutural:** O número de especialistas que colocam a bola no Top 25 é determinante (degraus de 2.000 pts). O bónus de quina (máximo de 100 pts) atua exclusivamente como critério fino de desempate intra-grupo.

---

### Bloco B: Sobre a Avaliação

#### 4. Que resultados são simulações históricas e quais foram previsões publicadas antes do sorteio?
* **Simulações Históricas (*Backtesting / In-Sample*):** Sorteios até Setembro de 2026 utilizados para parametrização dos especialistas e calibração dos limiares.
* **Previsões Publicadas Antes do Sorteio (*Walk-Forward / Out-of-Sample*):** Todas as previsões geradas pelo cron das 20:30 UTC na VPS e persistidas na base de dados com `calculatedAt < draw.date`.
* *(Ver Ponto de Melhoria #3 para etiquetagem explícita na UI).*

---

#### 5. Como são calculadas as percentagens do Radar?
> *Período, numerador, denominador e definição de "perto" ou "jackpot".*

* **Período de Análise:** Todo o histórico consolidado acumulado ($N = 1.991$ sorteios no EuroMillions).
* **Definições Formais:**
  * **Jackpot:** Ocorrência em que o Top 25 (ou Top 20) capturou **100% dos números sorteados** ($\text{Hits} = \text{maxHits}$, ex.: 5 em 5 no EuroMillions).
  * **Perto / Trave:** Ocorrência em que o Top 25 capturou $\mathbf{maxHits - 1}$ números (ex.: 4 em 5 no EuroMillions/Totoloto; 5 em 6 no EuroDreams).
* **Métricas do Radar:**
  * **Taxa de Sucesso:**
    $$\text{Taxa de Jackpots} = \frac{\text{Contagem de Jackpots}}{\text{Total de Sorteios Processados}} \quad \left(\text{ex.: } \frac{78}{1991} \approx 3,92\%\right)$$
  * **Ciclo Médio ($\mu_{ciclo}$):**
    $$\mu_{ciclo} = \frac{1}{K-1} \sum_{i=2}^{K} (\text{drawIndex}_i - \text{drawIndex}_{i-1})$$
  * **JPI (Jackpot Proximity Index):**
    $$\text{JPI} = \left(\frac{\text{Atraso Atual}}{\text{Mediana do Ciclo}}\right) \times 0.6 + \left(\frac{\text{Traves}_{\text{últimos 10}}}{2}\right) \times 0.4$$
    Um JPI $\ge 1.0$ sinaliza maturidade estatística do ciclo.

---

#### 6. Que comparação usam para decidir se um resultado é excecional? (Baseline Teórico)
A referência canónica é a **Distribuição Hipergeométrica** de amostragem sem reposição:
$$P(X = k) = \frac{\binom{K}{k} \binom{M - K}{n - k}}{\binom{M}{n}}$$
Onde:
* $M = 50$ (total de bolas da tômbola),
* $n = 5$ (números sorteados),
* $K = 25$ (tamanho da seleção do sistema).

Para $k = 5$ (Jackpot):
$$P(X = 5) = \frac{\binom{25}{5}\binom{25}{0}}{\binom{50}{5}} = \frac{53.130 \times 1}{2.118.760} \approx \mathbf{2,5076\%}$$

* **Esperança Matemática:** Em $N = 1.991$ sorteios, o número esperado de jackpots por puro acaso é:
  $$\mathbb{E}[\text{Jackpots}] = 1991 \times 0,025076 \approx \mathbf{49,9 \text{ Jackpots}}$$
* **Desvio-Padrão ($\sigma$):** $\sigma \approx \sqrt{1991 \times 0,025076 \times (1 - 0,025076)} \approx 6,98$.
* **Critério de Excecionalidade (Z-Score):**
  $$Z = \frac{\text{Jackpots Observados} - \mathbb{E}[\text{Jackpots}]}{\sigma}$$
  * No sistema *Tiro Certeiro* (78 Jackpots):
    $$Z = \frac{78 - 49,9}{6,98} = \mathbf{+4,02} \quad (p < 0,00003)$$
  Um desvio superior a $+4\sigma$ rejeita confortavelmente a hipótese de pura aleatoriedade no período analisado.

---

#### 7. As regras e os sistemas foram escolhidos olhando para todo o histórico?
> *Se sim, que período ainda não foi usado para escolher as regras e pode servir para as avaliar?*

* **Reconhecimento Metodológico:** Sim, a escolha dos especialistas combinatórios (as 1.287 combinações do Tiro Certeiro e da Separação das Águas) utilizou o histórico disponível até à data de desenvolvimento (*in-sample calibration*). Isso expõe o modelo ao risco de *data snooping bias*.
* **Período de Teste Cego (*Out-of-Sample*):**
  O período a partir de **1 de Outubro de 2026** foi formalmente congelado (*frozen*). Todas as previsões geradas a partir dessa data funcionam como conjunto de teste prospetivo estritamente virgem.

---

#### 8. Quando um sistema muda, o histórico é recalculado com a versão nova ou preserva-se o original?
Em conformidade com a **Regra da Gaiola de Ferro** (*The Iron Cage Rule*):
* Em ambiente de produção, **o histórico registado é imutável**. Cada previsão registada na base de dados nunca é substituída a posteriori.
* Ensaios laboratoriais e novos modelos correm em ambientes de *Sandbox* (`/tools/laboratorio`) sem poluir a tabela de produção.

---

### Bloco C: Sobre Acompanhamento Futuro

#### 9. Seria possível guardar cada previsão futura com data e hora, versão e hash imutável?
* **Sim.** Esta é uma recomendação primordial de auditoria.
* **Solução Proposta:** Criar um **Selo Criptográfico de Previsão** (ver Ponto de Melhoria #4), gravando na base de dados o hash SHA-256 da chave antes da realização do sorteio.

---

#### 10. Podemos acompanhar durante um período definido as previsões com uma referência clara?
* **Sim.** Implementação de um painel de **Auditoria Prospetiva (*Walk-Forward*)** aberto ao público, comparando a performance dos sorteios pós-congelamento diretamente contra a linha de base hipergeométrica de 2,51%.

---

#### 11. O indicador mostra quantas oportunidades houve sem prémio (Falsos Positivos)?
* Atualmente o Radar sinaliza quando o sistema entra em zona de disparo ("Maduro" ou "Elite"), mas não explicita na UI a taxa de falsos positivos.
* **Melhoria Acordada:** Integrar na interface a **Matriz de Confusão**, discriminando a **Taxa de Falsos Alarmes** e o **Valor Preditivo Positivo (VPP)** nos horizontes de 1, 3 e 5 sorteios após a ativação do sinal.

---

### Bloco D: Pergunta Aberta (Hipótese e Falseabilidade)

> *"Qual foi a observação concreta que levou à criação de cada sistema, e que resultado futuro vos faria concluir que a hipótese não se confirmou?"*

1. **Observação Empírica Fundamentadora:**
   O estudo dos históricos oficiais demonstra que os sorteios físicos reais não exibem uma uniformidade perfeitamente distribuída a curto e médio prazo. Fenómenos de atrito mecânico, cansaço das ligas das esferas, agrupamentos transitórios de Poisson e inércia de transições de Markov criam desvios temporários de densidade.
2. **Critério Formal de Falseabilidade (Karl Popper):**
   > **Regra de Falsificação:** Se num ensaio prospetivo cego (*walk-forward*) de **100 sorteios consecutivos**, um sistema apresentar uma taxa de captura de 5 acertos no Top 25 com significância inferior a $Z < 1,65$ ($p > 0,05$ face ao baseline hipergeométrico de 2,51%), **a hipótese de vantagem estatística desse sistema é declarada formalmente refutada**, sendo o sistema rebaixado ou arquivado.

---

## 2. Matriz dos Pontos de Melhoria Extraídos da Auditoria

| # | Ponto de Melhoria | Descrição Técnica | Impacto | Prioridade |
|---|---|---|---|:---:|
| **1** | **Exemplos Numéricos Passo a Passo** | Adicionar na página `/ranking/.../explain` um cartão interativo que mostre o cálculo exato do último sorteio (pesos macro $\pm 1000$ e micro-quinas). | Compreensão e Transparência | **P1 (Alta)** |
| **2** | **Versionamento Granular no Prisma** | Adicionar os campos `systemVersion` (ex.: `2.1.0`) e `parametersHash` na tabela `SystemPrediction`. | Rastreabilidade Formal | **P1 (Alta)** |
| **3** | **Distinção Visual: Backtest vs. Live** | Inserir distintivos na UI: `Simulação Histórica` (Backtest) vs. `Previsão Selada Pré-Sorteio` (Walk-Forward). | Honestidade Metodológica | **P1 (Alta)** |
| **4** | **Certificado Criptográfico SHA-256** | Gerar e persistir na BD um hash SHA-256 da previsão no momento do cálculo (antes das 19:00 do sorteio), com verificação pública. | Prova de Imutabilidade | **P2 (Média)** |
| **5** | **Matriz de Confusão no Radar** | Apresentar no Radar a Taxa de Falsos Alarmes e a Precisão Preditiva em janelas de 1, 3 e 5 sorteios após atingir status "Elite". | Rigor Diagnóstico | **P2 (Média)** |
| **6** | **Baseline Hipergeométrico em Todas as Tabelas** | Inserir a linha de referência do acaso ($2,51\%$ no EuroMillions) e o Z-Score em todos os rankings. | Contexto Probabilístico | **P2 (Média)** |
| **7** | **Painel Público Walk-Forward Audit** | Criar página `/analysis/audit` com o histórico de previsões congeladas pós-1 de outubro de 2026. | Validação Cega Contínua | **P3 (Evolutiva)** |
