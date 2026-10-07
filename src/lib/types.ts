export type SlideType = 'cover' | 'point' | 'data' | 'quote' | 'cta';
export type ImageLayout = 'full-bleed' | 'top-image' | 'split' | 'none';
export type VideoLayout = 'full-screen' | 'split-news';
export type PhoneApp = 'tiktok' | 'youtube' | 'instagram';

/** 카드 안에서 요소의 상대 위치 (0~1 비율) */
export interface ElementPosition {
  x: number; // 0 = 좌측, 1 = 우측
  y: number; // 0 = 상단, 1 = 하단
  scale?: number; // 0.5 ~ 2.0 (선택)
}

export interface SlidePositions {
  /** 요소별 위치 오버라이드 (없으면 프리셋 기본값 사용) */
  headline?: ElementPosition;
  body?: ElementPosition;
  highlight?: ElementPosition;
  badge?: ElementPosition;
  imageFocal?: { x: number; y: number }; // 이미지 focal point (0~1)
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
  /** 슬라이드별 위치 override */
  positions?: SlidePositions;
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  surface: string;
  text: string;
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
}

export interface Decoration {
  badgeStyle: 'pill' | 'square' | 'underline' | 'none';
  cornerRadius: number;
  accentBar: 'top' | 'left' | 'bottom' | 'none';
  backgroundPattern: 'none' | 'grid' | 'dots' | 'noise' | 'mesh';
  imageTreatment: 'normal' | 'duotone' | 'grayscale';
  shadow: boolean;
}

/** 프리셋에 저장되는 위치 기본값 */
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
  theme: Theme;
  typography: Typography;
  decoration: Decoration;
  positions?: PresetPositions;
  builtin: boolean;
  /** 파일 export 시 버전 */
  version?: number;
}

export interface BgmTrack {
  id: string;
  name: string;
  url: string; // 미리듣기용 (외부)
  source: string; // 사이트명
  sourceUrl: string; // 사이트 링크
  category: 'calm' | 'bright' | 'upbeat' | 'emotional' | 'minimal' | 'exciting';
}

export interface UploadedBgm {
  fileName: string;
  fileType: string;
  /** 세션 동안만 유지 — File 객체 자체를 보관 */
  file: File;
  volume: number; // 0 ~ 1
  fadeIn: number; // 초
  fadeOut: number; // 초
}

export interface LogoConfig {
  /** data URL */
  imageUrl: string;
  position: 'bottom-left' | 'bottom-right' | 'center' | 'top-left' | 'top-right';
  frame: 'first' | 'last' | 'both';
  size: number; // 픽셀 (예: 200)
  opacity: number; // 0 ~ 1
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

export const EMPTY_UPLOADED_BGM: UploadedBgm = {
  fileName: '',
  fileType: '',
  file: null as any,
  volume: 0.3,
  fadeIn: 1,
  fadeOut: 1.5,
};