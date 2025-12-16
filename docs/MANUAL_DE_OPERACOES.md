# 📖 MANUAL DE OPERAÇÕES - NÚMEROS MÁGICOS

> **Protocolo Oficial** para manutenção e atualização do sistema.
> Seguir rigorosamente para garantir a integridade dos dados e performance Offline-First.

---

## 📅 CENÁRIO A: Sorteio Novo (Rotina Diária)
**Quando:** Terça-feira e Sexta-feira à noite, após sair o resultado do EuroMilhões.

### Passo 1: Iniciar o Ambiente
1. Executa o ficheiro `NUMEROS_MAGICOS.bat` na raiz.
2. O servidor local arranca. Mantém esta janela aberta.

### Passo 2: Atualização Mestre (O Cérebro)
Este passo é **obrigatório**. Não usar atalhos.
1. Fecha o servidor local (Ctrl+C) para garantir que a BD não está "presa" (opcional, mas recomendado para SQlite local).
2. Executa o ficheiro `MASTER_UPDATE.bat` na raiz.
3. **O que vai acontecer (Automático):**
    *   **[1/4] Fetch:** O sistema vai tentar buscar o último sorteio online. (Se falhar, tens de inserir manualmente na BD).
    *   **[2/4] Backfill & Stats:** Recalcula estatísticas para os 66+ sistemas com o novo sorteio. Atualiza Rankings.
    *   **[3/4] AI Training:** Re-treina as Redes Neuronais (LSTM, Random Forest) com os dados novos. **Isto demora 1-2 minutos.**
    *   **[4/4] Static Gen:** Gera os ficheiros JSON definitivos para o site (Rankings, Detalhes, Previsões).

### Passo 3: Verificação Visual
1. Volta a executar `NUMEROS_MAGICOS.bat`.
2. Vai a `http://localhost:3000`.
3. Confere na Homepage:
    *   O "Último Sorteio" corresponde ao de hoje?
    *   O Jackpot estimado bate certo?
4. Vai a `/ranking`:
    *   Verifica se as estatísticas mudaram.
    *   Entra num sistema (ex: "Hot Numbers") e vê se o gráfico de histórico tem a bolinha do novo sorteio.

### Passo 4: Deploy (Publicar)
Se tudo estiver verde e validado localmente:
1. Abre o terminal no VS Code.
2. Executa:
   ```bash
   git add .
   git commit -m "Dados Atualizados: Sorteio [DATA]"
   git push
   ```
3. A Vercel vai detetar a mudança e atualizar o site público automaticamente.

---

## 🛠️ CENÁRIO B: Criei um Novo Sistema
**Quando:** Acabaste de adicionar um ficheiro novo em `src/systems/`.

### Passo 1: Registar
1. Abre `src/systems/index.ts`.
2. Importa o teu novo sistema e adiciona-o ao array `SystemRegistry`.

### Passo 2: Sincronizar & Validar
Antes de processar dados, garante que o sistema não crasha.
1. Executa no terminal:
   ```bash
   npx tsx src/scripts/core/sync-systems.ts
   ```
   *(Isto cria a entrada na BD para o teu sistema)*.
2. Executa o teste de verificação:
   ```bash
   npx tsx src/scripts/core/verify-all.ts
   ```
   *(Isto corre o `predict()` para garantir que ele cospe 25 números e não dá erro)*.

### Passo 3: Processamento Total (Backfill Inteligente)
O teu sistema é novo, por isso a BD não tem histórico nenhum dele.
1. Executa o `MASTER_UPDATE.bat`.
2. **A Magia Acontece:**
    *   O script deteta que os sistemas antigos já estão atualizados -> **SALTA-OS** (Instantâneo).
    *   Deteta que o TEU sistema está no "Draw 0" -> **CORRE TUDO** só para ele.
3. No final, gera os JSONs estáticos.

### Passo 4: Ver no Site
1. Executa `NUMEROS_MAGICOS.bat`.
2. Vai a `/ranking`. O teu sistema deve aparecer lá (provavelmente no fundo, porque ainda não tem "score" de qualidade consolidado, ou no topo se for muito bom!).

---

## ⚠️ REGRAS DE OURO (Resumo)
1. **Nunca alteres dados diretamente na BD de Produção.** Altera localmente (`dev.db`), processa, e manda o JSON/Código para cima.
2. **`MASTER_UPDATE.bat` é a Verdade.** Se mudaste lógica, corre-o. Se saiu sorteio, corre-o.
3. **Não comites código com erros no `verify-all.ts`.**
