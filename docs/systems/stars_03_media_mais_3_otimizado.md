# Sistema Média +3 Otimizado Estrelas

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Sistema Média +3 Otimizado Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Modelagem posicional das estrelas baseada no cálculo da média aparada (excluindo extremos min e max) dos últimos 50 sorteios para cada casa/posição da chave sorteada. Em redor de cada centro médio geram-se anéis de dispersão concêntricos (tiers de 0 a 3: desvios +-0, +-1, +-2, +-3).

## 2. Estrutura de Camadas (Tiers)
- **Tier 0**: A própria média arredondada da posição.
- **Tier 1**: Média +- 1.
- **Tier 2**: Média +- 2.
- **Tier 3**: Média +- 3.
- **Tier 99**: Restantes estrelas fora do raio +-3.

## 3. Regra Canónica de Desempate
1. **Prioridade por Tier**: Menor tier (Tier 0 > Tier 1 > Tier 2 > Tier 3).
2. **Frequência Recente**: Contagem de presenças nos últimos 50 sorteios.
3. **Frequência Global**: Contagem acumulada desde o sorteio 1.
4. **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 4. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/media_3_otimizado_stars_euromillions.json
  - data/consolidated/media_3_otimizado_stars_eurodreams.json
  - data/consolidated/media_3_otimizado_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
