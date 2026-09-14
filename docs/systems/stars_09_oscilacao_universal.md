# Sistema Oscilação Universal Estrelas (V2)

## 1. Identificação e Alma do Sistema
- **Nome Canónico**: Oscilação Universal Estrelas
- **Domínio**: STARS
- **Espaço Numérico**:
  - **Euromilhões**: Estrelas de 1 a 12 (Sorteados: 2 -> Sugeridos: **4**)
  - **EuroDreams**: Números de Sonho de 1 a 5 (Sorteados: 1 -> Sugeridos: **2**)
  - **Totoloto**: Número da Sorte de 1 a 13 (Sorteados: 1 -> Sugeridos: **2**)
  - **Mega-Sena**: Não aplicável (0 estrelas)
- **Conceito Fundamental ( A Alma)**:
  Matemática de vórtice e redução digital contínua (raízes 1 a 9). Identifica a raiz digital dominante no sorteio anterior T-1 e aplica o princípio pendular da oscilação (regra dos 74%): a probabilidade de uma raiz dominante se repetir de imediato é substancialmente menor do que a migração do fluxo quântico para as raízes complementares não dominantes.

## 2. Mecânica de Oscilação
Para cada candidato c (1 a maxStar) com frequência recente F(c):
- Se root(c) NÃO pertence às raízes dominantes de T-1: **Boost de +50%** (Score = F(c) * 1.5).
- Se root(c) PERTENCE às raízes dominantes de T-1: **Penalização de -50%** (Score = F(c) * 0.5).

## 3. Regra Canónica de Desempate
- **Critério Principal**: Score de oscilação decrescente.
- **Desempate Final**: **Opção A** (ordem numérica estritamente crescente).

## 4. Auditoria e Cofre Estático
- **Histórico**:
  - Euromilhões: 1980 sorteios auditados
  - EuroDreams: 298 sorteios auditados
  - Totoloto: 1555 sorteios auditados
- **Ficheiros no Cofre**:
  - data/consolidated/oscilacao_universal_stars_euromillions.json
  - data/consolidated/oscilacao_universal_stars_eurodreams.json
  - data/consolidated/oscilacao_universal_stars_totoloto.json
- **Imutabilidade**: O histórico está integralmente recalculado, validado e trancado.
