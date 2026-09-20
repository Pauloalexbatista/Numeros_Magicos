# 11_SOLUCAO_CORTE_NUMEROS_EURODREAMS: Margem de Salvaguarda (+1 Headroom)

> [!IMPORTANT]
> **Estado:** Documentado para implementação futura.
> **Alvo:** Motor da Matriz de Corte (`src/services/matriz-corte-engine.ts`).
> **Problema Central:** O EuroDreams apresentava alta taxa de corte erróneo (eliminava números vencedores) porque os números em *hot streak* batiam recordes históricos recentes e o sistema cortava-os imediatamente a 100%.

---

## 1. Diagnóstico e Caso de Estudo

### 1.1. Contexto Estatístico
* **EuroDreams:** Apenas ~299 sorteios (novembro de 2023 a 2026), com extração de **6 números em 40** (densidade de **15%** por sorteio).
* **Euromilhões:** ~1.980 sorteios, extração de **5 números em 50** (densidade de **10%** por sorteio).
* **Totoloto:** ~2.000 sorteios, extração de **5 números em 49** (densidade de **~10.2%** por sorteio).

Devido à alta densidade (15%) e reduzido histórico (299 sorteios), no EuroDreams:
1. Recordes de saídas consecutivas (*streaks* de 3 ou 4) e concentrações em janelas curtas ocorrem com frequência muito maior do que nos jogos de 10%.
2. Como a amostra ainda é recente, os recordes anteriores são baixos (ex.: uma bola ter tido no máximo 2 saídas seguidas).
3. Quando a bola iguala o recorde anterior (2/2 = 100%), o sistema atribui pontuação máxima de corte (+950 / +900 pontos) e elimina a bola à queima-roupa.

### 1.2. O Caso de Estudo Real (Bola 22 nos sorteios 270 a 273)
* **Sorteio 270:** Bola 22 atinge teto das janelas W=7 e W=10. **Cortada pelo sistema.** -> **Saiu no sorteio!**
* **Sorteio 271:** Bateu o recorde anterior. O sistema volta a marcar teto a 100%. **Cortada novamente.** -> **Voltou a sair!**
* **Sorteio 272:** Marca novos tetos W=5 e W=20. **Cortada novamente.** -> **Voltou a sair!**
* **Sorteio 273:** Atinge `MaxStreak (3/3)` e teto W=3. **Cortada novamente.** -> **Saiu pela 4ª vez consecutiva!**

Em 4 sorteios consecutivos, a ferramenta eliminou uma bola vencedora exatamente porque ela estava numa fase de alta frequência (*hot streak*).

---

## 2. A Solução: Margem Dinâmica de Salvaguarda (+1 Headroom)

A solução baseia-se na intuição do utilizador: **não cortar o número à queima-roupa quando ele iguala o recorde; dar +1 de margem e deixar o teto subir dinamicamente.**

### 2.1. Como Funciona a Matemática

Seja $M$ o recorde histórico anterior da bola (seja em *MaxStreak*, *Ping-Pong* ou saídas numa janela $W$).
Seja $Cur$ o valor atual observado.

#### Abordagem Atual (Rígida):
$$\text{Proximidade} = \frac{Cur}{M} \times 100\%$$
* Se $M = 2$ e $Cur = 2$: $\frac{2}{2} = 100\% \implies$ **Eliminação Imediata.**

#### Abordagem Proposta com Salvaguarda (+1):
Para jogos em consolidação ou especificamente no EuroDreams:
$$\text{Proximidade}_{\text{protegida}} = \frac{Cur}{M + 1} \times 100\%$$
* Se $M = 2$ e $Cur = 2$: $\frac{2}{2 + 1} = \frac{2}{3} \approx 66.7\% \implies$ **Não corta!**
* A bola tem espaço para continuar a sua sequência.
* Se a bola sair e atingir 3 saídas, no sorteio seguinte o novo recorde $M$ passa a ser 3, e o teto virtual de segurança sobe dinamicamente para $3 + 1 = 4$ ($\frac{3}{4} = 75\%$).

---

## 3. Plano Técnico de Implementação em `matriz-corte-engine.ts`

Quando formos implementar, estas são as alterações exatas necessárias:

### 3.1. Configuração por Jogo (`GAME_CONFIGS`)
Adicionar propriedades específicas para tolerância e janelas ativas:
```typescript
export interface GameConfig {
    name: string;
    totalBalls: number;
    pickSize: number;
    targetEliminate: number;
    tenRanges: { name: string; min: number; max: number }[];
    recordSlackMargin?: number; // 1 para EuroDreams, 0 para Euromilhoes/Totoloto
    maxWindowAllowed?: number;  // Limitar W máximo se histórico < 500 sorteios (ex: max W=30 no EuroDreams)
}
```

### 3.2. Matriz #4: Densidade e Velocidade (Janelas)
1. Desconsiderar janelas onde $W > \text{totalDraws} \times 0.2$ (no EuroDreams, $W=100$ e $W=50$ têm peso excessivo com apenas 299 sorteios).
2. Aplicar o divisor com folga:
```typescript
const effectiveMax = config.recordSlackMargin ? m + config.recordSlackMargin : m;
windowPct[b][w] = effectiveMax > 0 ? (actSum / effectiveMax) * 100 : 0;
```

### 3.3. Matriz #5: Ritmo e Repouso (Streaks e Ping-Pong)
```typescript
if (ritmoMaxStreak[b] > 0) {
    const effectiveStreakMax = config.recordSlackMargin 
        ? ritmoMaxStreak[b] + config.recordSlackMargin 
        : ritmoMaxStreak[b];
    const pS = (ritmoCurStreak[b] / effectiveStreakMax) * 100;
    if (pS > maxRitmoP) maxRitmoP = pS;
    if (pS >= 100) {
        ritmoDetails.push(`MaxStreak (${ritmoCurStreak[b]}/${effectiveStreakMax})`);
        ritmo100Cuts++;
    }
}
```

### 3.4. Matriz #1: Calibração das Casas para Jogos Jovens
No EuroDreams, uma transição $t \to t+1$ não vista em 299 sorteios não significa impossibilidade física. Reduzir a severidade do consenso de casas de 95% para 70% quando `history.length < 500`.

---

## 4. O Que o Sistema Ganha com Isto
1. **Preservação dos Números Vencedores Quentes:** Os números em pico de forma deixam de ser descartados.
2. **Corte Focado nos Verdadeiros Frios:** Os 20 números eliminados passarão a ser aqueles que demonstram saturação fria, longas dormências ou esgotamento pós-pico.
3. **Aumento Direto da Taxa de Jackpot Intacto:** Evita cortes cegos de recordes de curto prazo.

---

## 5. Como Retomar e Implementar
Quando for o momento de executar:
1. Abrir `src/services/matriz-corte-engine.ts`.
2. Integrar a flag `recordSlackMargin: 1` na configuração de `EURODREAMS`.
3. Executar o script de teste de auditoria nos sorteios 270 a 299 para comparar as taxas de retenção de jackpot antes vs depois.
