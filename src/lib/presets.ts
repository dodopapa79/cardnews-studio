import type {
  Preset,
  BackgroundConfig,
  TextElementConfig,
  TextAnimation,
  Slide,
  SlideType,
} from './types';
import { createDefaultText, DEFAULT_BACKGROUND } from './types';

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
  // 밝은 단색
  { id: 'bg-white', name: '화이트', category: 'solid', background: { type: 'color', color: '#ffffff', pattern: 'none' }, isDark: false },
  { id: 'bg-offwhite', name: '오프화이트', category: 'solid', background: { type: 'color', color: '#f5f4f0', pattern: 'none' }, isDark: false },
  { id: 'bg-cream', name: '크림', category: 'solid', background: { type: 'color', color: '#faf7f2', pattern: 'none' }, isDark: false },
  { id: 'bg-beige', name: '베이지', category: 'solid', background: { type: 'color', color: '#f0ebe1', pattern: 'none' }, isDark: false },
  { id: 'bg-lightblue', name: '라이트 블루', category: 'solid', background: { type: 'color', color: '#eff6ff', pattern: 'none' }, isDark: false },
  { id: 'bg-lightpink', name: '라이트 핑크', category: 'solid', background: { type: 'color', color: '#fef6fb', pattern: 'none' }, isDark: false },
  { id: 'bg-mint', name: '민트', category: 'solid', background: { type: 'color', color: '#f0fdfa', pattern: 'none' }, isDark: false },

  // 어두운 단색
  { id: 'bg-black', name: '블랙', category: 'solid', background: { type: 'color', color: '#0a0a0a', pattern: 'none' }, isDark: true },
  { id: 'bg-navy', name: '네이비', category: 'solid', background: { type: 'color', color: '#0f172a', pattern: 'none' }, isDark: true },
  { id: 'bg-burgundy', name: '버건디', category: 'solid', background: { type: 'color', color: '#450a0a', pattern: 'none' }, isDark: true },
  { id: 'bg-forest', name: '포레스트', category: 'solid', background: { type: 'color', color: '#052e16', pattern: 'none' }, isDark: true },
  { id: 'bg-purple', name: '퍼플', category: 'solid', background: { type: 'color', color: '#3b0764', pattern: 'none' }, isDark: true },
  { id: 'bg-charcoal', name: '차콜', category: 'solid', background: { type: 'color', color: '#1c1917', pattern: 'none' }, isDark: true },

  // 그라데이션
  { id: 'bg-grad-sunset', name: '선셋', category: 'gradient', background: { type: 'gradient', color: '#ea580c', colorEnd: '#7c2d12', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-ocean', name: '오션', category: 'gradient', background: { type: 'gradient', color: '#0ea5e9', colorEnd: '#1e3a8a', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-purple', name: '퍼플 그라데이션', category: 'gradient', background: { type: 'gradient', color: '#7c3aed', colorEnd: '#4c1d95', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-emerald', name: '에메랄드', category: 'gradient', background: { type: 'gradient', color: '#059669', colorEnd: '#065f46', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-rose', name: '로즈', category: 'gradient', background: { type: 'gradient', color: '#ec4899', colorEnd: '#831843', pattern: 'none' }, isDark: true },
  { id: 'bg-grad-midnight', name: '미드나이트', category: 'gradient', background: { type: 'gradient', color: '#0a0a1a', colorEnd: '#1e1b4b', pattern: 'none' }, isDark: true },

  // 패턴
  { id: 'bg-grid-white', name: '격자 (화이트)', category: 'pattern', background: { type: 'color', color: '#ffffff', pattern: 'grid' }, isDark: false },
  { id: 'bg-grid-dark', name: '격자 (다크)', category: 'pattern', background: { type: 'color', color: '#0a0a0a', pattern: 'grid' }, isDark: true },
  { id: 'bg-dots-light', name: '점 (라이트)', category: 'pattern', background: { type: 'color', color: '#f5f4f0', pattern: 'dots' }, isDark: false },
  { id: 'bg-noise-cream', name: '노이즈 (크림)', category: 'pattern', background: { type: 'color', color: '#faf7f2', pattern: 'noise' }, isDark: false },
  { id: 'bg-mesh-purple', name: '메시 (퍼플)', category: 'pattern', background: { type: 'gradient', color: '#1a0a2e', colorEnd: '#3b0764', pattern: 'mesh' }, isDark: true },
  { id: 'bg-mesh-blue', name: '메시 (블루)', category: 'pattern', background: { type: 'gradient', color: '#0a1a3b', colorEnd: '#1e3a8a', pattern: 'mesh' }, isDark: true },
];

// ─────────────────────────────────────────────
// 스타일 프리셋
// ─────────────────────────────────────────────
export const STYLE_PRESETS: Preset[] = [
  {
    id: 'preset-blank',
    name: '빈 프리셋',
    category: 'style',
    description: '처음부터 자유롭게',
    isBlank: true,
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[0].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 700, color: '#8b5cf6', align: 'left', x: 0.08, y: 0.1, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 88, fontWeight: 900, color: '#0a0a0a', align: 'left', lineHeight: 1.15, letterSpacing: -0.03, x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#525252', align: 'left', lineHeight: 1.55, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#8b5cf6', align: 'left', x: 0.08, y: 0.35, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#737373', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-dark-bold',
    name: '다크 볼드',
    category: 'style',
    description: '검정 배경 · 큰 제목 · 하단 설명',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[7].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 800, color: '#a3e635', align: 'left', x: 0.08, y: 0.18, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 100, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.32, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#d4d4d4', align: 'left', lineHeight: 1.55, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#a3e635', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 600, color: '#a3a3a3', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-dark-label',
    name: '라벨 박스',
    category: 'style',
    description: '상단 라벨 박스 · 큰 제목',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[8].background,
    defaultLabelStyle: {
      fontSize: 28, fontWeight: 800, color: '#0f172a', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5,
      background: '#38bdf8', backgroundOpacity: 1, padding: 14, borderRadius: 999,
    },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.35, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#cbd5e1', align: 'left', lineHeight: 1.55, x: 0.08, y: 0.65, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#38bdf8', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 600, color: '#94a3b8', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-minimal',
    name: '미니멀',
    category: 'style',
    description: '흰 배경 · 좌측 정렬',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[1].background,
    defaultLabelStyle: {
      fontSize: 28, fontWeight: 800, color: '#0a0a0a', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5,
      background: '#0a0a0a', backgroundOpacity: 0.08, padding: 10, borderRadius: 4,
    },
    defaultHeadlineStyle: { fontSize: 90, fontWeight: 800, color: '#0a0a0a', align: 'left', lineHeight: 1.15, letterSpacing: -0.03, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#525252', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#0a0a0a', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#737373', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-centered',
    name: '센터드',
    category: 'style',
    description: '모든 텍스트 중앙 정렬',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[0].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 700, color: '#0a0a0a', align: 'center', x: 0.5, y: 0.18, maxWidth: 0.6 },
    defaultHeadlineStyle: { fontSize: 90, fontWeight: 900, color: '#0a0a0a', align: 'center', lineHeight: 1.2, letterSpacing: -0.03, x: 0.5, y: 0.42, maxWidth: 0.8 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#525252', align: 'center', lineHeight: 1.6, x: 0.5, y: 0.62, maxWidth: 0.8 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#0a0a0a', align: 'center', x: 0.5, y: 0.4, maxWidth: 0.8 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#737373', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-cream',
    name: '크림',
    category: 'style',
    description: '크림 배경 · 검정 제목',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[2].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 800, color: '#9a3412', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#0a0a0a', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#525252', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#9a3412', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#78716c', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-gradient',
    name: '그라데이션',
    category: 'style',
    description: '그라데이션 배경 · 흰 텍스트',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[15].background,
    defaultLabelStyle: {
      fontSize: 28, fontWeight: 800, color: '#ffffff', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5,
      background: '#ffffff', backgroundOpacity: 0.15, padding: 10, borderRadius: 999,
    },
    defaultHeadlineStyle: { fontSize: 100, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.35, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#ddd6fe', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#ffffff', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#ffffffaa', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-mesh',
    name: '메시 다크',
    category: 'style',
    description: '메시 배경 · 흰 제목',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[23].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 800, color: '#c084fc', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#e9d5ff', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#c084fc', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#e9d5ffaa', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-burgundy',
    name: '버건디',
    category: 'style',
    description: '버건디 배경 · 골드 포인트',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[9].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 800, color: '#fbbf24', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#fecaca', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#fbbf24', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#fecaca99', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-forest',
    name: '포레스트',
    category: 'style',
    description: '포레스트 배경 · 그린 포인트',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[10].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 800, color: '#34d399', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#a7f3d0', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#34d399', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#a7f3d0aa', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-lightblue',
    name: '라이트 블루',
    category: 'style',
    description: '연한 파랑 · 신뢰감',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[4].background,
    defaultLabelStyle: { fontSize: 28, fontWeight: 800, color: '#1d4ed8', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 92, fontWeight: 900, color: '#0f172a', align: 'left', lineHeight: 1.15, x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 40, fontWeight: 400, color: '#475569', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#1d4ed8', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 26, fontWeight: 500, color: '#64748b', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
];

export function getPresetById(id: string, customPresets: Preset[] = []): Preset {
  const found = [...STYLE_PRESETS, ...customPresets].find((p) => p.id === id);
  return found || STYLE_PRESETS[0];
}

// ─────────────────────────────────────────────
// 슬라이드 종류별 글자 세로 위치 (0~1)
//  - 위에서 아래로 겹치지 않도록 간격을 둔 값
//  - 같은 프리셋이라도 표지/본문/데이터/마무리 배치가 달라짐
// ─────────────────────────────────────────────
type TextKey = 'label' | 'headline' | 'body' | 'highlight' | 'footer';

const LAYOUT_Y: Record<SlideType, Partial<Record<TextKey, number>>> = {
  cover: { label: 0.12, headline: 0.3, body: 0.7, footer: 0.93 },
  point: { label: 0.1, headline: 0.22, body: 0.52, footer: 0.93 },
  data: { label: 0.1, highlight: 0.2, headline: 0.46, body: 0.66, footer: 0.93 },
  quote: { label: 0.12, headline: 0.32, body: 0.66, footer: 0.93 },
  cta: { label: 0.12, headline: 0.28, body: 0.5, footer: 0.93 },
};

function layoutY(type: SlideType | undefined, key: TextKey): number | undefined {
  const layout = LAYOUT_Y[type as SlideType] || LAYOUT_Y.point;
  return layout[key];
}

// 글자 폭 추정 (한글=1, 영문/숫자=0.6, 공백=0.4)
function widthUnits(text: string): number {
  let sum = 0;
  for (const ch of Array.from(text)) {
    if (ch === ' ') sum += 0.4;
    else if (ch === '\n') continue;
    else sum += ch.charCodeAt(0) > 255 ? 1 : 0.6;
  }
  return Math.max(sum, 1);
}

/**
 * 글자 수에 맞춰 크기를 자동 조절
 *  - highlight(큰 숫자/키워드): 한 줄에 들어가도록 줄임 (최소 56px)
 *  - headline: 너무 길 때만 최대 70%까지 줄임
 */
export function fitFontSize(
  base: number,
  text: string,
  kind: 'headline' | 'highlight'
): number {
  const lineW = 1080 * 0.84; // 카드 폭 1080 기준 글자 영역
  const units = widthUnits(text || '');
  if (kind === 'highlight') {
    return Math.max(56, Math.min(base, Math.floor(lineW / units)));
  }
  const limit = lineW * 2.7; // 제목은 3줄 이내가 보기 좋음
  if (units * base <= limit) return base;
  return Math.max(Math.round(base * 0.7), Math.floor(limit / units));
}

const ANIMATION: Record<TextKey, TextAnimation> = {
  label: 'fade-in',
  headline: 'slide-up',
  body: 'fade-in',
  highlight: 'zoom-in',
  footer: 'fade-in',
};

function styleOf(preset: Preset, key: TextKey): Partial<TextElementConfig> | undefined {
  switch (key) {
    case 'label':
      return preset.defaultLabelStyle;
    case 'headline':
      return preset.defaultHeadlineStyle;
    case 'body':
      return preset.defaultBodyStyle;
    case 'highlight':
      return preset.defaultHighlightStyle;
    default:
      return preset.defaultFooterStyle;
  }
}

// ─────────────────────────────────────────────
// 새 슬라이드의 글자 만들기 (AI 생성 직후 사용)
//  → 프리셋 스타일 + 슬라이드 종류별 위치 + 자동 크기
// ─────────────────────────────────────────────
export function buildTextsForSlide(
  type: SlideType,
  content: Partial<Record<TextKey, string | undefined>>,
  preset: Preset
): Slide['texts'] {
  const make = (key: TextKey): TextElementConfig | undefined => {
    const text = content[key];
    if (!text) return undefined;
    const style: Partial<TextElementConfig> = { ...(styleOf(preset, key) || {}) };
    const y = layoutY(type, key);
    if (y !== undefined) style.y = y;
    if ((key === 'headline' || key === 'highlight') && style.fontSize) {
      style.fontSize = fitFontSize(style.fontSize, text, key);
    }
    return createDefaultText(text, { ...style, animation: ANIMATION[key] });
  };

  return {
    label: make('label'),
    headline: make('headline'),
    body: make('body'),
    highlight: type === 'data' ? make('highlight') : undefined,
    footer: make('footer'),
  };
}

// 새 슬라이드의 기본 배경 (프리셋 배경)
export function buildBackgroundForPreset(preset: Preset): BackgroundConfig {
  return {
    ...DEFAULT_BACKGROUND,
    ...(preset.defaultBackground || {}),
  } as BackgroundConfig;
}

// ─────────────────────────────────────────────
// 프리셋 → 슬라이드 적용 (값 복사)
//  - 배경 이미지가 있으면 이미지와 배치 설정은 그대로 유지
//  - 글자 위치는 슬라이드 종류별 배치를 따름
// ─────────────────────────────────────────────
export function applyPresetToSlide(slide: Slide, preset: Preset): Slide {
  const presetBg = preset.defaultBackground || {};
  const hasImage = slide.background.type === 'image' && !!slide.background.imageUrl;

  const newBg: BackgroundConfig = hasImage
    ? {
        ...slide.background,
        // 이미지는 유지하고, 이미지 주변(페이드)에 쓰이는 색만 프리셋 색으로
        color: presetBg.color ?? slide.background.color,
        colorEnd: presetBg.colorEnd ?? slide.background.colorEnd,
      }
    : {
        ...slide.background,
        ...presetBg,
      };

  const applyText = (
    key: TextKey,
    existing: TextElementConfig | undefined
  ): TextElementConfig | undefined => {
    const presetStyle = styleOf(preset, key);
    if (!presetStyle) return existing;

    const style: Partial<TextElementConfig> = { ...presetStyle };
    const y = layoutY(slide.type, key);
    if (y !== undefined) style.y = y;

    if (!existing) return createDefaultText('', style);

    const merged = { ...existing, ...style };
    if (key === 'headline' || key === 'highlight') {
      merged.fontSize = fitFontSize(merged.fontSize, merged.content, key);
    }
    return merged;
  };

  return {
    ...slide,
    background: newBg,
    texts: {
      label: applyText('label', slide.texts.label),
      headline: applyText('headline', slide.texts.headline),
      body: applyText('body', slide.texts.body),
      highlight: applyText('highlight', slide.texts.highlight),
      footer: applyText('footer', slide.texts.footer),
    },
  };
}

export function applyPresetToAllSlides(slides: Slide[], preset: Preset): Slide[] {
  return slides.map((s) => applyPresetToSlide(s, preset));
}
