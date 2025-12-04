# Bolas Mágicas 🎱

Sistema de Análise Avançada do EuroMilhões com modelos preditivos e ranking automático.

## 🎯 Funcionalidades

- 📊 **20+ Análises Estatísticas** (Frequência, Padrões, Propriedades)
- 🤖 **7 Sistemas Preditivos** (Markov Chain, Monte Carlo, Hot Numbers, etc.)
- 🏆 **Ranking Automático** de performance dos sistemas
- 🔄 **Atualização Automática** dos sorteios (Terça e Sexta às 22h)
- 🎨 **Dashboard Dinâmico** com cards personalizáveis
- 🔐 **Sistema de Autenticação** (USER, PRO, ADMIN)
- 🌙 **Dark Mode** completo
- ⚡ **Cache Inteligente** (Cálculos pesados são pré-processados e cacheados)

## ⚡ Regras de Performance (Cache)

Para garantir a performance e evitar sobreaquecimento do servidor/PC:
1. **Todos os Sistemas Preditivos** (Numéricos e Estrelas) DEVEM utilizar a tabela `CachedPrediction`.
2. O Frontend (`actions.ts`) deve **SEMPRE** verificar a cache antes de iniciar um cálculo.
3. Cálculos pesados (ex: Redes Neuronais) só devem ser executados via scripts de manutenção (`npm run db:update` ou `turbo-backfill`), nunca em tempo real pelo utilizador.

## 🚀 Tecnologias

- **Frontend:** Next.js 16, React 19, TailwindCSS 4
- **Backend:** Next.js API Routes, Server Actions
- **Database:** Prisma + SQLite
- **Auth:** NextAuth v5
- **Charts:** Recharts
- **TypeScript** em todo o projeto

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

# Importar histórico de sorteios
npm run db:import

# Inicializar sistemas de ranking
npm run seed:ranking

# Correr em desenvolvimento
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) no browser.

## 🔧 Configuração

Cria um ficheiro `.env.local`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="gera-uma-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Cron Secret (para atualização automática)
CRON_SECRET="secure-cron-key-2024"
```

## 📊 Sistemas de Ranking

O projeto avalia automaticamente 7 sistemas preditivos:

1. **Markov Chain** - Análise de probabilidades de transição
2. **Hot Numbers** - Números mais frequentes
3. **Monte Carlo** - Simulações probabilísticas
4. **Clustering** - Agrupamento de padrões
5. **PyramidPascal** - Análise baseada em Triângulo de Pascal
6. **PyramidGaps** - Análise de intervalos
7. **Random Generator** - Baseline de comparação
8. **Ensemble Voting** - Combinação inteligente dos sistemas acima.

### 🧠 Estratégia "Smart Inverse Ensemble"
O sistema de **Ensemble Voting** utiliza uma estratégia inteligente de inversão:
- **Sistemas > 50%**: O Ensemble confia na previsão (Peso = Precisão).
- **Sistemas < 50%**: O Ensemble **inverte** a previsão, apostando nos números que o sistema *não* escolheu (Peso = 100% - Precisão).
Isto transforma sistemas com fraca performance em contribuidores positivos.

## 🤖 Atualização Automática

### GitHub Actions
O workflow `.github/workflows/update-draws.yml` corre automaticamente às 22h de Terça e Sexta.

### Vercel Cron (Recomendado)
Se fizeres deploy na Vercel, o `vercel.json` configura automaticamente o cron job.

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run db:update    # Atualizar sorteios manualmente
npm run db:import    # Importar histórico completo
npm run seed:ranking # Inicializar sistemas de ranking
npm run test:ranking # Testar sistema de ranking
```

## 🎨 Estrutura do Projeto

```
numeros/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   ├── components/       # Componentes React
│   ├── services/         # Lógica de negócio
│   ├── models/           # Modelos preditivos
│   ├── scripts/          # Scripts de manutenção
│   └── utils/            # Utilitários
├── prisma/
│   └── schema.prisma     # Schema da base de dados
└── public/               # Assets estáticos
```

## 🏆 Performance dos Sistemas

Baseado nos últimos 100 sorteios:

| Sistema | Precisão |
|---------|----------|
| Markov Chain | 23.8% |
| Hot Numbers | 20.6% |
| Random Generator | 20.6% |
| PyramidPascal | 19.4% |
| PyramidGaps | 18.8% |
| Monte Carlo | 18.6% |
| Clustering | 18.6% |

*Baseline (escolha aleatória): 20%*

## 📄 Licença

Este projeto é privado e para uso pessoal.

## 👤 Autor

Paulo - [GitHub](https://github.com/SEU_USERNAME)

## 🎯 Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para planos futuros.

---

**Nota:** Este é um projeto educacional de análise estatística. Joga responsavelmente! 🎲
