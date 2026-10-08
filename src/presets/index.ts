import type { Preset, Typography, Decoration, Padding } from '@/lib/types';
import {
  CENTERED_COLORS,
  BOTTOM_FOCUS_COLORS,
  LEFT_BOLD_COLORS,
  TOP_LABEL_COLORS,
  NUMBER_FOCUS_COLORS,
  QUOTE_STYLE_COLORS,
  CARD_GRID_COLORS,
  SIDE_BAR_COLORS,
  FULL_OVERLAY_COLORS,
  MAGAZINE_COLORS,
} from './colors';

const FONT = 'Pretendard, system-ui, sans-serif';

// 기본값 (프리셋마다 override)
const baseTypo: Typography = {
  fontFamily: FONT,
  headlineWeight: 800,
  headlineSize: 96,
  bodySize: 30,
  headlineLetterSpacing: '-0.03em',
  lineHeight: 1.2,
  headlineUppercase: false,
};

const baseDeco: Decoration = {
  badgeStyle: 'pill',
  cornerRadius: 12,
  accentBar: 'none',
  backgroundPattern: 'none',
  imageTreatment: 'normal',
  shadow: false,
  topLine: false,
  bottomCircle: false,
};

// ─────────────────────────────────────────────
// 10개 프리셋 (각각 다른 레이아웃)
// ─────────────────────────────────────────────
export const STYLE_PRESETS: Preset[] = [
  // ─────────────────────────────────────
  // 1. 센터드 클래식 — 모든 텍스트 중앙 정렬
  // ─────────────────────────────────────
  {
    id: 'preset-centered',
    name: '센터드 클래식',
    category: 'style',
    description: '모든 텍스트 중앙 정렬, 미니멀',
    layout: 'centered',
    colorVariants: CENTERED_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 96,
      bodySize: 28,
      headlineLetterSpacing: '-0.02em',
      lineHeight: 1.25,
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'underline',
      cornerRadius: 0,
    },
    padding: { top: 140, right: 100, bottom: 140, left: 100 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 2. 하단 집중 — 상단 이미지, 하단 텍스트
  // ─────────────────────────────────────
  {
    id: 'preset-bottom-focus',
    name: '하단 집중',
    category: 'style',
    description: '상단 이미지 70% + 하단 텍스트 30%',
    layout: 'bottom-focus',
    colorVariants: BOTTOM_FOCUS_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 80,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'pill',
      cornerRadius: 0,
      shadow: true,
    },
    padding: { top: 900, right: 90, bottom: 100, left: 90 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 3. 좌측 정렬 볼드 — 큰 제목 좌측
  // ─────────────────────────────────────
  {
    id: 'preset-left-bold',
    name: '좌측 정렬 볼드',
    category: 'style',
    description: '큰 제목 좌측, 강렬한 임팩트',
    layout: 'left-bold',
    colorVariants: LEFT_BOLD_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 900,
      headlineSize: 110,
      bodySize: 28,
      lineHeight: 1.05,
      headlineLetterSpacing: '-0.04em',
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'square',
      cornerRadius: 4,
      shadow: true,
    },
    padding: { top: 120, right: 110, bottom: 120, left: 110 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 4. 상단 라벨 — 상단 라벨 + 중앙 제목
  // ─────────────────────────────────────
  {
    id: 'preset-top-label',
    name: '상단 라벨',
    category: 'style',
    description: '상단 라벨 + 중앙 큰 제목',
    layout: 'top-label',
    colorVariants: TOP_LABEL_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 92,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'none',
      cornerRadius: 0,
      topLine: true,
    },
    padding: { top: 130, right: 100, bottom: 130, left: 100 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 5. 숫자 강조 — 좌측 큰 숫자 + 우측 텍스트
  // ─────────────────────────────────────
  {
    id: 'preset-number-focus',
    name: '숫자 강조',
    category: 'style',
    description: '좌측 큰 숫자 (01) + 우측 텍스트',
    layout: 'number-focus',
    colorVariants: NUMBER_FOCUS_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 76,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'none',
      cornerRadius: 0,
      topLine: true,
    },
    padding: { top: 130, right: 100, bottom: 130, left: 100 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 6. 인용구 — 큰 따옴표
  // ─────────────────────────────────────
  {
    id: 'preset-quote',
    name: '인용구',
    category: 'style',
    description: '큰 따옴표 + 감성적 인용',
    layout: 'quote-style',
    colorVariants: QUOTE_STYLE_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 700,
      headlineSize: 88,
      bodySize: 30,
      lineHeight: 1.4,
      headlineLetterSpacing: '-0.01em',
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'none',
      cornerRadius: 0,
    },
    padding: { top: 200, right: 140, bottom: 200, left: 140 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 7. 그리드 카드 — 상단 이미지 + 하단 정보 박스
  // ─────────────────────────────────────
  {
    id: 'preset-card-grid',
    name: '그리드 카드',
    category: 'style',
    description: '상단 이미지 + 하단 정보 박스',
    layout: 'card-grid',
    colorVariants: CARD_GRID_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 72,
      bodySize: 26,
      lineHeight: 1.35,
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'pill',
      cornerRadius: 24,
      shadow: true,
    },
    padding: { top: 90, right: 90, bottom: 90, left: 90 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 8. 사이드 바 — 좌측 색상 바
  // ─────────────────────────────────────
  {
    id: 'preset-side-bar',
    name: '사이드 바',
    category: 'style',
    description: '좌측 색상 바 + 우측 텍스트',
    layout: 'side-bar',
    colorVariants: SIDE_BAR_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 84,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'underline',
      cornerRadius: 0,
      accentBar: 'left',
    },
    padding: { top: 140, right: 100, bottom: 140, left: 140 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 9. 이미지 오버레이 — 전체 이미지 + 하단 그라데이션
  // ─────────────────────────────────────
  {
    id: 'preset-full-overlay',
    name: '이미지 오버레이',
    category: 'style',
    description: '전체 이미지 + 하단 그라데이션 텍스트',
    layout: 'full-overlay',
    colorVariants: FULL_OVERLAY_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 92,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'pill',
      cornerRadius: 0,
    },
    padding: { top: 100, right: 90, bottom: 100, left: 90 },
    builtin: true,
  },

  // ─────────────────────────────────────
  // 10. 매거진 — 카테고리 + 큰 제목 + 컬럼
  // ─────────────────────────────────────
  {
    id: 'preset-magazine',
    name: '매거진',
    category: 'style',
    description: '카테고리 라벨 + 큰 제목 + 컬럼 레이아웃',
    layout: 'magazine',
    colorVariants: MAGAZINE_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 96,
      bodySize: 28,
      lineHeight: 1.15,
      headlineLetterSpacing: '-0.03em',
    },
    decoration: {
      ...baseDeco,
      badgeStyle: 'none',
      cornerRadius: 0,
      topLine: true,
    },
    padding: { top: 130, right: 100, bottom: 130, left: 100 },
    builtin: true,
  },
];

// ─────────────────────────────────────────────
// 업종 프리셋 — 스타일 프리셋 재활용 + 색상만 교체
// ─────────────────────────────────────────────
export const INDUSTRY_PRESETS: Preset[] = [
  {
    ...STYLE_PRESETS[4], // 숫자 강조
    id: 'ind-gov',
    name: '정부지원금',
    category: 'industry',
    description: '신뢰감 있는 블루',
    colorVariants: [
      {
        id: 'gov-blue', name: '정부 블루',
        background: '#ffffff', surface: '#eff6ff',
        text: '#0f172a', textMuted: '#64748b',
        accent: '#1d4ed8', accentSoft: '#dbeafe',
      },
      {
        id: 'gov-navy', name: '정부 네이비',
        background: '#f8fafc', surface: '#e2e8f0',
        text: '#0f172a', textMuted: '#64748b',
        accent: '#0f172a', accentSoft: '#e2e8f0',
      },
    ],
  },
  {
    ...STYLE_PRESETS[0], // 센터드
    id: 'ind-youth',
    name: '청년지원',
    category: 'industry',
    description: '희망찬 그린',
    colorVariants: [
      {
        id: 'youth-green', name: '청년 그린',
        background: '#ffffff', surface: '#ecfdf5',
        text: '#064e3b', textMuted: '#059669',
        accent: '#10b981', accentSoft: '#d1fae5',
      },
      {
        id: 'youth-mint', name: '민트',
        background: '#f0fdfa', surface: '#ccfbf1',
        text: '#134e4a', textMuted: '#0d9488',
        accent: '#14b8a6', accentSoft: '#99f6e4',
      },
    ],
  },
  {
    ...STYLE_PRESETS[2], // 좌측 볼드
    id: 'ind-finance',
    name: '재테크',
    category: 'industry',
    description: '다크 + 골드',
    colorVariants: [
      {
        id: 'gold', name: '골드',
        background: '#0f0a05', surface: '#1a140f',
        text: '#ffffff', textMuted: '#fcd34d',
        accent: '#f59e0b', accentSoft: '#451a03',
      },
      {
        id: 'finance-emerald', name: '에메랄드',
        background: '#051a0f', surface: '#0a2a1a',
        text: '#ffffff', textMuted: '#6ee7b7',
        accent: '#10b981', accentSoft: '#064e3b',
      },
    ],
  },
  {
    ...STYLE_PRESETS[8], // 이미지 오버레이
    id: 'ind-beauty',
    name: '뷰티',
    category: 'industry',
    description: '소프트 핑크',
    colorVariants: [
      {
        id: 'beauty-pink', name: '소프트 핑크',
        background: '#2a1020', surface: '#3d1a30',
        text: '#ffffff', textMuted: '#fbcfe8',
        accent: '#ec4899', accentSoft: '#831843',
      },
      {
        id: 'beauty-rose', name: '로즈',
        background: '#2a1015', surface: '#3d1a22',
        text: '#ffffff', textMuted: '#fecdd3',
        accent: '#f43f5e', accentSoft: '#881337',
      },
    ],
  },
  {
    ...STYLE_PRESETS[2], // 좌측 볼드
    id: 'ind-tech',
    name: 'IT/테크',
    category: 'industry',
    description: '다크 + 시안',
    colorVariants: [
      {
        id: 'tech-cyan', name: '테크 시안',
        background: '#020617', surface: '#0f172a',
        text: '#ffffff', textMuted: '#67e8f9',
        accent: '#06b6d4', accentSoft: '#164e63',
      },
      {
        id: 'tech-purple', name: '테크 퍼플',
        background: '#0a051a', surface: '#14082a',
        text: '#ffffff', textMuted: '#c4b5fd',
        accent: '#8b5cf6', accentSoft: '#2e1065',
      },
    ],
  },
  {
    ...STYLE_PRESETS[9], // 매거진
    id: 'ind-food',
    name: '맛집',
    category: 'industry',
    description: '따뜻한 오렌지',
    colorVariants: [
      {
        id: 'food-orange', name: '웜 오렌지',
        background: '#ea580c', backgroundEnd: '#7c2d12',
        surface: '#c2410c',
        text: '#ffffff', textMuted: '#fed7aa',
        accent: '#ffffff', accentSoft: '#7c2d12',
      },
      {
        id: 'food-red', name: '딥 레드',
        background: '#7f1d1d', backgroundEnd: '#450a0a',
        surface: '#991b1b',
        text: '#ffffff', textMuted: '#fecaca',
        accent: '#fbbf24', accentSoft: '#450a0a',
      },
    ],
  },
];

export const ALL_BUILTIN_PRESETS = [...STYLE_PRESETS, ...INDUSTRY_PRESETS];

export function getPresetById(id: string, customPresets: Preset[] = []): Preset {
  const found = [...ALL_BUILTIN_PRESETS, ...customPresets].find((p) => p.id === id);
  return found || STYLE_PRESETS[0];
}