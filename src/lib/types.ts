export type SlideType = 'cover' | 'point' | 'data' | 'quote' | 'cta';
export type ImageLayout = 'full-bleed' | 'top-image' | 'split' | 'none';
export type VideoLayout = 'full-screen' | 'split-news';
export type PhoneApp = 'tiktok' | 'youtube' | 'instagram';

export type CardLayout =
  | 'dark-bold'
  | 'dark-blue'
  | 'dark-red'
  | 'dark-green'
  | 'dark-purple'
  | 'mesh-dark'
  | 'dark-minimal'
  | 'light-minimal'
  | 'light-gray'
  | 'light-cream';

export type BackgroundType = 'solid' | 'gradient' | 'mesh' | 'pattern';
export type TextAlign = 'left' | 'center' | 'right';

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

/**
 * 슬라이드별 텍스트/색상 오버라이드
 * - 프리셋 위에 개별 조정 가능
 */
export interface SlideTextOverride {
  // 텍스트 크기
  headlineSize?: number;
  bodySize?: number;
  headlineWeight?: number;

  // 텍스트 색상
  headlineColor?: string;
  bodyColor?: string;
  highlightColor?: string;

  // 배경/강조 색상 오버라이드
  backgroundOverride?: string;
  backgroundEndOverride?: string;
  accentOverride?: string;
  accentSoftOverride?: string;
  textOverride?: string;
  textMutedOverride?: string;

  // 자동 축소
  autoShrink?: boolean;
}

export interface Slide {
  id: string;
  type: SlideType;
  headline: string;
  body: string;
  highlight: string;
  imageUrl: string;
  imageId?: string;
  imagePrompt: string;
  imageLayout: ImageLayout;
  positions?: SlidePositions;
  textOverride?: SlideTextOverride;
}

export interface ColorVariant {
  id: string;
  name: string;
  background: string;
  backgroundEnd?: string;
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
  topLine?: boolean;
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
  colorVariants: ColorVariant[];
  typography: Typography;
  decoration: Decoration;
  padding: Padding;
  positions?: PresetPositions;
  builtin: boolean;
  version?: number;
}

export interface BrandInfo {
  brandName: string;
  website: string;
  handle: string;
  logoUrl: string;
}

export const EMPTY_BRAND: BrandInfo = {
  brandName: '',
  website: '',
  handle: '',
  logoUrl: '',
};

export interface CardNewsProject {
  id: string;
  name: string;
  slides: Slide[];
  presetId: string;
  presetColorId: string;
  brand: BrandInfo;
  createdAt: number;
  updatedAt: number;
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
  brand: BrandInfo;
}

export const EMPTY_SETTINGS: Settings = {
  geminiApiKey: '',
  cfAccountId: '',
  cfApiToken: '',
  workerUrl: 'https://tight-unit-99da.whyno2617.workers.dev',
  brand: EMPTY_BRAND,
};

export const EMPTY_LOGO: LogoConfig = {
  imageUrl: '',
  position: 'bottom-right',
  frame: 'last',
  size: 200,
  opacity: 0.9,
};