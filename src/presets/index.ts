import type { Preset } from '@/lib/types';

const FONT = 'Pretendard, system-ui, sans-serif';

// ─────────────────────────────────────────────
// 빈 프리셋 (기본값 — 흰 배경)
// ─────────────────────────────────────────────
export const BLANK_PRESET: Preset = {
  id: 'preset-blank',
  name: '빈 프리셋',
  category: 'style',
  description: '처음부터 자유롭게 디자인',
  isBlank: true,
  fontFamily: FONT,
  defaultBackground: {
    type: 'color',
    color: '#ffffff',
    pattern: 'none',
  },
  defaultLabelStyle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#8b5cf6',
    x: 0.08,
    y: 0.1,
  },
  defaultHeadlineStyle: {
    fontSize: 88,
    fontWeight: 900,
    color: '#0a0a0a',
    x: 0.08,
    y: 0.4,
    lineHeight: 1.15,
    letterSpacing: -0.03,
    maxWidth: 0.84,
  },
  defaultBodyStyle: {
    fontSize: 32,
    fontWeight: 400,
    color: '#525252',
    x: 0.08,
    y: 0.62,
    lineHeight: 1.55,
    maxWidth: 0.84,
  },
  defaultHighlightStyle: {
    fontSize: 160,
    fontWeight: 900,
    color: '#8b5cf6',
    x: 0.08,
    y: 0.35,
  },
  defaultFooterStyle: {
    fontSize: 22,
    fontWeight: 500,
    color: '#737373',
    x: 0.5,
    y: 0.94,
    align: 'center',
  },
  builtin: true,
};

// ─────────────────────────────────────────────
// 다크 프리셋 (참고용)
// ─────────────────────────────────────────────
export const DARK_PRESET: Preset = {
  id: 'preset-dark',
  name: '다크 모드',
  category: 'style',
  description: '어두운 배경 + 흰 텍스트',
  fontFamily: FONT,
  defaultBackground: {
    type: 'color',
    color: '#0a0a0a',
    pattern: 'none',
    bottomFade: true,
  },
  defaultLabelStyle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#a3e635',
    x: 0.08,
    y: 0.1,
  },
  defaultHeadlineStyle: {
    fontSize: 92,
    fontWeight: 900,
    color: '#ffffff',
    x: 0.08,
    y: 0.4,
    lineHeight: 1.1,
    letterSpacing: -0.03,
    maxWidth: 0.84,
  },
  defaultBodyStyle: {
    fontSize: 32,
    fontWeight: 400,
    color: '#d4d4d4',
    x: 0.08,
    y: 0.62,
    lineHeight: 1.55,
    maxWidth: 0.84,
  },
  defaultHighlightStyle: {
    fontSize: 160,
    fontWeight: 900,
    color: '#a3e635',
    x: 0.08,
    y: 0.35,
  },
  defaultFooterStyle: {
    fontSize: 22,
    fontWeight: 500,
    color: '#a3a3a3',
    x: 0.5,
    y: 0.94,
    align: 'center',
  },
  builtin: true,
};

// ─────────────────────────────────────────────
// 그라데이션 프리셋 (참고용)
// ─────────────────────────────────────────────
export const GRADIENT_PRESET: Preset = {
  id: 'preset-gradient',
  name: '그라데이션',
  category: 'style',
  description: '컬러 그라데이션 배경',
  fontFamily: FONT,
  defaultBackground: {
    type: 'gradient',
    color: '#7c3aed',
    colorEnd: '#4c1d95',
    pattern: 'none',
  },
  defaultLabelStyle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#ffffff',
    x: 0.08,
    y: 0.1,
  },
  defaultHeadlineStyle: {
    fontSize: 96,
    fontWeight: 900,
    color: '#ffffff',
    x: 0.08,
    y: 0.4,
    lineHeight: 1.1,
    letterSpacing: -0.03,
    maxWidth: 0.84,
  },
  defaultBodyStyle: {
    fontSize: 32,
    fontWeight: 400,
    color: '#ffffffcc',
    x: 0.08,
    y: 0.62,
    lineHeight: 1.55,
    maxWidth: 0.84,
  },
  defaultHighlightStyle: {
    fontSize: 160,
    fontWeight: 900,
    color: '#ffffff',
    x: 0.08,
    y: 0.35,
  },
  defaultFooterStyle: {
    fontSize: 22,
    fontWeight: 500,
    color: '#ffffffaa',
    x: 0.5,
    y: 0.94,
    align: 'center',
  },
  builtin: true,
};

// ─────────────────────────────────────────────
// 메시 프리셋 (참고용)
// ─────────────────────────────────────────────
export const MESH_PRESET: Preset = {
  id: 'preset-mesh',
  name: '메시',
  category: 'style',
  description: '그라데이션 메시 배경',
  fontFamily: FONT,
  defaultBackground: {
    type: 'gradient',
    color: '#1a0a2e',
    colorEnd: '#3b0764',
    pattern: 'mesh',
  },
  defaultLabelStyle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#c084fc',
    x: 0.08,
    y: 0.1,
  },
  defaultHeadlineStyle: {
    fontSize: 92,
    fontWeight: 900,
    color: '#ffffff',
    x: 0.08,
    y: 0.4,
    lineHeight: 1.1,
    maxWidth: 0.84,
  },
  defaultBodyStyle: {
    fontSize: 32,
    fontWeight: 400,
    color: '#e9d5ff',
    x: 0.08,
    y: 0.62,
    lineHeight: 1.55,
    maxWidth: 0.84,
  },
  defaultHighlightStyle: {
    fontSize: 160,
    fontWeight: 900,
    color: '#c084fc',
    x: 0.08,
    y: 0.35,
  },
  defaultFooterStyle: {
    fontSize: 22,
    fontWeight: 500,
    color: '#e9d5ffaa',
    x: 0.5,
    y: 0.94,
    align: 'center',
  },
  builtin: true,
};

// ─────────────────────────────────────────────
// 모든 내장 프리셋
// ─────────────────────────────────────────────
export const STYLE_PRESETS: Preset[] = [
  BLANK_PRESET,
  DARK_PRESET,
  GRADIENT_PRESET,
  MESH_PRESET,
];

export const INDUSTRY_PRESETS: Preset[] = [];

export const ALL_BUILTIN_PRESETS = [...STYLE_PRESETS, ...INDUSTRY_PRESETS];

export function getPresetById(id: string, customPresets: Preset[] = []): Preset {
  const found = [...ALL_BUILTIN_PRESETS, ...customPresets].find((p) => p.id === id);
  return found || BLANK_PRESET;
}