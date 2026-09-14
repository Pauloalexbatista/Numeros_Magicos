# Transições de Markov Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Transições de Markov Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Modelação probabilística condicional de primeira ordem através de uma matriz de transição estocástica M_{i, j}. Mede com que frequência uma estrela j é sorteada imediatamente a seguir à ocorrência de uma estrela i. Para prever o sorteio T, avalia o vetor condicional projetado a partir de todas as estrelas do sorteio anterior T-1.

## 2. Pontuação e Regra Canónica de Desempate
- **Score(j)**: Soma de transições M_{i, j} para cada estrela i saída no sorteio T-1.
- **1º Desempate**: Frequência acumulada global da estrela j.
- **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 3. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/markov_stars_euromillions.json
  - data/consolidated/markov_stars_eurodreams.json
  - data/consolidated/markov_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
