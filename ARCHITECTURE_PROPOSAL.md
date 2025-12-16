# 🏗️ Proposta de Nova Arquitetura: Offline-First Calculation & Atomic Deploy

## 🚨 O Problema Atual
Atualmente, o projeto utiliza uma arquitetura **"Híbrida/Online"**:
1. O servidor (Vercel) tenta descarregar o sorteio e recalcular tudo em tempo real (Cron Job).
2. **Fragilidade:** O Vercel tem limites de tempo (10-60 segundos). Se o cálculo falhar a meio, a base de dados fica "a meio caminho" (ex: Rankings atualizados, mas Estatísticas antigas).
3. **Inconsistência:** Diferentes páginas leem de diferentes tabelas/caches, causando números diferentes para a mesma métrica.
4. **Stress:** As terças e sextas tornam-se momentos de ansiedade para verificar se o "script correu bem".

## 💡 A Solução: Arquitetura "Snapshot" (Offline-First)

A proposta é mudar o paradigma para **"Cálculo Local, Distribuição Global"**.
O "Cérebro" sai da cloud (limitada) e passa para o teu PC (ilimitado), onde tu controlas tudo.

### Fluxo de Trabalho Proposto

#### 1. 🏡 Fase Local (O "Laboratório")
*Corre no teu PC (Numa Terça à noite, por exemplo)*

1. **Ingestão:** Script `npm run update:draw` baixa o novo sorteio.
2. **Cálculo Pesado:** Script `npm run calc:all` corre todos os modelos, rankings, e estatísticas localmente.
   - Usa o poder total do CPU/GPU do PC.
   - Não há timeouts. Se demorar 10 minutos, tudo bem.
3. **Validação:** Tu abres o `localhost:3000` e verificas: "Os números batem certo? O ranking faz sentido?".
   - Se algo estiver errado, **ninguém vê**. Tu corriges localmente.

#### 2. 🧊 Congelamento (O "Snapshot")
Uma vez validado, o sistema gera uma série de ficheiros estáticos (JSONs) que representam a "Verdade Absoluta" daquele sorteio.
- `stats-frequency.json`
- `rankings-top.json`
- `predictions-next.json`

#### 3. 🚀 Deploy Atómico (A "Publicação")
1. Script faz **Git Commit** destes ficheiros novos.
2. Script faz **Git Push**.
3. A Vercel deteta a mudança e faz um **novo deploy**.
4. **Resultado:** O site em produção muda instantaneamente do "Estado A" para o "Estado B".
   - Não há estados intermédios.
   - Todas as páginas leem os mesmos ficheiros JSON. Zero incoerências.

## 📐 Estrutura Técnica

### A. Camada de Dados (Single Source of Truth)
Criamos uma pasta `/data/static` no projeto. O site deixa de calcular coisas "on-the-fly" na base de dados e passa a ler (maioritariamente) destes ficheiros otimizados.

`src/data/static/current-draw.json`
`src/data/static/rankings.json`
`src/data/static/stats-numbers.json`

### B. O Script Mestre (`MASTER_UPDATE.bat`)
Um único comando no teu PC que faz tudo:

```bash
# 1. Atualizar BD Local
npm run db:update:draw

# 2. Correr Cálculos (Rankings, Stats, AI)
npm run calc:heavy

# 3. Gerar Snapshots (JSONs para o Frontend)
npm run generate:static-data

# 4. Git Push (Opcional/Manual)
git add .
git commit -m "Update Draw #1700"
git push
```

## 🏆 Vantagens
1.  **Zero Inconsistência:** O site só tem uma fonte de verdade (os ficheiros gerados).
2.  **Zero Ansiedade:** Tu validas tudo localmente antes de os utilizadores verem.
3.  **Performance Extrema:** O site online não faz cálculos, apenas serve JSONs pré-calculados. Carregamento instantâneo.
4.  **Custo Zero:** Reduz o uso de CPU/Base de Dados na Vercel.
5.  **Robustez:** Se a Internet falhar, ou a API do Santa Casa mudar, o site online continua a funcionar perfeitamente com os dados anteriores até tu resolveres o problema localmente.

## 📅 Plano de Transição (Roadmap)

1.  **Criar Geradores:** Scripts que transformam a info da BD em JSONs estáticos.
2.  **Adaptar Frontend:** Os componentes passam a ler dos JSONs em vez de fazer queries complexas à BD.
3.  **Criar Pipeline Local:** O script `MASTER_UPDATE` para orquestrar tudo.

## 🛠️ Fase 3: Gestão de Ciclo de Vida de Sistemas (SLM)

Para resolver a desorganização ao criar/gerir sistemas, propomos um **"Registry Pattern"** automatizado.

### O Problema
Hoje, adicionar um sistema requer:
1. Criar a Classe.
2. Importar manualmente no `ranked-systems.ts`.
3. Adicionar ao array `baseSystems`.
4. Correr seed na base de dados.
*É manual, propenso a erro e mistura lógica de ML com Estatística.*

### A Solução: `SystemRegistry` Inteligente

#### 1. Interface Unificada
Todos os sistemas (sejam ML, Estatísticos ou Estrelas) implementam:

```typescript
interface ISystem {
  metadata: { name: string; type: 'STATIC' | 'ML' | 'ENSEMBLE' };
  train?(): Promise<void>;  // Só para ML
  predict(history: Draw[]): Promise<Prediction>;
}
```

#### 2. Auto-Discovery & Sync
Criamos um script `npm run sys:sync` que:
1.  Lê o array de sistemas ativos no código.
2.  Compara com a Base de Dados.
    -   **Novos no código?** -> Cria automaticamente na BD.
    -   **Removidos do código?** -> Marca como `isActive: false` na BD.
    -   **Atualizados?** -> Atualiza descrição/metadata.
3.  Gera automaticamente os Anti-Sistemas para todos os elegíveis.

#### 3. Organização por Pastas
```
src/
  systems/
    core/       # Interface e Registry
    stats/      # Hot Numbers, Markov...
    ml/         # LSTM, Random Forest...
    ensemble/   # Gold, Silver, Voter...
    experimental/ # O teu "Laboratório"
```

A adição de um novo sistema resume-se a **colocar o ficheiro na pasta certa** e adicioná-lo ao `index.ts` (Registry). O script `sys:sync` trata do resto.

