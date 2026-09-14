# Repositório de Especificações de Sistemas ("A Alma dos Sistemas")

Este diretório contém a documentação canónica e a especificação matemática de cada sistema preditivo da plataforma **Números Mágicos**.

> [!IMPORTANT]
> **REGRA DE OURO PARA AGENTES E DESENVOLVEDORES**:
> Antes de alterar qualquer linha de código ou algoritmo num sistema, é **obrigatório** ler o documento de especificação correspondente nesta pasta. O algoritmo em código deve ser um espelho exato do documento canónico.
> 
> **PRINCÍPIO DA IMUTABILIDADE ABSOLUTA**:
> Os cálculos históricos de previsões, uma vez validados e arquivados no cofre consolidado (`data/consolidated/`), ficam **trancados para sempre**. Rotinas automáticas ou cron jobs só podem acrescentar o sorteio novo mais recente.

## Sistemas de Números (Base Systems)

Todos os 10 sistemas canónicos de números foram rigorosamente especificados, protegidos contra inversões temporais, recalculados em todos os sorteios históricos dos 4 jogos na VPS, auditados a 100% pelo Watchdog e arquivados no cofre.

| Nº | Ficheiro | Sistema | Descrição / Alma | Estado |
| :---: | :--- | :--- | :--- | :---: |
| 01 | [01_diagonais_da_matriz.md](./01_diagonais_da_matriz.md) | **Diagonais da Matriz** | O sistema fundador em Excel (fluxos diagonais em V com limite 50) | 🟢 Canónico |
| 02 | [02_diagonais_da_matriz_3d.md](./02_diagonais_da_matriz_3d.md) | **Diagonais da Matriz 3D** | Fluxo tubular cilíndrico contínuo (wrap-around completo desde o 1º sorteio) | 🟢 Canónico |
| 03 | [03_media_mais_3_otimizado.md](./03_media_mais_3_otimizado.md) | **Sistema Média +3 Otimizado** | Tendência central posicional por casas (médias inteiras + vizinhos concêntricos) | 🟢 Canónico |
| 04 | [04_ultimos_a_sair.md](./04_ultimos_a_sair.md) | **Últimos a Sair** | Recência temporal pura / Ordem cronológica reversa até cobrir o volante | 🟢 Canónico |
| 05 | [05_mais_quentes.md](./05_mais_quentes.md) | **Mais Quentes** | Frequência recente (últimos 20) com inviolabilidade de escalão e expansão temporal | 🟢 Canónico |
| 06 | [06_piramide_pascal.md](./06_piramide_pascal.md) | **Pirâmide de Pascal** | Funil de convergência temporal e vórtice 3-6-9 (Pascal / Tesla) | 🟢 Canónico |
| 07 | [07_piramide_intervalos.md](./07_piramide_intervalos.md) | **Pirâmide de Intervalos** | Pirâmide de diferenças absolutas e projeção harmónica de saltos elásticos | 🟢 Canónico |
| 08 | [08_transicoes_markov.md](./08_transicoes_markov.md) | **Transições de Markov** | Cadeias estocásticas de probabilidade condicional de transição $P(Y \mid X)$ | 🟢 Canónico |
| 09 | [09_oscilacao_universal.md](./09_oscilacao_universal.md) | **Sistema Oscilação Universal V2** | Raízes digitais (Tesla), famílias do vórtice e regra de alternância (+50% / -50%) | 🟢 Canónico |
| 10 | [10_mais_sorteadas_sempre.md](./10_mais_sorteadas_sempre.md) | **Mais Sorteadas de Sempre** | Frequência acumulada absoluta desde o concurso nº 1 com desempate recente | 🟢 Canónico |
| 11 | [11_clustering.md](./11_clustering.md) | **Agrupamento de Padrões (Clustering)**| Análise de densidade espacial por dezenas nos últimos 50 sorteios | 🟢 Canónico |
| 12 | [12_monte_carlo.md](./12_monte_carlo.md) | **Monte Carlo** | 10.000 simulações virtuais estocásticas determinísticas com Seeded RNG | 🟢 Canónico |

*(Nota: O sistema "Mais Atrasados" foi oficialmente extinto por redundância direta, dado que a sua função é assumida com rigor matemático absoluto pelo Anti-Sistema / Espelho do "Últimos a Sair").*
