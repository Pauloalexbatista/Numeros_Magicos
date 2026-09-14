# Últimos a Sair Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Últimos a Sair Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Inércia de curto prazo e recência estrita. O algoritmo percorre os sorteios em ordem cronológica estritamente decrescente (T-1, T-2, ...) e recolhe as estrelas na ordem cronológica exata em que foram extraídas, até perfazer exatamente o dobro do número de estrelas sorteadas.

## 2. Regra Canónica de Desempate
- **Critério Principal**: Recência cronológica estrita (menor atraso delay = maior prioridade).
- **Desempate Intra-Sorteio**: Estrelas saídas no mesmo sorteio são ordenadas de forma crescente (**Opção A**).
- **Preenchimento Inicial**: Caso o histórico não contenha estrelas suficientes, completa com estrelas remanescentes de 1 a maxStar em ordem crescente.

## 3. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/ultimos_a_sair_stars_euromillions.json
  - data/consolidated/ultimos_a_sair_stars_eurodreams.json
  - data/consolidated/ultimos_a_sair_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
