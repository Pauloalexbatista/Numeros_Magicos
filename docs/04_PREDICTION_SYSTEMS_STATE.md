# 04_PREDICTION_SYSTEMS_STATE: A Bíblia dos Sistemas

> [!NOTE]
> **Estado Atual do Sistema (Março 2026)**
> - **Total de Sistemas Ativos:** 75
> - **Arquitetura:** Motor Monolítico Server-Side.
> - **Filosofia:** "Análise, Não Magia" — Estritamente baseado em Dados e Estatística.

---

## 1. Introdução e Estado do Ecossistema

Este documento constitui a **Bíblia dos Sistemas** do projeto Números Mágicos. Como Arquiteto de Sistemas, este é o registro definitivo de governação, integridade técnica e estado operacional de todos os algoritmos integrados na nossa infraestrutura.

O sistema identifica padrões e frequências estatísticas; contudo, não garante ganhos nem oferece fórmulas mágicas. A nossa missão é transformar o caos da aleatoriedade em dados organizados para análise e entretenimento.

---

## 2. A Lógica em Cadeia: O Motor de Previsão

O processamento de dados segue um fluxo linear, atómico e obrigatório:

1. **Sorteio (Draw N): Ingestão e Cura**
   O ciclo inicia com a captura do dado real e a "Cura de Gaps" (correção automática de históricos em falta).
2. **Backtesting: Validação Retroativa**
   A regra matemática de cada sistema é testada contra todo o histórico disponível (+1.900 sorteios).
3. **Score (Ranking): Atribuição de Valor**
   A performance é quantificada através de um sistema de pontos ponderado (**Quality Score**):
   - **10.000 pts:** Jackpot no EuroDreams (6 acertos).
   - **1.000 pts:** Jackpot no EuroMillions/Totoloto (5 acertos).
   - **100 pts:** 4 acertos.
   - **1 pt:** 3 acertos.
4. **Previsão (Draw N+1): Geração Dinâmica**
   Com base na performance validada e no último sorteio (N), é gerada a sugestão para o concurso futuro (N+1).

> [!IMPORTANT]
> **Regra de Imutabilidade:** Uma vez definida, a regra de um sistema deve ser aplicada a todo o histórico sem "cherry-picking". A consistência é o único parâmetro de comparação justa.

---

## 3. A Lei da Atualização Incremental

> [!CAUTION]
> **THE IRON CAGE RULE (Regra da Gaiola de Ferro)**
> É estritamente proibido o recálculo do histórico inteiro em cada novo sorteio no ambiente de produção.

Para garantir a estabilidade da VPS Hostinger (2 vCPU / 8GB RAM), o sistema realiza apenas o **append** do sorteio diário. O histórico validado é imutável e persistido nas tabelas `CachedPrediction` e `SystemPerformance`.

---

## 4. Catálogo Ativo: O Arsenal de 75 Sistemas

O sistema sugere pools de números para maximizar a cobertura estatística (~50% da matriz).

### EuroMillions (5/50 + 2/12)
*Pool: 25 Números (50%) e 6 Estrelas (50%)*

| Sistema | Descrição Curta | Status |
| :--- | :--- | :--- |
| **Clustering** | Agrupamento de padrões e números relacionados. | Ativo ✅ |
| **Hot Numbers/Stars** | Frequência máxima em sorteios recentes. | Ativo ✅ |
| **Markov Chain** | Probabilidades de transição entre estados. | Ativo ✅ |
| **Vortex Pyramid** | Análise de pirâmide baseada em ressonância toroidal. | Ativo ✅ |
| **Média sem Pontas** | Média aparada eliminando extremos por posição. | Ativo ✅ |
| **Monte Carlo** | Simulações probabilísticas (1,000+ iterações). | Ativo ✅ |

### Totoloto (5/49 + 1/13)
*Pool: 25 Números (~50%) e 6 Números da Sorte (~50%)*

| Sistema | Adaptação Operacional | Status |
| :--- | :--- | :--- |
| **Arsenal Totoloto** | Transposição de Hot Numbers e Markov para matriz 5/49. | Ativo ✅ |
| **Vortex 5/49** | Ressonância toroidal aplicada à matriz do Totoloto. | Ativo ✅ |
| **Lucky Number Sync** | Sincronização de probabilidade para o Número da Sorte. | Ativo ✅ |

### EuroDreams (6/40 + 1/5)
*Pool: 20 Números (50%) e 3 Números de Sonho (60%)*

| Sistema | Adaptação Operacional | Status |
| :--- | :--- | :--- |
| **Dream Clusters** | Agrupamento de padrões para a matriz 6/40. | Ativo ✅ |
| **Markov Dreams** | Transição de probabilidades otimizada para EuroDreams. | Ativo ✅ |
| **Ressonância 6/40** | Adaptação do sistema Vortex para o pool de 20 números. | Ativo ✅ |

---

## 5. A Quarentena: Governação de Machine Learning (ML)

Os sistemas **LSTM Neural Net**, **Random Forest AI**, **Standard Deviation** e **Sistema Elástico** estão em Quarentena Operacional.

> [!WARNING]
> **A Regra de Ouro da ML:** As redes neuronais **NUNCA** treinam em runtime (API routes ou Server Actions).

**Protocolo de Saída:**
1. **Treino Offline:** Executado obrigatoriamente via scripts `.bat` locais.
2. **The Vampire Schedule:** Re-treinos pesados apenas entre as **04:00 AM e 07:00 AM**.
3. **Persistência de Cache:** O modelo salva resultados em `MLModelTraining`. Em produção, a leitura é **Read-Only**.

---

## 6. A Grande Purga: Otimização e Eficiência

Para manter a VPS Hostinger ágil:
- **Proibição de Instanciação Independente:** Os Anti-Sistemas são calculados como o inverso matemático do sistema base numa única passagem de memória.
- **Accuracy Threshold:** Sistemas que não atingem uma accuracy mínima de **25%** ou causam latência excessiva são desativados.
- **Limpeza "Marie Kondo":** Ficheiros de laboratório e pastas órfãs são proibidos na produção. O código de produção deve residir exclusivamente em `src/scripts/core/`.

---

## 7. Protocolo de Verificação e Execução no Servidor

A integridade é garantida pelo processamento centralizado na VPS:

- [ ] **master-update.ts:** Processamento no servidor de novos sorteios e cálculos.
- [ ] **Verificação de Performance:** Auditoria de logs para garantir integridade.
- [ ] **Cálculo de Previsões:** Atualização automática da tabela `CachedPrediction`.

> [!IMPORTANT]
> **Responsabilidade Técnica:** O servidor de produção é descartável (*disposable*). A autoridade reside no GitHub e na Base de Dados local validada. Em caso de falha, restaura-se via Full Sync.
