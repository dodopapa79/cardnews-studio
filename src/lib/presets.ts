import type {
  Preset,
  PresetBlockStyles,
  BackgroundConfig,
  HeadlineStyle,
  BodyStyle,
  LabelStyle,
  HighlightStyle,
  ListStyle,
  NumberedCardStyle,
  PointBoxStyle,
  DividerStyle,
} from './types';

const FONT = 'Pretendard, system-ui, sans-serif';

// ─────────────────────────────────────────────
// 배경 프리셋
// ─────────────────────────────────────────────
export interface BgPreset {
  id: string;
  name: string;
  category: 'solid' | 'gradient' | 'pattern';
  background: Partial<BackgroundConfig>;
  isDark: boolean;
}

export const BG_PRESETS: BgPreset[] = [
  { id: 'bg-white', name: '화이트', category: 'solid', background: { type: 'color', color: '#ffffff', pattern: 'none' }, isDark: false },
  { id: 'bg-offwhite', name: '오프화이트', category: 'solid', background: { type: 'color', color: '#f5f4f0', pattern: 'none' }, isDark: false },
  { id: 'bg-cream', name: '크림', category: 'solid', background: { type: 'color', color: '#faf7f2', pattern: 'none' }, isDark: false },
  { id: 'bg-beige', name: '베이지', category: 'solid', background: { type: 'color', color: '#f0ebe1', pattern: 'none' }, isDark: false },
  { id: 'bg-lightblue', name: '라이트 블루', category: 'solid', background: { type: 'color', color: '#eff6ff', pattern: 'none' }, isDark: false },
  { id: 'bg-lightpink', name: '라이트 핑크', category: 'solid', background: { type: 'color', color: '#fef6fb', pattern: 'none' }, isDark: false },
  { id: 'bg-mint', name: '민트', category: 'solid', background: { type: 'color', color: '#f0fdfa', pattern: 'none' }, isDark: false },
  { id: 'bg-black', name: '블랙', category: 'solid', background: { type: 'color', color: '#0a0a0a', pattern: 'none' }, isDark: true },
  { id: 'bg-navy', name: '네이비', category: 'solid', background: { type: 'color', color: '#0f172a', pattern: 'none' }, isDark: true },
  { id: 'bg-burgundy', name: '버건디', category: 'solid', background: { type: 'color', color: '#450a0a', pattern: 'none' }, isDark: true },
  { id: 'bg-forest', name: '포레스트', category: 'solid', background: { type: 'color', color: '#052e16', pattern: 'none' }, isDark: true },
  { id: 'bg-purple', name: '퍼플', category: 'solid', background: { type: 'color', color: '#3b0764', pattern: 'none' }, isDark: true },
  { id: 'bg-charcoal', name: '차콜', category: 'solid', background: { type: 'color', color: '#1c1917', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-sunset', name: '선셋', category: 'gradient', background: { type: 'gradient', color: '#ea580c', colorEnd: '#7c2d12', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-ocean', name: '오션', category: 'gradient', background: { type: 'gradient', color: '#0ea5e9', colorEnd: '#1e3a8a', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-purple', name: '퍼플 그라데이션', category: 'gradient', background: { type: 'gradient', color: '#7c3aed', colorEnd: '#4c1d95', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-emerald', name: '에메랄드', category: 'gradient', background: { type: 'gradient', color: '#059669', colorEnd: '#065f46', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-rose', name: '로즈', category: 'gradient', background: { type: 'gradient', color: '#ec4899', colorEnd: '#831843', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-midnight', name: '미드나이트', category: 'gradient', background: { type: 'gradient', color: '#0a0a1a', colorEnd: '#1e1b4b', pattern: 'none' }, isDark: true },
  // 🆕 블루 메시 배경 추가
  { id: 'bg-mesh-blue-navy', name: '메시 (블루 네이비)', category: 'pattern', background: { type: 'gradient', color: '#0A1B3D', colorEnd: '#1E4FA3', pattern: 'mesh' }, isDark: true },
  { id: 'bg-grid-white', name: '격자 (화이트)', category: 'pattern', background: { type: 'color', color: '#ffffff', pattern: 'grid' }, isDark: false },
  { id: 'bg-grid-dark', name: '격자 (다크)', category: 'pattern', background: { type: 'color', color: '#0a0a0a', pattern: 'grid' }, isDark: true },
  { id: 'bg-dots-light', name: '점 (라이트)', category: 'pattern', background: { type: 'color', color: '#f5f4f0', pattern: 'dots' }, isDark: false },
  { id: 'bg-noise-cream', name: '노이즈 (크림)', category: 'pattern', background: { type: 'color', color: '#faf7f2', pattern: 'noise' }, isDark: false },
  { id: 'bg-mesh-purple', name: '메시 (퍼플)', category: 'pattern', background: { type: 'gradient', color: '#1a0a2e', colorEnd: '#3b0764', pattern: 'mesh' }, isDark: true },
  { id: 'bg-mesh-blue', name: '메시 (블루)', category: 'pattern', background: { type: 'gradient', color: '#0a1a3b', colorEnd: '#1e3a8a', pattern: 'mesh' }, isDark: true },
];

// ─────────────────────────────────────────────
// 기본 블록 스타일 헬퍼
// ─────────────────────────────────────────────
function makeHeadline(o: Partial<HeadlineStyle> = {}): HeadlineStyle {
  return {
    fontSize: 100,
    fontWeight: 900,
    color: '#0a0a0a',
    align: 'left',
    lineHeight: 1.15,
    letterSpacing: -0.03,
    ...o,
  };
}

function makeBody(o: Partial<BodyStyle> = {}): BodyStyle {
  return {
    fontSize: 52,
    fontWeight: 400,
    color: '#525252',
    align: 'left',
    lineHeight: 1.55,
    ...o,
  };
}

function makeLabel(o: Partial<LabelStyle> = {}): LabelStyle {
  return {
    fontSize: 28,
    fontWeight: 800,
    color: '#3b5bfd',
    align: 'left',
    ...o,
  };
}

function makeHighlight(o: Partial<HighlightStyle> = {}): HighlightStyle {
  return {
    fontSize: 160,
    fontWeight: 900,
    color: '#3b5bfd',
    ...o,
  };
}

function makeList(o: Partial<ListStyle> = {}): ListStyle {
  return {
    itemBg: '#ffffff',
    itemBgOpacity: 1,
    itemBorderRadius: 12,
    itemPadding: 24,
    itemGap: 16,
    numberColor: '#3b5bfd',
    numberSize: 48,
    titleSize: 36,
    titleColor: '#0a0a0a',
    descSize: 36,
    descColor: '#6b6b6b',
    ...o,
  };
}

function makeNumberedCard(o: Partial<NumberedCardStyle> = {}): NumberedCardStyle {
  return {
    cardBg: '#ffffff',
    cardBgOpacity: 1,
    cardBorderRadius: 12,
    cardPadding: 24,
    cardGap: 16,
    numberSize: 56,
    numberColor: '#3b5bfd',
    titleSize: 40,
    titleColor: '#0a0a0a',
    descSize: 38,
    descColor: '#6b6b6b',
    ...o,
  };
}

function makePointBox(o: Partial<PointBoxStyle> = {}): PointBoxStyle {
  return {
    bgColor: '#eef2ff',
    bgOpacity: 1,
    borderLeftColor: '#3b5bfd',
    borderLeftWidth: 6,
    labelColor: '#3b5bfd',
    labelSize: 24,
    textColor: '#1e293b',
    textSize: 32,
    padding: 28,
    borderRadius: 8,
    ...o,
  };
}

function makeDivider(o: Partial<DividerStyle> = {}): DividerStyle {
  return {
    color: '#d1d5db',
    thickness: 2,
    ...o,
  };
}

function makeAccentBlockStyles(
  accent: string,
  overrides: {
    headline?: Partial<HeadlineStyle>;
    body?: Partial<BodyStyle>;
    label?: Partial<LabelStyle>;
    highlight?: Partial<HighlightStyle>;
    list?: Partial<ListStyle>;
    numberedCard?: Partial<NumberedCardStyle>;
    pointBox?: Partial<PointBoxStyle>;
    divider?: Partial<DividerStyle>;
  } = {}
): PresetBlockStyles {
  return {
    headline: makeHeadline(overrides.headline),
    body: makeBody(overrides.body),
    label: makeLabel({ color: accent, ...overrides.label }),
    highlight: makeHighlight({ color: accent, ...overrides.highlight }),
    list: makeList({ numberColor: accent, ...overrides.list }),
    numberedCard: makeNumberedCard({
      numberColor: accent,
      ...overrides.numberedCard,
    }),
    pointBox: makePointBox({
      borderLeftColor: accent,
      labelColor: accent,
      ...overrides.pointBox,
    }),
    divider: makeDivider(overrides.divider),
  };
}

// ─────────────────────────────────────────────
// 프리셋 11종
// ─────────────────────────────────────────────
export const STYLE_PRESETS: Preset[] = [
  // 1. 빈 프리셋
  {
    id: 'preset-blank',
    name: '빈 프리셋',
    category: 'style',
    description: '흰 배경 · 검정 텍스트',
    isBlank: true,
    fontFamily: FONT,
    background: BG_PRESETS[0].background,
    accentColor: '#3b5bfd',
    blockStyles: makeAccentBlockStyles('#3b5bfd'),
    builtin: true,
  },

  // 2. 다크 볼드
  {
    id: 'preset-dark-bold',
    name: '다크 볼드',
    category: 'style',
    description: '검정 배경 · 네온 그린 포인트',
    fontFamily: FONT,
    background: BG_PRESETS[7].background,
    accentColor: '#a3e635',
    blockStyles: makeAccentBlockStyles('#a3e635', {
      headline: { color: '#ffffff' },
      body: { color: '#d4d4d4' },
      list: {
        itemBg: '#1a1a1a',
        titleColor: '#ffffff',
        descColor: '#a3a3a3',
      },
      numberedCard: {
        cardBg: '#1a1a1a',
        titleColor: '#ffffff',
        descColor: '#a3a3a3',
      },
      pointBox: {
        bgColor: '#1a1a1a',
        textColor: '#ffffff',
      },
      divider: { color: '#404040' },
    }),
    builtin: true,
  },

  // 3. 클로드 디자인
  {
    id: 'preset-claude',
    name: '클로드 디자인',
    category: 'style',
    description: '오프화이트 · 파란 포인트 · 미니멀',
    fontFamily: FONT,
    background: BG_PRESETS[1].background,
    accentColor: '#3b5bfd',
    blockStyles: makeAccentBlockStyles('#3b5bfd', {
      headline: { color: '#0a0a0a', fontSize: 130, fontWeight: 900 },
      body: { color: '#525252' },
      list: {
        itemBg: '#ffffff',
        titleColor: '#0a0a0a',
        descColor: '#6b6b6b',
      },
      numberedCard: {
        cardBg: '#ffffff',
        titleColor: '#0a0a0a',
        descColor: '#6b6b6b',
      },
      pointBox: {
        bgColor: '#eef2ff',
        textColor: '#1e293b',
      },
    }),
    builtin: true,
  },

  // 4. 미니멀
  {
    id: 'preset-minimal',
    name: '미니멀',
    category: 'style',
    description: '흰 배경 · 검정 · 심플',
    fontFamily: FONT,
    background: BG_PRESETS[0].background,
    accentColor: '#0a0a0a',
    blockStyles: makeAccentBlockStyles('#0a0a0a', {
      headline: { fontSize: 90, fontWeight: 800 },
      body: { color: '#525252' },
      label: {
        background: '#0a0a0a',
        backgroundOpacity: 0.08,
        padding: 10,
        borderRadius: 4,
      },
      list: {
        itemBg: '#f5f5f5',
        titleColor: '#0a0a0a',
        descColor: '#6b6b6b',
      },
      numberedCard: {
        cardBg: '#f5f5f5',
        titleColor: '#0a0a0a',
        descColor: '#6b6b6b',
      },
      pointBox: {
        bgColor: '#f5f5f5',
        textColor: '#0a0a0a',
      },
    }),
    builtin: true,
  },

  // 5. 크림
  {
    id: 'preset-cream',
    name: '크림',
    category: 'style',
    description: '크림 배경 · 브라운 포인트',
    fontFamily: FONT,
    background: BG_PRESETS[2].background,
    accentColor: '#9a3412',
    blockStyles: makeAccentBlockStyles('#9a3412', {
      headline: { color: '#0a0a0a' },
      body: { color: '#525252' },
      list: {
        itemBg: '#ffffff',
        titleColor: '#0a0a0a',
        descColor: '#6b6b6b',
      },
      numberedCard: {
        cardBg: '#ffffff',
        titleColor: '#0a0a0a',
        descColor: '#6b6b6b',
      },
      pointBox: {
        bgColor: '#fef3c7',
        textColor: '#431407',
      },
    }),
    builtin: true,
  },

  // 6. 그라데이션
  {
    id: 'preset-gradient',
    name: '그라데이션',
    category: 'style',
    description: '퍼플 그라데이션 · 흰 텍스트',
    fontFamily: FONT,
    background: BG_PRESETS[15].background,
    accentColor: '#ffffff',
    blockStyles: makeAccentBlockStyles('#ffffff', {
      headline: { color: '#ffffff' },
      body: { color: '#ddd6fe' },
      label: {
        background: '#ffffff',
        backgroundOpacity: 0.15,
        padding: 10,
        borderRadius: 999,
      },
      list: {
        itemBg: '#ffffff',
        itemBgOpacity: 0.1,
        titleColor: '#ffffff',
        descColor: '#ddd6fe',
      },
      numberedCard: {
        cardBg: '#ffffff',
        cardBgOpacity: 0.12,
        titleColor: '#ffffff',
        descColor: '#ddd6fe',
      },
      pointBox: {
        bgColor: '#ffffff',
        bgOpacity: 0.12,
        textColor: '#ffffff',
      },
      divider: { color: '#ffffff40' },
    }),
    builtin: true,
  },

  // 7. 메시 다크
  {
    id: 'preset-mesh',
    name: '메시 다크',
    category: 'style',
    description: '메시 그라데이션 · 보라 포인트',
    fontFamily: FONT,
    background: BG_PRESETS[23].background,
    accentColor: '#c084fc',
    blockStyles: makeAccentBlockStyles('#c084fc', {
      headline: { color: '#ffffff' },
      body: { color: '#e9d5ff' },
      list: {
        itemBg: '#ffffff',
        itemBgOpacity: 0.08,
        titleColor: '#ffffff',
        descColor: '#e9d5ff',
      },
      numberedCard: {
        cardBg: '#ffffff',
        cardBgOpacity: 0.08,
        titleColor: '#ffffff',
        descColor: '#e9d5ff',
      },
      pointBox: {
        bgColor: '#ffffff',
        bgOpacity: 0.08,
        textColor: '#ffffff',
      },
      divider: { color: '#ffffff30' },
    }),
    builtin: true,
  },

  // 8. 버건디
  {
    id: 'preset-burgundy',
    name: '버건디',
    category: 'style',
    description: '버건디 배경 · 골드 포인트',
    fontFamily: FONT,
    background: BG_PRESETS[9].background,
    accentColor: '#fbbf24',
    blockStyles: makeAccentBlockStyles('#fbbf24', {
      headline: { color: '#ffffff' },
      body: { color: '#fecaca' },
      list: {
        itemBg: '#ffffff',
        itemBgOpacity: 0.08,
        titleColor: '#ffffff',
        descColor: '#fecaca',
      },
      numberedCard: {
        cardBg: '#ffffff',
        cardBgOpacity: 0.08,
        titleColor: '#ffffff',
        descColor: '#fecaca',
      },
      pointBox: {
        bgColor: '#ffffff',
        bgOpacity: 0.08,
        textColor: '#ffffff',
      },
      divider: { color: '#ffffff30' },
    }),
    builtin: true,
  },

  // 9. 포레스트
  {
    id: 'preset-forest',
    name: '포레스트',
    category: 'style',
    description: '포레스트 배경 · 그린 포인트',
    fontFamily: FONT,
    background: BG_PRESETS[10].background,
    accentColor: '#34d399',
    blockStyles: makeAccentBlockStyles('#34d399', {
      headline: { color: '#ffffff' },
      body: { color: '#a7f3d0' },
      list: {
        itemBg: '#ffffff',
        itemBgOpacity: 0.08,
        titleColor: '#ffffff',
        descColor: '#a7f3d0',
      },
      numberedCard: {
        cardBg: '#ffffff',
        cardBgOpacity: 0.08,
        titleColor: '#ffffff',
        descColor: '#a7f3d0',
      },
      pointBox: {
        bgColor: '#ffffff',
        bgOpacity: 0.08,
        textColor: '#ffffff',
      },
      divider: { color: '#ffffff30' },
    }),
    builtin: true,
  },

  // 10. 라이트 블루
  {
    id: 'preset-lightblue',
    name: '라이트 블루',
    category: 'style',
    description: '연한 파랑 · 신뢰감',
    fontFamily: FONT,
    background: BG_PRESETS[4].background,
    accentColor: '#1d4ed8',
    blockStyles: makeAccentBlockStyles('#1d4ed8', {
      headline: { color: '#0f172a' },
      body: { color: '#475569' },
      list: {
        itemBg: '#ffffff',
        titleColor: '#0f172a',
        descColor: '#475569',
      },
      numberedCard: {
        cardBg: '#ffffff',
        titleColor: '#0f172a',
        descColor: '#475569',
      },
      pointBox: {
        bgColor: '#dbeafe',
        textColor: '#0f172a',
      },
    }),
    builtin: true,
  },

  // ═══════════════════════════════════
  // 11. 🆕 블루 메시 다크
  // ═══════════════════════════════════
  {
    id: 'preset-blue-mesh',
    name: '블루 메시 다크',
    category: 'style',
    description: '메시 그라데이션 · #1E4FA3 블루 포인트',
    fontFamily: FONT,
    background: {
      type: 'gradient',
      color: '#0A1B3D',
      colorEnd: '#1E4FA3',
      pattern: 'mesh',
    },
    accentColor: '#7EA6E0',
    blockStyles: makeAccentBlockStyles('#7EA6E0', {
      headline: { color: '#ffffff' },
      body: { color: '#B8CDE9' },
      label: {
        background: '#7EA6E0',
        backgroundOpacity: 0.18,
        padding: 10,
        borderRadius: 999,
      },
      list: {
        itemBg: '#7EA6E0',
        itemBgOpacity: 0.12,
        titleColor: '#ffffff',
        descColor: '#B8CDE9',
      },
      numberedCard: {
        cardBg: '#7EA6E0',
        cardBgOpacity: 0.12,
        titleColor: '#ffffff',
        descColor: '#B8CDE9',
      },
      pointBox: {
        bgColor: '#7EA6E0',
        bgOpacity: 0.12,
        borderLeftColor: '#7EA6E0',
        labelColor: '#7EA6E0',
        textColor: '#ffffff',
      },
      divider: { color: '#7EA6E040' },
    }),
    builtin: true,
  },
];

// ─────────────────────────────────────────────
// 프리셋 조회
// ─────────────────────────────────────────────
export function getPresetById(id: string, customPresets: Preset[] = []): Preset {
  const found = [...STYLE_PRESETS, ...customPresets].find((p) => p.id === id);
  return found || STYLE_PRESETS[0];
}

// ─────────────────────────────────────────────
// 프리셋 → 슬라이드 배경만 교체
// ─────────────────────────────────────────────
export function applyPresetBackground(
  slide: { background: BackgroundConfig },
  preset: Preset
): BackgroundConfig {
  const hasImage = slide.background.type === 'image' && !!slide.background.imageUrl;
  if (hasImage) {
    return {
      ...slide.background,
      color: preset.background.color ?? slide.background.color,
      colorEnd: preset.background.colorEnd ?? slide.background.colorEnd,
    };
  }
  return {
    ...slide.background,
    ...preset.background,
  };
}