# Arquitetura do Sistema: O Molde de Duas Fases
## Fase 1 (Peneira Individual) vs Fase 2 (Molde Anatómico Coletivo)

*Data de Registo: 2026-11-07*  
*Documento de Referência Oficial do Projeto Números Mágicos*

---

## 1. O Problema Que Resolvemos
Historicamente, sistemas de corte cometiam o erro grave de misturar **propriedades intrínsecas de uma bola individual** com **propriedades relacionais de uma combinação**:
* Exemplo do Erro 1: Cortar a bola `2` só porque ela não sai com a bola `31` (Pares Repulsivos). Isso proibia a bola `2` de sair sozinha ou com a bola `15`.
* Exemplo do Erro 2: Penalizar indiscriminadamente todas as 5 bolas que acabam em `1` (`1, 11, 21, 31, 41`) só porque chaves com 5 terminações iguais são impossíveis.

A solução definitiva foi desenhada com base no **Princípio da Separação em Duas Fases**.

---

## 2. Diagrama de Fluxo Arquitetural

```
                [ Universo Total de Bolas ]
             (ex: 50 Bolas no Euromilhões)
                          │
                          ▼
         ┌───────────────────────────────────┐
         │   FASE 1: MATRIZ DE CORTE        │
         │   (Molde Individual da Bola)      │
         │   «Quem está doente ou exausto?»  │
         └───────────────────────────────────┘
                          │
                          ▼
            [ Pool de Bolas Sobreviventes ]
             (ex: 30 a 35 Bolas Saudáveis)
                          │
                          ▼
         ┌───────────────────────────────────┐
         │   FASE 2: GERADOR GCI             │
         │   (Molde Anatómico da Chave)      │
         │   «Como combinar em harmonia?»    │
         └───────────────────────────────────┘
                          │
                          ▼
         [ Chaves Finais com Anatomia Vencedora ]
```

---

## 3. Fase 1: Matriz de Corte (Propriedades Individuais da Bola)

A Matriz de Corte opera sobre cada bola isoladamente. O seu papel é atribuir um **Score de Risco de Corte (0% a 100%)** baseado no estado biológico e histórico da própria bola no momento $T$.

### Variáveis Atualmente Ativas:
1. **Streaks Consecutivas Empíricas (Matriz #5):**
   * Se a bola saiu 3 vezes consecutivas $\implies$ Risco empírico de falha no 4.º sorteio $\ge 93.0\%$ (comprovado em 10.781 sorteios).
   * Se saiu 4 vezes consecutivas $\implies 97.0\%$.
   * Se atingiu o teto histórico ($\ge 5$ vezes) $\implies 100.0\%$.
2. **Tetos de Janelas Móveis (Matriz #4):**
   * Monitorização em janelas $W \in \{3, 5, 10, 15, 20\}$ sorteios. Se a bola atingiu o teto de saturação da janela (ex.: 3 saídas em 5 jogos), entra em risco de corte de 80% a 100%.
3. **Descanso Pós-Pico / Cooldown (Matriz #5):**
   * Após uma rajada de 3 saídas num intervalo curto ($\le 6$ sorteios), a bola exige um período de seca mínimo histórico (`minRest`). Se o repouso atual for inferior, a bola é cortada a 100%.
4. **Casas Invioladas / Dispersão Ordenada (Matriz #1):**
   * Limites empíricos por posição de saída (ex.: bola 48 nunca pode ser $N_1$; bola 3 nunca pode ser $N_5$).
5. **DNA de Estados L=6 (Matriz #2):**
   * Sequências binárias de 6 sorteios (ex: `0-1-0-0-1-0`). Se o padrão ocorreu $\ge 5$ vezes e nunca convergiu para saída no sorteio seguinte, o número recebe veto.
6. **Inércia / Fadiga T-1 Individual (Matriz #7):**
   * Mede a taxa de repetição individual de cada bola quando veio do sorteio imediatamente anterior.
7. **Veto de Consenso dos 19 Sistemas (Matriz #8):**
   * Se a bola estiver relegada para o fundo da tabela por mais de 70% dos sistemas matemáticos em simultâneo.
8. **Contexto Secundário (Dezenas M3 e Terminações M6):**
   * Atuam estritamente como **peso secundário de desempate (+120 / +150 pontos)**, nunca como veto cego absoluto.

---

## 4. Fase 2: GCI (O Molde Anatómico da Chave)

O Gerador de Chaves Inteligente pega nas bolas selecionadas pelo utilizador e filtra as combinações geradas, aplicando o molde das chaves reais.

### Regras do Molde Anatómico:
1. **Teto de Terminações:** Máximo **2 números** com o mesmo dígito final por chave (ex.: `[1, 11, 21]` é vetado; apenas `[1, 11]` é permitido).
2. **Teto de Dezenas:** Máximo **2 números** pertencentes à mesma dezena (em jogos de 5 bolas) e máx. 3 (em jogos de 6 bolas).
3. **Sequências Consecutivas:** Máximo **1 par consecutivo** (ex.: `[14, 15]`). Trios ou quartetos consecutivos seguidos (`[14, 15, 16]`) são estritamente vetados.
4. **Pares Repulsivos Históricos:** Chaves que unam pares que têm **0 saídas conjuntas** em centenas de sorteios (ex.: `[2, 31]`, `[5, 17]`, `[12, 16]` no EuroDreams) são rejeitadas.
5. **Janela de Soma Gaussiana:**
   * Euromilhões / Totoloto: Soma entre 90 e 165.
   * EuroDreams: Soma entre 95 e 155.
   * Mega-Sena: Soma entre 135 e 225.
   * Lotofácil: Soma entre 175 e 225.
6. **Paridade Par/Ímpar:** Proibição de extremos estapafúrdios (como 5 Pares ou 5 Ímpares).
7. **Repetidores de T-1 na Chave:** No máximo 1 ou 2 números repetidos do sorteio anterior.

---

## 5. Novas Variáveis Propostas Para a Fase 1 (Matriz de Corte)

Para expandir o molde individual da bola na Fase 1, foram mapeadas as seguintes novas variáveis matemáticas comprováveis:

1. **Efeito Elástico de Atraso Máximo (Elastic Tension Barrier):**
   * Se o atraso atual de uma bola aproxima-se de 90% do seu atraso recorde histórico, ela **NUNCA pode ser cortada**, mesmo que esteja em má posição noutras matrizes (o risco cai forçadamente para $<30\%$).
2. **Intervalo Médio de Re-entrada (Early Re-entry Lockout):**
   * Se a bola tem uma média histórica de retorno de 9 sorteios e o seu menor intervalo de sempre foi de 3 sorteios, se ela saiu há apenas 1 ou 2 sorteios, tem uma barreira protetora contra saída prematura.
3. **Momento Térmico / Derivada de Velocidade:**
   * Compara a frequência em $W=5$ com $W=20$. Se a derivada for fortemente negativa (bola estava muito ativa mas parou abruptamente), indica desaceleração térmica ativa.
4. **Taxa de Repetição Imediata ($G=1$ Zero-Repeaters):**
   * Bolas que em centenas de sorteios **nunca repetiram no sorteio imediatamente a seguir**. Para essas bolas específicas, sair em $T-1$ garante quase 100% de probabilidade de corte em $T$.
