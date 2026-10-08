import type {
  Preset,
  PresetImportJSON,
  BackgroundType,
  BackgroundPattern,
  TextAlign,
} from './types';

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
const VALID_ALIGNS: TextAlign[] = ['left', 'center', 'right'];

/**
 * AI가 반환한 JSON을 Preset으로 변환
 */
export function parsePresetJSON(jsonStr: string): Preset {
  let data: any;
  try {
    let cleaned = jsonStr.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    data = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('JSON 파싱 실패. 올바른 JSON 형식인지 확인하세요.');
  }

  if (!data.name) throw new Error('name 필드가 없습니다.');

  const json: PresetImportJSON = data;

  const preset: Preset = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: String(json.name).slice(0, 30) || '커스텀 프리셋',
    category: 'custom',
    description: json.description || 'AI가 생성한 프리셋',
    fontFamily: json.fontFamily || 'Pretendard, system-ui, sans-serif',
    defaultBackground: {
      type: VALID_BG_TYPES.includes(json.defaultBackground?.type as any)
        ? (json.defaultBackground!.type as BackgroundType)
        : 'color',
      color: isValidHex(json.defaultBackground?.color)
        ? json.defaultBackground!.color!
        : '#ffffff',
      colorEnd: isValidHex(json.defaultBackground?.colorEnd)
        ? json.defaultBackground!.colorEnd
        : undefined,
      pattern: VALID_PATTERNS.includes(json.defaultBackground?.pattern as any)
        ? (json.defaultBackground!.pattern as BackgroundPattern)
        : 'none',
    },
    defaultHeadlineStyle: json.defaultHeadlineStyle
      ? {
          fontSize: clamp(json.defaultHeadlineStyle.fontSize, 20, 200, 88),
          fontWeight: clamp(json.defaultHeadlineStyle.fontWeight, 400, 900, 900),
          color: isValidHex(json.defaultHeadlineStyle.color)
            ? json.defaultHeadlineStyle.color
            : '#0a0a0a',
          align: VALID_ALIGNS.includes(json.defaultHeadlineStyle.align as any)
            ? (json.defaultHeadlineStyle.align as TextAlign)
            : 'left',
          lineHeight: clamp(json.defaultHeadlineStyle.lineHeight, 0.9, 2.5, 1.15),
          letterSpacing: clamp(json.defaultHeadlineStyle.letterSpacing, -0.1, 0.5, -0.03),
          x: clamp(json.defaultHeadlineStyle.x, 0, 1, 0.08),
          y: clamp(json.defaultHeadlineStyle.y, 0, 1, 0.4),
        }
      : undefined,
    defaultBodyStyle: json.defaultBodyStyle
      ? {
          fontSize: clamp(json.defaultBodyStyle.fontSize, 14, 80, 32),
          color: isValidHex(json.defaultBodyStyle.color)
            ? json.defaultBodyStyle.color
            : '#525252',
          align: VALID_ALIGNS.includes(json.defaultBodyStyle.align as any)
            ? (json.defaultBodyStyle.align as TextAlign)
            : 'left',
          lineHeight: clamp(json.defaultBodyStyle.lineHeight, 0.9, 2.5, 1.55),
          x: clamp(json.defaultBodyStyle.x, 0, 1, 0.08),
          y: clamp(json.defaultBodyStyle.y, 0, 1, 0.62),
        }
      : undefined,
    defaultLabelStyle: json.defaultLabelStyle
      ? {
          fontSize: clamp(json.defaultLabelStyle.fontSize, 12, 60, 22),
          color: isValidHex(json.defaultLabelStyle.color)
            ? json.defaultLabelStyle.color
            : '#8b5cf6',
          x: clamp(json.defaultLabelStyle.x, 0, 1, 0.08),
          y: clamp(json.defaultLabelStyle.y, 0, 1, 0.1),
        }
      : undefined,
    defaultHighlightStyle: json.defaultHighlightStyle
      ? {
          fontSize: clamp(json.defaultHighlightStyle.fontSize, 40, 300, 160),
          color: isValidHex(json.defaultHighlightStyle.color)
            ? json.defaultHighlightStyle.color
            : '#8b5cf6',
          x: clamp(json.defaultHighlightStyle.x, 0, 1, 0.08),
          y: clamp(json.defaultHighlightStyle.y, 0, 1, 0.35),
        }
      : undefined,
    defaultFooterStyle: json.defaultFooterStyle
      ? {
          fontSize: clamp(json.defaultFooterStyle.fontSize, 12, 60, 22),
          color: isValidHex(json.defaultFooterStyle.color)
            ? json.defaultFooterStyle.color
            : '#737373',
          x: clamp(json.defaultFooterStyle.x, 0, 1, 0.5),
          y: clamp(json.defaultFooterStyle.y, 0, 1, 0.94),
        }
      : undefined,
    builtin: false,
    version: 5,
  };

  return preset;
}

/** 프리셋을 JSON으로 내보내기 */
export function presetToJSON(preset: Preset): PresetImportJSON {
  return {
    name: preset.name,
    description: preset.description,
    fontFamily: preset.fontFamily,
    defaultBackground: preset.defaultBackground
      ? {
          type: preset.defaultBackground.type,
          color: preset.defaultBackground.color,
          colorEnd: preset.defaultBackground.colorEnd,
          pattern: preset.defaultBackground.pattern,
        }
      : undefined,
    defaultHeadlineStyle: preset.defaultHeadlineStyle
      ? {
          fontSize: preset.defaultHeadlineStyle.fontSize,
          fontWeight: preset.defaultHeadlineStyle.fontWeight,
          color: preset.defaultHeadlineStyle.color,
          align: preset.defaultHeadlineStyle.align,
          lineHeight: preset.defaultHeadlineStyle.lineHeight,
          letterSpacing: preset.defaultHeadlineStyle.letterSpacing,
          x: preset.defaultHeadlineStyle.x,
          y: preset.defaultHeadlineStyle.y,
        }
      : undefined,
    defaultBodyStyle: preset.defaultBodyStyle
      ? {
          fontSize: preset.defaultBodyStyle.fontSize,
          color: preset.defaultBodyStyle.color,
          align: preset.defaultBodyStyle.align,
          lineHeight: preset.defaultBodyStyle.lineHeight,
          x: preset.defaultBodyStyle.x,
          y: preset.defaultBodyStyle.y,
        }
      : undefined,
    defaultLabelStyle: preset.defaultLabelStyle
      ? {
          fontSize: preset.defaultLabelStyle.fontSize,
          color: preset.defaultLabelStyle.color,
          x: preset.defaultLabelStyle.x,
          y: preset.defaultLabelStyle.y,
        }
      : undefined,
    defaultHighlightStyle: preset.defaultHighlightStyle
      ? {
          fontSize: preset.defaultHighlightStyle.fontSize,
          color: preset.defaultHighlightStyle.color,
          x: preset.defaultHighlightStyle.x,
          y: preset.defaultHighlightStyle.y,
        }
      : undefined,
    defaultFooterStyle: preset.defaultFooterStyle
      ? {
          fontSize: preset.defaultFooterStyle.fontSize,
          color: preset.defaultFooterStyle.color,
          x: preset.defaultFooterStyle.x,
          y: preset.defaultFooterStyle.y,
        }
      : undefined,
  };
}