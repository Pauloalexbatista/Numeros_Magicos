# 02_ARCHITECTURE_AND_VPS: Manual de Arquitetura e Infraestrutura

> [!IMPORTANT]
> **Versão:** 3.0 - Monolithic Edition
> **Responsabilidade:** Arquiteto de Sistemas Cloud / Engenheiro DevOps Sénior

---

## 1. Visão Geral da Arquitetura 3.0

O ecossistema **"Números Mágicos 3.0"** opera sob o paradigma **Server-Side Engine**, uma evolução estratégica para um modelo Monolítico de Alta Disponibilidade alojado em VPS. Esta centralização elimina latências de rede e garante que processamentos pesados de Machine Learning ocorram diretamente na infraestrutura de produção.

A arquitetura separa rigorosamente a **Engine** (Processamento) da **Web** (Interface):
- **Engine (Servidor):** Contentores isolados para ingestão de dados, treino incremental de modelos (LSTM, Random Forest) e cálculos de probabilidade executados na VPS.
- **Web (Next.js Standalone):** Instância otimizada para servir dados calculados diretamente da base de dados PostgreSQL de produção.

### Objetivos Estratégicos:
- **Centralização Total:** Toda a inteligência reside no servidor Hostinger.
- **Escalabilidade:** Estrutura "Game Agnostic" preparada para EuroMilhões, Totoloto e EuroDreams.
- **Zero Latência:** Consulta direta à base de dados PostgreSQL interna via Docker.

---

## 2. Especificações da Infraestrutura (Hostinger VPS)

A aplicação reside num servidor **Hostinger VPS KVM 2**, configurado para máxima resiliência de dados e isolamento de processos.

### Recursos de Hardware:
- **Processamento:** 2 vCPU.
- **Memória:** 8GB RAM.
- **Rede Interna:** Docker Network com IP fixo para estabilidade de serviços.

> [!CAUTION]
> **Regra de Ouro (Iron Cage):** É obrigatório o isolamento de recursos para os contentores de ML (Machine Learning). Nenhum processo de treino pode colocar em risco a disponibilidade do frontend.
>
> A configuração no `docker-compose.yml` deve limitar rigorosamente:
> - **CPU:** 50% (máximo 1.0 vCPU).
> - **RAM:** 50% (máximo 4GB).
>
> Os restantes 50% de recursos são reservados exclusivamente para a UI (Next.js) e o motor PostgreSQL.

---

## 3. Camada de Dados e Conetividade

A transição para **PostgreSQL** permite maior concorrência e integridade referencial. Para garantir estabilidade absoluta dentro do ambiente Docker, a aplicação utiliza o IP interno `172.16.16.2` no `DATABASE_URL`.

### Configuração de Produção:
- **Zero-Touch API:** O frontend consome exclusivamente a tabela `CachedPrediction`. Nenhum cálculo de sistema é efetuado em runtime.
- **Prisma Provider:** Atualizado de `sqlite` para `postgresql` para suportar o volume de dados de produção (147k+ registos).

### Comparação de Ambientes
| Componente | Ambiente Local (Dev) | Ambiente Produção (VPS) | Objetivo |
| :--- | :--- | :--- | :--- |
| **Base de Dados** | SQLite (dev.db) | PostgreSQL | Estabilidade e Concorrência |
| **Prisma Provider** | `sqlite` | `postgresql` | Compatibilidade de Schema |
| **Porta DB** | N/A | 5432 | Sincronização e Admin |
| **IP Conexão** | localhost | **172.16.16.2** | Resiliência de Rede Docker |

---

## 4. Automação e Ciclos de Vida (Cron Job)

A orquestração de tarefas é gerida pelo contentor `numeros-magicos-cron`.

- **Endpoint de Trigger:** `/api/cron/update` (protegido por `CRON_SECRET`).
- **Backup (Disposable Server Rule):** Executado diariamente às 03:00. Backups automatizados para localização externa.
- **Treino Pesado (ML):** Agendamento "Vampiro" entre as 04:00 e as 07:00 para isolar o consumo da "Iron Cage".

> [!WARNING]
> **JANELA DE SORTEIOS:** A automação de atualização de dados (Fetch/Sync) deve operar estritamente entre as **20:00 e as 23:00**. Esta janela coincide com a publicação de resultados oficiais.

---

## 5. Pipeline de Atualização Linear (Server-Side)

Para garantir 100% de consistência, o ciclo de vida ocorre integralmente no servidor:
1. **Ingestão (Fetch):** Descarregamento de dados brutos na VPS.
2. **Cura de Gaps:** Verificação automática de falhas no histórico da BD PostgreSQL.
3. **Cálculo Base e Estatísticas:** Processamento de frequências e padrões na Engine do servidor.
4. **Treino Incremental de ML:** Atualização de redes neuronais (via Iron Cage).
5. **Ensemble:** Combinação de resultados para gerar a classificação final.
6. **Persistência Atómica:** Gravação direta nas tabelas `CachedPrediction`.

---

## 6. Configuração de Rede e Segurança (Firewall UFW)

A segurança segue a "Regra da Paranoia".

- **Porta 22 (SSH):** Acesso administrativo.
  ```bash
  ufw allow 22/tcp
  ```
- **Portas 80/443 (HTTP/HTTPS):** Tráfego público Next.js.
  ```bash
  ufw allow 80/tcp
  ufw allow 443/tcp
  ```
- **Porta 5432 (PostgreSQL):** Acesso restrito.
  ```bash
  ufw allow from [ADMIN_IP] to any port 5432
  ```

---

## 7. Workflow de Deploy e Manutenção

**Princípio Fundamental:** "No-Touch" no Servidor para dados, "GitHub-First" para código.
1. **Desenvolvimento:** Edição de código no PC Local.
2. **Versionamento:** Push para GitHub (Main Branch).
3. **Deploy:** Pull na VPS + `docker compose up -d --build`.
4. **Execução:** O servidor inicia automaticamente os cálculos necessários.

---

## 8. Verificação do Sistema (Logs)

Utilize os seguintes comandos para monitorização em tempo real:

- **Monitorização Geral:**
  ```bash
  docker compose logs -f --tail 100
  ```
- **Saúde da Base de Dados:**
  ```bash
  docker exec -it postgres_container pg_isready -U admin_magico
  ```
- **Logs de Automação (Cron):**
  ```bash
  docker logs numeros-magicos-cron -f
  ```
- **Logs do Frontend:**
  ```bash
  docker logs numeros-magicos-web -f
  ```
