# 📔 Diário de Desenvolvimento - Abril 2024

Este documento serve de registo histórico de todas as alterações significativas, erros encontrados e soluções implementadas no projeto Números Mágicos 3.0.

---

## 🗓️ 20 de Abril de 2026 - Revitalização da Pipeline Automática

**Status:** Estabilizado e Automatizado ✅

### 🎯 Objetivos da Sessão
- Reparar os scrapers de sorteios que não atualizavam desde 14/04.
- Implementar um sistema de Cron mais inteligente e robusto.
- Limpar scripts obsoletos e documentação desatualizada.

### 🛠️ Problemas e Soluções

#### 1. Falha na Captura de Dados (Scrapers)
- **Sintoma:** O EuroMilhões e Totoloto pararam de detetar a data do sorteio.
- **Causa:** O site oficial (Jogos Santa Casa) alterou os cabeçalhos para maiúsculas (`DATA DO SORTEIO`).
- **Solução:** Atualização dos regex de captura para serem insensíveis a maiúsculas/minúsculas (`/i`) nos serviços correspondentes.

#### 2. Nova Arquitetura de Agendamento (Cron Manager)
- **Sintoma:** O script shell antigo era difícil de monitorizar e consumia CPU desnecessariamente.
- **Causa:** Paradigma de loop shell simples.
- **Solução:** Implementação do `src/scripts/core/cron-manager.ts`. Este script gere a atualização exclusivamente entre as 20h e as 00h, entrando em modo stand-by fora dessa janela.

#### 3. Conectividade e Autenticação VPS
- **Sintoma:** Contentores não conseguiam ligar-se à base de dados PostgreSQL.
- **Causa:** Credenciais configuradas no `docker-compose.prod.yml` não coincidiam com as da produção (`admin_magico`).
- **Solução:** Identificação manual das variáveis de ambiente na VPS e sincronização dos ficheiros de configuração.

#### 4. Estrutura da Imagem Docker (Next.js Standalone)
- **Sintoma:** Erro `MODULE_NOT_FOUND` ao tentar correr scripts na VPS.
- **Causa:** O modo `standalone` do Next.js remove a pasta `src/` e `devDependencies` para otimização de espaço.
- **Solução:** 
    - Ajuste da `Dockerfile` para copiar explicitamente `src/`, `package.json` e `tsconfig.json` para a imagem de execução.
    - Movimentação do `tsx` e `node-fetch` para as `dependencies` de produção.

### 📂 Organização e Limpeza
- Criada a pasta `_OBSOLETE_ARCHIVE/` para isolar scripts de versões anteriores que estavam a causar confusão aos agentes.
- Atualizada a `docs/` para refletir o novo paradigma **Server-Side Engine**.

---
## 🗓️ 21 de Abril de 2026 - Estabilização de Infraestrutura e Cron

**Status:** Concluído e Validado ✅

### 🎯 Objetivos da Sessão
- Corrigir a falha de execução dos Cron Jobs na VPS.
- Unificar credenciais de base de dados entre serviços.
- Sincronizar o Timezone dos contentores Docker.

### 🛠️ Problemas e Soluções

#### 1. Inconsistência de Credenciais (Prisma/Docker)
- **Sintoma:** O Cron não conseguia autenticar-se na DB de produção.
- **Causa:** `docker-compose.prod.yml` usava credenciais `magico_user` (offline) enquanto a DB real exige `admin_magico`.
- **Solução:** Unificação de todos os serviços para as credenciais `admin_magico` / `numeros_magicos_prod` após teste de conectividade bem-sucedido.

#### 2. Desvio de Janela Horária (UTC vs Lisbon)
- **Sintoma:** O Cron ignorava a abertura da janela às 20h.
- **Causa:** Ausência de `TZ=Europe/Lisbon`, fazendo o sistema operar em UTC (1 hora de atraso).
- **Solução:** Implementação da variável `TZ` em todos os serviços no compose de produção.

#### 3. Melhoria na Monitorização
- **Solução:** O `cron-manager.ts` agora realiza um `prisma.$connect()` no arranque e loga explicitamente a hora do sistema para facilitar auditorias via logs.

### 🚀 Resultados
- Identificado e corrigido o gap do EuroDreams de 20/04 durante a simulação de conectividade.
- Sistema preparado para operação "Zero-Touch" resiliente.

### 🛠️ Integridade de Dados e IA (Sessão Extra - Noite)
- **Limpeza de Duplicados:** Removidos 130 registos de sorteios fundidos (128 no EuroDreams).
- **Proteção de Dados:** Implementada verificação por intervalo de data nos scrapers, eliminando duplicações por fuso horário/horas.
- **Sincronização IA:** Resolvido desvio de chaves LSTM no EuroMilhões, permitindo o carregamento correto dos modelos neuronais (`LSTM_EUROMILLIONS_...`).
- **Performance:** Rankings recalculados e novas previsões N+1 geradas para todos os jogos.

---
## 🗓️ 21 de Abril de 2026 - Noite: Transição para Laboratório Neuronal 2.0
 
**Status:** Concluído e Estabilizado ✅
 
### 🚀 Inovações de Engenharia
Nesta sessão extra, abandonamos o paradigma de ficheiros locais voláteis por uma arquitetura de dados persistente e resiliente.
 
#### 1. Camada de Persistência Neural (DB-Resident Weights)
- **Inovação:** Os modelos (pesos e configurações) deixam de ser guardados em ficheiros `.json` na pasta `trained_models/` e passam a residir diretamente na base de dados PostgreSQL (`AIModelStore`).
- **Impacto:** Eliminação total do risco de perda de dados de treino durante "builds", "deploys" no Coolify ou limpeza de volumes Docker.
 
#### 2. Estratégia de Memória Híbrida (Hybrid Depth Strategy)
Desenvolvemos uma separação lógica no consumo de dados baseada no tipo de algoritmo:
- **Motores Leves (RF/Classifier):** Treinam sobre o **Histórico Total (desde 2004)**. Foco em padrões estatísticos de longo prazo e anomalias "evergreen".
- **Motores Pesados (LSTM Deep):** Treinam sobre uma **Janela Móvel de 2 Anos**. Foco em tendências sequenciais recentes e na "vibe" atual das máquinas de sorteio.
 
#### 3. Unificação da API Neural (Universal Signature)
- **Otimização:** Refatoração de todos os 8 motores de IA para uma assinatura única baseada num objeto de `options`.
- **Impacto:** Permite que scripts de simulação (Titãs), backtests e APIs de produção utilizem o mesmo motor matematicamente puro, garantindo que o que é testado é exatamente o que vai para produção.
 
#### 4. Estabilização de Build e Tipagem
- **TypeScript:** Resolvidos todos os erros de tipagem e conflitos de variáveis nos serviços de IA.
- **Next.js/Turbopack:** Corrigidos erros de sintaxe JSX no dashboard que impediam a visualização do estado de saúde do sistema.
 
### 🏆 Resultados Finais
- Sistema validado com `tsc` (Exit Code 0).
- Todos os scripts de simulação (`titan-lstm`, `titan-rf`, `backfills`) operacionais com a nova infraestrutura.
- Preparado para o primeiro grande ciclo de cálculos históricos persistentes.
 
---
*Próxima Etapa: Iniciar os Titãs para preenchimento total da base de dados de performance com a nova lógica 2.0.*
