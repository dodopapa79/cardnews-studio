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
export type ImageLayout = 'full-bleed' | 'top-image' | 'split' | 'none';

export interface BackgroundConfig {
  type: BackgroundType;
  color: string;
  colorEnd?: string;
  pattern: BackgroundPattern;
  imageUrl?: string;
  imageId?: string;
  imageLayout?: ImageLayout;
  imageBrightness?: number;
  imageContrast?: number;
  imageSaturation?: number;
  imageBlur?: number;
  imageGrayscale?: number;
  imageOpacity?: number;
  imageFocalX?: number;
  imageFocalY?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  bottomFade?: boolean;
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
// 텍스트 관련
// ─────────────────────────────────────────────
export type TextAlign = 'left' | 'center' | 'right';

export type TextAnimation =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in';

export const TEXT_ANIMATIONS: { id: TextAnimation; name: string }[] = [
  { id: 'none', name: '없음' },
  { id: 'fade-in', name: '페이드인' },
  { id: 'slide-up', name: '위로' },
  { id: 'slide-down', name: '아래로' },
  { id: 'slide-left', name: '좌측' },
  { id: 'slide-right', name: '우측' },
  { id: 'zoom-in', name: '줌인' },
];

// ─────────────────────────────────────────────
// 블록 타입
// ─────────────────────────────────────────────
export type BlockType =
  | 'headline'
  | 'body'
  | 'label'
  | 'highlight'
  | 'list'
  | 'numbered-card'
  | 'point-box'
  | 'divider';

export interface BlockItem {
  number?: string;
  title: string;
  desc?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  y: number;
  content: {
    text?: string;
    boxLabel?: string;
    items?: BlockItem[];
  };
  animation?: TextAnimation;
  visible?: boolean;
}

// ─────────────────────────────────────────────
// 슬라이드
// ─────────────────────────────────────────────
export type SlideType = 'cover' | 'point' | 'data' | 'quote' | 'cta';

export interface Slide {
  id: string;
  type: SlideType;
  background: BackgroundConfig;
  blocks: Block[];
  imagePrompt: string;
  imagePromptKo: string;
  isLast?: boolean;
}

// ─────────────────────────────────────────────
// 프리셋
// ─────────────────────────────────────────────
export interface HeadlineStyle {
  fontSize: number;
  fontWeight: number;
  color: string;
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}

export interface BodyStyle {
  fontSize: number;
  fontWeight: number;
  color: string;
  align: TextAlign;
  lineHeight: number;
}

export interface LabelStyle {
  fontSize: number;
  fontWeight: number;
  color: string;
  align: TextAlign;
  background?: string;
  backgroundOpacity?: number;
  padding?: number;
  borderRadius?: number;
}

export interface HighlightStyle {
  fontSize: number;
  fontWeight: number;
  color: string;
}

export interface ListStyle {
  itemBg: string;
  itemBgOpacity?: number;
  itemBorderRadius: number;
  itemPadding: number;
  itemGap: number;
  numberColor: string;
  numberSize: number;
  titleSize: number;
  titleColor: string;
  descSize: number;
  descColor: string;
}

export interface NumberedCardStyle {
  cardBg: string;
  cardBgOpacity?: number;
  cardBorderRadius: number;
  cardPadding: number;
  cardGap: number;
  numberSize: number;
  numberColor: string;
  titleSize: number;
  titleColor: string;
  descSize: number;
  descColor: string;
}

export interface PointBoxStyle {
  bgColor: string;
  bgOpacity?: number;
  borderLeftColor: string;
  borderLeftWidth: number;
  labelColor: string;
  labelSize: number;
  textColor: string;
  textSize: number;
  padding: number;
  borderRadius: number;
}

export interface DividerStyle {
  color: string;
  thickness: number;
}

export interface PresetBlockStyles {
  headline: HeadlineStyle;
  body: BodyStyle;
  label: LabelStyle;
  highlight: HighlightStyle;
  list: ListStyle;
  numberedCard: NumberedCardStyle;
  pointBox: PointBoxStyle;
  divider: DividerStyle;
}

export interface Preset {
  id: string;
  name: string;
  category: 'style' | 'industry' | 'custom';
  description?: string;
  isBlank?: boolean;
  fontFamily: string;
  background: Partial<BackgroundConfig>;
  blockStyles: PresetBlockStyles;
  builtin: boolean;
  version?: number;
  accentColor?: string;
}

// ─────────────────────────────────────────────
// 프리셋 JSON
// ─────────────────────────────────────────────
export interface PresetImportJSON {
  name: string;
  description?: string;
  fontFamily?: string;
  accentColor?: string;
  background: {
    type?: BackgroundType;
    color?: string;
    colorEnd?: string;
    pattern?: BackgroundPattern;
  };
  blockStyles: {
    headline?: Partial<HeadlineStyle>;
    body?: Partial<BodyStyle>;
    label?: Partial<LabelStyle>;
    highlight?: Partial<HighlightStyle>;
    list?: Partial<ListStyle>;
    numberedCard?: Partial<NumberedCardStyle>;
    pointBox?: Partial<PointBoxStyle>;
    divider?: Partial<DividerStyle>;
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
// 영상
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
  /** 카드뉴스 생성 시 첫 카드 배경 이미지를 자동 생성할지 여부 */
  autoGenerateFirstImage: boolean;
}

export const EMPTY_SETTINGS: Settings = {
  geminiApiKey: '',
  cfAccountId: '',
  cfApiToken: '',
  workerUrl: 'https://tight-unit-99da.whyno2617.workers.dev',
  brand: EMPTY_BRAND,
  defaultCardSize: 'instagram',
  autoGenerateFirstImage: false,
};