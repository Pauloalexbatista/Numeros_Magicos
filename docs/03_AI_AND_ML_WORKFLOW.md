# 03_AI_AND_ML_WORKFLOW: Fluxo de IA e Machine Learning

> [!NOTE]
> **Versão:** 3.0 (VPS Hostinger)
> Este documento detalha como a Engine de Inteligência Artificial opera no ambiente monolítico, eliminando latências e garantindo a integridade dos modelos estatísticos.

---

## 1. Visão Geral da Arquitetura Monolítica

O projeto consolidou-se numa **Arquitetura de VPS Monolítica** centralizada. O servidor Hostinger é o núcleo único de:
- **Engine de Processamento**
- **Base de Dados PostgreSQL** (IP: `172.16.16.2`)
- **Interface Next.js**

### Vantagens da Latência Zero (App <-> BD):
1. **Performance Instantânea:** Consultas diretas à tabela de previsões sem cold starts ou latência de rede externa.
2. **Sincronização Atómica:** Os resultados do pipeline de IA são persistidos e disponibilizados ao utilizador de forma imediata.
3. **Simplicidade Operacional:** O servidor é agora o núcleo único de cálculo e entrega.

---

## 2. Persistência em PostgreSQL (Autoridade Única)

Toda a persistência de dados de produção ocorre exclusivamente na base de dados PostgreSQL da VPS. O Next.js consome as previsões diretamente da tabela `CachedPrediction`.

> [!IMPORTANT]
> **A Base de Dados PostgreSQL na VPS (IP: 172.16.16.2) é a Única Fonte de Verdade.** O SQLite local (`dev.db`) destina-se exclusivamente a desenvolvimento e testes.

---

## 3. Protocolo de Execução Técnica

A operação de IA na VPS rege-se pelos seguintes pilares:

- **Monitorização de Recursos (Gaiola de Ferro):** Contentores de ML possuem limites rígidos. É proibido exceder **50% de CPU** e **50% de RAM**.
- **Contentor de Orquestração (numeros-magicos-cron):** Gere o agendamento de todas as tarefas de atualização automática no servidor.
- **Ambiente de Laboratório (Health Admin):** Testes e monitorização de novos algoritmos ocorrem via interface de admin no servidor.
- **Persistência de Dados:** Armazenamento em volumes Docker persistentes (`postgres_data`).
- **Acesso Direto:** Comunicação via IP interno para evitar falhas de DNS.

---

## 4. Pipeline de Processamento Linear de IA

O ciclo de vida de cada sorteio segue esta sequência obrigatória:

1. **Ingestão e Cura de Gaps:** Fetch de novos dados e preenchimento automático do histórico.
2. **Cálculo Estatístico Base:** Geração de métricas primárias (frequências, atrasos, padrões).
3. **Treino ML (Heavy) Incremental:**
   - **Exclusão LSTM:** Frequência semanal (ou a cada 10 novos sorteios).
   - **Modelos LSTM/Redes Neuronais:** Frequência mensal (ou a cada 50 novos sorteios).
4. **Cálculo de Anti-Sistemas:** Cálculo do inverso matemático simultâneo para otimizar recursos.
5. **Ensemble:** Fusão de resultados (ex: Quarteto Elite) para gerar o consenso final.
6. **Persistência:** Indexação final na tabela `CachedPrediction`.

---

## 5. Gestão de Recursos e "Vampire Schedule"

| Atividade | Horário Permitido | Limite de Recurso (Docker) |
| :--- | :--- | :--- |
| **Treino de Redes Neuronais (LSTM)** | 04:00 AM - 07:00 AM | 50% CPU / 4GB RAM |
| **Cálculo de Anti-Sistemas** | Simultâneo com Base | Integrado no processo base |
| **Atualização de Estatísticas (Stats)** | Pós-Sorteio | 20% CPU |
| **Backup Automático da BD** | 03:00 AM | 10% CPU (Prioritário) |

---

## 6. Configuração e Scripts de Execução

A manutenção do workflow utiliza scripts Typescript orquestrados pelo `master-update.ts`.

- **Orquestrador Mestre:** `npx tsx src/scripts/core/master-update.ts`
- **Atualização de Sorteios:** `npm run db:update`
- **Recálculo de Previsões:** `npx tsx src/scripts/core/update-system-predictions.ts`
- **Treino de Modelos Pesados:** `tools/ML_UPDATE.bat`
- **Sincronização de Sistemas:** `npx tsx src/scripts/core/sync-systems.ts`

---

## 7. Verificação de Integridade e Logs

Checklist obrigatória após cada ciclo de processamento:

- [ ] Executar `verify-update.ts` e `verify-stars.ts` para confirmar performance > 0.
- [ ] Validar se a tabela `CachedPrediction` contém dados para o sorteio N+1.
- [ ] Confirmar se os Anti-Sistemas são o inverso exato das previsões base.
- [ ] Verificar se as accuracy scores dos sistemas de estrelas somam ~100%.
- [ ] Validar nos logs do contentor cron a ausência de erros de memória (OOM).

---

## 8. Regras de Ouro para Agentes e Programadores

> [!CAUTION]
> - **NUNCA** editar código diretamente no servidor VPS via terminal (Princípio da Imutabilidade).
> - **NUNCA** treinar modelos de Redes Neuronais em tempo de execução (runtime) ou rotas de API.
> - **NUNCA** ignorar os limites da "Gaiola de Ferro"; processos excedentes serão terminados.
> - **ADMIN IS DEAD:** A interface `/admin` foi abolida. Gestão via scripts ou SSH.

> [!TIP]
> - **ATIVIDADE NO SERVIDOR:** A base de dados PostgreSQL na VPS é a única autoridade.
> - **SMART SKIP:** Ignorar o treino ML se os critérios de frequência não forem atingidos.
