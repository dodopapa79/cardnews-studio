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

export interface BackgroundConfig {
  type: BackgroundType;
  color: string;
  colorEnd?: string;
  pattern: BackgroundPattern;
  /** AI 생성 이미지 */
  imageUrl?: string;
  imageId?: string;
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
  /** 하단 검정 그라데이션 (어두운 배경) */
  bottomFade?: boolean;
  /** 상단 이미지 하단 그라데이션 (배경색으로 이어짐) */
  topImageFade?: boolean;
}

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'color',
  color: '#ffffff',
  pattern: 'none',
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
  /** 위치 (0~1, 카드 기준 비율) */
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
  /** 최대 너비 (0~1, 카드 기준 비율) */
  maxWidth?: number;
  /** 영상용 애니메이션 */
  animation?: TextAnimation;
  /** 표시 여부 */
  visible?: boolean;
}

export const createDefaultText = (
  content: string,
  overrides: Partial<TextElementConfig> = {}
): TextElementConfig => ({
  content,
  x: 0.1,
  y: 0.5,
  fontSize: 40,
  fontWeight: 700,
  color: '#000000',
  align: 'left',
  italic: false,
  underline: false,
  lineHeight: 1.3,
  letterSpacing: 0,
  maxWidth: 0.8,
  animation: 'fade-in',
  visible: true,
  ...overrides,
});

// ─────────────────────────────────────────────
// 슬라이드 (배경 + 텍스트 분리)
// ─────────────────────────────────────────────
export interface Slide {
  id: string;
  type: 'cover' | 'point' | 'data' | 'quote' | 'cta';
  /** 배경 (색상/이미지) */
  background: BackgroundConfig;
  /** 텍스트 요소들 */
  texts: {
    label?: TextElementConfig;
    headline?: TextElementConfig;
    body?: TextElementConfig;
    highlight?: TextElementConfig;
    footer?: TextElementConfig;
  };
  /** 이미지 프롬프트 */
  imagePrompt: string;
  imagePromptKo: string;
  /** 마지막 카드 여부 */
  isLast?: boolean;
}

// ─────────────────────────────────────────────
// 프리셋 (빈 프리셋이 기본)
// ─────────────────────────────────────────────
export interface Preset {
  id: string;
  name: string;
  category: 'style' | 'industry' | 'custom';
  description?: string;
  /** 빈 프리셋 여부 */
  isBlank?: boolean;
  /** 폰트 패밀리 */
  fontFamily: string;
  /** 배경 기본값 (슬라이드별 override 가능) */
  defaultBackground?: Partial<BackgroundConfig>;
  /** 텍스트 기본 스타일 (슬라이드별 override 가능) */
  defaultHeadlineStyle?: Partial<TextElementConfig>;
  defaultBodyStyle?: Partial<TextElementConfig>;
  defaultLabelStyle?: Partial<TextElementConfig>;
  defaultHighlightStyle?: Partial<TextElementConfig>;
  defaultFooterStyle?: Partial<TextElementConfig>;
  builtin: boolean;
  version?: number;
}

// JSON 가져오기 스키마
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
  };
  defaultBodyStyle?: {
    fontSize?: number;
    color?: string;
    align?: TextAlign;
    lineHeight?: number;
    x?: number;
    y?: number;
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
  /** 텍스트 요소별 애니메이션 간격 (ms) */
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

// ─────────────────────────────────────────────
// BGM 사이트
// ─────────────────────────────────────────────
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