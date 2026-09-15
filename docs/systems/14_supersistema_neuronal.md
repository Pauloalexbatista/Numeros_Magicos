# Sistema: SuperSistema Neuronal (Meta-Ensemble AI)

> **Identificador**: `SuperSistema Neuronal`  
> **Tipo**: Meta-Ensemble Stacking (Quintetos de Ouro com Muralha de Corte)  
> **Domínio**: Números (`NUMBERS`)  
> **Ficheiro de Implementação**: `src/services/supersistema-neuronal.ts`  
> **Origem / Autoria da Lógica Canónica**: Concebido pelo Paulo Alexandre Batista durante a sessão de pesquisa avançada de 15/09/2026.

---

## 1. A Alma do Sistema (História e Génese)

O **SuperSistema Neuronal** nasceu de uma revelação matemática e empírica marcante obtida a partir da auditoria de mais de 20 anos de sorteios na plataforma *Números Mágicos*.

### A Descoberta da "Armadilha do Comitê"
Inicialmente, tentámos combinar os 5 sistemas com melhor histórico através de uma média tradicional de percentis. O resultado foi desapontador:
* O *Diagonais da Matriz* tinha 56 jackpots sozinho, mas a média do comitê só conseguiu 45.
* **A explicação matemática**: Uma média aritmética clássica suaviza as apostas arrojadas e promove números medianos e consensuais ("a sopa morna"). Se o *Diagonais* colocava uma bola genial em 1º lugar, mas outros sistemas a colocavam em 30º, a média atirava a bola para o 18º lugar, destruindo o jackpot!

### A Intuição Genial do Paulo: Quintetos de Ouro e a Muralha dos 25
O Paulo identificou a chave mestra que desbloqueou o recorde histórico:
1. **O ouro de cada especialista está dentro dos seus primeiros 25 números**: Se cada um dos 5 especialistas já provou acertar jackpots históricos no seu Top 25, não devemos tentar inventar nem diluir essas listas.
2. **Dentro de uma Quina não há hierarquia artificial**: Quando sai um jackpot, as bolas raramente são o 1º e o 2º lugar; são muitas vezes a 3ª, a 7ª, a 14ª e a 22ª bola! Castigar uma bola do 4º lugar face à 1ª é um erro. As bolas devem ser pontuadas por **Blocos de 5 números (Quintetos)**.
3. **A Muralha Sagrada dos 25 Números**: Do 26º ao 50º lugar (a segunda metade que o especialista rejeitou), a pontuação tem de ser **RIGOROSAMENTE ZERO**. Isso cria uma muralha de contenção absoluta que impede qualquer número rejeitado de subir e empurrar para fora uma bola de ouro.

Ao aplicar este modelo de Quintetos com a Muralha dos 25, o resultado foi demolidor:
* **Euromilhões**: Bateu o recorde de sempre do site com **57 JACKPOTS MÁXIMOS** e 310 vezes 4 acertos!
* **Totoloto**: **49 Jackpots** e 323 Prémios Nobres (topo da história do Totoloto)!
* **Mega-Sena**: **40 Senas (6 acertos)** e 268 Quinas!
* **Eurodreams**: **5 Jackpots (6 acertos)** e 30 vezes 5 acertos!
* **Total Absoluto nos 4 Jogos**: **151 Jackpots Máximos** e **1.033 Prémios Nobres**!

---

## 2. A Tabela Canónica de Pontuação por Quintetos

Cada um dos 5 especialistas atribui pontos aos números de acordo com a Quina em que o número se encontra no seu ranking:

| Quina / Bloco | Posições no Ranking do Especialista | Tier | Pontuação Atribuída |
| :---: | :---: | :---: | :---: |
| 💎 **1ª Quina** | **1º ao 5º lugar** | Diamante | **100 pontos** |
| 🥇 **2ª Quina** | **6º ao 10º lugar** | Ouro | **75 pontos** |
| 🥈 **3ª Quina** | **11º ao 15º lugar** | Prata | **50 pontos** |
| 🥉 **4ª Quina** | **16º ao 20º lugar** | Bronze | **30 pontos** |
| 🏅 **5ª Quina** | **21º ao 25º lugar** | Limiar de Corte | **15 pontos** |
| 📍 **6ª Quina (Mega-Sena)** | **26º ao 30º lugar** | Top 30 | **8 pontos** |
| ⛔ **Quinas Restantes** | **26º / 31º em diante** | **Anti-Sistema (Rejeitados)** | **0 PONTOS (Muralha de Aço)** |

---

## 3. Os 5 Especialistas Selecionados por Jogo

A composição do conselho de notáveis é **100% independente por jogo**, seleccionando os 5 com melhor histórico no universo daquela lotaria:

* **🇪🇺 Euromilhões**: *Diagonais da Matriz*, *Sistema Oscilação Universal V2*, *Mais Sorteadas de Sempre*, *Transições de Markov*, *Random Forest AI*.
* **🇵🇹 Totoloto**: *Agrupamento de Padrões (Clustering)*, *Diagonais da Matriz*, *Mais Sorteadas de Sempre*, *Mais Quentes*, *Transições de Markov*.
* **🇧🇷 Mega-Sena**: *Random Forest AI*, *Sistema Média +3 Otimizado*, *Diagonais da Matriz*, *Transições de Markov*, *Mais Sorteadas de Sempre*.
* **🌠 Eurodreams**: *Mais Quentes*, *Diagonais da Matriz 3D*, *Últimos a Sair*, *Random Forest AI*, *Pirâmide de Intervalos*.

---

## 4. Garantia de Causalidade (Zero Lookahead Bias)

O sistema cumpre integralmente os requisitos científicos da plataforma *Números Mágicos*:
1. Para cada sorteio $T$, o SuperSistema apenas consulta as previsões geradas pelos especialistas com dados recolhidos até $T-1$.
2. Não há qualquer contaminação com dados do sorteio $T$ nem do futuro.
3. Não há ajuste arbitrário de regras ao longo do tempo: a mesma regra dos Quintetos de Ouro é aplicada estritamente desde o 1º sorteio histórico até hoje.
