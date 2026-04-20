# Bolas Mágicas 🎱

Sistema de Análise Avançada para EuroMilhões, EuroDreams e Totoloto com modelos preditivos e ranking automático.

## 🚀 Arquitetura "Offline-First"

O projeto utiliza uma arquitetura robusta de **Cálculo Offline e Deploy Atómico**. Todos os cálculos pesados (IA, Rankings e Estatísticas) são realizados localmente e sincronizados com o servidor de produção, garantindo performance máxima e zero inconsistência.

## 🎯 Funcionalidades

- 🎲 **Suporte Multi-Jogo**: EuroMilhões, EuroDreams e Totoloto.
- 📊 **20+ Análises Estatísticas** (Frequência, Padrões, Propriedades).
- 🤖 **7+ Sistemas Preditivos** (Markov Chain, Monte Carlo, Hot Numbers, Vortex, etc.).
- 🏆 **Ranking Automático** de performance dos sistemas por jogo.
- 🔄 **Sincronização Incremental** (Terça e Sexta às 22h).
- 🎨 **Dashboard Dinâmico** com cards personalizáveis para cada jogo.
- 🔐 **Sistema de Autenticação** (USER, PRO, ADMIN).
- 🌙 **Dark Mode** completo.
- ⚡ **Cache Inteligente** (Cálculos pré-processados e persistidos).

## 🛠️ Guia de Manutenção (Scripts)

Para manter os dados atualizados, utiliza os scripts na pasta `tools/`:

1. **`2-MASTER_UPDATE.bat`**: Descarrega novos sorteios e recalcula tudo no PC local.
2. **`3-INCREMENTAL_SYNC_PROD.bat`**: Sincroniza apenas os novos dados com o site (rápido).
3. **`3-FULL_SYNC_PROD.bat`**: Re-sincronização total (em caso de erro de dados).

## ⚡ Regras de Performance

1. **Cache Obrigatória**: Todos os sistemas DEVEM utilizar a tabela `CachedPrediction`.
2. **Treino Offline**: Redes Neuronais (LSTM, etc.) são treinadas via scripts offline, nunca no frontend.

## 📦 Instalação

```bash
# Clonar repositório
git clone https://github.com/SEU_USERNAME/bolas-magicas.git
cd bolas-magicas

# Instalar dependências
npm install

# Configurar base de dados
npx prisma generate
npx prisma db push

# Importar histórico e inicializar
npm run db:import
npm run seed:ranking

# Correr em desenvolvimento
npm run dev
```

## 🎨 Estrutura do Projeto

- `src/app/`: Páginas e Rotas (separadas por jogo em `(games)`).
- `src/services/`: Lógica de negócio e serviços de cada jogo.
- `src/scripts/`: Utilitários de manutenção e pipelines.
- `prisma/`: Definições da Base de Dados.

---

**Nota:** Este é um projeto educacional de análise estatística. Joga responsavelmente! 🎲
