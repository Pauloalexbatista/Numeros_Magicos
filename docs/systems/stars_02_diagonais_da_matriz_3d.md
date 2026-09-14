# Diagonais da Matriz 3D Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Diagonais da Matriz 3D Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Evolução tridimensional do algoritmo de diagonais que assume uma topologia cilíndrica/toroidal fechada. Em vez de interromper o rastreio nas fronteiras do espaço numérico (1 e maxStar), as diagonais dão a volta contínua (wrap-around através de aritmética modular) e propagam-se por toda a extensão temporal do histórico completo do jogo.

## 2. Formulação Matemática
Para cada candidato n (1 a maxStar) e para cada atraso temporal d (1 a totalHistory):
- Coluna esquerda: ((n - d mod maxStar) + maxStar) mod maxStar + 1
- Coluna direita: (n + d - 2 mod maxStar) + 1
Score(n) = soma de presenças registadas ao longo de ambos os vetores helicoidais.

## 3. Regra Canónica de Desempate
- **Critério Principal**: Score(n) decrescente.
- **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 4. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/diagonais_matriz_3d_stars_euromillions.json
  - data/consolidated/diagonais_matriz_3d_stars_eurodreams.json
  - data/consolidated/diagonais_matriz_3d_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado pelo watchdog e trancado.
