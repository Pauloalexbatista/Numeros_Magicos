# 06_LABORATORY_OPERATIONS: Protocolo Operacional do LAB

> [!NOTE]
> **Versão:** 3.0 (Março 2026)
> Este protocolo constitui a lei operacional das cinco funções centrais do Laboratório (LAB) do projeto Números Mágicos. Define os padrões para garantir a integridade absoluta dos dados e o controlo total sobre a infraestrutura de MLOps.

---

## 1. Introdução às Operações do LAB

O LAB é o motor soberano de processamento centralizado no servidor. Funciona como o núcleo de cálculo pesado dentro da infraestrutura da VPS, preparando o terreno para todos os algoritmos em ambiente isolado.

### Paradigma Monolítico Server-Side:
- **Motor do Servidor:** Toda a inteligência e processamento ocorrem na VPS, sem limites de tempo de execução, protegidos pela "Gaiola de Ferro".
- **Produção e Lab:** O servidor PostgreSQL é a autoridade máxima. O Laboratório é uma interface de monitorização e ensaio real alojada no servidor.

---

## 2. Função 1: Análise de Falhas e Validação da BD

O LAB aplica o paradigma de **"Cura de Gaps"**, obrigando ao preenchimento sequencial de sorteios em falta.

### Ordem Obrigatória do Pipeline (Linear):
1. **Ingestão:** Fetch de dados brutos.
2. **Cura de Gaps:** Identificação e preenchimento de hiatos históricos.
3. **Cálculo Base:** Estatísticas simples e padrões iniciais.
4. **Treino ML:** Atualização incremental de modelos de IA.
5. **Ensemble:** Combinação de resultados e geração de rankings.
6. **Sincronização:** Deploy atómico para a produção.

### Checklist de Validação Técnica (No Servidor):
- [ ] **Sorteios:** Executar `npm run db:update`. Validar "New draw added" no log.
- [ ] **Números:** Executar `src/scripts/core/verify-all.ts`. Confirmar records > 0.
- [ ] **Rankings:** Executar `npm run force-ranking`.
- [ ] **URL de Saúde:** Monitorizar `https://www.numerosmagicos.com/admin/health`.

> [!IMPORTANT]
> **Verificação Visual Final:** Monitorizar o dashboard de administração em `admin/health`. Se as métricas indicarem falhas generalizadas, o pipeline deve ser reiniciado manualmente no servidor.

---

## 3. Função 2: Exportação do Histórico para Excel

O LAB atua como o repositório central com mais de 1900 sorteios.

- **Protocolo:** A exportação para Excel/CSV só pode ser realizada após a execução do `2-MASTER_UPDATE.bat` na pasta `tools/`.
- **Finalidade:** Garantir que auditorias externas e estudos de regressão utilizem a versão mais recente e validada do arquivo histórico.

---

## 4. Função 3: Game Engine e Inventário de Sistemas

Os algoritmos adaptam-se dinamicamente à estrutura de cada jogo através de configurações injetadas em runtime.

| Jogo | Estrutura | Categoria | Exemplos de Sistemas Ativos |
| :--- | :--- | :--- | :--- |
| **EuroMilhões** | 5/50 + 2/12 | Números/Estrelas | Markov, Vortex, LSTM, Clustering |
| **Totoloto** | 5/49 + 1/13 | Números/Sorte | PyramidPascal, Recent Numbers |
| **EuroDreams** | 6/40 + 1/5 | Números/Sonho | Monte Carlo, PyramidGaps, Hot |

---

## 5. Função 4: Controlo de Sistemas (Admin is Dead)

Não existe interface visual de administração na produção.

- **Protocolo:** Ativação/Desativação via scripts em `tools/` ou endpoints protegidos.
- **Critério:** Sistemas com **Accuracy < 20%** ou que degradem a VPS devem ser desativados (`isActive = false`).
- **Blacklist de Hangs:** LSTM Neural Net, Random Forest AI, Standard Deviation e Sistema Elástico.

> [!IMPORTANT]
> **Regra 2.1: "No-Touch" Workflow:** É terminantemente proibido editar código diretamente na VPS. O fluxo é: Editar Local -> Testar -> Push GitHub -> Deploy VPS.

---

## 6. Função 5: Treino de Redes Neuronais (AI)

O treino de Deep Learning é a operação mais sensível do LAB.

> [!CAUTION]
> **NUNCA** treinar modelos em runtime ou via API pública. O sistema deve lançar um erro se o cache (`lstm_weights.json`) estiver ausente, em vez de tentar treinar no servidor.

### Frequência de Operação:
- **Modelos de Exclusão:** Treino Semanal (Trigger: 10+ novos sorteios).
- **Modelos LSTM Base:** Treino Mensal (Trigger: 50+ novos sorteios).

---

## 7. Registo de Recuperação de IA (Importante para Amanhã)

> [!IMPORTANT]
> **Estado em 20 de Abril de 2026:**
> Foi confirmado que o treino efetuado na última semana (13-17 de Abril) **está salvo** na base de dados PostgreSQL de produção.
> - **Localização:** Tabela `MLModelTraining`.
> - **Volume:** 20 registos (modelos) identificados.
> - **Último Registo:** `CLASSIFIER_TOTOLOTO_STARS` (17/04/2026, 18:39).
>
> **Próximo Passo:** Não re-treinar a IA. É necessário apenas executar o script de geração de previsões na VPS para popular as tabelas `SystemPrediction` e `ExclusionCache` a partir destes pesos existentes.

**O servidor de produção é o centro de tudo:** Toda a inteligência reside na VPS. O ambiente local serve exclusivamente para desenvolvimento de código e interface.
