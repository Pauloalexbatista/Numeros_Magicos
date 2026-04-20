# 🏗️ Arquitetura: Números Mágicos 3.0

Esta arquitetura foi desenhada para garantir **Consistência Total**, **Escalabilidade** e **Zero Timeouts**, separando o processamento pesado da exibição de dados.

## 1. O Paradigma "Offline-First"

O projeto separa completamente o **Processamento (Engine)** da **Exibição (Web)**.

- **Engine (Local):** Processa o descarregamento de sorteios, treino de modelos de IA e cálculo de rankings no PC do utilizador (onde não há limites de tempo de execução).
- **Web (Vercel):** Um site Next.js de alta performance que serve dados sincronizados da base de dados (PostgreSQL em produção).

## 2. Pipeline de Atualização (Linear)

O ciclo de vida de um novo sorteio segue esta ordem obrigatória:

1. **Ingestão**: O script de fetch descarrega os dados do EuroMilhões, EuroDreams ou Totoloto.
2. **Cura de Gaps**: O sistema deteta automaticamente se faltam sorteios intermédios e descarrega o arquivo necessário.
3. **Cálculo Base**: Estatísticas simples e sistemas de padrões são calculados primeiro.
4. **Treino ML (Heavy)**: As Redes Neuronais (LSTM, etc.) são treinadas de forma incremental (apenas com os novos dados).
5. **Ensemble**: Os sistemas de votação combinam os resultados dos sistemas base e ML.
6. **Sincronização**: Os dados são submetidos para o servidor de produção através do script `INCREMENTAL_SYNC_PROD.bat`.

## 3. Estratégia "Game Agnostic"

Todos os sistemas preditivos são desenhados para serem independentes do jogo. Eles recebem parâmetros como `maxNumber` e `drawSize`, permitindo que o mesmo algoritmo de "Hot Numbers" ou "Markov Chain" funcione para qualquer jogo suportado.

## 4. Camada de Dados e Cache

- **SQLite (Local):** Utilizado para desenvolvimento e cálculos pesados.
- **Postgres (Produção):** Utilizado para servir os utilizadores finais.
- **CachedPrediction**: Tabela central que armazena os resultados finais de todos os sistemas, evitando cálculos em tempo real no frontend.

## 5. Manutenção e Segurança

- **Master Update**: Script único que orquestra todo o pipeline local.
- **Atomic Sync**: A produção só é atualizada quando todos os cálculos locais estão validados.
- **Zero-Touch API**: O frontend apenas lê dados da cache, garantindo carregamentos instantâneos.
