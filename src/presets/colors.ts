import type { ColorVariant } from '@/lib/types';

// ─────────────────────────────────────────────
// 다크 볼드 (검정 배경 + 네온 포인트)
// ─────────────────────────────────────────────
export const DARK_BOLD_COLORS: ColorVariant[] = [
  {
    id: 'neon-green',
    name: '네온 그린',
    background: '#0a0f0a',
    surface: '#141f14',
    text: '#ffffff',
    textMuted: '#a3e635',
    accent: '#84cc16',
    accentSoft: '#1a2e05',
  },
  {
    id: 'neon-cyan',
    name: '네온 시안',
    background: '#05090f',
    surface: '#0f1a24',
    text: '#ffffff',
    textMuted: '#67e8f9',
    accent: '#06b6d4',
    accentSoft: '#083344',
  },
  {
    id: 'neon-magenta',
    name: '네온 마젠타',
    background: '#0f050a',
    surface: '#1f0f1a',
    text: '#ffffff',
    textMuted: '#f0abfc',
    accent: '#d946ef',
    accentSoft: '#4a044e',
  },
  {
    id: 'neon-orange',
    name: '네온 오렌지',
    background: '#0f0805',
    surface: '#1f1410',
    text: '#ffffff',
    textMuted: '#fdba74',
    accent: '#f97316',
    accentSoft: '#431407',
  },
];

// ─────────────────────────────────────────────
// 넘버링 (흰 배경 + 진한 강조색)
// ─────────────────────────────────────────────
export const NUMBERING_COLORS: ColorVariant[] = [
  {
    id: 'deep-green',
    name: '딥 그린',
    background: '#ffffff',
    surface: '#f0fdf4',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#059669',
    accentSoft: '#d1fae5',
  },
  {
    id: 'navy',
    name: '네이비',
    background: '#ffffff',
    surface: '#eff6ff',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#1e40af',
    accentSoft: '#dbeafe',
  },
  {
    id: 'burgundy',
    name: '버건디',
    background: '#ffffff',
    surface: '#fef2f2',
    text: '#1c1917',
    textMuted: '#78716c',
    accent: '#991b1b',
    accentSoft: '#fee2e2',
  },
  {
    id: 'charcoal',
    name: '차콜',
    background: '#ffffff',
    surface: '#f4f4f5',
    text: '#18181b',
    textMuted: '#71717a',
    accent: '#27272a',
    accentSoft: '#e4e4e7',
  },
];

// ─────────────────────────────────────────────
// 포토 감성 (사진 배경 + 오버레이)
// ─────────────────────────────────────────────
export const PHOTO_MOOD_COLORS: ColorVariant[] = [
  {
    id: 'warm-brown',
    name: '웜 브라운',
    background: '#292018',
    surface: '#3d2f22',
    text: '#ffffff',
    textMuted: '#d6c9b8',
    accent: '#d97706',
    accentSoft: '#78350f',
  },
  {
    id: 'sepia',
    name: '세피아',
    background: '#2a2418',
    surface: '#3a3220',
    text: '#ffffff',
    textMuted: '#d4c7a5',
    accent: '#ca8a04',
    accentSoft: '#713f12',
  },
  {
    id: 'cool-blue',
    name: '쿨 블루',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#ffffff',
    textMuted: '#cbd5e1',
    accent: '#38bdf8',
    accentSoft: '#075985',
  },
  {
    id: 'muted-gray',
    name: '뮤트 그레이',
    background: '#1c1917',
    surface: '#292524',
    text: '#ffffff',
    textMuted: '#d6d3d1',
    accent: '#a8a29e',
    accentSoft: '#44403c',
  },
];

// ─────────────────────────────────────────────
// 미니멀 리스트 (흰 배경 + 검정)
// ─────────────────────────────────────────────
export const MINIMAL_LIST_COLORS: ColorVariant[] = [
  {
    id: 'classic',
    name: '클래식',
    background: '#ffffff',
    surface: '#fafafa',
    text: '#0a0a0a',
    textMuted: '#737373',
    accent: '#171717',
    accentSoft: '#e5e5e5',
  },
  {
    id: 'navy',
    name: '네이비',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#1e3a8a',
    accentSoft: '#dbeafe',
  },
  {
    id: 'brown',
    name: '브라운',
    background: '#fffbf5',
    surface: '#fef3c7',
    text: '#431407',
    textMuted: '#92400e',
    accent: '#b45309',
    accentSoft: '#fde68a',
  },
  {
    id: 'gray',
    name: '그레이',
    background: '#ffffff',
    surface: '#f4f4f5',
    text: '#18181b',
    textMuted: '#71717a',
    accent: '#52525b',
    accentSoft: '#e4e4e7',
  },
];

// ─────────────────────────────────────────────
// 비즈니스 뱃지 (흰 배경 + 파란 강조)
// ─────────────────────────────────────────────
export const BUSINESS_BADGE_COLORS: ColorVariant[] = [
  {
    id: 'royal-blue',
    name: '로열 블루',
    background: '#ffffff',
    surface: '#eff6ff',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
  },
  {
    id: 'navy',
    name: '네이비',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#1e3a8a',
    accentSoft: '#dbeafe',
  },
  {
    id: 'forest',
    name: '포레스트',
    background: '#ffffff',
    surface: '#f0fdf4',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#047857',
    accentSoft: '#d1fae5',
  },
  {
    id: 'purple',
    name: '퍼플',
    background: '#ffffff',
    surface: '#faf5ff',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#7c3aed',
    accentSoft: '#ede9fe',
  },
];

// ─────────────────────────────────────────────
// 그라데이션 볼드 (컬러 그라데이션 배경)
// ─────────────────────────────────────────────
export const GRADIENT_BOLD_COLORS: ColorVariant[] = [
  {
    id: 'emerald',
    name: '에메랄드',
    background: '#059669',
    backgroundEnd: '#065f46',
    surface: '#047857',
    text: '#ffffff',
    textMuted: '#a7f3d0',
    accent: '#ffffff',
    accentSoft: '#065f46',
  },
  {
    id: 'sunset',
    name: '선셋',
    background: '#f97316',
    backgroundEnd: '#be123c',
    surface: '#ea580c',
    text: '#ffffff',
    textMuted: '#fed7aa',
    accent: '#ffffff',
    accentSoft: '#9a3412',
  },
  {
    id: 'ocean',
    name: '오션',
    background: '#0ea5e9',
    backgroundEnd: '#1e3a8a',
    surface: '#0284c7',
    text: '#ffffff',
    textMuted: '#bae6fd',
    accent: '#ffffff',
    accentSoft: '#075985',
  },
  {
    id: 'royal',
    name: '로얄',
    background: '#7c3aed',
    backgroundEnd: '#4c1d95',
    surface: '#6d28d9',
    text: '#ffffff',
    textMuted: '#ddd6fe',
    accent: '#ffffff',
    accentSoft: '#5b21b6',
  },
];