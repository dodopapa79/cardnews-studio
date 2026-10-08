export { BackgroundLayer } from './BackgroundLayer';
export { TextLayer } from './TextLayer';
export { CardRenderer, BackgroundOnlyRenderer } from './CardRenderer';

// ─────────────────────────────────────────────
// 기존 CardSlide — 새 CardRenderer로 위임
// (이전 코드 호환용)
// ─────────────────────────────────────────────
import React from 'react';
import type { Slide, Preset, BrandInfo } from '@/lib/types';
import { CardRenderer } from './CardRenderer';

/** @deprecated CardRenderer 사용 권장 */
export interface CardSlideProps {
  slide: Slide;
  preset?: Preset;
  colorId?: string;
  brand?: BrandInfo;
  editable?: boolean;
  onElementClick?: (el: string) => void;
  selectedElement?: string | null;
  onElementDrag?: (el: string, pos: { x: number; y: number }) => void;
  width?: number;
  height?: number;
  isLast?: boolean;
}

/** @deprecated CardRenderer 사용 권장 */
export function CardSlide({
  slide,
  brand,
  editable = false,
  onElementClick,
  selectedElement,
  width = 1080,
  height = 1350,
  isLast = false,
}: CardSlideProps) {
  return (
    <CardRenderer
      slide={{ ...slide, isLast }}
      brand={brand}
      width={width}
      height={height}
      editable={editable}
      selectedElement={selectedElement}
      onSelectElement={onElementClick}
    />
  );
}