# Pirâmide de Pascal Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Pirâmide de Pascal Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Decomposição digital e redução em pirâmide triangular invertida. As estrelas do sorteio anterior (T-1) são desdobradas nos seus algarismos individuais. A partir dessa linha de base, geram-se sucessivas linhas convergentes somando pares vizinhos em aritmética modular 10 ((a + b) mod 10) até atingir o vértice único.

## 2. Pontuação e Desempate
- **Score da Estrela**: Soma da contagem de presenças dos seus dígitos em toda a estrutura da pirâmide.
- **Critério Principal**: Score decrescente.
- **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 3. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/piramide_pascal_stars_euromillions.json
  - data/consolidated/piramide_pascal_stars_eurodreams.json
  - data/consolidated/piramide_pascal_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
