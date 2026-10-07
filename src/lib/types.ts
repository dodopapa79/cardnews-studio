export type SlideType = 'cover' | 'point' | 'data' | 'quote' | 'cta';
export type ImageLayout = 'full-bleed' | 'top-image' | 'split' | 'none';
export type VideoLayout = 'full-screen' | 'split-news';

export interface Slide {
  id: string;
  type: SlideType;
  headline: string;
  body: string;
  highlight: string;
  imageUrl: string;
  imagePrompt: string;
  imageLayout: ImageLayout;
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

export interface Preset {
  id: string;
  name: string;
  category: 'style' | 'industry' | 'custom';
  description?: string;
  theme: Theme;
  typography: Typography;
  decoration: Decoration;
  builtin: boolean;
}

export interface Settings {
  geminiApiKey: string;
  cfAccountId: string;
  cfApiToken: string;
}

export const EMPTY_SETTINGS: Settings = {
  geminiApiKey: '',
  cfAccountId: '',
  cfApiToken: '',
};