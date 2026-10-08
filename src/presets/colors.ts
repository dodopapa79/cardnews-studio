import type { ColorVariant } from '@/lib/types';

// 1. 센터드 클래식 — 미니멀 (흰 배경 + 검정)
export const CENTERED_COLORS: ColorVariant[] = [
  {
    id: 'white-black', name: '화이트 블랙',
    background: '#ffffff', surface: '#fafafa',
    text: '#0a0a0a', textMuted: '#525252',
    accent: '#171717', accentSoft: '#e5e5e5',
  },
  {
    id: 'warm-cream', name: '웜 크림',
    background: '#faf7f2', surface: '#f0ebe1',
    text: '#1c1917', textMuted: '#78716c',
    accent: '#9a3412', accentSoft: '#fed7aa',
  },
  {
    id: 'cool-slate', name: '쿨 슬레이트',
    background: '#f8fafc', surface: '#f1f5f9',
    text: '#0f172a', textMuted: '#64748b',
    accent: '#334155', accentSoft: '#e2e8f0',
  },
  {
    id: 'soft-rose', name: '소프트 로즈',
    background: '#fff5f8', surface: '#ffe4ec',
    text: '#831843', textMuted: '#be185d',
    accent: '#f43f5e', accentSoft: '#ffe4e6',
  },
  {
    id: 'pure-black', name: '퓨어 블랙',
    background: '#0a0a0a', surface: '#171717',
    text: '#ffffff', textMuted: '#a3a3a3',
    accent: '#fafafa', accentSoft: '#262626',
  },
];

// 2. 하단 집중 — 사진 배경 + 하단 텍스트
export const BOTTOM_FOCUS_COLORS: ColorVariant[] = [
  {
    id: 'warm-brown', name: '웜 브라운',
    background: '#292018', surface: '#3d2f22',
    text: '#ffffff', textMuted: '#d6c9b8',
    accent: '#d97706', accentSoft: '#78350f',
  },
  {
    id: 'deep-navy', name: '딥 네이비',
    background: '#0f172a', surface: '#1e293b',
    text: '#ffffff', textMuted: '#cbd5e1',
    accent: '#38bdf8', accentSoft: '#075985',
  },
  {
    id: 'forest-dark', name: '포레스트',
    background: '#051a0f', surface: '#0a2a1a',
    text: '#ffffff', textMuted: '#6ee7b7',
    accent: '#10b981', accentSoft: '#064e3b',
  },
  {
    id: 'sunset', name: '선셋',
    background: '#7c2d12', surface: '#9a3412',
    text: '#ffffff', textMuted: '#fed7aa',
    accent: '#fbbf24', accentSoft: '#451a03',
  },
  {
    id: 'mono-dark', name: '모노 다크',
    background: '#0a0a0a', surface: '#171717',
    text: '#ffffff', textMuted: '#a3a3a3',
    accent: '#fafafa', accentSoft: '#262626',
  },
];

// 3. 좌측 정렬 볼드 — 큰 제목 좌측, 하단 설명
export const LEFT_BOLD_COLORS: ColorVariant[] = [
  {
    id: 'neon-green', name: '네온 그린',
    background: '#0a0f0a', surface: '#141f14',
    text: '#ffffff', textMuted: '#a3e635',
    accent: '#84cc16', accentSoft: '#1a2e05',
  },
  {
    id: 'hot-pink', name: '핫 핑크',
    background: '#1a0510', surface: '#2a0a1f',
    text: '#ffffff', textMuted: '#fbcfe8',
    accent: '#ec4899', accentSoft: '#500724',
  },
  {
    id: 'electric-blue', name: '일렉트릭 블루',
    background: '#050b1a', surface: '#0f172a',
    text: '#ffffff', textMuted: '#7dd3fc',
    accent: '#0ea5e9', accentSoft: '#082f49',
  },
  {
    id: 'bright-orange', name: '브라이트 오렌지',
    background: '#1a0a05', surface: '#2a1410',
    text: '#ffffff', textMuted: '#fdba74',
    accent: '#f97316', accentSoft: '#431407',
  },
  {
    id: 'pure-white', name: '퓨어 화이트',
    background: '#ffffff', surface: '#fafafa',
    text: '#0a0a0a', textMuted: '#525252',
    accent: '#171717', accentSoft: '#e5e5e5',
  },
];

// 4. 상단 라벨 — 상단 라벨 + 중앙 제목
export const TOP_LABEL_COLORS: ColorVariant[] = [
  {
    id: 'cream', name: '크림',
    background: '#fffbf5', surface: '#fef3c7',
    text: '#431407', textMuted: '#92400e',
    accent: '#b45309', accentSoft: '#fde68a',
  },
  {
    id: 'pastel-pink', name: '파스텔 핑크',
    background: '#fef6fb', surface: '#fce7f3',
    text: '#4c1d3d', textMuted: '#9d174d',
    accent: '#ec4899', accentSoft: '#fce7f3',
  },
  {
    id: 'mint', name: '민트',
    background: '#f0fdfa', surface: '#ccfbf1',
    text: '#134e4a', textMuted: '#0d9488',
    accent: '#14b8a6', accentSoft: '#99f6e4',
  },
  {
    id: 'charcoal', name: '차콜',
    background: '#0a0a0a', surface: '#171717',
    text: '#ffffff', textMuted: '#a3a3a3',
    accent: '#fafafa', accentSoft: '#262626',
  },
  {
    id: 'deep-purple', name: '딥 퍼플',
    background: '#0f051a', surface: '#1a0a2a',
    text: '#ffffff', textMuted: '#c4b5fd',
    accent: '#8b5cf6', accentSoft: '#2e1065',
  },
];

// 5. 숫자 강조 — 좌측 큰 숫자 + 우측 텍스트
export const NUMBER_FOCUS_COLORS: ColorVariant[] = [
  {
    id: 'deep-green', name: '딥 그린',
    background: '#ffffff', surface: '#f0fdf4',
    text: '#0f172a', textMuted: '#64748b',
    accent: '#059669', accentSoft: '#d1fae5',
  },
  {
    id: 'royal-blue', name: '로열 블루',
    background: '#ffffff', surface: '#eff6ff',
    text: '#0f172a', textMuted: '#64748b',
    accent: '#1e40af', accentSoft: '#dbeafe',
  },
  {
    id: 'burgundy', name: '버건디',
    background: '#ffffff', surface: '#fef2f2',
    text: '#1c1917', textMuted: '#78716c',
    accent: '#991b1b', accentSoft: '#fee2e2',
  },
  {
    id: 'neon-cyan', name: '네온 시안',
    background: '#05090f', surface: '#0f1a24',
    text: '#ffffff', textMuted: '#67e8f9',
    accent: '#06b6d4', accentSoft: '#083344',
  },
  {
    id: 'gold', name: '골드',
    background: '#0f0a05', surface: '#1a140f',
    text: '#ffffff', textMuted: '#fcd34d',
    accent: '#f59e0b', accentSoft: '#451a03',
  },
];

// 6. 인용구 — 큰 따옴표
export const QUOTE_STYLE_COLORS: ColorVariant[] = [
  {
    id: 'dark-charcoal', name: '차콜',
    background: '#0a0a0a', surface: '#171717',
    text: '#ffffff', textMuted: '#a3a3a3',
    accent: '#fafafa', accentSoft: '#262626',
  },
  {
    id: 'paper-white', name: '페이퍼',
    background: '#faf7f2', surface: '#f0ebe1',
    text: '#1c1917', textMuted: '#78716c',
    accent: '#9a3412', accentSoft: '#fed7aa',
  },
  {
    id: 'midnight-blue', name: '미드나이트',
    background: '#0a0a1a', surface: '#141428',
    text: '#ffffff', textMuted: '#c4b5fd',
    accent: '#8b5cf6', accentSoft: '#1e1b4b',
  },
  {
    id: 'forest', name: '포레스트',
    background: '#051a0f', surface: '#0a2a1a',
    text: '#ffffff', textMuted: '#6ee7b7',
    accent: '#10b981', accentSoft: '#064e3b',
  },
  {
    id: 'wine', name: '와인',
    background: '#150308', surface: '#22060f',
    text: '#ffffff', textMuted: '#fecdd3',
    accent: '#be123c', accentSoft: '#4c0519',
  },
];

// 7. 그리드 카드 — 상단 이미지 + 하단 정보 박스
export const CARD_GRID_COLORS: ColorVariant[] = [
  {
    id: 'clean-blue', name: '클린 블루',
    background: '#f8fafc', surface: '#ffffff',
    text: '#0f172a', textMuted: '#64748b',
    accent: '#2563eb', accentSoft: '#dbeafe',
  },
  {
    id: 'warm-white', name: '웜 화이트',
    background: '#fafaf9', surface: '#ffffff',
    text: '#1c1917', textMuted: '#78716c',
    accent: '#c2410c', accentSoft: '#fed7aa',
  },
  {
    id: 'charcoal-grid', name: '차콜',
    background: '#0a0a0a', surface: '#171717',
    text: '#ffffff', textMuted: '#a3a3a3',
    accent: '#fafafa', accentSoft: '#262626',
  },
  {
    id: 'dark-purple', name: '다크 퍼플',
    background: '#0f051a', surface: '#1a0a2a',
    text: '#ffffff', textMuted: '#c4b5fd',
    accent: '#8b5cf6', accentSoft: '#2e1065',
  },
  {
    id: 'pink-grid', name: '핑크',
    background: '#fef6fb', surface: '#ffffff',
    text: '#4c1d3d', textMuted: '#9d174d',
    accent: '#ec4899', accentSoft: '#fce7f3',
  },
];

// 8. 사이드 바 — 좌측 색상 바
export const SIDE_BAR_COLORS: ColorVariant[] = [
  {
    id: 'white-blue', name: '화이트 블루',
    background: '#ffffff', surface: '#eff6ff',
    text: '#0f172a', textMuted: '#64748b',
    accent: '#1d4ed8', accentSoft: '#dbeafe',
  },
  {
    id: 'white-green', name: '화이트 그린',
    background: '#ffffff', surface: '#f0fdf4',
    text: '#0f172a', textMuted: '#64748b',
    accent: '#059669', accentSoft: '#d1fae5',
  },
  {
    id: 'white-red', name: '화이트 레드',
    background: '#ffffff', surface: '#fef2f2',
    text: '#0f172a', textMuted: '#64748b',
    accent: '#dc2626', accentSoft: '#fee2e2',
  },
  {
    id: 'dark-cyan', name: '다크 시안',
    background: '#020617', surface: '#0f172a',
    text: '#ffffff', textMuted: '#67e8f9',
    accent: '#06b6d4', accentSoft: '#164e63',
  },
  {
    id: 'dark-purple-bar', name: '다크 퍼플',
    background: '#0f051a', surface: '#1a0a2a',
    text: '#ffffff', textMuted: '#c4b5fd',
    accent: '#8b5cf6', accentSoft: '#2e1065',
  },
];

// 9. 이미지 오버레이 — 전체 이미지 + 하단 그라데이션
export const FULL_OVERLAY_COLORS: ColorVariant[] = [
  {
    id: 'black-overlay', name: '블랙',
    background: '#000000', surface: '#171717',
    text: '#ffffff', textMuted: '#d4d4d4',
    accent: '#fafafa', accentSoft: '#262626',
  },
  {
    id: 'navy-overlay', name: '네이비',
    background: '#0f172a', surface: '#1e293b',
    text: '#ffffff', textMuted: '#cbd5e1',
    accent: '#38bdf8', accentSoft: '#075985',
  },
  {
    id: 'wine-overlay', name: '와인',
    background: '#450a0a', surface: '#7f1d1d',
    text: '#ffffff', textMuted: '#fecaca',
    accent: '#fbbf24', accentSoft: '#450a0a',
  },
  {
    id: 'forest-overlay', name: '포레스트',
    background: '#052e16', surface: '#064e3b',
    text: '#ffffff', textMuted: '#6ee7b7',
    accent: '#34d399', accentSoft: '#064e3b',
  },
  {
    id: 'purple-overlay', name: '퍼플',
    background: '#3b0764', surface: '#581c87',
    text: '#ffffff', textMuted: '#ddd6fe',
    accent: '#c084fc', accentSoft: '#4c1d95',
  },
];

// 10. 매거진 — 카테고리 + 큰 제목 + 컬럼
export const MAGAZINE_COLORS: ColorVariant[] = [
  {
    id: 'paper', name: '페이퍼',
    background: '#faf7f2', surface: '#f0ebe1',
    text: '#1c1917', textMuted: '#78716c',
    accent: '#9a3412', accentSoft: '#fed7aa',
  },
  {
    id: 'bright-white', name: '브라이트 화이트',
    background: '#ffffff', surface: '#f8fafc',
    text: '#0a0a0a', textMuted: '#525252',
    accent: '#dc2626', accentSoft: '#fee2e2',
  },
  {
    id: 'dark-magazine', name: '다크 매거진',
    background: '#0a0a0a', surface: '#171717',
    text: '#ffffff', textMuted: '#a3a3a3',
    accent: '#fbbf24', accentSoft: '#262626',
  },
  {
    id: 'deep-navy-mag', name: '딥 네이비',
    background: '#0f172a', surface: '#1e293b',
    text: '#ffffff', textMuted: '#cbd5e1',
    accent: '#f59e0b', accentSoft: '#78350f',
  },
  {
    id: 'cream-mag', name: '크림',
    background: '#fffbf5', surface: '#fef3c7',
    text: '#431407', textMuted: '#92400e',
    accent: '#b45309', accentSoft: '#fde68a',
  },
];