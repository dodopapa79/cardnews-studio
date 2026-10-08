export type SlideType = 'cover' | 'point' | 'data' | 'quote' | 'cta';
export type ImageLayout = 'full-bleed' | 'top-image' | 'split' | 'none';
export type PhoneApp = 'tiktok' | 'youtube' | 'instagram';

export type CardSize = 'instagram' | 'square';
export const CARD_SIZE_DIMENSIONS: Record<CardSize, { width: number; height: number }> = {
  instagram: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
};

export type CardLayout =
  | 'centered'
  | 'bottom-focus'
  | 'left-bold'
  | 'top-label'
  | 'number-focus'
  | 'quote-style'
  | 'card-grid'
  | 'side-bar'
  | 'full-overlay'
  | 'magazine';

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
  label?: ElementPosition;
  imageFocal?: { x: number; y: number };
}

export interface TextStyleOverride {
  content?: string;
  fontSize?: number;
  color?: string;
  weight?: number;
  align?: 'left' | 'center' | 'right';
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  background?: string;
  padding?: number;
  borderRadius?: number;
}

export interface ImageStyleOverride {
  focal?: { x: number; y: number };
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  grayscale?: number;
  sepia?: number;
  hueRotate?: number;
  opacity?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  gradientMask?: {
    enabled: boolean;
    direction: 'top' | 'bottom' | 'left' | 'right';
    start: number;
    end: number;
  };
}

export interface Slide {
  id: string;
  type: SlideType;
  headline: string;
  body: string;
  highlight: string;
  label: string;
  imageUrl: string;
  imageId?: string;
  imagePrompt: string;
  imageLayout: ImageLayout;
  positions?: SlidePositions;
  headlineStyle?: TextStyleOverride;
  bodyStyle?: TextStyleOverride;
  highlightStyle?: TextStyleOverride;
  labelStyle?: TextStyleOverride;
  imageStyle?: ImageStyleOverride;
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
  label?: ElementPosition;
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
  cardSize: CardSize;
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

// ─────────────────────────────────────────────
// 영상 스타일
// ─────────────────────────────────────────────
export type VideoBackgroundType = 'color' | 'gradient' | 'mesh';
export type VideoCardPosition = 'top' | 'center' | 'bottom';
export type VideoTransition = 'fade' | 'slide' | 'slide-up' | 'zoom' | 'blur';

export interface VideoStyle {
  backgroundType: VideoBackgroundType;
  backgroundColor: string;
  backgroundColorEnd: string;
  backgroundPreset: string;
  cardPosition: VideoCardPosition;
  cardScale: number;
  transition: VideoTransition;
  transitionMs: number;
  slideDurationMs: number;
  showSubtitle: boolean;
  subtitleColor: string;
  subtitleBg: string;
  showProgressBar: boolean;
  progressBarColor: string;
  cardRadius: number;
  cardShadow: boolean;
}

export const VIDEO_BG_PRESETS: {
  id: string;
  name: string;
  from: string;
  to: string;
  dark?: boolean;
}[] = [
  { id: 'black', name: '블랙', from: '#000000', to: '#1a1a1a', dark: true },
  { id: 'navy', name: '네이비', from: '#0f172a', to: '#1e293b', dark: true },
  { id: 'deep-blue', name: '딥 블루', from: '#082f49', to: '#0c4a6e', dark: true },
  { id: 'burgundy', name: '버건디', from: '#450a0a', to: '#7f1d1d', dark: true },
  { id: 'deep-red', name: '딥 레드', from: '#7f1d1d', to: '#991b1b', dark: true },
  { id: 'forest', name: '포레스트', from: '#052e16', to: '#064e3b', dark: true },
  { id: 'purple', name: '퍼플', from: '#3b0764', to: '#581c87', dark: true },
  { id: 'dark-gray', name: '다크 그레이', from: '#171717', to: '#262626', dark: true },
  { id: 'warm-gray', name: '웜 그레이', from: '#1c1917', to: '#292524', dark: true },
  { id: 'white', name: '화이트', from: '#ffffff', to: '#f5f5f5' },
  { id: 'cream', name: '크림', from: '#fffbf5', to: '#fef3c7' },
  { id: 'pink', name: '핑크', from: '#831843', to: '#be185d', dark: true },
];

export const DEFAULT_VIDEO_STYLE: VideoStyle = {
  backgroundType: 'gradient',
  backgroundColor: '#000000',
  backgroundColorEnd: '#1a1a1a',
  backgroundPreset: 'black',
  cardPosition: 'center',
  cardScale: 0.85,
  transition: 'fade',
  transitionMs: 400,
  slideDurationMs: 2500,
  showSubtitle: false,
  subtitleColor: '#ffffff',
  subtitleBg: 'rgba(0,0,0,0.7)',
  showProgressBar: true,
  progressBarColor: '#8b5cf6',
  cardRadius: 32,
  cardShadow: true,
};

export interface Settings {
  geminiApiKey: string;
  cfAccountId: string;
  cfApiToken: string;
  workerUrl: string;
  brand: BrandInfo;
  defaultCardSize: CardSize;
}

export const EMPTY_SETTINGS: Settings = {
  geminiApiKey: '',
  cfAccountId: '',
  cfApiToken: '',
  workerUrl: 'https://tight-unit-99da.whyno2617.workers.dev',
  brand: EMPTY_BRAND,
  defaultCardSize: 'instagram',
};

export const EMPTY_LOGO: LogoConfig = {
  imageUrl: '',
  position: 'bottom-right',
  frame: 'last',
  size: 200,
  opacity: 0.9,
};