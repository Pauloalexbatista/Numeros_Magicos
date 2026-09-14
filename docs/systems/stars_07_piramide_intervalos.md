# Pirâmide de Intervalos Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Pirâmide de Intervalos Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Modelagem de intervalos espaciais e elásticos entre estrelas.
  - Para jogos de 2 estrelas (Euromilhões): analisa os pontos de partida mais prováveis (1ª estrela) e os intervalos intra-sorteio delta = s2 - s1 com maior densidade histórica, reconstruindo os pares (s1, s1 + delta).
  - Para jogos de 1 estrela (EuroDreams e Totoloto): modela as variações temporais sucessivas |s(T-1) - s(T-2)| projetadas a partir da última estrela saída.

## 2. Regra Canónica de Desempate
- **Critério Principal**: Frequência histórica das combinações de partida e saltos elásticos.
- **Preenchimento de Suporte**: Frequência acumulada global de estrelas.
- **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 3. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/piramide_intervalos_stars_euromillions.json
  - data/consolidated/piramide_intervalos_stars_eurodreams.json
  - data/consolidated/piramide_intervalos_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
