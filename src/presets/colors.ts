import type { ColorVariant } from '@/lib/types';

// ─────────────────────────────────────────────
// 1. 다크 볼드 (검정 + 네온)
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
// 2. 다크 블루 (네이비 + 시안)
// ─────────────────────────────────────────────
export const DARK_BLUE_COLORS: ColorVariant[] = [
  {
    id: 'deep-navy',
    name: '딥 네이비',
    background: '#050b1a',
    surface: '#0f172a',
    text: '#ffffff',
    textMuted: '#7dd3fc',
    accent: '#0ea5e9',
    accentSoft: '#082f49',
  },
  {
    id: 'midnight',
    name: '미드나이트',
    background: '#0a0a1a',
    surface: '#141428',
    text: '#ffffff',
    textMuted: '#c4b5fd',
    accent: '#8b5cf6',
    accentSoft: '#1e1b4b',
  },
  {
    id: 'ocean',
    name: '오션',
    background: '#031b26',
    surface: '#0c3040',
    text: '#ffffff',
    textMuted: '#67e8f9',
    accent: '#22d3ee',
    accentSoft: '#083344',
  },
];

// ─────────────────────────────────────────────
// 3. 다크 레드 (버건디 + 오렌지)
// ─────────────────────────────────────────────
export const DARK_RED_COLORS: ColorVariant[] = [
  {
    id: 'burgundy',
    name: '버건디',
    background: '#1a0505',
    surface: '#2a0a0a',
    text: '#ffffff',
    textMuted: '#fca5a5',
    accent: '#dc2626',
    accentSoft: '#450a0a',
  },
  {
    id: 'crimson',
    name: '크림슨',
    background: '#1a0510',
    surface: '#2a0a1f',
    text: '#ffffff',
    textMuted: '#fda4af',
    accent: '#e11d48',
    accentSoft: '#4c0519',
  },
  {
    id: 'ember',
    name: '엠버',
    background: '#1a0a05',
    surface: '#2a1410',
    text: '#ffffff',
    textMuted: '#fdba74',
    accent: '#f97316',
    accentSoft: '#431407',
  },
];

// ─────────────────────────────────────────────
// 4. 다크 그린 (포레스트 + 라임)
// ─────────────────────────────────────────────
export const DARK_GREEN_COLORS: ColorVariant[] = [
  {
    id: 'forest',
    name: '포레스트',
    background: '#051a0f',
    surface: '#0a2a1a',
    text: '#ffffff',
    textMuted: '#6ee7b7',
    accent: '#10b981',
    accentSoft: '#064e3b',
  },
  {
    id: 'lime',
    name: '라임',
    background: '#0f1a05',
    surface: '#1f2a0a',
    text: '#ffffff',
    textMuted: '#bef264',
    accent: '#84cc16',
    accentSoft: '#1a2e05',
  },
  {
    id: 'emerald',
    name: '에메랄드',
    background: '#031a1a',
    surface: '#062a2a',
    text: '#ffffff',
    textMuted: '#5eead4',
    accent: '#14b8a6',
    accentSoft: '#134e4a',
  },
];

// ─────────────────────────────────────────────
// 5. 다크 퍼플 (보라 + 핑크)
// ─────────────────────────────────────────────
export const DARK_PURPLE_COLORS: ColorVariant[] = [
  {
    id: 'royal-purple',
    name: '로열 퍼플',
    background: '#0f051a',
    surface: '#1a0a2a',
    text: '#ffffff',
    textMuted: '#c4b5fd',
    accent: '#8b5cf6',
    accentSoft: '#2e1065',
  },
  {
    id: 'hot-pink',
    name: '핫 핑크',
    background: '#1a0510',
    surface: '#2a0a1f',
    text: '#ffffff',
    textMuted: '#fbcfe8',
    accent: '#ec4899',
    accentSoft: '#500724',
  },
  {
    id: 'indigo',
    name: '인디고',
    background: '#0a051a',
    surface: '#14082a',
    text: '#ffffff',
    textMuted: '#a5b4fc',
    accent: '#6366f1',
    accentSoft: '#1e1b4b',
  },
];

// ─────────────────────────────────────────────
// 6. 메시 다크 (그라데이션 메시)
// ─────────────────────────────────────────────
export const MESH_DARK_COLORS: ColorVariant[] = [
  {
    id: 'mesh-purple',
    name: '퍼플 메시',
    background: '#1a0a2e',
    backgroundEnd: '#3b0764',
    surface: '#2a1040',
    text: '#ffffff',
    textMuted: '#e9d5ff',
    accent: '#c084fc',
    accentSoft: '#581c87',
  },
  {
    id: 'mesh-blue',
    name: '블루 메시',
    background: '#0a1a3b',
    backgroundEnd: '#1e3a8a',
    surface: '#102a52',
    text: '#ffffff',
    textMuted: '#bfdbfe',
    accent: '#60a5fa',
    accentSoft: '#1e40af',
  },
  {
    id: 'mesh-red',
    name: '레드 메시',
    background: '#2e0a1a',
    backgroundEnd: '#831843',
    surface: '#3d0f24',
    text: '#ffffff',
    textMuted: '#fbcfe8',
    accent: '#f472b6',
    accentSoft: '#831843',
  },
];

// ─────────────────────────────────────────────
// 7. 다크 미니멀 (차콜 + 화이트)
// ─────────────────────────────────────────────
export const DARK_MINIMAL_COLORS: ColorVariant[] = [
  {
    id: 'charcoal',
    name: '차콜',
    background: '#0a0a0a',
    surface: '#171717',
    text: '#ffffff',
    textMuted: '#a3a3a3',
    accent: '#fafafa',
    accentSoft: '#262626',
  },
  {
    id: 'graphite',
    name: '그래파이트',
    background: '#0f0f0f',
    surface: '#1f1f1f',
    text: '#ffffff',
    textMuted: '#d4d4d4',
    accent: '#e5e5e5',
    accentSoft: '#2a2a2a',
  },
  {
    id: 'slate',
    name: '슬레이트',
    background: '#0f1419',
    surface: '#1a2027',
    text: '#ffffff',
    textMuted: '#94a3b8',
    accent: '#cbd5e1',
    accentSoft: '#1e293b',
  },
];

// ─────────────────────────────────────────────
// 8. 라이트 미니멀 (흰 + 검정)
// ─────────────────────────────────────────────
export const LIGHT_MINIMAL_COLORS: ColorVariant[] = [
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
    id: 'forest',
    name: '포레스트',
    background: '#ffffff',
    surface: '#f0fdf4',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#059669',
    accentSoft: '#d1fae5',
  },
];

// ─────────────────────────────────────────────
// 9. 라이트 그레이 (연회색 + 네이비)
// ─────────────────────────────────────────────
export const LIGHT_GRAY_COLORS: ColorVariant[] = [
  {
    id: 'slate-gray',
    name: '슬레이트',
    background: '#f8fafc',
    surface: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#334155',
    accentSoft: '#e2e8f0',
  },
  {
    id: 'cool-gray',
    name: '쿨 그레이',
    background: '#f4f4f5',
    surface: '#e4e4e7',
    text: '#18181b',
    textMuted: '#71717a',
    accent: '#52525b',
    accentSoft: '#d4d4d8',
  },
  {
    id: 'warm-gray',
    name: '웜 그레이',
    background: '#fafaf9',
    surface: '#f5f5f4',
    text: '#1c1917',
    textMuted: '#78716c',
    accent: '#44403c',
    accentSoft: '#e7e5e4',
  },
];

// ─────────────────────────────────────────────
// 10. 라이트 크림 (베이지 + 브라운)
// ─────────────────────────────────────────────
export const LIGHT_CREAM_COLORS: ColorVariant[] = [
  {
    id: 'cream',
    name: '크림',
    background: '#fffbf5',
    surface: '#fef3c7',
    text: '#431407',
    textMuted: '#92400e',
    accent: '#b45309',
    accentSoft: '#fde68a',
  },
  {
    id: 'sand',
    name: '샌드',
    background: '#faf7f2',
    surface: '#f0ebe1',
    text: '#1c1917',
    textMuted: '#78716c',
    accent: '#9a3412',
    accentSoft: '#fed7aa',
  },
  {
    id: 'rose',
    name: '로즈',
    background: '#fff5f8',
    surface: '#ffe4ec',
    text: '#831843',
    textMuted: '#be185d',
    accent: '#f43f5e',
    accentSoft: '#ffe4e6',
  },
];

// ─────────────────────────────────────────────
// 업종 프리셋용 (일부 재활용)
// ─────────────────────────────────────────────
export const GOV_COLORS: ColorVariant[] = [
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
];

export const YOUTH_COLORS: ColorVariant[] = [
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
  {
    id: 'youth-mint',
    name: '민트',
    background: '#f0fdfa',
    surface: '#ccfbf1',
    text: '#134e4a',
    textMuted: '#0d9488',
    accent: '#14b8a6',
    accentSoft: '#99f6e4',
  },
];

export const FINANCE_COLORS: ColorVariant[] = [
  {
    id: 'finance-gold',
    name: '골드',
    background: '#0f0a05',
    surface: '#1a140f',
    text: '#ffffff',
    textMuted: '#fcd34d',
    accent: '#f59e0b',
    accentSoft: '#451a03',
  },
  {
    id: 'finance-emerald',
    name: '에메랄드',
    background: '#051a0f',
    surface: '#0a2a1a',
    text: '#ffffff',
    textMuted: '#6ee7b7',
    accent: '#10b981',
    accentSoft: '#064e3b',
  },
];

export const BEAUTY_COLORS: ColorVariant[] = [
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
  {
    id: 'beauty-rose',
    name: '로즈',
    background: '#2a1015',
    surface: '#3d1a22',
    text: '#ffffff',
    textMuted: '#fecdd3',
    accent: '#f43f5e',
    accentSoft: '#881337',
  },
];

export const TECH_COLORS: ColorVariant[] = [
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
  {
    id: 'tech-purple',
    name: '테크 퍼플',
    background: '#0a051a',
    surface: '#14082a',
    text: '#ffffff',
    textMuted: '#c4b5fd',
    accent: '#8b5cf6',
    accentSoft: '#2e1065',
  },
];

export const FOOD_COLORS: ColorVariant[] = [
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
  {
    id: 'food-red',
    name: '딥 레드',
    background: '#7f1d1d',
    backgroundEnd: '#450a0a',
    surface: '#991b1b',
    text: '#ffffff',
    textMuted: '#fecaca',
    accent: '#fbbf24',
    accentSoft: '#450a0a',
  },
];