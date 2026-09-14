# Mais Quentes Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Mais Quentes Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Frequência pura numa janela temporal recente fixa de 20 sorteios. Avalia quais as estrelas com maior momento térmico na janela imediata.

## 2. Regra Canónica de Desempate
- **Critério Principal**: Frequência absoluta nos últimos 20 sorteios.
- **Inviolabilidade de Tiers**: Tiers de frequência mais alta têm prioridade estrita sobre tiers mais baixos.
- **Desempate Dinâmico**:
  - Se duas ou mais estrelas empatarem na janela base de 20 sorteios, expande-se a janela sucessivamente em blocos de +5 sorteios (25, 30, 35...) até desempatar.
  - Caso o empate persista até ao limite do histórico, aplica-se a **Opção A** (ordem numérica estritamente crescente).

## 3. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/mais_quentes_stars_euromillions.json
  - data/consolidated/mais_quentes_stars_eurodreams.json
  - data/consolidated/mais_quentes_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
