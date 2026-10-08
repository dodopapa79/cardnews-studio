import type {
  Preset,
  PresetImportJSON,
  BackgroundType,
  BackgroundPattern,
  PresetBlockStyles,
} from './types';
import { STYLE_PRESETS } from './presets';

function isValidHex(s: string | undefined): boolean {
  if (!s) return false;
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

function clamp(n: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof n !== 'number' || isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

const VALID_BG_TYPES: BackgroundType[] = ['color', 'gradient', 'pattern', 'image'];
const VALID_PATTERNS: BackgroundPattern[] = ['none', 'grid', 'dots', 'noise', 'mesh'];

const BASE_STYLES: PresetBlockStyles = STYLE_PRESETS[0].blockStyles;

export function parsePresetJSON(jsonStr: string, overrideName?: string): Preset {
  let data: any;
  try {
    let cleaned = jsonStr.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();
    data = JSON.parse(cleaned);
  } catch {
    throw new Error('JSON 파싱 실패. 올바른 JSON 형식인지 확인하세요.');
  }

  if (!data.name && !overrideName) {
    throw new Error('name 필드가 없습니다.');
  }

  const json: PresetImportJSON = data;
  const bs = json.blockStyles || {};

  const preset: Preset = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: overrideName || String(json.name).slice(0, 30) || '커스텀 프리셋',
    category: 'custom',
    description: json.description || 'AI가 생성한 프리셋',
    fontFamily: json.fontFamily || 'Pretendard, system-ui, sans-serif',
    background: {
      type: VALID_BG_TYPES.includes(json.background?.type as any)
        ? (json.background!.type as BackgroundType)
        : 'color',
      color: isValidHex(json.background?.color)
        ? json.background!.color!
        : '#ffffff',
      colorEnd: isValidHex(json.background?.colorEnd)
        ? json.background!.colorEnd
        : undefined,
      pattern: VALID_PATTERNS.includes(json.background?.pattern as any)
        ? (json.background!.pattern as BackgroundPattern)
        : 'none',
    },
    blockStyles: {
      headline: {
        ...BASE_STYLES.headline,
        fontSize: clamp(bs.headline?.fontSize, 20, 200, BASE_STYLES.headline.fontSize),
        fontWeight: clamp(bs.headline?.fontWeight, 400, 900, BASE_STYLES.headline.fontWeight),
        color: isValidHex(bs.headline?.color) ? bs.headline!.color! : BASE_STYLES.headline.color,
        align: ['left', 'center', 'right'].includes(bs.headline?.align as any)
          ? bs.headline!.align!
          : BASE_STYLES.headline.align,
        lineHeight: clamp(bs.headline?.lineHeight, 0.9, 2.5, BASE_STYLES.headline.lineHeight),
        letterSpacing: clamp(bs.headline?.letterSpacing, -0.1, 0.5, BASE_STYLES.headline.letterSpacing),
      },
      body: {
        ...BASE_STYLES.body,
        fontSize: clamp(bs.body?.fontSize, 14, 80, BASE_STYLES.body.fontSize),
        fontWeight: clamp(bs.body?.fontWeight, 300, 900, BASE_STYLES.body.fontWeight),
        color: isValidHex(bs.body?.color) ? bs.body!.color! : BASE_STYLES.body.color,
        align: ['left', 'center', 'right'].includes(bs.body?.align as any)
          ? bs.body!.align!
          : BASE_STYLES.body.align,
        lineHeight: clamp(bs.body?.lineHeight, 0.9, 2.5, BASE_STYLES.body.lineHeight),
      },
      label: {
        ...BASE_STYLES.label,
        fontSize: clamp(bs.label?.fontSize, 12, 60, BASE_STYLES.label.fontSize),
        fontWeight: clamp(bs.label?.fontWeight, 400, 900, BASE_STYLES.label.fontWeight),
        color: isValidHex(bs.label?.color) ? bs.label!.color! : BASE_STYLES.label.color,
        align: ['left', 'center', 'right'].includes(bs.label?.align as any)
          ? bs.label!.align!
          : BASE_STYLES.label.align,
        background: isValidHex(bs.label?.background) ? bs.label!.background : undefined,
        backgroundOpacity: bs.label?.backgroundOpacity,
        padding: bs.label?.padding,
        borderRadius: bs.label?.borderRadius,
      },
      highlight: {
        ...BASE_STYLES.highlight,
        fontSize: clamp(bs.highlight?.fontSize, 40, 300, BASE_STYLES.highlight.fontSize),
        fontWeight: clamp(bs.highlight?.fontWeight, 400, 900, BASE_STYLES.highlight.fontWeight),
        color: isValidHex(bs.highlight?.color) ? bs.highlight!.color! : BASE_STYLES.highlight.color,
      },
      list: {
        ...BASE_STYLES.list,
        itemBg: isValidHex(bs.list?.itemBg) ? bs.list!.itemBg! : BASE_STYLES.list.itemBg,
        itemBgOpacity: bs.list?.itemBgOpacity,
        itemBorderRadius: clamp(bs.list?.itemBorderRadius, 0, 40, BASE_STYLES.list.itemBorderRadius),
        itemPadding: clamp(bs.list?.itemPadding, 8, 60, BASE_STYLES.list.itemPadding),
        itemGap: clamp(bs.list?.itemGap, 4, 40, BASE_STYLES.list.itemGap),
        numberColor: isValidHex(bs.list?.numberColor) ? bs.list!.numberColor! : BASE_STYLES.list.numberColor,
        numberSize: clamp(bs.list?.numberSize, 16, 100, BASE_STYLES.list.numberSize),
        titleSize: clamp(bs.list?.titleSize, 16, 80, BASE_STYLES.list.titleSize),
        titleColor: isValidHex(bs.list?.titleColor) ? bs.list!.titleColor! : BASE_STYLES.list.titleColor,
        descSize: clamp(bs.list?.descSize, 14, 60, BASE_STYLES.list.descSize),
        descColor: isValidHex(bs.list?.descColor) ? bs.list!.descColor! : BASE_STYLES.list.descColor,
      },
      numberedCard: {
        ...BASE_STYLES.numberedCard,
        cardBg: isValidHex(bs.numberedCard?.cardBg) ? bs.numberedCard!.cardBg! : BASE_STYLES.numberedCard.cardBg,
        cardBgOpacity: bs.numberedCard?.cardBgOpacity,
        cardBorderRadius: clamp(bs.numberedCard?.cardBorderRadius, 0, 40, BASE_STYLES.numberedCard.cardBorderRadius),
        cardPadding: clamp(bs.numberedCard?.cardPadding, 8, 60, BASE_STYLES.numberedCard.cardPadding),
        cardGap: clamp(bs.numberedCard?.cardGap, 4, 40, BASE_STYLES.numberedCard.cardGap),
        numberSize: clamp(bs.numberedCard?.numberSize, 20, 120, BASE_STYLES.numberedCard.numberSize),
        numberColor: isValidHex(bs.numberedCard?.numberColor)
          ? bs.numberedCard!.numberColor!
          : BASE_STYLES.numberedCard.numberColor,
        titleSize: clamp(bs.numberedCard?.titleSize, 16, 80, BASE_STYLES.numberedCard.titleSize),
        titleColor: isValidHex(bs.numberedCard?.titleColor)
          ? bs.numberedCard!.titleColor!
          : BASE_STYLES.numberedCard.titleColor,
        descSize: clamp(bs.numberedCard?.descSize, 14, 60, BASE_STYLES.numberedCard.descSize),
        descColor: isValidHex(bs.numberedCard?.descColor)
          ? bs.numberedCard!.descColor!
          : BASE_STYLES.numberedCard.descColor,
      },
      pointBox: {
        ...BASE_STYLES.pointBox,
        bgColor: isValidHex(bs.pointBox?.bgColor) ? bs.pointBox!.bgColor! : BASE_STYLES.pointBox.bgColor,
        bgOpacity: bs.pointBox?.bgOpacity,
        borderLeftColor: isValidHex(bs.pointBox?.borderLeftColor)
          ? bs.pointBox!.borderLeftColor!
          : BASE_STYLES.pointBox.borderLeftColor,
        borderLeftWidth: clamp(bs.pointBox?.borderLeftWidth, 0, 20, BASE_STYLES.pointBox.borderLeftWidth),
        labelColor: isValidHex(bs.pointBox?.labelColor)
          ? bs.pointBox!.labelColor!
          : BASE_STYLES.pointBox.labelColor,
        labelSize: clamp(bs.pointBox?.labelSize, 12, 60, BASE_STYLES.pointBox.labelSize),
        textColor: isValidHex(bs.pointBox?.textColor)
          ? bs.pointBox!.textColor!
          : BASE_STYLES.pointBox.textColor,
        textSize: clamp(bs.pointBox?.textSize, 14, 60, BASE_STYLES.pointBox.textSize),
        padding: clamp(bs.pointBox?.padding, 8, 60, BASE_STYLES.pointBox.padding),
        borderRadius: clamp(bs.pointBox?.borderRadius, 0, 40, BASE_STYLES.pointBox.borderRadius),
      },
      divider: {
        ...BASE_STYLES.divider,
        color: isValidHex(bs.divider?.color) ? bs.divider!.color! : BASE_STYLES.divider.color,
        thickness: clamp(bs.divider?.thickness, 1, 10, BASE_STYLES.divider.thickness),
      },
    },
    builtin: false,
    version: 6,
  };

  return preset;
}

export function presetToJSON(preset: Preset): PresetImportJSON {
  return {
    name: preset.name,
    description: preset.description,
    fontFamily: preset.fontFamily,
    background: {
      type: preset.background.type,
      color: preset.background.color,
      colorEnd: preset.background.colorEnd,
      pattern: preset.background.pattern,
    },
    blockStyles: {
      headline: preset.blockStyles.headline,
      body: preset.blockStyles.body,
      label: preset.blockStyles.label,
      highlight: preset.blockStyles.highlight,
      list: preset.blockStyles.list,
      numberedCard: preset.blockStyles.numberedCard,
      pointBox: preset.blockStyles.pointBox,
      divider: preset.blockStyles.divider,
    },
  };
}