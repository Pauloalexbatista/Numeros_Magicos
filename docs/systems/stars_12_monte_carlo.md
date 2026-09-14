# Monte Carlo Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Monte Carlo Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Simulação estocástica de alta densidade através de 10.000 ensaios sintéticos por ponto temporal. A probabilidade de cada estrela é calibrada a partir de uma distribuição dinâmica que conjuga o momento recente (últimos 20 sorteios com peso 3x) e a inércia global.

## 2. Determinismo e Imutabilidade
- Utiliza um gerador pseudoaleatório (LCG) com seed estritamente vinculada à data do sorteio anterior e metadados do jogo, garantindo auditoria reprodutível bit a bit.
- Para cada uma das 10.000 iterações, são extraídas sem reposição as estrelas virtuais do jogo (2 para Euromilhões, 1 para EuroDreams e Totoloto).

## 3. Regra Canónica de Desempate
- **Critério Principal**: Número de seleções obtidas ao longo das 10.000 simulações.
- **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 4. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/monte_carlo_stars_euromillions.json
  - data/consolidated/monte_carlo_stars_eurodreams.json
  - data/consolidated/monte_carlo_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
