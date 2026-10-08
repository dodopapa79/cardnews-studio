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
  BLANK_COLORS,
} from './colors';

const FONT = 'Pretendard, system-ui, sans-serif';

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
// 스타일 프리셋 11종 (빈 템플릿 포함)
// ─────────────────────────────────────────────
export const STYLE_PRESETS: Preset[] = [
  // 0. 빈 템플릿
  {
    id: 'preset-blank',
    name: '빈 템플릿',
    category: 'style',
    description: '처음부터 자유롭게 디자인',
    layout: 'blank',
    colorVariants: BLANK_COLORS,
    typography: {
      ...baseTypo,
      headlineSize: 96,
      bodySize: 30,
    },
    decoration: { ...baseDeco, badgeStyle: 'none' },
    padding: { top: 100, right: 100, bottom: 120, left: 100 },
    positions: {
      headline: { x: 0.5, y: 0.35 },
      body: { x: 0.5, y: 0.6 },
      badge: { x: 0.5, y: 0.15 },
      label: { x: 0.5, y: 0.1 },
    },
    builtin: true,
  },

  // 1. 센터드 클래식
  {
    id: 'preset-centered',
    name: '센터드 클래식',
    category: 'style',
    description: '모든 텍스트 중앙 정렬',
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
    decoration: { ...baseDeco, badgeStyle: 'underline', cornerRadius: 0 },
    padding: { top: 140, right: 100, bottom: 140, left: 100 },
    positions: {
      headline: { x: 0.5, y: 0.42 },
      body: { x: 0.5, y: 0.62 },
      badge: { x: 0.5, y: 0.2 },
    },
    builtin: true,
  },

  // 2. 하단 집중
  {
    id: 'preset-bottom-focus',
    name: '하단 집중',
    category: 'style',
    description: '상단 이미지 + 하단 텍스트',
    layout: 'bottom-focus',
    colorVariants: BOTTOM_FOCUS_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 80,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: { ...baseDeco, badgeStyle: 'pill', cornerRadius: 0, shadow: true },
    padding: { top: 900, right: 90, bottom: 100, left: 90 },
    positions: {
      headline: { x: 0.08, y: 0.68 },
      body: { x: 0.08, y: 0.82 },
      badge: { x: 0.08, y: 0.58 },
    },
    builtin: true,
  },

  // 3. 좌측 정렬 볼드
  {
    id: 'preset-left-bold',
    name: '좌측 정렬 볼드',
    category: 'style',
    description: '좌측 큰 제목',
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
    decoration: { ...baseDeco, badgeStyle: 'square', cornerRadius: 4, shadow: true },
    padding: { top: 120, right: 110, bottom: 120, left: 110 },
    positions: {
      headline: { x: 0.1, y: 0.4 },
      body: { x: 0.1, y: 0.7 },
      badge: { x: 0.1, y: 0.2 },
    },
    builtin: true,
  },

  // 4. 상단 라벨
  {
    id: 'preset-top-label',
    name: '상단 라벨',
    category: 'style',
    description: '상단 라벨 + 중앙 제목',
    layout: 'top-label',
    colorVariants: TOP_LABEL_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 92,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: { ...baseDeco, badgeStyle: 'none', topLine: true },
    padding: { top: 130, right: 100, bottom: 130, left: 100 },
    positions: {
      label: { x: 0.1, y: 0.12 },
      headline: { x: 0.1, y: 0.45 },
      body: { x: 0.1, y: 0.72 },
    },
    builtin: true,
  },

  // 5. 숫자 강조
  {
    id: 'preset-number-focus',
    name: '숫자 강조',
    category: 'style',
    description: '좌측 큰 숫자 + 우측 텍스트',
    layout: 'number-focus',
    colorVariants: NUMBER_FOCUS_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 76,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: { ...baseDeco, badgeStyle: 'none', topLine: true },
    padding: { top: 130, right: 100, bottom: 130, left: 100 },
    positions: {
      label: { x: 0.1, y: 0.15 },
      highlight: { x: 0.1, y: 0.4 },
      headline: { x: 0.42, y: 0.4 },
      body: { x: 0.42, y: 0.65 },
    },
    builtin: true,
  },

  // 6. 인용구
  {
    id: 'preset-quote',
    name: '인용구',
    category: 'style',
    description: '큰 따옴표 + 감성 인용',
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
    decoration: { ...baseDeco, badgeStyle: 'none' },
    padding: { top: 200, right: 140, bottom: 200, left: 140 },
    positions: {
      headline: { x: 0.5, y: 0.4 },
      body: { x: 0.5, y: 0.68 },
    },
    builtin: true,
  },

  // 7. 그리드 카드
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
    decoration: { ...baseDeco, badgeStyle: 'pill', cornerRadius: 24, shadow: true },
    padding: { top: 90, right: 90, bottom: 90, left: 90 },
    positions: {
      headline: { x: 0.08, y: 0.62 },
      body: { x: 0.08, y: 0.78 },
      badge: { x: 0.08, y: 0.55 },
    },
    builtin: true,
  },

  // 8. 사이드 바
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
    decoration: { ...baseDeco, badgeStyle: 'underline', accentBar: 'left' },
    padding: { top: 140, right: 100, bottom: 140, left: 140 },
    positions: {
      label: { x: 0.15, y: 0.18 },
      headline: { x: 0.15, y: 0.45 },
      body: { x: 0.15, y: 0.72 },
    },
    builtin: true,
  },

  // 9. 이미지 오버레이
  {
    id: 'preset-full-overlay',
    name: '이미지 오버레이',
    category: 'style',
    description: '전체 이미지 + 하단 그라데이션',
    layout: 'full-overlay',
    colorVariants: FULL_OVERLAY_COLORS,
    typography: {
      ...baseTypo,
      headlineWeight: 800,
      headlineSize: 92,
      bodySize: 28,
      lineHeight: 1.3,
    },
    decoration: { ...baseDeco, badgeStyle: 'pill' },
    padding: { top: 100, right: 90, bottom: 100, left: 90 },
    positions: {
      headline: { x: 0.08, y: 0.62 },
      body: { x: 0.08, y: 0.82 },
      badge: { x: 0.08, y: 0.52 },
    },
    builtin: true,
  },

  // 10. 매거진
  {
    id: 'preset-magazine',
    name: '매거진',
    category: 'style',
    description: '카테고리 + 큰 제목 + 컬럼',
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
    decoration: { ...baseDeco, badgeStyle: 'none', topLine: true },
    padding: { top: 130, right: 100, bottom: 130, left: 100 },
    positions: {
      label: { x: 0.1, y: 0.08 },
      headline: { x: 0.1, y: 0.35 },
      body: { x: 0.55, y: 0.62 },
    },
    builtin: true,
  },
];

// ─────────────────────────────────────────────
// 업종 프리셋
// ─────────────────────────────────────────────
export const INDUSTRY_PRESETS: Preset[] = [
  {
    ...STYLE_PRESETS[5],
    id: 'ind-gov',
    name: '정부지원금',
    category: 'industry',
    description: '신뢰감 있는 블루',
    colorVariants: [
      {
        id: 'gov-blue',
        name: '정부 블루',
        background: '#ffffff',
        surface: '#eff6ff',
        text: '#0f172a',
        textMuted: '#64748b',
        accent: '#1d4ed8',
        accentSoft: '#dbeafe',
      },
      {
        id: 'gov-navy',
        name: '정부 네이비',
        background: '#f8fafc',
        surface: '#e2e8f0',
        text: '#0f172a',
        textMuted: '#64748b',
        accent: '#0f172a',
        accentSoft: '#e2e8f0',
      },
    ],
  },
  {
    ...STYLE_PRESETS[1],
    id: 'ind-youth',
    name: '청년지원',
    category: 'industry',
    description: '희망찬 그린',
    colorVariants: [
      {
        id: 'youth-green',
        name: '청년 그린',
        background: '#ffffff',
        surface: '#ecfdf5',
        text: '#064e3b',
        textMuted: '#059669',
        accent: '#10b981',
        accentSoft: '#d1fae5',
      },
    ],
  },
  {
    ...STYLE_PRESETS[3],
    id: 'ind-finance',
    name: '재테크',
    category: 'industry',
    description: '다크 + 골드',
    colorVariants: [
      {
        id: 'gold',
        name: '골드',
        background: '#0f0a05',
        surface: '#1a140f',
        text: '#ffffff',
        textMuted: '#fcd34d',
        accent: '#f59e0b',
        accentSoft: '#451a03',
      },
    ],
  },
  {
    ...STYLE_PRESETS[9],
    id: 'ind-beauty',
    name: '뷰티',
    category: 'industry',
    description: '소프트 핑크',
    colorVariants: [
      {
        id: 'beauty-pink',
        name: '소프트 핑크',
        background: '#2a1020',
        surface: '#3d1a30',
        text: '#ffffff',
        textMuted: '#fbcfe8',
        accent: '#ec4899',
        accentSoft: '#831843',
      },
    ],
  },
  {
    ...STYLE_PRESETS[3],
    id: 'ind-tech',
    name: 'IT/테크',
    category: 'industry',
    description: '다크 + 시안',
    colorVariants: [
      {
        id: 'tech-cyan',
        name: '테크 시안',
        background: '#020617',
        surface: '#0f172a',
        text: '#ffffff',
        textMuted: '#67e8f9',
        accent: '#06b6d4',
        accentSoft: '#164e63',
      },
    ],
  },
  {
    ...STYLE_PRESETS[10],
    id: 'ind-food',
    name: '맛집',
    category: 'industry',
    description: '따뜻한 오렌지',
    colorVariants: [
      {
        id: 'food-orange',
        name: '웜 오렌지',
        background: '#ea580c',
        backgroundEnd: '#7c2d12',
        surface: '#c2410c',
        text: '#ffffff',
        textMuted: '#fed7aa',
        accent: '#ffffff',
        accentSoft: '#7c2d12',
      },
    ],
  },
];

export const ALL_BUILTIN_PRESETS = [...STYLE_PRESETS, ...INDUSTRY_PRESETS];

export function getPresetById(id: string, customPresets: Preset[] = []): Preset {
  const found = [...ALL_BUILTIN_PRESETS, ...customPresets].find((p) => p.id === id);
  return found || STYLE_PRESETS[1];
}