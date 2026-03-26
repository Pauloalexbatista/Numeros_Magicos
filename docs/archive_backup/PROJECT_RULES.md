# 📜 PROJECT GOLDEN RULES (REGRAS DE OURO)

> **AVISO A TODOS OS AGENTES AI:** LEIAM ISTO ANTES DE QUALQUER ALTERAÇÃO SIGNIFICATIVA.
> Estas regras foram definidas pelo utilizador para evitar problemas recorrentes de performance e lógica.

## 1. ⚡ Otimização de Anti-Sistemas
**NUNCA** recalcular um Anti-Sistema do zero.
*   **Regra:** Um Anti-Sistema é estritamente o inverso do Sistema base.
*   **Implementação:**
    1.  Calcular a previsão do Sistema Base (ex: `HotNumbers`).
    2.  Calcular o inverso matematicamente `(Todos Numeros - Previsão)`.
    3.  Gravar AMBOS na Base de Dados numa única passagem.
*   **Proibido:** Instanciar a classe `AntiHotNumbers` e pedir para gerar previsões independentes.

## 2. 🧩 Modularidade nos Cálculos
**NUNCA** tentar calcular "Tudo" numa única função ou processo monolítico se isso bloquear o sistema.
*   **Regra:** Os scripts de atualização devem ser separados por tipo/domínio para permitir atualizações parciais.
*   **Estrutura Aceite:**
    *   `stats-update.ts` (Sitemas rápidos)
    *   `ml-update.ts` (Redes Neuronais - Lento)
    *   `stars-update.ts` (Estrelas)
*   **Orquestração:** O `MASTER_UPDATE` pode chamar estes scripts sequencialmente, mas eles devem poder ser executados isoladamente.

## 3. 🎯 Offline-First (Single Source of Truth)
*   Os cálculos complexos são feitos LOCALMENTE.
*   O site Online (`Vercel`) deve ser "burro" e apenas ler ficheiros JSON estáticos (`src/data/static/`) ou dados já processados na BD.
*   **Proibido:** Correr `trainModel()` ou `generateHistory()` no ambiente Serverless da Vercel.

## 4. 🧹 Limpeza e Manutenção
*   Antes de criar um novo script na raiz ou em `tools/`, verificar se já existe em `src/scripts/core/`.
*   Manter a pasta `tools/` apenas para Batch Files (.bat) ou utilitários de sistema. Código Typescript deve ir para `src/scripts/`.

---
*Documento vivo - Atualizar conforme novas regras sejam definidas.*
