# 🗺️ ROADMAP - Bolas Mágicas

**Última Atualização:** 27 Novembro 2024

---

---

## ✅ CONCLUÍDO (Sessão 02 Dez 2025 - Noite)

### ⚡ Performance e Cache (COMPLETO)
**Data:** 02 Dez 2025

**Implementado:**
- ✅ **Cache de Previsões:** Implementado sistema de cache para Números e Estrelas (`CachedPrediction`).
- ✅ **Otimização de CPU:** Redução drástica de carga no servidor/PC ao evitar cálculos repetidos.
- ✅ **Flash Update:** Script `force-cache-update.ts` para preencher lacunas rapidamente.
- ✅ **Auditoria:** Verificação de integridade (Todos os 43 sistemas com 25 números).

### 🎨 Standardização de UI (COMPLETO)
**Data:** 02 Dez 2025

**Implementado:**
- ✅ **Tema Unificado:** Cartões "Rede Neuronal", "Estrelas" e "Aposta Recomendada" agora usam o tema padrão (Branco/Dark Grey).
- ✅ **Legibilidade:** Melhoria de contraste em textos e badges.
- ✅ **Estados Vazios:** Tratamento correto de "Sem previsão disponível".

---

## ✅ CONCLUÍDO (Sessão 01 Dez 2025 - Noite)

### 🔐 Autenticação e Acesso Tiered (COMPLETO)
**Data:** 01 Dez 2025

**Implementado:**
- ✅ **Login/Registo:** Sistema completo com email/password (Bcrypt).
- ✅ **Proteção de Rotas:** Middleware para proteger `/dashboard` e `/admin`.
- ✅ **Tiered Access:** Cartões "Free" vs "Pro" (Bloqueados).
- ✅ **Pagamento Simulado:** Fluxo de compra de cartões Premium (9.99€).
- ✅ **UI de Bloqueio:** Overlay transparente (Glassmorphism) para cartões Premium.

### 👮 Admin Dashboard Centralizado (COMPLETO)
**Data:** 01 Dez 2025

**Implementado:**
- ✅ **Nova Página:** `/admin` como hub central.
- ✅ **Gestão de Cartões:** Mover cartões de administração para esta área.
- ✅ **Navegação:** Link "Admin Dashboard" no menu de utilizador (apenas para Admins).
- ✅ **User Admin:** Criação de utilizador admin (`hugoandre@net.sapo.pt`).

---

## ✅ CONCLUÍDO (Sessão 01 Dez 2025 - Tarde)

### 🏆 Sistemas de Elite e Ranking (COMPLETO)
**Data:** 01 Dez 2025

**Implementado:**
- ✅ **Sistema Platina:** Ensemble dinâmico do Top 12 (IA).
- ✅ **Sistema Média Vizinhos:** Sistema fixo baseado em padrão visual (Líder em 2025).
- ✅ **Atualização Flash:** Correção e otimização do backfill (`ATUALIZACAO_FLASH.bat`).
- ✅ **Liga dos Campeões:** Tabela comparativa anual (Jackpots/Prémios) na página de Ranking.
- ✅ **Correções Técnicas:** Resolução de bugs de recursão e Foreign Key.

**Arquivos:**
- `src/services/ranked-systems.ts`
- `src/scripts/turbo-backfill.ts`
- `src/components/TopSystemsAnalysis.tsx`
- `ANALYSIS_PLATINUM_VS_FIXED.md`

---

## ✅ CONCLUÍDO (Sessão 27 Nov 2024)

### 📊 Propriedades dos Números (COMPLETO)
**Data:** 27 Nov 2024

**Implementado:**
- ✅ Página `/analysis/number-properties`
- ✅ Análise unificada: Pares, Ímpares, Primos, M3, M4, M5, M7
- ✅ Input customizável (mínimo 5 sorteios)
- ✅ **Índice de Ocorrência** (Real/Esperado × 100)
- ✅ Código de cores (🔴 <85%, 🟡 85-95%, 🟢 95-105%, 🟠 >115%)
- ✅ Status visual (📉 Abaixo, ✅ Normal, 📈 Acima)
- ✅ Cards de resumo com quantidade disponível e percentagem
- ✅ Top 10 números mais sorteados com propriedades
- ✅ Legenda de cores

**Arquivos:**
- `src/services/statistics.ts` - Função `analyzeNumberProperties()`
- `src/components/NumberPropertiesClient.tsx`
- `src/app/analysis/number-properties/page.tsx`
- `src/scripts/seed-cards.ts` - Card PRO adicionado

---

### 🎨 UX e Jogo Responsável (COMPLETO)
**Data:** 27 Nov 2024

**Implementado:**
- ✅ Componente `ResponsibleGamingFooter`
  - Avisos de jogo responsável
  - Linhas de ajuda (1414, 800 202 484)
  - Disclaimer de não afiliação
  - Dark mode completo
- ✅ Componente `InfoTooltip`
  - Tooltips informativos com ℹ️
  - 4 posições (top, bottom, left, right)
  - Hover/click para mostrar
- ✅ Adicionado footer a `NumberPropertiesClient`

**Arquivos:**
- `src/components/ResponsibleGamingFooter.tsx`
- `src/components/InfoTooltip.tsx`

**Pendente:**
- [ ] Adicionar footer às 19 páginas restantes
- [ ] Adicionar tooltips onde necessário
- [ ] Melhorar ExplanationCards com linguagem mais simples

---

## 🔄 EM PROGRESSO
   - **Monitorização:** Batalha "Platina vs Vizinhos" (Quem ganha 2026?)
   - **Novos Sistemas Fixos:** Adicionar mais padrões visuais se identificados.
   - **Integração "Stars":** Sistema de previsão de estrelas (Pendente).

2. **Avaliação Automática**
   - Trigger quando nova chave é sorteada
   - Compara Top 10 previsto vs 5 números reais
   - Calcula taxa de acerto
   - Grava histórico

3. **Ranking Público**
   - Tabela com todos os sistemas
   - Performance média (últimos 100 sorteios)
   - Comparação com escolha aleatória
   - Gráfico de evolução temporal
   - FREE: vê ranking
   - PRO: vê detalhes e previsões

4. **Gestão Admin**
   - Ativar/desativar sistemas no ranking
   - Adicionar novos sistemas
   - Configurar parâmetros

**Estrutura BD:**
```sql
-- Sistemas registados
CREATE TABLE ranked_systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de performance
CREATE TABLE system_performance (
    id SERIAL PRIMARY KEY,
    draw_id INT REFERENCES draws(id),
    system_name VARCHAR(50),
    predicted_numbers INT[],
    actual_numbers INT[],
    hits INT,
    accuracy DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cache do ranking atual
CREATE TABLE system_ranking (
    id SERIAL PRIMARY KEY,
    system_name VARCHAR(50) UNIQUE,
    avg_accuracy DECIMAL(5,2),
    total_predictions INT,
    last_updated TIMESTAMP
);
```

**Tarefas:**
- [ ] Criar estrutura de BD
- [ ] Criar interface `RankedSystem`
- [ ] Implementar geração de Top 10 em cada sistema
- [ ] Criar trigger automático
- [ ] Criar página de ranking
- [ ] Criar painel admin de gestão

---

## 📋 BACKLOG

### Fase 1: Melhorias de UX (CURTO PRAZO)

#### 1.1 Standardização de Cartões (PRIORITÁRIO)
- [ ] **Design Unificado:** Todos os cartões com o mesmo tamanho e layout.
- [ ] **Categorias Visuais:**
  - 🔮 **Sistemas:** Cor/Ícone específico.
  - 🛠️ **Ferramentas:** Cor/Ícone específico.
  - 🛡️ **Admin:** Cor/Ícone específico.
- [ ] **Badges Claros:** "Free" vs "Pro" sempre visível.
- [ ] **Regras de Ícones:** Definir padrão (1 vs 2 ícones).

#### 1.2 Footer em Todas as Páginas
- [ ] Adicionar `ResponsibleGamingFooter` a 19 páginas
- [ ] Testar responsividade
- [ ] Testar dark mode

#### 1.2 Tooltips Informativos
- [ ] Identificar gráficos/tabelas que precisam
- [ ] Adicionar tooltips com explicações breves
- [ ] Testar usabilidade

#### 1.3 Simplificar Linguagem
- [ ] Rever todos os `ExplanationCard`
- [ ] Remover jargão técnico
- [ ] Adicionar exemplos práticos

---

### Fase 2: Índice de Ocorrência (CURTO PRAZO)

**Adicionar a 6 páginas "pobres":**
- [ ] PrimeNumbersClient
- [ ] StarPatternsClient
- [ ] DecadesClient
- [ ] QuadrantsClient
- [ ] MultiplesClient
- [ ] MeanAmplitudeClient

**Para cada:**
- Cálculo (Real / Esperado) × 100
- Código de cores
- Status (📉 Abaixo, ✅ Normal, 📈 Acima)

---

### Fase 3: Análise de Tendências (MÉDIO PRAZO)

**Para todas as páginas "pobres":**

#### 3.1 Gráficos de Evolução Temporal
- [ ] Mostrar evolução dos últimos N sorteios
- [ ] Linha de tendência
- [ ] Indicador de direção (↗️↘️➡️)

#### 3.2 Análise de Volatilidade
- [ ] Cálculo de desvio padrão
- [ ] Classificação (Estável/Moderado/Errático)
- [ ] Impacto na previsibilidade

#### 3.3 Previsões de Compensação
- [ ] Cálculo de "dívida estatística"
- [ ] Probabilidade de compensação
- [ ] Janelas temporais (10, 20, 50 sorteios)

---

### Fase 4: Correlações (MÉDIO PRAZO)

- [ ] Matriz de correlação entre propriedades
- [ ] Padrões de compensação
- [ ] Regras de associação
- [ ] Visualização de relações

---

### Fase 5: Estatísticas Avançadas (LONGO PRAZO)

#### 5.1 Números Quentes/Frios
- [ ] Análise de frequência histórica
- [ ] Definir thresholds (top 20%, bottom 20%)
- [ ] Integrar com ranking de sistemas

#### 5.2 Atraso Médio
- [ ] Calcular sorteios desde última aparição
- [ ] Análise histórica completa
- [ ] Previsão de próxima aparição

#### 5.3 Análise Temporal
- [ ] Padrões por dia da semana
- [ ] Padrões sazonais
- [ ] Repetições do sorteio anterior

---

## 🎯 PRIORIDADES IMEDIATAS

### 1. Sistema de Ranking (ESTA SEMANA)
- Implementação completa
- Teste com 3-4 sistemas
- Página pública de ranking

### 2. Footer em Todas as Páginas (ESTA SEMANA)
- Adicionar a 19 páginas restantes
- Garantir consistência

### 3. Índice de Ocorrência (PRÓXIMA SEMANA)
- Adicionar a 6 páginas principais
- Testar e validar cálculos

---

## 📊 ESTATÍSTICAS DO PROJETO

### Análises Implementadas: 20
- **Básicas (Superficiais):** 16
- **Avançadas (Profundas):** 4

### Componentes Criados Hoje: 3
- NumberPropertiesClient
- ResponsibleGamingFooter
- InfoTooltip

### Páginas de Análise: 20
- 1 com footer ✅
- 19 pendentes ⏳

---

## 🔮 VISÃO FUTURA

### Machine Learning
- Combinação de múltiplos sistemas
- Otimização automática de parâmetros
- Aprendizagem com novos dados

### Apostas Inteligentes
- Sugestões baseadas em ranking
- Combinação de sistemas top
- Gestão de risco

### Comunidade
- Partilha de estratégias
- Ranking de utilizadores
- Competições

---

## 📝 NOTAS

### Performance
- Estatísticas históricas devem ser pré-calculadas
- Cache de rankings atualizado automaticamente
- Trigger eficiente para novos sorteios

### UI/UX
- Linguagem simples e clara
- Avisos de jogo responsável sempre visíveis
- Tooltips para explicações inline
- Dark mode em tudo

### Dados
- Backup regular da BD
- Histórico completo de previsões
- Auditoria de sistemas

---

**Última Revisão:** 27 Novembro 2024  
**Próxima Revisão:** Após implementação do Sistema de Ranking
