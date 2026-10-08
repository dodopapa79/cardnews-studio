export {
  STYLE_PRESETS,
  BG_PRESETS,
  getPresetById,
  applyPresetToSlide,
  applyPresetToAllSlides,
} from '@/lib/presets';

export type { BgPreset } from '@/lib/presets';

// 하위 호환 (기존 코드가 INDUSTRY_PRESETS 참조하는 경우 대비)
export const INDUSTRY_PRESETS: any[] = [];
export const ALL_BUILTIN_PRESETS: any[] = [];