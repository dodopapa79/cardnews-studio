'use client';
import React, { forwardRef } from 'react';
import type { Slide, Preset, BrandInfo } from '@/lib/types';
import { BackgroundLayer, hasDarkImageBackdrop } from './BackgroundLayer';
import { TextLayer } from './TextLayer';

// ─────────────────────────────────────────────
// 색상 밝기 판단
// ─────────────────────────────────────────────
function isDark(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// ─────────────────────────────────────────────
// 마지막 카드 브랜드 정보
// ─────────────────────────────────────────────
function LastCardBrand({
  brand,
  isDark: dark,
}: {
  brand?: BrandInfo;
  isDark: boolean;
}) {
  if (!brand?.brandName && !brand?.website && !brand?.logoUrl) return null;

  const mainColor = dark ? '#ffffff' : '#0a0a0a';
  const mutedColor = dark ? 'rgba(255,255,255,0.8)' : 'rgba(10,10,10,0.7)';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '68%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        textAlign: 'center',
        zIndex: 4,
        pointerEvents: 'none',
      }}
    >
      {brand?.logoUrl && (
        <img
          src={brand.logoUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            width: 100,
            height: 100,
            objectFit: 'contain',
            filter: dark ? 'brightness(0) invert(1)' : 'none',
          }}
        />
      )}
      {brand?.brandName && (
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: mainColor,
            letterSpacing: '0.03em',
            lineHeight: 1.2,
          }}
        >
          {brand.brandName}
        </div>
      )}
      {brand?.website && (
        <div
          style={{
            fontSize: 28,
            color: mutedColor,
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {brand.website}
        </div>
      )}
      {brand?.handle && (
        <div
          style={{
            fontSize: 24,
            color: mutedColor,
            opacity: 0.8,
            fontWeight: 500,
          }}
        >
          {brand.handle}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CardRenderer
// ─────────────────────────────────────────────
export interface CardRendererProps {
  slide: Slide;
  preset?: Preset;
  brand?: BrandInfo;
  width: number;
  height: number;
  editable?: boolean;
  selectedElement?: string | null;
  onSelectElement?: (key: string) => void;
  onChangeText?: (key: string, patch: any) => void;
  onSelectBackground?: () => void;
}

export const CardRenderer = forwardRef<HTMLDivElement, CardRendererProps>(
  function CardRenderer(
    {
      slide,
      preset,
      brand,
      width,
      height,
      editable = false,
      selectedElement,
      onSelectElement,
      onChangeText,
      onSelectBackground,
    },
    ref
  ) {
    const bgIsDark = isDark(slide.background.color);
    const onDarkImage = hasDarkImageBackdrop(slide.background);

    return (
      <div
        ref={ref}
        data-card
        data-card-container
        style={{
          width,
          height,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: slide.background.color,
          fontFamily: preset?.fontFamily || 'Pretendard, system-ui, sans-serif',
        }}
      >
        {/* 배경 레이어 */}
        <div
          data-background-container
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <BackgroundLayer
            background={slide.background}
            width={width}
            height={height}
            editable={editable}
            isSelected={selectedElement === 'background'}
            accent="#8b5cf6"
            onClick={onSelectBackground}
          />
        </div>

        {/* 마지막 카드 브랜드 */}
        {slide.isLast && (
          <LastCardBrand brand={brand} isDark={bgIsDark || onDarkImage} />
        )}

        {/* 텍스트 레이어 */}
        <TextLayer
          texts={slide.texts}
          cardWidth={width}
          cardHeight={height}
          editable={editable}
          selectedElement={selectedElement}
          accent="#8b5cf6"
          onDarkBackdrop={onDarkImage}
          onSelectElement={onSelectElement}
          onChangeText={onChangeText}
        />
      </div>
    );
  }
);

// ─────────────────────────────────────────────
// BackgroundOnlyRenderer (영상용)
// ─────────────────────────────────────────────
export const BackgroundOnlyRenderer = forwardRef<
  HTMLDivElement,
  { slide: Slide; width: number; height: number; brand?: BrandInfo }
>(function BackgroundOnlyRenderer({ slide, width, height, brand }, ref) {
  const bgIsDark =
    isDark(slide.background.color) || hasDarkImageBackdrop(slide.background);

  return (
    <div
      ref={ref}
      data-background-only
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: slide.background.color,
      }}
    >
      <BackgroundLayer
        background={slide.background}
        width={width}
        height={height}
      />
      {slide.isLast && <LastCardBrand brand={brand} isDark={bgIsDark} />}
    </div>
  );
});