import React from 'react';
import type {
  Slide,
  Preset,
  ColorVariant,
  ElementPosition,
  BrandInfo,
  TextStyleOverride,
  ImageStyleOverride,
} from '@/lib/types';

// ─────────────────────────────────────────────
// 색상 밝기 판단
// ─────────────────────────────────────────────
function isDarkColor(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}

// ─────────────────────────────────────────────
// 이미지 필터
// ─────────────────────────────────────────────
function buildImageFilter(ov?: ImageStyleOverride): string {
  if (!ov) return 'none';
  const parts: string[] = [];
  if (ov.brightness !== undefined) parts.push(`brightness(${ov.brightness}%)`);
  if (ov.contrast !== undefined) parts.push(`contrast(${ov.contrast}%)`);
  if (ov.saturation !== undefined) parts.push(`saturate(${ov.saturation}%)`);
  if (ov.blur !== undefined && ov.blur > 0) parts.push(`blur(${ov.blur}px)`);
  if (ov.grayscale !== undefined && ov.grayscale > 0)
    parts.push(`grayscale(${ov.grayscale}%)`);
  if (ov.sepia !== undefined && ov.sepia > 0) parts.push(`sepia(${ov.sepia}%)`);
  if (ov.hueRotate !== undefined && ov.hueRotate > 0)
    parts.push(`hue-rotate(${ov.hueRotate}deg)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

// ─────────────────────────────────────────────
// 자동 축소
// ─────────────────────────────────────────────
function calcAutoSize(
  text: string,
  baseSize: number,
  maxWidthPx: number,
  charFactor = 1.05,
  maxLines = 4
): number {
  if (!text) return baseSize;
  const maxChars = Math.max(1, Math.floor(maxWidthPx / (baseSize * charFactor)));
  const lines = Math.ceil(text.length / maxChars);
  if (lines <= maxLines) return baseSize;
  return Math.max(baseSize * 0.55, baseSize * (maxLines / lines));
}

// ─────────────────────────────────────────────
// HEX + 투명도 → rgba
// ─────────────────────────────────────────────
function hexToRgba(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ─────────────────────────────────────────────
// 배경
// ─────────────────────────────────────────────
function BackgroundLayer({
  color,
  pattern,
}: {
  color: ColorVariant;
  pattern: string;
}) {
  const isGradient = !!color.backgroundEnd;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isGradient
            ? `linear-gradient(135deg, ${color.background} 0%, ${color.backgroundEnd} 100%)`
            : color.background,
        }}
      />
      {pattern === 'mesh' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 20% 20%, ${color.accent}55 0%, transparent 45%),
                         radial-gradient(circle at 80% 60%, ${color.accent}44 0%, transparent 50%),
                         radial-gradient(circle at 50% 90%, ${color.accent}33 0%, transparent 45%)`,
            pointerEvents: 'none',
          }}
        />
      )}
      {pattern === 'grid' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${color.text} 1px, transparent 1px), linear-gradient(90deg, ${color.text} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            opacity: 0.05,
            pointerEvents: 'none',
          }}
        />
      )}
      {pattern === 'dots' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${color.text} 2px, transparent 2px)`,
            backgroundSize: '40px 40px',
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        />
      )}
      {pattern === 'noise' && (
        <svg
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="noise-bg">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise-bg)" />
        </svg>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// 이미지 레이어
// ─────────────────────────────────────────────
function ImageLayer({
  src,
  layoutType,
  focal,
  filter,
  gradientMask,
  overlayColor,
  overlayOpacity,
  opacity,
  width,
  height,
  radius,
}: {
  src: string;
  layoutType: 'full' | 'top' | 'split-right';
  focal: { x: number; y: number };
  filter: string;
  gradientMask?: ImageStyleOverride['gradientMask'];
  overlayColor?: string;
  overlayOpacity?: number;
  opacity?: number;
  width: number;
  height: number;
  radius: number;
}) {
  let pos: React.CSSProperties = {};
  if (layoutType === 'full') {
    pos = { position: 'absolute', inset: 0, width: '100%', height: '100%' };
  } else if (layoutType === 'top') {
    pos = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height * 0.55,
    };
  } else if (layoutType === 'split-right') {
    pos = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: width * 0.5,
    };
  }

  const maskImage = (() => {
    if (!gradientMask?.enabled) return undefined;
    const dirMap = {
      top: 'to top',
      bottom: 'to bottom',
      left: 'to left',
      right: 'to right',
    } as const;
    return `linear-gradient(${dirMap[gradientMask.direction]}, transparent ${gradientMask.start}%, black ${gradientMask.end}%)`;
  })();

  return (
    <div
      style={{
        ...pos,
        overflow: 'hidden',
        borderRadius: radius,
        WebkitMaskImage: maskImage,
        maskImage,
      }}
    >
      <img
        src={src}
        alt=""
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
          filter,
          opacity: opacity ?? 1,
          display: 'block',
        }}
      />
      {overlayColor && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlayColor,
            opacity: overlayOpacity ?? 0.4,
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 자유 텍스트
// ─────────────────────────────────────────────
function FreeText({
  text,
  base,
  override,
  position,
  editable,
  elementKey,
  selectedElement,
  onElementClick,
  onElementDrag,
  accent,
}: {
  text: string;
  base: {
    fontSize: number;
    color: string;
    weight: number;
    align: 'left' | 'center' | 'right';
    lineHeight: number;
    letterSpacing: string;
  };
  override?: TextStyleOverride;
  position?: ElementPosition;
  editable: boolean;
  elementKey: string;
  selectedElement?: string | null;
  onElementClick?: (el: string) => void;
  onElementDrag?: (el: string, pos: ElementPosition) => void;
  accent: string;
}) {
  if (!text) return null;

  const resolved: ElementPosition = position || { x: 0, y: 0 };
  const isSelected = selectedElement === elementKey;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const container = e.currentTarget.closest(
      '[data-card-container]'
    ) as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startOffset = { x: resolved.x, y: resolved.y };

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      onElementDrag?.(elementKey, {
        x: Math.max(0, Math.min(1, startOffset.x + dx)),
        y: Math.max(0, Math.min(1, startOffset.y + dy)),
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const fontSize = override?.fontSize ?? base.fontSize;
  const textColor = override?.color ?? base.color;
  const weight = override?.weight ?? base.weight;
  const align = override?.align ?? base.align;
  const lineHeight = override?.lineHeight ?? base.lineHeight;
  const letterSpacing =
    override?.letterSpacing !== undefined
      ? `${override.letterSpacing}em`
      : base.letterSpacing;

  const hasBg = !!override?.background;
  const bgOpacity = override?.backgroundOpacity ?? 1;
  const bgColor = hasBg
    ? hexToRgba(override!.background!, bgOpacity)
    : undefined;

  return (
    <div
      data-element={elementKey}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onElementClick?.(elementKey);
      }}
      style={{
        position: 'absolute',
        left: `${resolved.x * 100}%`,
        top: `${resolved.y * 100}%`,
        transform: align === 'center' ? 'translateX(-50%)' : undefined,
        cursor: editable ? 'move' : 'default',
        outline: editable
          ? isSelected
            ? `3px solid ${accent}`
            : '2px dashed transparent'
          : 'none',
        outlineOffset: 8,
        borderRadius: 6,
        transition: 'outline-color 0.15s',
        maxWidth: '90%',
        zIndex: 3,
      }}
      onMouseEnter={(e) => {
        if (editable && !isSelected)
          e.currentTarget.style.outline = `2px dashed ${accent}88`;
      }}
      onMouseLeave={(e) => {
        if (editable && !isSelected)
          e.currentTarget.style.outline = '2px dashed transparent';
      }}
    >
      <div
        style={{
          display: hasBg ? 'inline-block' : 'block',
          background: bgColor,
          padding: hasBg ? override?.padding ?? 16 : undefined,
          borderRadius: hasBg ? override?.borderRadius ?? 8 : undefined,
          fontSize,
          color: textColor,
          fontWeight: weight,
          textAlign: align,
          lineHeight,
          letterSpacing,
          fontStyle: override?.italic ? 'italic' : 'normal',
          textDecoration: override?.underline ? 'underline' : 'none',
          wordBreak: 'keep-all',
          overflowWrap: 'anywhere',
        }}
      >
        {override?.content || text}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 카드 푸터
// ─────────────────────────────────────────────
function CardFooter({
  brand,
  isLast,
  textMuted,
  accent,
}: {
  brand?: BrandInfo;
  isLast: boolean;
  textMuted: string;
  accent: string;
}) {
  if (isLast) {
    const hasBrand = brand?.brandName || brand?.website || brand?.handle;
    if (!hasBrand) return null;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          textAlign: 'center',
        }}
      >
        {brand?.logoUrl && (
          <img
            src={brand.logoUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ width: 110, height: 110, objectFit: 'contain', opacity: 0.95 }}
          />
        )}
        {brand?.brandName && (
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: accent,
              letterSpacing: '0.03em',
            }}
          >
            {brand.brandName}
          </div>
        )}
        {brand?.website && (
          <div
            style={{
              fontSize: 26,
              color: textMuted,
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
              color: textMuted,
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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 22,
        color: textMuted,
      }}
    >
      <div style={{ fontWeight: 600, opacity: 0.9 }}>
        {brand?.website || brand?.brandName || ''}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontWeight: 800,
          letterSpacing: '0.15em',
        }}
      >
        SWIPE
        <span style={{ color: accent, fontSize: 26 }}>→</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface CardSlideProps {
  slide: Slide;
  preset: Preset;
  colorId?: string;
  brand?: BrandInfo;
  editable?: boolean;
  onElementClick?: (el: string) => void;
  selectedElement?: string | null;
  onElementDrag?: (el: string, pos: ElementPosition) => void;
  width?: number;
  height?: number;
  isLast?: boolean;
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────
export function CardSlide({
  slide,
  preset,
  colorId,
  brand,
  editable = false,
  onElementClick,
  selectedElement,
  onElementDrag,
  width = 1080,
  height = 1350,
  isLast = false,
}: CardSlideProps) {
  const baseColor =
    preset.colorVariants.find((c) => c.id === colorId) || preset.colorVariants[0];
  const color: ColorVariant = { ...baseColor };

  const { typography, decoration, padding } = preset;
  const { positions } = slide;
  const pp = preset.positions;

  const headlinePos = positions?.headline ?? pp?.headline ?? { x: 0.1, y: 0.5 };
  const bodyPos = positions?.body ?? pp?.body ?? { x: 0.1, y: 0.75 };
  const highlightPos = positions?.highlight ?? pp?.highlight ?? { x: 0.1, y: 0.3 };
  const badgePos = positions?.badge ?? pp?.badge ?? { x: 0.1, y: 0.15 };
  const labelPos = positions?.label ?? pp?.label ?? { x: 0.1, y: 0.1 };

  const focal = slide.imageStyle?.focal ?? positions?.imageFocal ?? { x: 0.5, y: 0.5 };
  const filter = buildImageFilter(slide.imageStyle);

  const hasImage = !!slide.imageUrl;
  const imgLayout = slide.imageLayout;

  const maxTextWidth = width - padding.left - padding.right;

  const darkBg = isDarkColor(color.background);
  const bottomBlack = darkBg;

  const headlineBaseSize = slide.headlineStyle?.fontSize ?? typography.headlineSize;
  const bodyBaseSize = slide.bodyStyle?.fontSize ?? typography.bodySize;
  const headlineSize = calcAutoSize(slide.headline, headlineBaseSize, maxTextWidth, 1.05);
  const bodySize = calcAutoSize(slide.body, bodyBaseSize, maxTextWidth, 0.55);

  const onImage = hasImage && imgLayout === 'full-bleed';
  const textColor = onImage ? '#ffffff' : color.text;
  const textMutedColor = onImage ? '#ffffffcc' : color.textMuted;

  // 뱃지
  const renderBadge = () => {
    if (isLast) return null;
    if (decoration.badgeStyle === 'none') return null;
    const labels: Record<string, string> = {
      cover: 'FEATURED',
      point: 'INFO',
      data: 'DATA',
      quote: 'QUOTE',
      cta: 'READY',
    };
    const label = labels[slide.type] || slide.type.toUpperCase();

    return (
      <div
        data-element="badge"
        onMouseDown={(e) => {
          if (!editable) return;
          e.preventDefault();
          e.stopPropagation();
          const startX = e.clientX;
          const startY = e.clientY;
          const container = e.currentTarget.closest(
            '[data-card-container]'
          ) as HTMLElement;
          if (!container) return;
          const rect = container.getBoundingClientRect();
          const startOffset = { ...badgePos };
          const onMove = (ev: MouseEvent) => {
            const dx = (ev.clientX - startX) / rect.width;
            const dy = (ev.clientY - startY) / rect.height;
            onElementDrag?.('badge', {
              x: Math.max(0, Math.min(1, startOffset.x + dx)),
              y: Math.max(0, Math.min(1, startOffset.y + dy)),
            });
          };
          const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (editable) onElementClick?.('badge');
        }}
        style={{
          position: 'absolute',
          left: `${badgePos.x * 100}%`,
          top: `${badgePos.y * 100}%`,
          cursor: editable ? 'move' : 'default',
          outline:
            editable && selectedElement === 'badge'
              ? `3px solid ${color.accent}`
              : '2px dashed transparent',
          outlineOffset: 6,
          borderRadius: 4,
          zIndex: 3,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: color.background,
            backgroundColor: color.accent,
            borderRadius:
              decoration.badgeStyle === 'pill'
                ? 999
                : decoration.badgeStyle === 'square'
                ? 4
                : 0,
            borderBottom:
              decoration.badgeStyle === 'underline'
                ? `2px solid ${color.accent}`
                : 'none',
          }}
        >
          {label}
        </div>
      </div>
    );
  };

  // 이미지
  const renderImage = () => {
    if (!hasImage) return null;
    if (imgLayout === 'full-bleed') {
      return (
        <ImageLayer
          src={slide.imageUrl}
          layoutType="full"
          focal={focal}
          filter={filter}
          gradientMask={slide.imageStyle?.gradientMask}
          overlayColor={slide.imageStyle?.overlayColor}
          overlayOpacity={slide.imageStyle?.overlayOpacity}
          opacity={slide.imageStyle?.opacity}
          width={width}
          height={height}
          radius={0}
        />
      );
    }
    if (imgLayout === 'top-image') {
      return (
        <ImageLayer
          src={slide.imageUrl}
          layoutType="top"
          focal={focal}
          filter={filter}
          gradientMask={slide.imageStyle?.gradientMask}
          overlayColor={slide.imageStyle?.overlayColor}
          overlayOpacity={slide.imageStyle?.overlayOpacity}
          opacity={slide.imageStyle?.opacity}
          width={width}
          height={height}
          radius={0}
        />
      );
    }
    if (imgLayout === 'split') {
      return (
        <ImageLayer
          src={slide.imageUrl}
          layoutType="split-right"
          focal={focal}
          filter={filter}
          gradientMask={slide.imageStyle?.gradientMask}
          overlayColor={slide.imageStyle?.overlayColor}
          overlayOpacity={slide.imageStyle?.overlayOpacity}
          opacity={slide.imageStyle?.opacity}
          width={width}
          height={height}
          radius={0}
        />
      );
    }
    return null;
  };

  // 텍스트 요소들 (모든 layout에서 자유 배치)
  const headlineEl = (
    <FreeText
      text={slide.headline}
      base={{
        fontSize: slide.type === 'cover' ? headlineSize : headlineSize * 0.82,
        color: textColor,
        weight: typography.headlineWeight,
        align: 'left',
        lineHeight: typography.lineHeight,
        letterSpacing: typography.headlineLetterSpacing,
      }}
      override={slide.headlineStyle}
      position={headlinePos}
      editable={editable}
      elementKey="headline"
      selectedElement={selectedElement}
      onElementClick={onElementClick}
      onElementDrag={onElementDrag}
      accent={color.accent}
    />
  );

  const bodyEl = (
    <FreeText
      text={slide.body}
      base={{
        fontSize: bodySize,
        color: textMutedColor,
        weight: 400,
        align: 'left',
        lineHeight: 1.55,
        letterSpacing: '0',
      }}
      override={slide.bodyStyle}
      position={bodyPos}
      editable={editable}
      elementKey="body"
      selectedElement={selectedElement}
      onElementClick={onElementClick}
      onElementDrag={onElementDrag}
      accent={color.accent}
    />
  );

  const highlightEl =
    slide.type === 'data' && slide.highlight ? (
      <FreeText
        text={slide.highlight}
        base={{
          fontSize: Math.min(220, headlineSize * 2),
          color: color.accent,
          weight: 900,
          align: 'left',
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
        }}
        override={slide.highlightStyle}
        position={highlightPos}
        editable={editable}
        elementKey="highlight"
        selectedElement={selectedElement}
        onElementClick={onElementClick}
        onElementDrag={onElementDrag}
        accent={color.accent}
      />
    ) : null;

  const labelEl = slide.label ? (
    <FreeText
      text={slide.label}
      base={{
        fontSize: 22,
        color: color.accent,
        weight: 700,
        align: 'left',
        lineHeight: 1.2,
        letterSpacing: '0.15em',
      }}
      override={slide.labelStyle}
      position={labelPos}
      editable={editable}
      elementKey="label"
      selectedElement={selectedElement}
      onElementClick={onElementClick}
      onElementDrag={onElementDrag}
      accent={color.accent}
    />
  ) : null;

  return (
    <div
      data-card
      data-card-container
      style={{
        width,
        height,
        backgroundColor: color.background,
        color: color.text,
        fontFamily: typography.fontFamily,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BackgroundLayer color={color} pattern={decoration.backgroundPattern} />
      {renderImage()}

      {bottomBlack && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '22%',
            background: `linear-gradient(180deg, ${color.background}00 0%, #000000 100%)`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}

      {hasImage && imgLayout === 'top-image' && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: height * 0.4,
            height: height * 0.2,
            background: `linear-gradient(180deg, ${color.background}00 0%, ${color.background}cc 60%, ${color.background} 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {labelEl}
      {renderBadge()}
      {highlightEl}
      {headlineEl}
      {bodyEl}

      <div
        style={{
          position: 'absolute',
          left: padding.left,
          right: padding.right,
          bottom: 40,
          zIndex: 4,
        }}
      >
        <CardFooter
          brand={brand}
          isLast={isLast}
          textMuted={bottomBlack ? '#ffffffaa' : color.textMuted}
          accent={color.accent}
        />
      </div>
    </div>
  );
}