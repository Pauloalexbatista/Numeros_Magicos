# Diagonais da Matriz Estrelas (2D)

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Diagonais da Matriz Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Modelar as estrelas e números complementares como uma grelha temporal planar, onde a evolução dos sorteios recentes projeta vetores diagonais geométricos de propagação. Para cada número candidato n, traçam-se duas diagonais no espaço passado até uma profundidade de 50 sorteios:
  1. Diagonal descendente esquerda: (d, n - (d - 1))
  2. Diagonal descendente direita: (d, n + (d - 1))

## 2. Formulação Matemática
Score(n) = contagem de presenças nas posições diagonais com atraso d (1 a 50) à esquerda e à direita.

## 3. Regra Canónica de Desempate
- **Critério Principal**: Score(n) decrescente.
- **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 4. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/diagonais_matriz_stars_euromillions.json
  - data/consolidated/diagonais_matriz_stars_eurodreams.json
  - data/consolidated/diagonais_matriz_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado pelo watchdog e trancado.
