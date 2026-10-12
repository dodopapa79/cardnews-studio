import type { Preset } from './types';

/**
 * 프리셋의 모든 포인트 색상을 하나로 통일.
 * - highlight.color
 * - label.color, label.background
 * - list.numberColor
 * - numberedCard.numberColor
 * - pointBox.borderLeftColor, pointBox.labelColor
 * - divider.color
 */
export function applyAccentColor(preset: Preset, accent: string): Preset {
  return {
    ...preset,
    accentColor: accent,
    blockStyles: {
      ...preset.blockStyles,
      highlight: {
        ...preset.blockStyles.highlight,
        color: accent,
      },
      label: {
        ...preset.blockStyles.label,
        color: accent,
        background: preset.blockStyles.label.background ? accent : undefined,
      },
      list: {
        ...preset.blockStyles.list,
        numberColor: accent,
      },
      numberedCard: {
        ...preset.blockStyles.numberedCard,
        numberColor: accent,
      },
      pointBox: {
        ...preset.blockStyles.pointBox,
        borderLeftColor: accent,
        labelColor: accent,
      },
      divider: {
        ...preset.blockStyles.divider,
        color: accent,
      },
    },
  };
}

/**
 * 프리셋에서 "포인트 색상"을 추출.
 * accentColor가 있으면 그 값, 없으면 highlight.color 사용.
 */
export function getAccentColor(preset: Preset): string {
  return preset.accentColor || preset.blockStyles.highlight.color || '#3b5bfd';
}

/**
 * 프리셋의 포인트 색상이 적용된 프리셋 반환 (accentColor 없으면 원본)
 */
export function resolvePreset(preset: Preset): Preset {
  if (preset.accentColor) {
    return applyAccentColor(preset, preset.accentColor);
  }
  return preset;
}