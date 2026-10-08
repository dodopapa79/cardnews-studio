'use client';
import React, { forwardRef } from 'react';
import type { Slide, Preset, BrandInfo, Block } from '@/lib/types';
import { BackgroundLayer, hasDarkImageBackdrop } from './BackgroundLayer';
import { BlockRenderer } from './BlockRenderer';

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
// 마지막 카드 브랜드
// ─────────────────────────────────────────────
function LastCardBrand({
  brand,
  dark,
}: {
  brand?: BrandInfo;
  dark: boolean;
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
        bottom: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
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
            width: 90,
            height: 90,
            objectFit: 'contain',
            filter: dark ? 'brightness(0) invert(1)' : 'none',
          }}
        />
      )}
      {brand?.brandName && (
        <div
          style={{
            fontSize: 36,
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
            fontSize: 26,
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
            fontSize: 22,
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
  preset: Preset;
  brand?: BrandInfo;
  width: number;
  height: number;
  editable?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
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
      selectedBlockId,
      onSelectBlock,
      onSelectBackground,
    },
    ref
  ) {
    const bgIsDark = isDark(slide.background.color);
    const onDarkImage = hasDarkImageBackdrop(slide.background);

    // 편집 가능한 블록만 표시 (visible + content 있음)
    const visibleBlocks = slide.blocks.filter(
      (b) => b.visible !== false && hasContent(b)
    );

    // y 순으로 정렬
    const sortedBlocks = [...visibleBlocks].sort((a, b) => a.y - b.y);

    // padding
    const paddingTop = 90;
    const paddingBottom = slide.isLast ? 260 : 120;

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
          fontFamily: preset.fontFamily,
        }}
      >
        {/* 배경 */}
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
            isSelected={false}
            accent="#8b5cf6"
            onClick={onSelectBackground}
          />
        </div>

        {/* 콘텐츠 블록 — 세로 중앙 정렬 + 클릭 통과 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: paddingTop,
            bottom: paddingBottom,
            paddingLeft: 90,
            paddingRight: 90,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 28,
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          {sortedBlocks.map((block) => (
            <div
              key={block.id}
              style={{
                width: '100%',
                pointerEvents: editable ? 'auto' : 'none',
              }}
            >
              <BlockRenderer
                block={block}
                preset={preset}
                editable={editable}
                selected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock?.(block.id)}
              />
            </div>
          ))}
        </div>

        {/* 마지막 카드 브랜드 */}
        {slide.isLast && (
          <LastCardBrand
            brand={brand}
            dark={bgIsDark || onDarkImage}
          />
        )}
      </div>
    );
  }
);

// ─────────────────────────────────────────────
// 콘텐츠 유무 확인
// ─────────────────────────────────────────────
function hasContent(block: Block): boolean {
  if (block.visible === false) return false;
  if (block.type === 'divider') return true;
  if (block.content.text && block.content.text.trim()) return true;
  if (block.content.items && block.content.items.length > 0) return true;
  return false;
}

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
      {slide.isLast && (
        <LastCardBrand brand={brand} dark={bgIsDark} />
      )}
    </div>
  );
});