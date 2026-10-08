import type {
  Preset,
  PresetImportJSON,
  ColorVariant,
  CardLayout,
  Decoration,
} from './types';

const VALID_LAYOUTS: CardLayout[] = [
  'centered',
  'bottom-focus',
  'left-bold',
  'top-label',
  'number-focus',
  'quote-style',
  'card-grid',
  'side-bar',
  'full-overlay',
  'magazine',
  'blank',
];

const VALID_BADGE_STYLES = ['pill', 'square', 'underline', 'none', 'circle-number'];
const VALID_ACCENT_BARS = ['top', 'left', 'bottom', 'none'];
const VALID_PATTERNS = ['none', 'grid', 'dots', 'noise', 'mesh'];

/** HEX 유효성 검사 */
function isValidHex(s: string | undefined): boolean {
  if (!s) return false;
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

/** 숫자 범위 제한 */
function clamp(n: number, min: number, max: number, fallback: number): number {
  if (typeof n !== 'number' || isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/**
 * AI가 반환한 JSON을 Preset으로 변환
 */
export function parsePresetJSON(jsonStr: string): Preset {
  let data: any;
  try {
    // 마크다운 코드블록 제거
    let cleaned = jsonStr.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    data = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('JSON 파싱 실패. 올바른 JSON 형식인지 확인하세요.');
  }

  // 필수 필드 확인
  if (!data.colors) throw new Error('colors 필드가 없습니다.');
  if (!data.typography) throw new Error('typography 필드가 없습니다.');

  const layout: CardLayout = VALID_LAYOUTS.includes(data.layout)
    ? data.layout
    : 'centered';

  // 색상 검증
  const background = isValidHex(data.colors.background)
    ? data.colors.background
    : '#ffffff';
  const backgroundEnd = isValidHex(data.colors.backgroundEnd)
    ? data.colors.backgroundEnd
    : undefined;
  const text = isValidHex(data.colors.text) ? data.colors.text : '#000000';
  const textMuted = isValidHex(data.colors.textMuted)
    ? data.colors.textMuted
    : '#666666';
  const accent = isValidHex(data.colors.accent) ? data.colors.accent : '#000000';
  const accentSoft = isValidHex(data.colors.accentSoft)
    ? data.colors.accentSoft
    : '#e5e5e5';

  const colorVariant: ColorVariant = {
    id: 'primary',
    name: '기본',
    background,
    backgroundEnd,
    surface: background,
    text,
    textMuted,
    accent,
    accentSoft,
  };

  // 타이포그래피
  const typography = {
    fontFamily: 'Pretendard, system-ui, sans-serif',
    headlineSize: clamp(data.typography.headlineSize, 40, 200, 96),
    headlineWeight: clamp(data.typography.headlineWeight, 400, 900, 800),
    bodySize: clamp(data.typography.bodySize, 16, 60, 30),
    lineHeight: clamp(data.typography.lineHeight, 0.9, 2.5, 1.3),
    headlineLetterSpacing:
      typeof data.typography.headlineLetterSpacing === 'string'
        ? data.typography.headlineLetterSpacing
        : '-0.03em',
    headlineUppercase: !!data.typography.headlineUppercase,
  };

  // 장식
  const decoIn = data.decoration || {};
  const decoration: Decoration = {
    badgeStyle: VALID_BADGE_STYLES.includes(decoIn.badgeStyle)
      ? decoIn.badgeStyle
      : 'pill',
    cornerRadius: clamp(decoIn.cornerRadius ?? 12, 0, 64, 12),
    accentBar: VALID_ACCENT_BARS.includes(decoIn.accentBar)
      ? decoIn.accentBar
      : 'none',
    backgroundPattern: VALID_PATTERNS.includes(decoIn.backgroundPattern)
      ? decoIn.backgroundPattern
      : 'none',
    imageTreatment: 'normal',
    shadow: !!decoIn.shadow,
    topLine: !!decoIn.topLine,
    bottomCircle: !!decoIn.bottomCircle,
  };

  // 여백
  const padIn = data.padding || {};
  const padding = {
    top: clamp(padIn.top ?? 100, 0, 300, 100),
    right: clamp(padIn.right ?? 100, 0, 300, 100),
    bottom: clamp(padIn.bottom ?? 120, 0, 300, 120),
    left: clamp(padIn.left ?? 100, 0, 300, 100),
  };

  // 위치
  const positions =
    data.positions && typeof data.positions === 'object'
      ? data.positions
      : undefined;

  const preset: Preset = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: typeof data.name === 'string' && data.name.trim()
      ? data.name.trim().slice(0, 30)
      : '커스텀 프리셋',
    category: 'custom',
    description: 'AI가 생성한 프리셋',
    layout,
    colorVariants: [colorVariant],
    typography,
    decoration,
    padding,
    positions,
    builtin: false,
    version: 1,
  };

  return preset;
}

/** 프리셋을 JSON으로 내보내기 */
export function presetToJSON(preset: Preset): PresetImportJSON {
  const c = preset.colorVariants[0];
  return {
    name: preset.name,
    layout: preset.layout,
    padding: preset.padding,
    typography: {
      headlineSize: preset.typography.headlineSize,
      headlineWeight: preset.typography.headlineWeight,
      bodySize: preset.typography.bodySize,
      lineHeight: preset.typography.lineHeight,
      headlineLetterSpacing: preset.typography.headlineLetterSpacing,
    },
    colors: {
      background: c.background,
      backgroundEnd: c.backgroundEnd,
      text: c.text,
      textMuted: c.textMuted,
      accent: c.accent,
      accentSoft: c.accentSoft,
    },
    decoration: preset.decoration,
    positions: preset.positions,
  };
}