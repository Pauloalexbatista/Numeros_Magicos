import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Let's create the official challenge document
const docPath = path.join(process.cwd(), "docs", "APOSTA_TOTOLOTO_PROXIMO_SORTEIO.md");

const pauloNumbers = [2, 4, 5, 6, 11, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 30, 32, 37, 38, 39].sort((a,b)=>a-b);

// Antigravity's selection:
// Strategy: "Ensemble Multi-Sistema (Tiro Certeiro + Separação das Águas + Média 3 Otimizado + Mais Sorteadas)"
// Filter: Eliminate ball 8 (100% risk) and ball 9 (90% risk). Keep ball 7 (unanimous across 5 systems) and ball 42 (unanimous 5 systems).
// Let's take the top 21 consensus numbers:
// Unanimous (5 systems): 7, 24, 25, 33, 39, 42
// 4 systems: 6, 10, 16, 17, 21, 22, 23, 29, 32, 46, 47
// 3 systems with high momentum: 4, 13, 18, 26 (and 30, 34)
// Total 21: [4, 6, 7, 10, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 29, 32, 33, 39, 42, 46, 47]

const antigravityNumbers = [4, 6, 7, 10, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 29, 32, 33, 39, 42, 46, 47].sort((a,b)=>a-b);

const commonNumbers = pauloNumbers.filter(n => antigravityNumbers.includes(n));
const pauloExclusive = pauloNumbers.filter(n => !antigravityNumbers.includes(n));
const antigravityExclusive = antigravityNumbers.filter(n => !pauloNumbers.includes(n));

const docContent = `# 🎰 Duelo do Laboratório: Aposta para o Próximo Sorteio do Totoloto (4ª Feira)

**Documento:** \`docs/APOSTA_TOTOLOTO_PROXIMO_SORTEIO.md\`  
**Data do Registo:** 27 de Outubro de 2026  
**Concurso Alvo:** Totoloto — Quarta-feira, 28 de Outubro de 2026  
**Desafio:** Paulo Batista vs. Antigravity AI (21 Números cada)

---

## 👤 1. Seleção do Paulo (Estratégia: Separação das Águas + Corte Cirúrgico 80%)

* **Sistema Base:** *Separação das Águas* (Líder Absoluto do Radar com Score JPI 100/100, 12 traves acumuladas no ciclo atual).
* **Filtro Aplicado:** *Matriz de Corte* com Fasquia de 80% (Eliminação dos números com risco crítico $\ge 80\%$: eliminou o 3, 7, 8 e 9).
* **Os 21 Números do Paulo:**
\`\`\`
[ 02, 04, 05, 06, 11, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 30, 32, 37, 38, 39 ]
\`\`\`
* **Distribuição Estrutural:**
  * Quadrado Mágico de Marte (5x5): Âncora central no **21** (presente em 4 chaves), diagonais no **2, 4, 5, 23, 24, 26**.
  * Total de Chaves desdobradas: 12 chaves adaptativas.

---

## 🤖 2. Seleção da Antigravity (Estratégia: Ensemble Multi-Sistema & Votação Consensual)

* **Sistemas Base:** Fusão ponderada dos 4 sistemas no Sweet Spot do Totoloto:
  * *Tiro Certeiro* (Recordista de Jackpots no Totoloto com 64 prémios máximos).
  * *Separação das Águas* (Líder de Convergência JPI 100).
  * *Média 3 Otimizado* (JPI 85 com 3 traves nos últimos 5 sorteios).
  * *Mais Sorteadas de Sempre* (JPI 81).
* **Filtro Aplicado:** Corte seletivo nas bolas com 100% de risco (corte da bola 8 e bola 9), mas **preservação da bola 7** (votada unanimemente por todos os 5 sistemas) e resgate de forças exteriores (**42, 46, 47, 10, 29**).
* **Os 21 Números da Antigravity:**
\`\`\`
[ 04, 06, 07, 10, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 29, 32, 33, 39, 42, 46, 47 ]
\`\`\`

---

## ⚖️ 3. Análise Cruzada do Duelo

### 🤝 Números em Comum (${commonNumbers.length} bolas):
Ambos concordam em pleno que estas **${commonNumbers.length} bolas** têm máxima probabilidade:
\`\`\`
[ ${commonNumbers.map(n => String(n).padStart(2, '0')).join(', ')} ]
\`\`\`

### ⚔️ Onde Divergimos:
* **Exclusivos do Paulo (${pauloExclusive.length} bolas):**
  \`\`\`
  [ ${pauloExclusive.map(n => String(n).padStart(2, '0')).join(', ')} ]
  \`\`\`
  *(Foco na extremidade baixa 2, 5, 11 e na década dos 30: 27, 30, 37, 38, confiando a 100% no modelo polar puro).*

* **Exclusivos da Antigravity (${antigravityExclusive.length} bolas):**
  \`\`\`
  [ ${antigravityExclusive.map(n => String(n).padStart(2, '0')).join(', ')} ]
  \`\`\`
  *(Foco na recuperação de números em alta pressão exterior: 7, 10, 29, 33 e na família dos 40: 42, 46, 47).*

---

## 🏆 Critério de Vitória
Na 4ª feira, após o sorteio oficial do Totoloto:
1. Comparamos as 5 bolas sorteadas contra as duas listas de 21 números.
2. Quem tiver mais acertos dentro dos seus 21 ganha a primeira ronda do desafio do Laboratório!
`;

fs.writeFileSync(docPath, docContent, "utf-8");
console.log("Documento criado com sucesso em:", docPath);
