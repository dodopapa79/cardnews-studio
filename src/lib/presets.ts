import type {
  Preset,
  BackgroundConfig,
  TextElementConfig,
  Slide,
} from './types';
import { createDefaultText } from './types';

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
    defaultLabelStyle: { fontSize: 22, fontWeight: 700, color: '#8b5cf6', align: 'left', x: 0.08, y: 0.1, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 88, fontWeight: 900, color: '#0a0a0a', align: 'left', lineHeight: 1.15, letterSpacing: -0.03, x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 32, fontWeight: 400, color: '#525252', align: 'left', lineHeight: 1.55, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#8b5cf6', align: 'left', x: 0.08, y: 0.35, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#737373', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-dark-bold',
    name: '다크 볼드',
    category: 'style',
    description: '검정 배경 · 큰 제목 · 하단 설명',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[7].background,
    defaultLabelStyle: { fontSize: 20, fontWeight: 800, color: '#a3e635', align: 'left', x: 0.08, y: 0.18, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 100, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.32, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 34, fontWeight: 400, color: '#d4d4d4', align: 'left', lineHeight: 1.55, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#a3e635', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 600, color: '#a3a3a3', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
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
      fontSize: 22, fontWeight: 800, color: '#0f172a', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5,
      background: '#38bdf8', backgroundOpacity: 1, padding: 14, borderRadius: 999,
    },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.35, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 32, fontWeight: 400, color: '#cbd5e1', align: 'left', lineHeight: 1.55, x: 0.08, y: 0.65, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#38bdf8', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 600, color: '#94a3b8', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
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
      fontSize: 20, fontWeight: 800, color: '#0a0a0a', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5,
      background: '#0a0a0a', backgroundOpacity: 0.08, padding: 10, borderRadius: 4,
    },
    defaultHeadlineStyle: { fontSize: 90, fontWeight: 800, color: '#0a0a0a', align: 'left', lineHeight: 1.15, letterSpacing: -0.03, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 30, fontWeight: 400, color: '#525252', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#0a0a0a', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#737373', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-centered',
    name: '센터드',
    category: 'style',
    description: '모든 텍스트 중앙 정렬',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[0].background,
    defaultLabelStyle: { fontSize: 20, fontWeight: 700, color: '#0a0a0a', align: 'center', x: 0.5, y: 0.18, maxWidth: 0.6 },
    defaultHeadlineStyle: { fontSize: 90, fontWeight: 900, color: '#0a0a0a', align: 'center', lineHeight: 1.2, letterSpacing: -0.03, x: 0.5, y: 0.42, maxWidth: 0.8 },
    defaultBodyStyle: { fontSize: 30, fontWeight: 400, color: '#525252', align: 'center', lineHeight: 1.6, x: 0.5, y: 0.62, maxWidth: 0.8 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#0a0a0a', align: 'center', x: 0.5, y: 0.4, maxWidth: 0.8 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#737373', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-cream',
    name: '크림',
    category: 'style',
    description: '크림 배경 · 검정 제목',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[2].background,
    defaultLabelStyle: { fontSize: 20, fontWeight: 800, color: '#9a3412', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#0a0a0a', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 30, fontWeight: 400, color: '#525252', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#9a3412', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#78716c', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
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
      fontSize: 20, fontWeight: 800, color: '#ffffff', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5,
      background: '#ffffff', backgroundOpacity: 0.15, padding: 10, borderRadius: 999,
    },
    defaultHeadlineStyle: { fontSize: 100, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, letterSpacing: -0.03, x: 0.08, y: 0.35, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 32, fontWeight: 400, color: '#ddd6fe', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.62, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#ffffff', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#ffffffaa', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-mesh',
    name: '메시 다크',
    category: 'style',
    description: '메시 배경 · 흰 제목',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[23].background,
    defaultLabelStyle: { fontSize: 20, fontWeight: 800, color: '#c084fc', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 30, fontWeight: 400, color: '#e9d5ff', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#c084fc', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#e9d5ffaa', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-burgundy',
    name: '버건디',
    category: 'style',
    description: '버건디 배경 · 골드 포인트',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[9].background,
    defaultLabelStyle: { fontSize: 20, fontWeight: 800, color: '#fbbf24', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 30, fontWeight: 400, color: '#fecaca', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#fbbf24', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#fecaca99', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-forest',
    name: '포레스트',
    category: 'style',
    description: '포레스트 배경 · 그린 포인트',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[10].background,
    defaultLabelStyle: { fontSize: 20, fontWeight: 800, color: '#34d399', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 96, fontWeight: 900, color: '#ffffff', align: 'left', lineHeight: 1.1, x: 0.08, y: 0.38, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 30, fontWeight: 400, color: '#a7f3d0', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#34d399', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#a7f3d0aa', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
  {
    id: 'preset-lightblue',
    name: '라이트 블루',
    category: 'style',
    description: '연한 파랑 · 신뢰감',
    fontFamily: FONT,
    defaultBackground: BG_PRESETS[4].background,
    defaultLabelStyle: { fontSize: 20, fontWeight: 800, color: '#1d4ed8', align: 'left', x: 0.08, y: 0.15, maxWidth: 0.5 },
    defaultHeadlineStyle: { fontSize: 92, fontWeight: 900, color: '#0f172a', align: 'left', lineHeight: 1.15, x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultBodyStyle: { fontSize: 30, fontWeight: 400, color: '#475569', align: 'left', lineHeight: 1.6, x: 0.08, y: 0.64, maxWidth: 0.84 },
    defaultHighlightStyle: { fontSize: 160, fontWeight: 900, color: '#1d4ed8', align: 'left', x: 0.08, y: 0.4, maxWidth: 0.84 },
    defaultFooterStyle: { fontSize: 22, fontWeight: 500, color: '#64748b', align: 'center', x: 0.5, y: 0.93, maxWidth: 0.8 },
    builtin: true,
  },
];

export function getPresetById(id: string, customPresets: Preset[] = []): Preset {
  const found = [...STYLE_PRESETS, ...customPresets].find((p) => p.id === id);
  return found || STYLE_PRESETS[0];
}

// ─────────────────────────────────────────────
// 프리셋 → 슬라이드 적용 (값 복사)
// ─────────────────────────────────────────────
export function applyPresetToSlide(slide: Slide, preset: Preset): Slide {
  const newBg: BackgroundConfig = {
    ...slide.background,
    ...(preset.defaultBackground || {}),
  };

  const applyText = (
    existing: TextElementConfig | undefined,
    presetStyle: Partial<TextElementConfig> | undefined
  ): TextElementConfig | undefined => {
    if (!presetStyle) return existing;
    if (!existing) return createDefaultText('', presetStyle);
    return { ...existing, ...presetStyle };
  };

  return {
    ...slide,
    background: newBg,
    texts: {
      label: applyText(slide.texts.label, preset.defaultLabelStyle),
      headline: applyText(slide.texts.headline, preset.defaultHeadlineStyle),
      body: applyText(slide.texts.body, preset.defaultBodyStyle),
      highlight: applyText(slide.texts.highlight, preset.defaultHighlightStyle),
      footer: applyText(slide.texts.footer, preset.defaultFooterStyle),
    },
  };
}

export function applyPresetToAllSlides(slides: Slide[], preset: Preset): Slide[] {
  return slides.map((s) => applyPresetToSlide(s, preset));
}