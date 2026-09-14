# Agrupamento de Padrões Estrelas (Clustering)

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Agrupamento de Padrões Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Agrupamento espacial em micro-clusters de tamanho 3 (ex: [1-3], [4-6], [7-9], [10-12], [13]). Mede a densidade de atividade de cada cluster nos últimos 20 sorteios para concentrar a previsão nas zonas espaciais de maior momento, ordenando internamente as estrelas por frequência recente e global.

## 2. Regra Canónica de Desempate
- **Ordenação dos Clusters**: Pelo número total de saídas recentes (mais ativo primeiro; empate pelo menor id do cluster).
- **Ordenação Intra-Cluster**:
  1. Frequência recente (últimos 20 sorteios).
  2. Frequência global acumulada.
  3. **Opção A** (ordem numérica estritamente crescente).

## 3. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/clustering_stars_euromillions.json
  - data/consolidated/clustering_stars_eurodreams.json
  - data/consolidated/clustering_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
