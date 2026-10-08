// ─────────────────────────────────────────────
// 카드 사이즈
// ─────────────────────────────────────────────
export type CardSize = 'instagram' | 'square';

export const CARD_SIZE_DIMENSIONS: Record<CardSize, { width: number; height: number }> = {
  instagram: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
};

// ─────────────────────────────────────────────
// 배경
// ─────────────────────────────────────────────
export type BackgroundType = 'color' | 'gradient' | 'pattern' | 'image';
export type BackgroundPattern = 'none' | 'grid' | 'dots' | 'noise' | 'mesh';

export type ImageLayout =
  | 'full-bleed'
  | 'top-image'
  | 'split'
  | 'none';

export interface BackgroundConfig {
  type: BackgroundType;
  color: string;
  colorEnd?: string;
  pattern: BackgroundPattern;
  /** AI 생성 이미지 */
  imageUrl?: string;
  imageId?: string;
  /** 이미지 배치 방식 */
  imageLayout?: ImageLayout;
  /** 이미지 필터/효과 */
  imageBrightness?: number;
  imageContrast?: number;
  imageSaturation?: number;
  imageBlur?: number;
  imageGrayscale?: number;
  imageOpacity?: number;
  imageFocalX?: number;
  imageFocalY?: number;
  /** 이미지 위 오버레이 (배경 어둡게/밝게) */
  overlayColor?: string;
  overlayOpacity?: number;
  /** 하단 검정 그라데이션 */
  bottomFade?: boolean;
  /** 상단 이미지 하단 그라데이션 */
  topImageFade?: boolean;
}

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'color',
  color: '#ffffff',
  pattern: 'none',
  imageLayout: 'full-bleed',
  bottomFade: false,
  topImageFade: false,
};

// ─────────────────────────────────────────────
// 텍스트 요소
// ─────────────────────────────────────────────
export type TextElementKey = 'label' | 'headline' | 'body' | 'highlight' | 'footer';
export type TextAlign = 'left' | 'center' | 'right';

export type TextAnimation =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in';

export interface TextElementConfig {
  content: string;
  /** 위치 (0~1) */
  x: number;
  y: number;
  /** 스타일 */
  fontSize: number;
  fontWeight: number;
  color: string;
  align: TextAlign;
  italic: boolean;
  underline: boolean;
  lineHeight: number;
  letterSpacing: number;
  /** 배경 박스 */
  background?: string;
  backgroundOpacity?: number;
  padding?: number;
  borderRadius?: number;
  /** 최대 너비 (0~1) */
  maxWidth?: number;
  /** 영상 애니메이션 */
  animation?: TextAnimation;
  /** 표시 여부 */
  visible?: boolean;
}

export const createDefaultText = (
  content: string,
  overrides: Partial<TextElementConfig> = {}
): TextElementConfig => ({
  content,
  x: 0.08,
  y: 0.5,
  fontSize: 40,
  fontWeight: 700,
  color: '#000000',
  align: 'left',
  italic: false,
  underline: false,
  lineHeight: 1.3,
  letterSpacing: 0,
  maxWidth: 0.84,
  animation: 'fade-in',
  visible: true,
  ...overrides,
});

// ─────────────────────────────────────────────
// 슬라이드
// ─────────────────────────────────────────────
export type SlideType = 'cover' | 'point' | 'data' | 'quote' | 'cta';

export interface Slide {
  id: string;
  type: SlideType;
  background: BackgroundConfig;
  texts: {
    label?: TextElementConfig;
    headline?: TextElementConfig;
    body?: TextElementConfig;
    highlight?: TextElementConfig;
    footer?: TextElementConfig;
  };
  imagePrompt: string;
  imagePromptKo: string;
  isLast?: boolean;
}

// ─────────────────────────────────────────────
// 프리셋
// ─────────────────────────────────────────────
export interface Preset {
  id: string;
  name: string;
  category: 'style' | 'industry' | 'custom';
  description?: string;
  isBlank?: boolean;
  fontFamily: string;
  defaultBackground?: Partial<BackgroundConfig>;
  defaultHeadlineStyle?: Partial<TextElementConfig>;
  defaultBodyStyle?: Partial<TextElementConfig>;
  defaultLabelStyle?: Partial<TextElementConfig>;
  defaultHighlightStyle?: Partial<TextElementConfig>;
  defaultFooterStyle?: Partial<TextElementConfig>;
  builtin: boolean;
  version?: number;
}

export interface PresetImportJSON {
  name: string;
  description?: string;
  fontFamily?: string;
  defaultBackground?: {
    type?: BackgroundType;
    color?: string;
    colorEnd?: string;
    pattern?: BackgroundPattern;
  };
  defaultHeadlineStyle?: {
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    align?: TextAlign;
    lineHeight?: number;
    letterSpacing?: number;
    x?: number;
    y?: number;
    maxWidth?: number;
  };
  defaultBodyStyle?: {
    fontSize?: number;
    color?: string;
    align?: TextAlign;
    lineHeight?: number;
    x?: number;
    y?: number;
    maxWidth?: number;
  };
  defaultLabelStyle?: {
    fontSize?: number;
    color?: string;
    x?: number;
    y?: number;
  };
  defaultHighlightStyle?: {
    fontSize?: number;
    color?: string;
    x?: number;
    y?: number;
  };
  defaultFooterStyle?: {
    fontSize?: number;
    color?: string;
    x?: number;
    y?: number;
  };
}

// ─────────────────────────────────────────────
// 브랜드
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// 프로젝트
// ─────────────────────────────────────────────
export interface CardNewsProject {
  id: string;
  name: string;
  slides: Slide[];
  presetId: string;
  cardSize: CardSize;
  brand: BrandInfo;
  createdAt: number;
  updatedAt: number;
}

// ─────────────────────────────────────────────
// 영상 스타일
// ─────────────────────────────────────────────
export type VideoTransition = 'fade' | 'slide' | 'slide-up' | 'zoom' | 'blur';

export interface VideoStyle {
  transition: VideoTransition;
  transitionMs: number;
  slideDurationMs: number;
  textStaggerMs: number;
}

export const DEFAULT_VIDEO_STYLE: VideoStyle = {
  transition: 'fade',
  transitionMs: 400,
  slideDurationMs: 2500,
  textStaggerMs: 200,
};

export interface UploadedBgm {
  fileName: string;
  fileType: string;
  file: File;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface BgmTrack {
  id: string;
  name: string;
  url: string;
  source: string;
  sourceUrl: string;
  category: 'calm' | 'bright' | 'upbeat' | 'emotional' | 'minimal' | 'exciting';
}

// ─────────────────────────────────────────────
// 설정
// ─────────────────────────────────────────────
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