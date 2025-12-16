# 🗺️ ROADMAP - Números Mágicos

**Última Atualização:** 08 Dezembro 2025  
**Versão:** 2.0

---

## 🏗️ ARQUITETURA OVERHAUL (IMEDIATO - Dezembro 2025/Janeiro 2026) ⭐ PRIORIDADE MÁXIMA

**Objetivo:** Resolver inconsistências de dados e falhas de update online movendo o processamento para Offline/Local e usando deployment atómico.

### Fase 1: Pipeline de Dados Estáticos "Offline-First"
- [ ] **Design da Estrutura de Dados:** Definir schemas JSON para `rankings.json`, `stats.json`, `predictions.json`.
- [ ] **Script Gerador (`generate-static.ts`):** Criar script que lê da BD SQLite e cospe os JSONs finais.
- [ ] **Adaptação do Frontend:** Modificar componentes críticos (Dashboard, Rankings) para lerem de JSON se disponível.
- [ ] **Script Mestre (`MASTER_UPDATE.bat`):** Automação total: Fetch -> Calc -> Generate -> Commit -> Push.

### Fase 2: Validação & Deploy
- [ ] **Verificação Local:** Garantir que `npm run dev` reflete exatamente os ficheiros estáticos.
- [ ] **Desativação de Cron Jobs Online:** Remover os scripts frágeis da Vercel.
- [ ] **Documentação de Processo:** Guia passo-a-passo para dias de sorteio (Terça/Sexta).

---

## ✅ CONCLUÍDO (Dezembro 2025)

### 🎯 Sessão 08 Dezembro 2025

#### Widgets de Performance nas Páginas de Análise (COMPLETO)
**Data:** 08 Dez 2025

### 🎯 Sessão 14 Dezembro 2025 (Parte 2)

#### UI/UX & Data Consistency (COMPLETO)
**Data:** 14 Dez 2025

**Implementado:**
- ✅ **Dashboard Restore** - Widget "Último Sorteio" restaurado na página inicial.
- ✅ **Métricas Padronizadas** - "Top Sistemas" usa Score (ex: 909) em vez de % na página Numbers.
- ✅ **Navegação Uniforme** - Renomeado "Voltar ao Dashboard" para "Voltar à Visão Geral".
- ✅ **LSTM Upgrade** - Sugestão expandida para 25 números (era 5).
- ✅ **Schema Unification** - Sincronização segura entre SQLite (Local) e Postgres (Prod).

**Arquivos:**
- `src/app/page.tsx`
- `src/app/analysis/numbers/page.tsx`
- `src/components/LSTMClient.tsx`
- `prisma/schema.prisma`
- `prisma/schema.postgresql.prisma`

#### Deployment Vercel & Domínio Oficial (COMPLETO)

#### Deployment Vercel & Domínio Oficial (COMPLETO)
**Data:** 14 Dez 2025

**Implementado:**
- ✅ **Deploy Vercel** - Aplicação Next.js 100% funcional em ambiente serverless.
- ✅ **Domínio Oficial** - `numerosmagicos.com` configurado e propagado (GoDaddy).
- ✅ **Google OAuth Prod** - Autenticação social configurada para produção (App publicada).
- ✅ **Postinstall Script** - Geração condicional do Prisma Client (SQLite vs Postgres).
- ✅ **Security Fix** - Atualização crítica do Next.js (CVE-2025-66478).
- ✅ **Optimized Build** - Exclusão de scripts pesados (`ts-node`) do build de produção.

**Arquivos:**
- `src/scripts/core/postinstall.js` (novo)
- `tsconfig.json` (modificado)
- `package.json` (modificado)

---

### 🎯 Sessão 12 Dezembro 2025

#### Admin Tools e Fix de Backfill (COMPLETO)
**Data:** 12 Dez 2025

**Implementado:**
- ✅ **Página Admin de Previsões** - Lista completa com filtros e paginação
- ✅ **Correção Crítica de Backfill** - `SystemPrediction` agora popula todo o histórico (1900+ sorteios)
- ✅ **Correção de Estatísticas** - Ajuste nas probabilidades esperadas (inclusão do 0 acertos)
- ✅ **Coerência de Dados** - Tabelas de probabilidades e análises sincronizadas
- ✅ **Comparação Sistema vs Anti-Sistema** - Visualização clara de hits inversos

**Arquivos:**
- `src/app/admin/predictions/page.tsx` (novo)
- `src/scripts/core/turbo-backfill.ts` (modificado)
- `src/components/IndividualSystemAnalysis.tsx` (modificado)
- `src/app/ranking/[systemName]/page.tsx` (modificado)
- `src/app/probabilities/page.tsx` (modificado)

#### Widgets de Performance nas Páginas de Análise (COMPLETO)
**Data:** 08 Dez 2025

**Implementado:**
- ✅ **Widgets na Página Stars** - TopStarSystemsWidget + LastDrawStarSystems lado a lado no topo
- ✅ **Widgets na Página Numbers** - RankingSummaryWidget + LastDrawNumberSystems lado a lado no topo
- ✅ **Melhor Visibilidade** - Performance dos sistemas destacada no início de cada página
- ✅ **Layout Limpo** - Removidas secções duplicadas

**Arquivos:**
- `src/app/analysis/stars/page.tsx` (modificado)
- `src/app/analysis/numbers/page.tsx` (modificado)

#### Deployment & Dockerization (COMPLETO)
**Data:** 12 Dez 2025

**Implementado:**
- ✅ **Docker Support** - `Dockerfile` multi-stage e `docker-compose.yml`
- ✅ **Fix de Build** - Correção de rotas API (`force-dynamic`) e configurações de DB
- ✅ **Startup Script** - `DOCKER_START.bat` para fácil execução
- ✅ **Segurança** - Remoção de hardcoded keys e port conflict resolution
- ✅ **Ambiente Isolado** - Base de dados SQLite persistente em volume

**Arquivos:**
- `Dockerfile` (novo)
- `docker-compose.yml` (novo)
- `DOCKER_START.bat` (novo)
- `.dockerignore` (novo)
- `next.config.ts` (modificado)

#### Documentação Completa do Projeto (COMPLETO)
**Data:** 08 Dez 2025

**Implementado:**
- ✅ **ROADMAP Atualizado** - Sincronizado com trabalho de Dezembro 2025
- ✅ **Documentação Técnica** - 27 páginas, 43 sistemas, arquitetura completa
- ✅ **Relatório de Auditoria** - Build verification, code quality (9.2/10)
- ✅ **Guia de Melhorias** - Testes, Logger, Monitorização com exemplos práticos

**Arquivos:**
- `ROADMAP.md` (atualizado)
- `project_documentation.md` (novo)
- `audit_report.md` (novo)
- `improvement_guide.md` (novo)

#### Análise de Tendências (COMPLETO)
**Data:** 08 Dez 2025

**Implementado:**
- ✅ **Service Backend** - Cálculos matemáticos (regressão linear, desvio padrão, compensação)
- ✅ **Componente Frontend** - Gráficos interativos com Recharts
- ✅ **Página de Números** - `/analysis/number-trends`
- ✅ **Página de Estrelas** - `/analysis/star-trends`
- ✅ **Navegação** - Cards com badge "NOVO" adicionados
- ✅ **UX Otimizada** - Contagem real em vez de percentagens, labels temporais

**Funcionalidades:**
- Identificação de tendências (↗️ Subida, ↘️ Descida, ➡️ Estável)
- Análise de volatilidade (🟢 Estável, 🟡 Moderado, 🔴 Errático)
- Cálculo de compensação estatística ("dívida")
- Gráficos de evolução temporal
- Filtros por tipo de tendência
- Probabilidades de compensação (10, 20, 50 sorteios)

**Arquivos:**
- `src/services/trend-analysis.ts` (novo)
- `src/components/TrendAnalysisClient.tsx` (novo)
- `src/app/analysis/number-trends/page.tsx` (novo)
- `src/app/analysis/star-trends/page.tsx` (novo)
- `src/app/analysis/numbers/page.tsx` (modificado)
- `src/app/analysis/stars/page.tsx` (modificado)

**Dependências:**
- `recharts` - Biblioteca de gráficos React


### 🎯 Sessão 16 Dezembro 2025

#### Correção de Consistência de Dados & Ranking (COMPLETO)
**Data:** 16 Dez 2025

**Implementado:**
- ✅ **Unified Data Source:** `SystemPerformance` table is now the single source of truth for both Rankings and Lab.
- ✅ **Robust Static Generation:** `generate-all.ts` generates JSONs used by the frontend for max performance.
- ✅ **Zero-Touch DB Sync:** GitHub Actions (`sync-db.yml`) automatically hydrates the Online DB whenever new static data is pushed.
- ✅ **Cálculo de Score Validado** - Fórmula `(3hits*1) + (4hits*10) + (5hits*100)` consistente em toda a app.
- ✅ **Refatorização do Laboratório** - Removido modo "Simulação Estática" (redundante). Foco total em "Histórico Real".
- ✅ **Automação Robusta** - Integrado `generate-all.ts` no `MASTER_UPDATE.bat` para regeneração perpétua garantida.
- ✅ **Histórico Expandido** - Gerador estático aumentado para 500 sorteios (era 50) para maior profundidade de análise.
- ✅ **Correção de Discrepância (59 vs 73 Jackpots)** - Script `sync-draws-to-db.ts` criado para preencher lacunas de sorteios na BD de produção.

**Arquivos:**
- `src/scripts/static-generator/generate-all.ts` (modificado)
- `src/components/IndividualSystemAnalysis.tsx` (modificado)
- `src/app/analysis/actions.ts` (modificado)
- `MASTER_UPDATE.bat` (verificado)
- `SYNC_PROD.bat` (novo)
- `src/scripts/admin/sync-draws-to-db.ts` (novo)

---


### 🎯 Sessão 06 Dezembro 2025

#### Sistema de Comparação Detalhada (COMPLETO)
**Data:** 06 Dez 2025

**Implementado:**
- ✅ **Página de Comparação** - `/analysis/compare` para comparar 2 sistemas lado-a-lado
- ✅ **Tabelas de Prémios** - Jackpots, 4 acertos, 3 acertos com diferenças
- ✅ **Análise Anual** - Performance por ano em paralelo
- ✅ **Correlação Inversa** - Análise de comportamento oposto
- ✅ **Botão de Navegação** - Nas páginas de detalhes de sistemas
- ✅ **Detecção Automática** - Identifica anti-sistemas
- ✅ **Next.js 15+ Compatible** - Fix para `await searchParams`

**Arquivos:**
- `src/app/analysis/compare/page.tsx` (401 linhas)
- `src/app/ranking/[systemName]/page.tsx` (modificado)

---

#### Sistema de 6 Estrelas (COMPLETO)
**Data:** 06 Dez 2025

**Implementado:**
- ✅ **Aumento de 4 para 6 Estrelas** - 50% de proporção igual aos números
- ✅ **Regeneração de Cache** - Todos os sistemas de estrelas atualizados
- ✅ **Melhorias de Precisão** - Ajustes nos algoritmos
- ✅ **Atualização de Textos** - Todas as referências atualizadas

**Arquivos:**
- `src/services/star-systems.ts`
- `src/scripts/cache/regenerate-star-cache.ts`
- Múltiplos componentes de UI

---

#### Reorganização da Página Stars (COMPLETO)
**Data:** 06 Dez 2025

**Implementado:**
- ✅ **Layout Otimizado** - Melhor uso do espaço
- ✅ **Remoção de Tabelas** - Tabelas anuais removidas
- ✅ **CTA Card** - Card de call-to-action adicionado
- ✅ **Design Limpo** - Interface mais clara e focada

**Arquivos:**
- `src/app/analysis/stars/page.tsx`

---

#### Melhorias de UI/UX (COMPLETO)
**Data:** 06 Dez 2025

**Implementado:**
- ✅ **Explanation Cards** - Cards explicativos melhorados
- ✅ **Tamanho Uniforme** - Todos os cards com tamanho consistente
- ✅ **Tooltips** - Informação contextual
- ✅ **Responsividade** - Design responsivo completo

**Arquivos:**
- `src/components/ExplanationCard.tsx`
- `src/components/InfoTooltip.tsx`

---

### 🎯 Sessão 05 Dezembro 2025

#### Sistema de Análise Histórica (COMPLETO)
**Data:** 05-06 Dez 2025

**Implementado:**
- ✅ **Página de Histórico** - `/analysis/history` com análise completa
- ✅ **Atualização Automática** - Cron job para novos sorteios
- ✅ **Performance Tracking** - Histórico de todos os sistemas
- ✅ **Visualizações** - Gráficos e tabelas de evolução

**Arquivos:**
- `src/app/analysis/history/page.tsx`
- `src/services/euroMillionsService.ts`

---

#### Sistema LSTM de Exclusão (COMPLETO)
**Data:** 05 Dez 2025

**Implementado:**
- ✅ **LSTM para Números** - Rede neuronal para exclusão de números
- ✅ **LSTM para Estrelas** - Rede neuronal para exclusão de estrelas
- ✅ **Cache de Exclusões** - Sistema de cache para performance
- ✅ **Performance Tracking** - Histórico de acertos
- ✅ **Treino Offline** - Scripts batch para treino
- ✅ **Correção de Erros** - Fix de JSON errors

**Arquivos:**
- `src/services/exclusion-lstm.ts`
- `src/models/lstm-exclusion.ts`
- `src/scripts/training/train-lstm.ts`
- `ML_UPDATE.bat`

**Tabelas BD:**
- `ExclusionCache`
- `ExclusionPerformance`
- `MLModelTraining`

---

#### Reorganização em 3 Pilares (COMPLETO)
**Data:** 04-05 Dez 2025

**Implementado:**
- ✅ **Dashboard Principal** - Hub central com visão geral
- ✅ **Pilar Numbers** - `/analysis/numbers` com análises de números
- ✅ **Pilar Stars** - `/analysis/stars` com análises de estrelas
- ✅ **Migração de Cards** - Cards movidos para sub-páginas
- ✅ **Navegação Reestruturada** - Menu principal atualizado

**Arquivos:**
- `src/app/page.tsx` (Dashboard)
- `src/app/analysis/numbers/page.tsx`
- `src/app/analysis/stars/page.tsx`
- `src/components/MainNavigation.tsx`

---

### 🎯 Sessões Anteriores (Novembro-Dezembro 2025)

#### Sistema de Ranking Completo (COMPLETO)
**Data:** Novembro 2025

**Implementado:**
- ✅ **43 Sistemas Ranqueados** - Todos os sistemas com avaliação
- ✅ **Ranking Público** - Página `/ranking` com todos os sistemas
- ✅ **Detalhes por Sistema** - Página individual `/ranking/[systemName]`
- ✅ **Avaliação Automática** - Trigger após cada sorteio
- ✅ **Smart Inverse Ensemble** - Inversão inteligente de sistemas fracos
- ✅ **Sistema Platina** - Top 12 dinâmico (IA)
- ✅ **Sistema Média Camadas** - 55% de precisão 🏆

**Arquivos:**
- `src/services/ranked-systems.ts`
- `src/services/ranking-evaluator.ts`
- `src/app/ranking/page.tsx`
- `src/app/ranking/[systemName]/page.tsx`

**Tabelas BD:**
- `RankedSystem`
- `SystemPerformance`
- `SystemRanking`
- `SystemPerformanceStaging`

---

#### Sistemas Ensemble Avançados (COMPLETO)
**Data:** Novembro 2025

**Implementado:**
- ✅ **Gold System** - Ensemble de elite
- ✅ **Silver System** - Ensemble intermédio
- ✅ **Bronze System** - Ensemble base
- ✅ **Vortex Pyramid** - Sistema de pirâmide vortex
- ✅ **Análise de Coverage** - Raw vs Top 25

**Arquivos:**
- `src/components/GoldSystemClient.tsx`
- `src/components/SilverSystemClient.tsx`
- `src/components/BronzeSystemClient.tsx`
- `src/services/vortex-pyramid.ts`

---

#### Otimização de Performance (COMPLETO)
**Data:** Novembro 2025

**Implementado:**
- ✅ **Cache de Previsões** - Tabela `CachedPrediction`
- ✅ **Treino Offline de AI** - Scripts batch para modelos pesados
- ✅ **Wheeling Optimization** - Algoritmo bitmask 100x mais rápido
- ✅ **Web Workers** - Processamento em background
- ✅ **Staging System** - Backfill seguro com staging

**Arquivos:**
- `src/services/ml/turboTraining.ts`
- `src/workers/wheeling.worker.ts`
- `src/scripts/backfill/backfill-staging.ts`
- `ML_UPDATE.bat`
- `BACKFILL_STAGING.bat`

---

#### Autenticação e Acesso Tiered (COMPLETO)
**Data:** Novembro 2025

**Implementado:**
- ✅ **Login/Registo** - Sistema completo com email/password (Bcrypt)
- ✅ **Proteção de Rotas** - Middleware para `/dashboard` e `/admin`
- ✅ **Tiered Access** - FREE, PRO, ADMIN
- ✅ **Pagamento Simulado** - Fluxo de compra de cards Premium
- ✅ **UI de Bloqueio** - Overlay glassmorphism para cards PRO

**Arquivos:**
- `src/auth.ts`
- `src/middleware.ts`
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`

**Tabelas BD:**
- `User`
- `Account`
- `Session`
- `VerificationToken`

---

#### Admin Dashboard (COMPLETO)
**Data:** Novembro 2025

**Implementado:**
- ✅ **Página Admin** - `/admin` como hub central
- ✅ **Gestão de Utilizadores** - Lista e edição
- ✅ **Auditoria de Sistemas** - Diagnósticos completos
- ✅ **Atualização de AI** - Botão para treinar modelos
- ✅ **Gestão de Cards** - Ativar/desativar funcionalidades

**Arquivos:**
- `src/app/admin/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/audit/page.tsx`
- `src/components/admin/AuditResultsTable.tsx`

---

#### UI Standardization (COMPLETO)
**Data:** Novembro 2025

**Implementado:**
- ✅ **LinkCard Component** - Tamanho uniforme, novos variants
- ✅ **Tema Pro** - Dark Blue + Gold
- ✅ **Categorias** - System, Tool, Admin
- ✅ **Back Button** - Componente consistente
- ✅ **Liga dos Campeões** - Ano padrão 2025

**Arquivos:**
- `src/components/ui/LinkCard.tsx`
- `src/components/ui/BackButton.tsx`
- `src/app/card-themes.css`

---

#### Análises Estatísticas (COMPLETO)
**Data:** Novembro 2025

**Implementado:**
- ✅ **27 Páginas de Análise** - Cobertura completa
- ✅ **Índice de Ocorrência** - Real/Esperado × 100
- ✅ **Código de Cores** - 🔴 🟡 🟢 🟠
- ✅ **Responsible Gaming Footer** - Todas as páginas
- ✅ **Tooltips Informativos** - Explicações inline

**Páginas:**
- Frequência, Sequências, Propriedades, Múltiplos
- Décadas, Quadrantes, Primos, Amplitude
- Desvio Padrão, Soma Raiz, Mean Reversion
- Positional, Pattern, Matrix, Vortex
- Markov, Monte Carlo, Clustering
- Random Forest, LSTM, ML Classifier
- Gold, Silver, Bronze
- Stars (Frequência, Pares, Padrões, Propriedades, LSTM, Model Lab)

---

## 🔄 EM PROGRESSO

### Monitorização Contínua
- **Batalha de Sistemas** - Platina vs Média Camadas vs Vortex (Quem ganha 2026?)
- **Performance Tracking** - Avaliação automática após cada sorteio
- **Ajustes de Precisão** - Fine-tuning de modelos baseado em resultados

---

## 📋 BACKLOG

### Fase 1: Internacionalização (PENDENTE - Futuro)

#### 1.1 Multi-idioma (i18n) 🌍
- [ ] **Instalar next-intl** - Biblioteca otimizada para Next.js 14 (1 dia)
- [ ] **Criar estrutura de ficheiros** - messages/pt.json, en.json, fr.json, es.json (1 dia)
- [ ] **Configurar middleware** - Deteção automática de locale (1 dia)
- [ ] **Extrair strings** - Identificar ~220 strings hardcoded (3-4 horas)
- [ ] **Implementar traduções PT** - Baseline (2 horas)
- [ ] **Traduzir para EN** - Inglês (2-3 horas)
- [ ] **Traduzir para FR** - Francês (2-3 horas)
- [ ] **Traduzir para ES** - Espanhol (2-3 horas)
- [ ] **Language Switcher UI** - Componente de seleção (1-2 horas)
- [ ] **SEO Multi-idioma** - hreflang tags, sitemap (1 hora)

**Tempo Estimado:** 10-15 horas  
**Impacto Bundle:** +15KB (biblioteca) + 30-50KB por idioma (só carrega o ativo)  
**Benefício:** Alcance internacional, melhor UX para não-portugueses  
**Nota:** Usa ficheiros JSON, NÃO base de dados

---

### Fase 2: Melhorias de Qualidade (CURTO PRAZO - 4-6 semanas)

#### 2.1 Testes Automatizados ⭐ PRIORIDADE ALTA
- [ ] **Configurar Jest + Testing Library** - Setup inicial (2 dias)
- [ ] **Testes de Serviços** - 5-10 serviços críticos (1 semana)
  - `statistics.ts` - Cálculos estatísticos
  - `ranked-systems.ts` - Ranking de sistemas
  - `euroMillionsService.ts` - Fetch de sorteios
- [ ] **Testes de Componentes** - 5-10 componentes principais (1 semana)
  - `TopSystemsAnalysis` - Widget de top sistemas
  - `RankingSummaryWidget` - Resumo de ranking
- [ ] **Testes de API Routes** - Endpoints principais (3 dias)
  - `/api/ranking` - Ranking público
  - `/api/predictions/latest` - Últimas previsões
- [ ] **CI/CD** - GitHub Actions para testes automáticos (2 dias)
- [ ] **Cobertura 50%+** - Meta inicial de cobertura

**Tempo Estimado:** 2-3 semanas  
**Custo:** GRÁTIS  
**Benefício:** Confiança nas mudanças, menos bugs

#### 1.2 Logger Profissional (Winston) ⭐ PRIORIDADE MÉDIA
- [ ] **Instalar Winston** - Setup e configuração (1 dia)
- [ ] **Criar Logger Base** - Níveis, formatos, transports (1 dia)
- [ ] **Substituir console.logs** - Services e API routes (2-3 dias)
  - 30 ocorrências identificadas
  - Adicionar contexto (userId, requestId)
- [ ] **Rotação de Logs** - Configurar max size e retention (1 dia)
- [ ] **Testar em Produção** - Verificar funcionamento (1 dia)

**Tempo Estimado:** 1 semana  
**Custo:** GRÁTIS  
**Benefício:** Debugging mais fácil, logs estruturados

#### 1.3 Monitorização (Sentry) ⭐ PRIORIDADE MÉDIA
- [ ] **Criar Conta Sentry** - Setup inicial (1 hora)
- [ ] **Instalar SDK** - @sentry/nextjs (1 hora)
- [ ] **Configurar Client/Server** - Ambos os ambientes (2 horas)
- [ ] **Adicionar Contexto** - User info, breadcrumbs (1 dia)
- [ ] **Configurar Alertas** - Email/Slack notifications (2 horas)
- [ ] **Performance Monitoring** - Transactions e spans (1 dia)
- [ ] **Session Replay** - Gravação de sessões (1 dia)

**Tempo Estimado:** 1 semana  
**Custo:** GRÁTIS (plano inicial 10k eventos/mês)  
**Benefício:** Error tracking automático, debugging visual

---

### Fase 2: Melhorias de UX (MÉDIO PRAZO - 2-3 meses)

#### 2.1 Exportação de Dados
- [ ] **Exportar Rankings** - CSV/PDF
- [ ] **Exportar Comparações** - CSV/PDF
- [ ] **Exportar Análises** - CSV/PDF

#### 2.2 Gráficos Visuais
- [x] **Fase 2: Interface & Usabilidade**
  - [x] Dashboard Interativo "Top Sistemas"
  - [x] Páginas de detalhes por sistema com históricos
  - [x] Integração de gráficos de performance
  - [x] Seletor de intervalo de tempo (20, 50, 100, All stats)

- [x] **Fase 3: Laboratório Experimental (Novo)** 🧪
  - [x] Criação de App Independente (`/laboratory`) na porta 3001
  - [x] Ferramenta: Análise de Complementaridade
  - [x] Ferramenta: Laboratório de Consenso (Votação Ponderada)
  - [x] Ferramenta: Simulação de Exclusão (Cold Numbers)
  - [x] Script de Backup da BD (`dev_backup_lab_init.db`)

- [x] **Fase 4: Expansão de Modelos**
- [ ] **Gráficos de Linha** - Evolução temporal de sistemas
- [ ] **Gráficos de Barras** - Comparação de performance
- [ ] **Heatmaps** - Visualização de padrões

#### 2.3 Filtros Avançados
- [ ] **Filtrar por Período** - Análises por intervalo de datas
- [ ] **Filtrar por Precisão** - Sistemas acima de X%
- [ ] **Filtrar por Tipo** - Estatístico, ML, Ensemble

---

### Fase 2: Análise de Tendências (MÉDIO PRAZO)

#### 2.1 Gráficos de Evolução Temporal
- [ ] Mostrar evolução dos últimos N sorteios
- [ ] Linha de tendência
- [ ] Indicador de direção (↗️↘️➡️)

#### 2.2 Análise de Volatilidade
- [ ] Cálculo de desvio padrão por sistema
- [ ] Classificação (Estável/Moderado/Errático)
- [ ] Impacto na previsibilidade

#### 2.3 Previsões de Compensação
- [ ] Cálculo de "dívida estatística"
- [ ] Probabilidade de compensação
- [ ] Janelas temporais (10, 20, 50 sorteios)

---

### Fase 3: Correlações (MÉDIO PRAZO)

- [ ] Matriz de correlação entre propriedades
- [ ] Padrões de compensação
- [ ] Regras de associação
- [ ] Visualização de relações

---

### Fase 4: Estatísticas Avançadas (LONGO PRAZO)

#### 4.1 Análise Temporal Avançada
- [ ] Padrões por dia da semana
- [ ] Padrões sazonais
- [ ] Repetições do sorteio anterior

#### 4.2 Análise de Atraso
- [ ] Calcular sorteios desde última aparição
- [ ] Análise histórica completa
- [ ] Previsão de próxima aparição

---

### Fase 5: Machine Learning Avançado (LONGO PRAZO)

#### 5.1 Novos Modelos
- [ ] **Transformer Networks** - Atenção para sequências
- [ ] **GAN** - Generative Adversarial Networks
- [ ] **Reinforcement Learning** - Aprendizagem por reforço

#### 5.2 AutoML
- [ ] Otimização automática de hiperparâmetros
- [ ] Seleção automática de features
- [ ] Ensemble automático

---

---

## 🧪 LABORATÓRIO EXPERIMENTAL (INDEPENDENTE)

**Status:** Setup Inicial Concluído  
**Localização:** `/laboratory` (App independente Next.js)  
**Porta:** 3001 (Tipicamente)  
**Repositório:** *Git Ignored* (Sandbox local)

O Laboratório é uma aplicação isolada desenhada para correr simulações pesadas e testes avançados sem impactar a performance ou integridade da aplicação principal (`numerosmagicos.com`). Funciona como um "banco de ensaio" para novos algoritmos.

### 🛠️ Estrutura Atual
- **Core:** Next.js 15, TailwindCSS, Prisma (SQLite separado ou partilhado de leitura).
- **Módulos Criados:**
  - `app/complementarity` - Estrutura para análise de pares.
  - `app/consensus` - Estrutura para votação ponderada.
  - `app/exclusion` - Estrutura para testes de cold numbers.

### 🚀 Plano de Desenvolvimento
1.  **Análise de Complementaridade (IMEDIATO)**
    *   **Objetivo:** Identificar sistemas que se cobrem mutuamente.
    *   **Ferramenta:** "Matrix View" linha-a-linha de sorteios.
    *   **KPI:** Se A+B+C jogassem juntos, quantos Jackpots teriam ganho?

2.  **Laboratório de Consenso**
    *   **Objetivo:** Precisão máxima através da concordância.
    *   **Lógica:** Se 3 sistemas diferentes sugerem o nº 7, a probabilidade aumenta.
    *   **Output:** Lista de "Super Números" baseada em votação ponderada.

3.  **Simulação de Exclusão**
    *   **Objetivo:** Testar estratégias de remoção de números (Cold Numbers).
    *   **Teste:** "E se nunca jogássemos nos 10 números mais frios?"
    *   **Backtest:** Simulação rápida em 20 anos de histórico.

---


### 1. Exportação de Dados (ESTA SEMANA)
- Implementar exportação CSV/PDF
- Adicionar botões de exportação
- Testar com diferentes browsers

### 2. Gráficos Visuais (PRÓXIMA SEMANA)
- Adicionar gráficos de linha
- Adicionar gráficos de barras
- Testar responsividade

### 3. Filtros Avançados (PRÓXIMAS 2 SEMANAS)
- Implementar filtros por período
- Implementar filtros por precisão
- Implementar filtros por tipo

---

## 📊 ESTATÍSTICAS DO PROJETO

### Análises Implementadas: 27
- **Números:** 20
- **Estrelas:** 6
- **Comparação:** 1

### Sistemas Preditivos: 43
- **Estatísticos:** 12
- **Probabilísticos:** 8
- **Machine Learning:** 6
- **Ensemble:** 10
- **Geométricos:** 5
- **Exclusão:** 2

### Componentes Criados: 97
- **Dashboard:** 13
- **Analysis:** 55
- **Admin:** 10
- **UI:** 11
- **Shop:** 2
- **Ads:** 1
- **Outros:** 5

### Páginas de Análise: 27
- Todas com footer ✅
- Todas com tooltips ✅
- Todas com dark mode ✅

---

## 🔮 VISÃO FUTURA

### Machine Learning Avançado
- Combinação de múltiplos modelos
- Otimização automática de parâmetros
- Aprendizagem contínua com novos dados

### Apostas Inteligentes
- Sugestões baseadas em ranking
- Combinação de sistemas top
- Gestão de risco
- Simulador de investimento

### Comunidade
- Partilha de estratégias
- Ranking de utilizadores
- Competições mensais
- Fórum de discussão

### API Pública
- Endpoints para desenvolvedores
- Webhooks para novos sorteios
- Rate limiting
- Documentação completa

---

## 📝 NOTAS TÉCNICAS

### Performance
- Estatísticas históricas pré-calculadas ✅
- Cache de rankings atualizado automaticamente ✅
- Trigger eficiente para novos sorteios ✅
- Web Workers para tarefas pesadas ✅

### UI/UX
- Linguagem simples e clara ✅
- Avisos de jogo responsável sempre visíveis ✅
- Tooltips para explicações inline ✅
- Dark mode em tudo ✅
- Design responsivo ✅

### Dados
- Backup regular da BD (recomendado)
- Histórico completo de previsões ✅
- Auditoria de sistemas ✅
- Staging system para segurança ✅

### Segurança
- Passwords hashed (Bcrypt) ✅
- Middleware de autenticação ✅
- Proteção de rotas admin ✅
- CRON_SECRET para endpoints sensíveis ✅

---

## 📈 MÉTRICAS DE SUCESSO

### Performance Atual
- **Sistema Líder:** Sistema Média Camadas (55% precisão)
- **Baseline:** Random Generator (20%)
- **Sistemas > 50%:** 3
- **Sistemas > 40%:** 8
- **Sistemas > 30%:** 15

### Objetivos 2026
- [ ] Atingir 60% de precisão em pelo menos 1 sistema
- [ ] Ter 5 sistemas acima de 50%
- [ ] Ter 15 sistemas acima de 40%
- [ ] Implementar 10 novos sistemas
- [ ] Atingir 1000 utilizadores registados

---

**Última Revisão:** 08 Dezembro 2025  
**Próxima Revisão:** Após implementação de Exportação de Dados  
**Versão:** 2.0
