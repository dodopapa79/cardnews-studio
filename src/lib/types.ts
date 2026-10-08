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
  | 'magazine'
  | 'blank';

export type TextAlign = 'left' | 'center' | 'right';

export interface ElementPosition {
  x: number;
  y: number;
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
  align?: TextAlign;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  background?: string;
  backgroundOpacity?: number;
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
  imagePromptKo: string;
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

export interface PresetImportJSON {
  name: string;
  layout: CardLayout;
  padding: Padding;
  typography: {
    headlineSize: number;
    headlineWeight: number;
    bodySize: number;
    lineHeight: number;
    headlineLetterSpacing: string;
  };
  colors: {
    background: string;
    backgroundEnd?: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSoft: string;
  };
  decoration: Decoration;
  positions?: PresetPositions;
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

export type VideoTransition = 'fade' | 'slide' | 'slide-up' | 'zoom' | 'blur';
export type TextAnimation =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in';

export interface VideoStyle {
  transition: VideoTransition;
  transitionMs: number;
  slideDurationMs: number;
  textAnimation: TextAnimation;
}

export const DEFAULT_VIDEO_STYLE: VideoStyle = {
  transition: 'fade',
  transitionMs: 400,
  slideDurationMs: 2500,
  textAnimation: 'fade-in',
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