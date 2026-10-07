import type { Preset, Typography, Decoration, Padding } from '@/lib/types';
import {
  DARK_BOLD_COLORS,
  NUMBERING_COLORS,
  PHOTO_MOOD_COLORS,
  MINIMAL_LIST_COLORS,
  BUSINESS_BADGE_COLORS,
  GRADIENT_BOLD_COLORS,
} from './colors';

const FONT = 'Pretendard, system-ui, sans-serif';

// ─────────────────────────────────────────────
// 스타일 프리셋 6종
// ─────────────────────────────────────────────
export const STYLE_PRESETS: Preset[] = [
  // 1. 다크 볼드
  {
    id: 'preset-dark-bold',
    name: '다크 볼드',
    category: 'style',
    description: '검정 배경 + 네온 포인트, 좌측 정렬',
    layout: 'dark-bold',
    colorVariants: DARK_BOLD_COLORS,
    typography: {
      fontFamily: FONT,
      headlineWeight: 900,
      headlineSize: 108,
      bodySize: 30,
      headlineLetterSpacing: '-0.02em',
      lineHeight: 1.05,
      headlineUppercase: false,
    },
    decoration: {
      badgeStyle: 'square',
      cornerRadius: 6,
      accentBar: 'none',
      backgroundPattern: 'none',
      imageTreatment: 'normal',
      shadow: true,
      topLine: false,
      bottomCircle: false,
    },
    padding: { top: 100, right: 100, bottom: 100, left: 100 },
    builtin: true,
  },

  // 2. 넘버링
  {
    id: 'preset-numbering',
    name: '넘버링',
    category: 'style',
    description: '흰 배경 + 좌측 큰 숫자 + 상단 라인',
    layout: 'numbering',
    colorVariants: NUMBERING_COLORS,
    typography: {
      fontFamily: FONT,
      headlineWeight: 800,
      headlineSize: 84,
      bodySize: 32,
      headlineLetterSpacing: '-0.03em',
      lineHeight: 1.25,
      headlineUppercase: false,
    },
    decoration: {
      badgeStyle: 'underline',
      cornerRadius: 0,
      accentBar: 'none',
      backgroundPattern: 'none',
      imageTreatment: 'normal',
      shadow: false,
      topLine: true,
      bottomCircle: false,
    },
    padding: { top: 120, right: 90, bottom: 100, left: 90 },
    builtin: true,
  },

  // 3. 포토 감성
  {
    id: 'preset-photo-mood',
    name: '포토 감성',
    category: 'style',
    description: '사진 배경 + 하단 그라데이션 + 흰 텍스트',
    layout: 'photo-mood',
    colorVariants: PHOTO_MOOD_COLORS,
    typography: {
      fontFamily: FONT,
      headlineWeight: 700,
      headlineSize: 90,
      bodySize: 30,
      headlineLetterSpacing: '-0.02em',
      lineHeight: 1.3,
      headlineUppercase: false,
    },
    decoration: {
      badgeStyle: 'pill',
      cornerRadius: 32,
      accentBar: 'none',
      backgroundPattern: 'none',
      imageTreatment: 'normal',
      shadow: false,
      topLine: false,
      bottomCircle: false,
    },
    padding: { top: 100, right: 90, bottom: 100, left: 90 },
    builtin: true,
  },

  // 4. 미니멀 리스트
  {
    id: 'preset-minimal-list',
    name: '미니멀 리스트',
    category: 'style',
    description: '흰 배경 + 탑 넘버링 + 하단 리스트',
    layout: 'minimal-list',
    colorVariants: MINIMAL_LIST_COLORS,
    typography: {
      fontFamily: FONT,
      headlineWeight: 800,
      headlineSize: 92,
      bodySize: 32,
      headlineLetterSpacing: '-0.03em',
      lineHeight: 1.2,
      headlineUppercase: false,
    },
    decoration: {
      badgeStyle: 'none',
      cornerRadius: 0,
      accentBar: 'none',
      backgroundPattern: 'none',
      imageTreatment: 'normal',
      shadow: false,
      topLine: true,
      bottomCircle: false,
    },
    padding: { top: 120, right: 100, bottom: 120, left: 100 },
    builtin: true,
  },

  // 5. 비즈니스 뱃지
  {
    id: 'preset-business-badge',
    name: '비즈니스 뱃지',
    category: 'style',
    description: '흰 배경 + 파란 강조 + 원형 뱃지',
    layout: 'business-badge',
    colorVariants: BUSINESS_BADGE_COLORS,
    typography: {
      fontFamily: FONT,
      headlineWeight: 800,
      headlineSize: 88,
      bodySize: 32,
      headlineLetterSpacing: '-0.03em',
      lineHeight: 1.25,
      headlineUppercase: false,
    },
    decoration: {
      badgeStyle: 'circle-number',
      cornerRadius: 24,
      accentBar: 'left',
      backgroundPattern: 'none',
      imageTreatment: 'normal',
      shadow: false,
      topLine: false,
      bottomCircle: false,
    },
    padding: { top: 110, right: 100, bottom: 110, left: 120 },
    builtin: true,
  },

  // 6. 그라데이션 볼드
  {
    id: 'preset-gradient-bold',
    name: '그라데이션 볼드',
    category: 'style',
    description: '그라데이션 배경 + 큰 숫자 + 좌측 정렬',
    layout: 'gradient-bold',
    colorVariants: GRADIENT_BOLD_COLORS,
    typography: {
      fontFamily: FONT,
      headlineWeight: 900,
      headlineSize: 96,
      bodySize: 30,
      headlineLetterSpacing: '-0.02em',
      lineHeight: 1.15,
      headlineUppercase: false,
    },
    decoration: {
      badgeStyle: 'pill',
      cornerRadius: 999,
      accentBar: 'none',
      backgroundPattern: 'none',
      imageTreatment: 'normal',
      shadow: false,
      topLine: false,
      bottomCircle: true,
    },
    padding: { top: 110, right: 100, bottom: 110, left: 100 },
    builtin: true,
  },
];

// ─────────────────────────────────────────────
// 업종 프리셋 (스타일 재활용 + 색상 조정)
// ─────────────────────────────────────────────
export const INDUSTRY_PRESETS: Preset[] = [
  {
    ...STYLE_PRESETS[1], // 넘버링
    id: 'ind-gov',
    name: '정부지원금',
    category: 'industry',
    description: '신뢰감 있는 블루 톤',
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
      ...BUSINESS_BADGE_COLORS.slice(1, 4),
    ],
  },
  {
    ...STYLE_PRESETS[1],
    id: 'ind-youth',
    name: '청년지원',
    category: 'industry',
    description: '희망찬 그린 톤',
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
      ...NUMBERING_COLORS.slice(0, 3),
    ],
  },
  {
    ...STYLE_PRESETS[0], // 다크 볼드
    id: 'ind-finance',
    name: '재테크',
    category: 'industry',
    description: '다크 + 골드 포인트',
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
      ...DARK_BOLD_COLORS.slice(1, 4),
    ],
  },
  {
    ...STYLE_PRESETS[2], // 포토 감성
    id: 'ind-beauty',
    name: '뷰티',
    category: 'industry',
    description: '소프트 핑크 톤',
    colorVariants: [
      {
        id: 'soft-pink',
        name: '소프트 핑크',
        background: '#2a1020',
        surface: '#3d1a30',
        text: '#ffffff',
        textMuted: '#fbcfe8',
        accent: '#ec4899',
        accentSoft: '#831843',
      },
      {
        id: 'rose',
        name: '로즈',
        background: '#2a1015',
        surface: '#3d1a22',
        text: '#ffffff',
        textMuted: '#fecdd3',
        accent: '#f43f5e',
        accentSoft: '#881337',
      },
    ],
  },
  {
    ...STYLE_PRESETS[0],
    id: 'ind-tech',
    name: 'IT/테크',
    category: 'industry',
    description: '다크 + 시안',
    colorVariants: DARK_BOLD_COLORS.slice(1, 4),
  },
  {
    ...STYLE_PRESETS[5], // 그라데이션 볼드
    id: 'ind-food',
    name: '맛집',
    category: 'industry',
    description: '따뜻한 오렌지 톤',
    colorVariants: [
      GRADIENT_BOLD_COLORS[1], // sunset
      {
        id: 'warm-orange',
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