export type SlideType = 'cover' | 'point' | 'data' | 'quote' | 'cta';
export type ImageLayout = 'full-bleed' | 'top-image' | 'split' | 'none';
export type VideoLayout = 'full-screen' | 'split-news';
export type PhoneApp = 'tiktok' | 'youtube' | 'instagram';

/** 카드 레이아웃 종류 */
export type CardLayout =
  | 'dark-bold'        // 검정 배경, 좌측 정렬, 큰 대문자
  | 'numbering'        // 흰 배경, 좌측 큰 숫자(01), 상단 라인
  | 'photo-mood'       // 사진 배경, 하단 그라데이션
  | 'minimal-list'     // 흰 배경, 상단 탑 넘버링, 하단 리스트
  | 'business-badge'   // 흰 배경, 파란 강조, 원형 뱃지
  | 'gradient-bold';   // 그라데이션 배경, 큰 숫자, 좌측 정렬

/** 배경 타입 */
export type BackgroundType = 'solid' | 'gradient' | 'mesh' | 'pattern';

/** 텍스트 정렬 */
export type TextAlign = 'left' | 'center' | 'right';

/** 카드 안에서 요소의 상대 위치 (0~1 비율) */
export interface ElementPosition {
  x: number;
  y: number;
  scale?: number;
}

export interface SlidePositions {
  headline?: ElementPosition;
  body?: ElementPosition;
  highlight?: ElementPosition;
  badge?: ElementPosition;
  imageFocal?: { x: number; y: number };
}

export interface Slide {
  id: string;
  type: SlideType;
  headline: string;
  body: string;
  highlight: string;
  imageUrl: string;
  imagePrompt: string;
  imageLayout: ImageLayout;
  positions?: SlidePositions;
}

/** 하나의 색상 세트 */
export interface ColorVariant {
  id: string;
  name: string;
  background: string;      // 단색 배경 or 그라데이션 시작
  backgroundEnd?: string;  // 그라데이션 끝 (옵션)
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
}

export interface Typography {
  fontFamily: string;
  headlineWeight: number;
  headlineSize: number;
  bodySize: number;
  headlineLetterSpacing: string;
  lineHeight: number;
  /** 대문자 변환 (다크 볼드용) */
  headlineUppercase?: boolean;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Decoration {
  badgeStyle: 'pill' | 'square' | 'underline' | 'none' | 'circle-number';
  cornerRadius: number;
  accentBar: 'top' | 'left' | 'bottom' | 'none';
  backgroundPattern: 'none' | 'grid' | 'dots' | 'noise' | 'mesh';
  imageTreatment: 'normal' | 'duotone' | 'grayscale';
  shadow: boolean;
  /** 상단 라인 (넘버링용) */
  topLine?: boolean;
  /** 하단 원형 아이콘 (그라데이션 볼드용) */
  bottomCircle?: boolean;
}

export interface PresetPositions {
  headline?: ElementPosition;
  body?: ElementPosition;
  highlight?: ElementPosition;
  badge?: ElementPosition;
}

export interface Preset {
  id: string;
  name: string;
  category: 'style' | 'industry' | 'custom';
  description?: string;
  layout: CardLayout;
  /** 색상 팔레트 — 첫 번째가 기본값 */
  colorVariants: ColorVariant[];
  typography: Typography;
  decoration: Decoration;
  padding: Padding;
  positions?: PresetPositions;
  builtin: boolean;
  version?: number;
}

export interface BgmTrack {
  id: string;
  name: string;
  url: string;
  source: string;
  sourceUrl: string;
  category: 'calm' | 'bright' | 'upbeat' | 'emotional' | 'minimal' | 'exciting';
}

export interface UploadedBgm {
  fileName: string;
  fileType: string;
  file: File;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface LogoConfig {
  imageUrl: string;
  position: 'bottom-left' | 'bottom-right' | 'center' | 'top-left' | 'top-right';
  frame: 'first' | 'last' | 'both';
  size: number;
  opacity: number;
}

export interface Settings {
  geminiApiKey: string;
  cfAccountId: string;
  cfApiToken: string;
  workerUrl: string;
}

export const EMPTY_SETTINGS: Settings = {
  geminiApiKey: '',
  cfAccountId: '',
  cfApiToken: '',
  workerUrl: 'https://tight-unit-99da.whyno2617.workers.dev',
};

export const EMPTY_LOGO: LogoConfig = {
  imageUrl: '',
  position: 'bottom-right',
  frame: 'last',
  size: 200,
  opacity: 0.9,
};