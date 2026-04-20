# 01_CORE: Manifesto e Regras de Ouro do Sistema (Versão VPS Monolítica)

> [!NOTE]
> Este documento define as **Restrições Operacionais** e os fundamentos técnicos que regem o ecossistema Números Mágicos. Como Arquiteto de Sistemas, estas diretrizes são leis imutáveis para garantir a estabilidade, segurança e integridade dos dados em ambiente de alto desempenho.

---

## 1. Manifesto do Projeto: A Alma dos Números Mágicos

### A Diretiva do Agente
A missão deste sistema é converter a aleatoriedade bruta em dados estruturados para análise estatística.
- **Papel do Agente:** Consultor técnico e arquiteto de dados.
- **Papel do Utilizador:** Autoridade final de decisão.

- **Análise, Não Magia:** O sistema é uma ferramenta de entretenimento baseada em estatística. É terminantemente proibido sugerir garantias de ganhos ou fórmulas infalíveis.
- **Transparência Estatística:** Todos os sistemas operam sobre um histórico real (mais de 1900 sorteios), sem manipulação de resultados para favorecer tendências.
- **Decisão Soberana:** A IA propõe chaves baseadas em padrões; a responsabilidade da aposta reside exclusivamente no utilizador.

### Política de "Contas Zero" e Privacidade
É mandatória a adesão à política de **Privacidade Total**. O sistema não armazena e-mails, passwords ou metadados identificáveis. O acesso é condicionado unicamente à aceitação dos termos de Jogo Responsável, renovada por sessão.

---

## 2. Arquitetura Monolítica: O Motor Central na VPS

### Definição da Infraestrutura (KVM 2)
O sistema opera numa **Arquitetura Monolítica Centralizada** alojada numa VPS Hostinger (KVM 2: 2 vCPU / 8GB RAM). A stack completa (Next.js, PostgreSQL e Motor de IA) reside no mesmo hardware para eliminar latência e garantir a "Fonte Única da Verdade".

### Limites de Recursos (A Regra de Ferro)
Para assegurar a disponibilidade crítica do frontend, os processos de backend e o motor de IA são isolados via Docker com limites estritos:

> [!IMPORTANT]
> **Regra de Ferro da VPS:** O contentor de ML/Engine está limitado a um máximo de **50% de CPU (1 vCPU)** e **50% de RAM (4GB)**. Os restantes 50% de recursos são reservados exclusivamente para o tráfego da UI, Base de Dados e estabilidade do sistema operativo.

---

## 3. Treino de IA e Manutenção: Operação Manual no Laboratório

### Fim do Agendamento Automático (No Vampire Schedule)
A função de agendamento automático noturno para treino de modelos foi oficialmente eliminada. O treino de Redes Neuronais (LSTM, Random Forest) é agora uma **OPERAÇÃO EXCLUSIVAMENTE MANUAL**, realizada via Dashboard de Controlo ou scripts dedicados.

### As Leis de Segurança da IA (The "NEVER" List)
> [!CAUTION]
> - **NUNCA** treinar modelos em API routes ou Server Actions.
> - **NUNCA** disparar treinos em resposta a ações de utilizadores comuns no site.
> - **NUNCA** realizar auto-treino em caso de falha de cache (Cache Miss); o sistema deve lançar um erro e solicitar intervenção manual.
> - **NUNCA** exceder os limites de hardware definidos na Seção 2 durante o treino.

### Protocolo de Execução Técnica (No Servidor)
O scripts de treino e atualização residem no servidor e seguem estes passos:
1. **Monitorização:** Validar que a carga de CPU atual é inferior a 10%.
2. **Execução:** Disparar o script de treino (ex: `npx tsx src/scripts/core/master-update.ts`).
3. **Persistência:** Validar a escrita física nas tabelas `ExclusionCache` ou `CachedPrediction` do PostgreSQL.
4. **Prontidão:** O frontend consome os dados atualizados instantaneamente da BD.

---

## 4. Mecânicas de Jogo e Estratégia "Game Agnostic"

O motor de previsão é agnóstico ao jogo, injetando parâmetros como `maxNumber` e `drawSize` em tempo de execução.

| Jogo | Estrutura (Bolas + Especial) | Max Number | Pool de Previsão (50/50) |
| :--- | :--- | :--- | :--- |
| **EuroMilhões** | 5/50 + 2/12 | 50 | 25 Números + 6 Estrelas |
| **Totoloto** | 5/49 + 1/13 | 49 | 25 Números + 6 N. Sorte |
| **EuroDreams** | 6/40 + 1/5 | 40 | 20 Números + 3 N. Sonho |

**Lógica de Distribuição:** O sistema visa cobrir ~50% do pool total para maximizar a captura de padrões estatísticos sem diluir excessivamente a probabilidade de acerto.

---

## 5. Sistema de Ranking e Lógica "Elastic"

### Regressão à Média (Force of Correction)
O sistema utiliza a lógica **Elastic**. Quando um padrão se desvia significativamente da sua média histórica, o sistema atribui um peso de "força de correção". O ranking não avalia apenas o passado, mas a probabilidade de um sistema estar prestes a compensar uma "dívida estatística".

### Tabela de Pontuação de Qualidade (Quality Score)
O ranking é a Fonte Única de Verdade para a qualidade do sistema, substituindo qualquer simulação estática.

| Tipo de Acerto | Pontos Atribuídos |
| :--- | :--- |
| **Jackpot (6 acertos EuroDreams)** | 10.000 pts |
| **Jackpot (5 acertos EM / TL)** | 1.000 pts |
| **4 Acertos** | 100 pts |
| **3 Acertos** | 1 pt |
| **0-2 Acertos** | 0 pts |

---

## 6. Regras de Ouro Operacionais (The Immutable Laws)

### Workflow de Desenvolvimento (No-Touch Production)
É proibido editar código diretamente na VPS. O fluxo é um **Snapshot Atómico**:
1. **Local:** Edição em VS Code e teste em `1-TOOLS/1-START_APP_LOCAL.bat`.
2. **Repositório:** Push para GitHub (Versionamento).
3. **Deploy:** Pull na VPS seguido de `docker compose up -d --build`. O servidor é considerado descartável; toda a inteligência deve estar no Git e nos Backups.

### Segurança de Rede e Base de Dados
- **Endereçamento Interno:** A aplicação deve ligar-se à base de dados PostgreSQL via IP interno `172.16.16.2` para garantir estabilidade e evitar timeouts de resolução de DNS.
- **Acesso Restrito:** A porta `5432` deve estar fechada para o exterior. O acesso administrativo é feito exclusivamente via SSH Tunnel.
- **Firewall (UFW):** Apenas portas 80 (HTTP), 443 (HTTPS) e 22 (SSH) são permitidas.
- **Protocolo HTTP:** O "Internal HTTP/2" no painel de controlo da VPS deve estar desativado, pois o Next.js opera em HTTP simples (porta 3000).

---

## 7. Workflow de Atualização Automática e Manual

As atualizações ocorrem inteiramente no servidor, seguindo uma pipeline linear:
1. **Ingestão:** `src/scripts/core/db-update.ts` (Fetch de dados reais e cura automática de gaps).
2. **Cálculo:** Processamento de estatísticas e sistemas de padrões (Executado no Servidor).
3. **Persistência Atómica:** Escrita direta na base de dados PostgreSQL de produção.
4. **Disponibilidade:** Os dados ficam imediatamente disponíveis no frontend via consultas Prisma à tabela `CachedPrediction`.

---

**Versão:** 3.0 (Março 2026) - Monolithic VPS Master Manual.
**Localização de Scripts:** `tools/`, `src/scripts/core/`, `src/scripts/static-generator/`.
