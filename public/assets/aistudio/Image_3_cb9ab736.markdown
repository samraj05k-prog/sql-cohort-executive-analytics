---
name: Obsidian Executive Pulse
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c1c7d3'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#8b919d'
  outline-variant: '#414751'
  surface-tint: '#a4c9ff'
  primary: '#a4c9ff'
  on-primary: '#00315d'
  primary-container: '#60a5fa'
  on-primary-container: '#003a6b'
  inverse-primary: '#0060ac'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#b090ff'
  on-tertiary-container: '#4600a7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-md:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Geist
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
  metric-num-xl:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  metric-num-md:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
spacing:
  gutter: 0.75rem
  gutter-md: 1rem
  margin: 1rem
  margin-md: 1.5rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
  space-2xl: 1.5rem
---

## Brand & Style

This design system targets enterprise operators, executive revenue teams, and quantitative strategists who demand instantaneous data ingestion without decorative friction. The brand aesthetic merges the intellectual depth of dark academia with the technical precision of an obsidian flight deck. It prioritizes ultra-high information density, crisp telemetry, and brutalist structural economy.

The emotional impression is authoritative, unyielding, and razor-sharp. Interactions rely on cold, machined geometry: absolute zero border radii, hairline dividers, subtle inner atmospheric glows, and monospace telemetry cues. The system treats analytical density as a luxury, presenting cohort matrices, retention curves, and revenue velocity in an uncompromising command-console format.

## Colors

The palette establishes an ultra-deep obsidian baseline where light is emitted, not reflected. Contrast is strictly engineered for low-fatigue, round-the-clock decision-making:

- **Canvas & Surface Hierarchy:**
  - Base Obsidian Canvas: `#090D16`
  - Structural Surface Layer: `#111827`
  - Interactive / Hover Elevated Surface: `#1F2937`
  - Hairline Frame & Divider Borders: `#1F2937` (subtle) to `#374151` (structural framing)

- **Text & Visual Clarity:**
  - Dominant Metric / Primary Text: `#F9FAFB`
  - Dimension Labels / Secondary Text: `#9CA3AF`
  - Contextual Metadata / Muted Text: `#6B7280`

- **Functional Signal Spectrum:**
  - **Electric Blue (`#60A5FA`):** Used as the primary system signal for rankings, active filters, cohort tracking vectors, and primary selections.
  - **Emerald Green (`#10B981`):** Net positive MRR delta, expansion revenue, cohort gains, and confirmed retention benchmarks.
  - **Tier 1 Purple (`#8B5CF6`):** Enterprise cohort tiers, high-LTV account segments, and prioritized executive signals.
  - **Amber (`#F59E0B`):** At-risk retention thresholds, churn warnings, Tier 2 mid-market classifications, and pending reconciliations.

## Typography

Typography functions as a precision instrument. `Space Grotesk` governs the macro structure, lending architectural rigidity, geometric authority, and sharp terminal angles to section headers, KPIs, and card anchors.

`Geist` delivers data readability across tabular cohort cells, navigation hierarchies, and dense metadata fields. Data metrics and numerical visualizations must enforce tabular figures (`tnum`) and slashed zeros (`zero`) through OpenType font features to ensure column integrity in multi-row cohort comparisons. Labels use uppercase styling with expanded letter spacing to act as micro-structural dividers.

## Layout & Spacing

This design system implements an ultra-dense, 12-column fluid grid calibrated for zero-waste dashboard telemetry. The viewport is pinned to maximum visibility with minimal dead canvas.

- **Breakpoints & Fluid Adaptability:**
  - **Desktop (HM
N���L�X��[[�ܚYK�\�[X�[��\�X\��[�\�[X��[[��]\�ˈY]�X��[��[���ܝX]�X�\�\�^H�[ܚ^�۝[\��^\��]�]�\�X�[�ܛ���H
��X�]
͎HM�\
N����X��[[�ܚY\�[X�[��\�X\��[���\�[X�]\�ˈX�\��Y��ܚ^�۝[H[��YXY\�[�\��]ܛ���X^\��ܛ�[�˂�H
��[ؚ[H
͎
N����X��[[�܈�[��K\�X��[�X\����\�[XX\��[����\�[X�]\�ˈZXܛ�[Y]�X���ۙ[��H[��X[\�][[Y]�H[�[˂���\�X�[�Y[��H�[Y\�ۈH��X��X�YܚY
�X�K^���Y��X�KL�
K�Y�Y[��]H]HX�\��ۜ��Z[��[�\�X�[Y[������\�[X�X\�[�YZ[��]X\���\�X�H��ܝ�X�\��][�[�^X�]]�I���[X\�H�Y]�ܝ�����[]�][ۈ	�\��[]�][ۈ\�X�Y]�Y��Y�\��]X�\�[^Y\�[��[�Z\�[�H��[�\�Y\��]\�[�Y��\�H���Y��ˈH\�Yۈ�\�[H�Z�X��\�X�[���Y���[��]�܈و[Z[���]H�X��[��[�ܚ\���X�\�[�ܙ\�΂��H
��]�[
�[��\��\�JN���[��Y]�LM���X��ܛ�[��\��X�H�܈H�\�[H�Y]�ܝ��H
��]�[H
�\�	�[�[H[����\�\�N����\�H�[�LLN���ܙ\�Y�]H\��Y�[Hو�Q��L����H
��]�[�
X�]�K[]�]Y܈ݙ\��\��X�\�N����X��ܛ�[��Q��L���ܙ\��Y������MLX��[�[[Z[�]Y�H���\�܈X�]�HY]�X���\���Z[�[�[��\�Z\�[�HY�H��Έ[��]\�ؘJM�M�K�L�
X��H
��]�[�
��][��ݙ\�^\��[�]�	���\�N����X��ܛ�[��LLN���ܙ\�Y�H\��Y���MLX��\[Y[�Y�HH\�X�[ۘ[[�K]Y��Y�ΈM��ؘJ�
X���][��\�X��\�X[Y\�\��H][^�\��X�H[�X\�ܘYY[��
K�ˋ�LLN���[��][ۚ[����LML�]HN0��X�܊H�[��܈�ZX]�HY]�X�[�[˂�����\\�H�[�Y]�X���[Y]�ܚ�[��ܘ�\�[�X���]H�Y]\�وXܛ���]�\�H[�\��X�H\�Y�X���\���]ۜ���ܝ�[�[�]�Y[��Y�\�[�[�[�Y]�\�H�ܛYY�]�^�܋\�\�ܝ��ۘ[�X�\�[ۋ����ܛ�\��\�H\��Y�X[��\ˈ]�Y\��\�H��ZY�\[�\��[��[��Y�K]�YY�K�[�H��[ۈو�ٝ�\��\��\X�Y�]X][X]X�[^X��\���Z[��ܘ�[��H][��\�Hو[�[[]]X�KZ[]\�KYܘYH�[�[��X[[�[Y�[��H�][ۋ�������\ۙ[������]ۜ�	��Y��\�[[Y[�H
���[X\�N�����Y͌MQ�X�[^�LM�[��Z\��[ZKX��\\��\�K�Y]\ˈݙ\��]H�[��][ۜ��[��L��Q��X�]�H�]H�Y���ܙ\��\[��]��PQ�X��H
���X�ۙ\�H�X�[ۘX�N����[��\�[��[\��Y���MLX�ܙ\�^юQ�Q���ݙ\��Y��\���[�Q��L���]�ܙ\�͌MQ�X��H
��[��]HY\�����\�X�[Y[�����\�[Xܚ^�۝[Y[����\�[X�������Y�\�	��Yۘ[[�X�]ܜH[��\�Y[�H\��Y��[YH�][�[�K\�X�H[�Y�[
L	X[Hو�Yۘ[��܊K��H�X]\�\�HXY[����]X\�H���[��[�X�]܈�
�ܙ\�\�Y]\Έ
H�]HZXܛ���\�Y��X]�[��H�Yۘ[��HܙY[�
^[��[ۋ�X[JN��L�NX��]��\�Y�Έ��L�NX��H�YH
��ܝ\��]
N�͌MQ�X��]��\�Y�Έ�͌MQ�X��H\�H
[�\��\�HY\�JN���Pэ���]��\�Y�Έ���Pэ���H[X�\�
�][�[ۈ�\���\��N�эNQL���]��\�Y�Έ�эNQL�������^X�]]�H[�[]X���\�H[����Y�]H\��Y�ܙ\�
�Q��L��
K�X��ܛ�[��LLN����H�Y�H[��ܜܘ]\�[��[ۘ[��[��[ۘ[X��[��Z[�Y�X�[��H�]Y�ܞH�]\˂�HY[��\���\X����\�[X[�\��[Y[���܈]H[��]K��H�\�]\��[�\�[�X�[\�X\\��\�H�X��[���]�P�L�Q��Y]�X��\�^H�XHY]�X�[�[K^[�юQ�Q��������X�[\���ܝX]�X�\HXY\��[Έ�LLN���X��ܛ�[�\��Y�Q��L�����H�ܙ\�X�[\�X\\��\�H^[�͐�̎��H]H�[Έ��X��Y]\�[ۛ��X�YX�[\��Y�\�\��^Y��[[��Y˂�H�][�[ۈX]X\�[Y\Έ[�[ZX�[H[�Y�X��ܛ�[�^Y\��\�[��͌MQ�X܈�L�NX]\�ܙ]H�X�]H�\�
IXMIX�	XL	X	X
K�]^�Y�[��[�[ZX�[H�]�Y[��P�L�Q�[�юQ�Q���\�Yۈ�X��ܛ�[�[Z[���]K��H���ݙ\���Q��L��Xܛ���[[��Y[YK\�\�[˂������ܛH[�]�	��[X�ܜH�X��ܛ�[���LM�\��Y�ܙ\��Q��L����H���\�Y�]N�\��Y͌MQ�X�][�[��\�\���[�K��H^�юQ�Q��X�Z�\�͐�̎�ZY��ۜ��Z[�Y�̜�܈Y�Y[��]H^[�]˂������X�؛�\�	��Y�Y[����\H�X�؛�\ΈM�\��]X\�\�
�Y]\�K\��Y���MLX�X��[���[���Y͌MQ�X�][�؜�YX[�ܛ���Z\�܈�]X\�HX�˂�H�Y�Y[���]�\�Έ[����Y[�X\��Z[
�LM�
H�]�Y�Y[�Y][\�ۘ\Y�\�Y�Z[��XX��\��X�]�H�Y�Y[�\�Y�Y�Y�]�Q��L���[[�H\��Y͌MQ�X���H�ܙ\�