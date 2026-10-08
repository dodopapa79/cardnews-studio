import React from 'react';
import type {
  Slide,
  Preset,
  ColorVariant,
  ElementPosition,
  BrandInfo,
  TextStyleOverride,
  ImageStyleOverride,
  ImageLayout,
} from '@/lib/types';

// ─────────────────────────────────────────────
// 유틸: 이미지 필터
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
// 유틸: 텍스트 자동 축소
// ─────────────────────────────────────────────
function calcAutoSize(
  text: string,
  baseSize: number,
  maxWidthPx: number,
  charWidthFactor = 1.05,
  maxLines = 4
): number {
  if (!text) return baseSize;
  const maxChars = Math.max(1, Math.floor(maxWidthPx / (baseSize * charWidthFactor)));
  const lines = Math.ceil(text.length / maxChars);
  if (lines <= maxLines) return baseSize;
  return Math.max(baseSize * 0.55, baseSize * (maxLines / lines));
}

// ─────────────────────────────────────────────
// 유틸: 텍스트 스타일 적용
// ─────────────────────────────────────────────
function applyTextStyle(
  base: {
    fontSize: number;
    color: string;
    weight: number;
    align: 'left' | 'center' | 'right';
    lineHeight: number;
    letterSpacing: string;
    italic: boolean;
    underline: boolean;
    background: string;
    padding: number;
    borderRadius: number;
  },
  override?: TextStyleOverride,
  autoShrinkText?: string,
  maxWidth?: number,
  charFactor = 1.05
): React.CSSProperties {
  let fontSize = base.fontSize;
  if (override?.fontSize !== undefined) {
    fontSize = override.fontSize;
  } else if (autoShrinkText && maxWidth) {
    fontSize = calcAutoSize(autoShrinkText, base.fontSize, maxWidth, charFactor);
  }

  const style: React.CSSProperties = {
    fontSize,
    color: override?.color ?? base.color,
    fontWeight: override?.weight ?? base.weight,
    textAlign: override?.align ?? base.align,
    lineHeight: override?.lineHeight ?? base.lineHeight,
    letterSpacing:
      override?.letterSpacing !== undefined
        ? `${override.letterSpacing}em`
        : base.letterSpacing,
    fontStyle: override?.italic ? 'italic' : 'normal',
    textDecoration: override?.underline ? 'underline' : 'none',
    margin: 0,
    wordBreak: 'keep-all',
    overflowWrap: 'anywhere',
  };

  if (override?.background) {
    style.background = override.background;
    style.padding = override.padding ?? 16;
    style.borderRadius = override.borderRadius ?? 8;
    style.display = 'inline-block';
  }

  return style;
}

// ─────────────────────────────────────────────
// 배경 레이어
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
  layout,
  focal,
  filter,
  gradientMask,
  overlayColor,
  overlayOpacity,
  opacity,
  radius,
  customPosition,
}: {
  src: string;
  layout: 'full' | 'top' | 'bottom' | 'left' | 'right' | 'custom';
  focal: { x: number; y: number };
  filter: string;
  gradientMask?: ImageStyleOverride['gradientMask'];
  overlayColor?: string;
  overlayOpacity?: number;
  opacity?: number;
  radius: number;
  customPosition?: React.CSSProperties;
}) {
  let pos: React.CSSProperties = {};
  if (layout === 'custom' && customPosition) {
    pos = customPosition;
  } else if (layout === 'full') {
    pos = { position: 'absolute', inset: 0, width: '100%', height: '100%' };
  } else if (layout === 'top') {
    pos = { position: 'absolute', top: 0, left: 0, right: 0, height: '65%' };
  } else if (layout === 'bottom') {
    pos = { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' };
  } else if (layout === 'left') {
    pos = { position: 'absolute', top: 0, bottom: 0, left: 0, width: '55%' };
  } else if (layout === 'right') {
    pos = { position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%' };
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
// 드래그 가능 wrapper
// ─────────────────────────────────────────────
function DraggableElement({
  elementKey,
  position,
  editable,
  selectedElement,
  onElementClick,
  onElementDrag,
  accent,
  children,
  style,
}: {
  elementKey: string;
  position?: ElementPosition;
  editable: boolean;
  selectedElement?: string | null;
  onElementClick?: (el: any) => void;
  onElementDrag?: (el: string, pos: ElementPosition) => void;
  accent: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  if (!editable) return <>{children}</>;

  const isSelected = selectedElement === elementKey;
  const ox = position?.x ?? 0;
  const oy = position?.y ?? 0;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const container = e.currentTarget.closest('[data-card-container]') as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startOffset = { x: ox, y: oy };

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      onElementDrag?.(elementKey, {
        x: Math.max(-0.4, Math.min(0.4, startOffset.x + dx)),
        y: Math.max(-0.4, Math.min(0.4, startOffset.y + dy)),
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onElementClick?.(elementKey);
      }}
      style={{
        position: 'relative',
        cursor: 'move',
        outline: isSelected ? `3px solid ${accent}` : '2px dashed transparent',
        outlineOffset: 6,
        borderRadius: 4,
        transform: `translate(${ox * 100}%, ${oy * 100}%)`,
        transition: 'outline-color 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.outline = `2px dashed ${accent}88`;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.outline = '2px dashed transparent';
      }}
    >
      {children}
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
          <div style={{ fontSize: 38, fontWeight: 900, color: accent, letterSpacing: '0.03em' }}>
            {brand.brandName}
          </div>
        )}
        {brand?.website && (
          <div style={{ fontSize: 26, color: textMuted, fontWeight: 500, letterSpacing: '0.02em' }}>
            {brand.website}
          </div>
        )}
        {brand?.handle && (
          <div style={{ fontSize: 22, color: textMuted, opacity: 0.8, fontWeight: 500 }}>
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
  onElementClick?: (el: any) => void;
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
  const { typography, decoration, padding, layout } = preset;
  const { positions } = slide;
  const pp = preset.positions;

  const headlinePos = positions?.headline ?? pp?.headline;
  const bodyPos = positions?.body ?? pp?.body;
  const highlightPos = positions?.highlight ?? pp?.highlight;
  const badgePos = positions?.badge ?? pp?.badge;
  const labelPos = positions?.label ?? pp?.label;

  const focal = slide.imageStyle?.focal ?? positions?.imageFocal ?? { x: 0.5, y: 0.5 };
  const filter = buildImageFilter(slide.imageStyle);

  const hasImage = !!slide.imageUrl;
  const imgLayout = slide.imageLayout;
  const maxTextWidth = width - padding.left - padding.right;

  const commonDrag = {
    editable,
    selectedElement,
    onElementClick,
    onElementDrag,
    accent: color.accent,
  };

  // ─────────────────────────────────────
  // 공통 텍스트 스타일
  // ─────────────────────────────────────
  const headlineBase = {
    fontSize: typography.headlineSize,
    color: color.text,
    weight: typography.headlineWeight,
    align: 'left' as const,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.headlineLetterSpacing,
    italic: false,
    underline: false,
    background: '',
    padding: 0,
    borderRadius: 0,
  };
  const bodyBase = {
    fontSize: typography.bodySize,
    color: color.textMuted,
    weight: 400,
    align: 'left' as const,
    lineHeight: 1.55,
    letterSpacing: '0',
    italic: false,
    underline: false,
    background: '',
    padding: 0,
    borderRadius: 0,
  };
  const highlightBase = {
    fontSize: Math.min(220, typography.headlineSize * 2),
    color: color.accent,
    weight: 900,
    align: 'left' as const,
    lineHeight: 0.95,
    letterSpacing: '-0.04em',
    italic: false,
    underline: false,
    background: '',
    padding: 0,
    borderRadius: 0,
  };
  const labelBase = {
    fontSize: 22,
    color: color.accent,
    weight: 700,
    align: 'left' as const,
    lineHeight: 1.2,
    letterSpacing: '0.15em',
    italic: false,
    underline: false,
    background: '',
    padding: 0,
    borderRadius: 0,
  };

  // ─────────────────────────────────────
  // 요소 렌더
  // ─────────────────────────────────────
  const renderHeadline = (extra?: React.CSSProperties, align?: 'left' | 'center' | 'right') =>
    slide.headline ? (
      <DraggableElement elementKey="headline" position={headlinePos} {...commonDrag}>
        <h1
          style={{
            ...applyTextStyle(
              { ...headlineBase, align: align || headlineBase.align },
              slide.headlineStyle,
              slide.headline,
              maxTextWidth,
              1.05
            ),
            textTransform: typography.headlineUppercase ? 'uppercase' : 'none',
            ...extra,
          }}
        >
          {slide.headlineStyle?.content || slide.headline}
        </h1>
      </DraggableElement>
    ) : null;

  const renderBody = (extra?: React.CSSProperties, align?: 'left' | 'center' | 'right') =>
    slide.body ? (
      <DraggableElement elementKey="body" position={bodyPos} {...commonDrag}>
        <p
          style={{
            ...applyTextStyle(
              { ...bodyBase, align: align || bodyBase.align },
              slide.bodyStyle,
              slide.body,
              maxTextWidth,
              0.55
            ),
            ...extra,
          }}
        >
          {slide.bodyStyle?.content || slide.body}
        </p>
      </DraggableElement>
    ) : null;

  const renderHighlight = (extra?: React.CSSProperties) =>
    slide.type === 'data' && slide.highlight ? (
      <DraggableElement elementKey="highlight" position={highlightPos} {...commonDrag}>
        <div
          style={{
            ...applyTextStyle(
              highlightBase,
              slide.highlightStyle,
              slide.highlight,
              maxTextWidth,
              0.55
            ),
            ...extra,
          }}
        >
          {slide.highlightStyle?.content || slide.highlight}
        </div>
      </DraggableElement>
    ) : null;

  const renderLabel = (extra?: React.CSSProperties, align?: 'left' | 'center' | 'right') =>
    slide.label ? (
      <DraggableElement elementKey="label" position={labelPos} {...commonDrag}>
        <div
          style={{
            ...applyTextStyle(
              { ...labelBase, align: align || labelBase.align },
              slide.labelStyle,
              slide.label,
              maxTextWidth,
              0.9
            ),
            textTransform: 'uppercase',
            ...extra,
          }}
        >
          {slide.labelStyle?.content || slide.label}
        </div>
      </DraggableElement>
    ) : null;

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
    const bgIsLight =
      color.background === '#ffffff' ||
      color.background.startsWith('#f') ||
      color.background.startsWith('#e');

    return (
      <DraggableElement elementKey="badge" position={badgePos} {...commonDrag}>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: bgIsLight ? color.accent : color.background,
            backgroundColor: bgIsLight ? color.accentSoft : color.accent,
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
      </DraggableElement>
    );
  };

  const renderImage = (
    layoutType: 'full' | 'top' | 'bottom' | 'left' | 'right' | 'custom',
    radius = 0,
    customPosition?: React.CSSProperties
  ) =>
    hasImage ? (
      <ImageLayer
        src={slide.imageUrl}
        layout={layoutType}
        focal={focal}
        filter={filter}
        gradientMask={slide.imageStyle?.gradientMask}
        overlayColor={slide.imageStyle?.overlayColor}
        overlayOpacity={slide.imageStyle?.overlayOpacity}
        opacity={slide.imageStyle?.opacity}
        radius={radius}
        customPosition={customPosition}
      />
    ) : null;

  // ═════════════════════════════════════════
  // 1. 센터드 클래식
  // ═════════════════════════════════════════
  const renderCentered = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      {hasImage && imgLayout === 'full-bleed' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${color.background}dd 0%, ${color.background}88 40%, ${color.background}ee 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          {renderBadge()}
        </div>
        <div style={{ marginBottom: 32 }}>{renderHighlight({ textAlign: 'center' })}</div>
        <div style={{ marginBottom: 28 }}>{renderHeadline({ textAlign: 'center' }, 'center')}</div>
        <div style={{ maxWidth: width * 0.75, marginLeft: 'auto', marginRight: 'auto' }}>
          {renderBody({ textAlign: 'center' }, 'center')}
        </div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════
  // 2. 하단 집중
  // ═════════════════════════════════════════
  const renderBottomFocus = () => (
    <>
      {hasImage && (
        <>
          {renderImage('full', 0)}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, ${color.background}00 0%, ${color.background}33 45%, ${color.background}f0 70%, ${color.background} 100%)`,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: 20 }}>{renderBadge()}</div>
        <div style={{ marginBottom: 16 }}>{renderHeadline({ color: '#ffffff' }, 'left')}</div>
        <div>{renderBody({ color: '#ffffffcc' }, 'left')}</div>
      </div>
    </>
  );

  // ═════════════════════════════════════════
  // 3. 좌측 정렬 볼드
  // ═════════════════════════════════════════
  const renderLeftBold = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      {hasImage && imgLayout === 'full-bleed' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${color.background}ee 0%, ${color.background}88 60%, ${color.background}66 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2, maxWidth: width * 0.82 }}>
        <div style={{ marginBottom: 32 }}>{renderBadge()}</div>
        {renderHighlight({ marginBottom: 28 })}
        <div style={{ marginBottom: 32 }}>{renderHeadline()}</div>
        <div style={{ maxWidth: width * 0.7 }}>{renderBody()}</div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════
  // 4. 상단 라벨
  // ═════════════════════════════════════════
  const renderTopLabel = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          {renderLabel()}
          <div style={{ flex: 1, height: 2, backgroundColor: color.accent, opacity: 0.3 }} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ marginBottom: 32 }}>{renderHighlight()}</div>
        <div style={{ marginBottom: 32 }}>{renderHeadline()}</div>
        <div style={{ maxWidth: width * 0.8 }}>{renderBody()}</div>
      </div>

      {!isLast && <div style={{ marginTop: 40 }}>{renderBadge()}</div>}
    </div>
  );

  // ═════════════════════════════════════════
  // 5. 숫자 강조
  // ═════════════════════════════════════════
  const renderNumberFocus = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 60 }}>
        <div style={{ width: 60, height: 2, backgroundColor: color.accent }} />
        {renderLabel()}
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 auto', minWidth: 180 }}>
          {renderHighlight({
            fontSize: 200,
            fontWeight: 900,
            color: color.accent,
            lineHeight: 0.9,
            letterSpacing: '-0.05em',
          })}
        </div>
        <div style={{ flex: 1, paddingTop: 20 }}>
          <div style={{ marginBottom: 32 }}>{renderHeadline()}</div>
          <div style={{ maxWidth: width * 0.55 }}>{renderBody()}</div>
        </div>
      </div>

      {!isLast && <div style={{ marginTop: 40 }}>{renderBadge()}</div>}
    </div>
  );

  // ═════════════════════════════════════════
  // 6. 인용구
  // ═════════════════════════════════════════
  const renderQuoteStyle = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* 큰 따옴표 */}
      <div
        style={{
          fontSize: 220,
          lineHeight: 0.6,
          fontWeight: 900,
          color: color.accent,
          opacity: 0.35,
          marginBottom: 20,
          fontFamily: 'Georgia, serif',
        }}
      >
        "
      </div>

      {/* 인용 텍스트 = 헤드라인 */}
      <div style={{ maxWidth: width * 0.82, marginBottom: 40 }}>
        {renderHeadline(
          {
            fontSize: Math.min(110, typography.headlineSize * 1.15),
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            textAlign: 'center',
          },
          'center'
        )}
      </div>

      {/* 하단 구분선 */}
      <div
        style={{
          width: 80,
          height: 3,
          backgroundColor: color.accent,
          marginBottom: 32,
        }}
      />

      {/* 본문 (인용 설명) */}
      <div style={{ maxWidth: width * 0.72 }}>
        {renderBody(
          {
            fontSize: 24,
            color: color.textMuted,
            textAlign: 'center',
            letterSpacing: '0.02em',
          },
          'center'
        )}
      </div>

      {/* 하단 라벨 */}
      {slide.label && (
        <div style={{ marginTop: 40 }}>{renderLabel({ textAlign: 'center' }, 'center')}</div>
      )}
    </div>
  );

  // ═════════════════════════════════════════
  // 7. 그리드 카드
  // ═════════════════════════════════════════
  const renderCardGrid = () => (
    <>
      {/* 상단 이미지 (약 55%) */}
      {hasImage &&
        renderImage('custom', 0, {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '55%',
        })}

      {/* 하단 정보 박스 (약 45% + 여백) */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          bottom: 60,
          top: '50%',
          backgroundColor: color.surface,
          borderRadius: 24,
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          zIndex: 2,
        }}
      >
        <div style={{ marginBottom: 20 }}>{renderBadge()}</div>
        <div style={{ marginBottom: 20 }}>{renderHeadline()}</div>
        <div>{renderBody()}</div>
      </div>
    </>
  );

  // ═════════════════════════════════════════
  // 8. 사이드 바
  // ═════════════════════════════════════════
  const renderSideBar = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        gap: 50,
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* 좌측 색상 바 */}
      <div
        style={{
          flex: '0 0 auto',
          width: 8,
          backgroundColor: color.accent,
          borderRadius: 4,
          alignSelf: 'stretch',
          marginTop: 20,
          marginBottom: 20,
        }}
      />

      {/* 우측 콘텐츠 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ marginBottom: 40 }}>{renderLabel()}</div>
        <div style={{ marginBottom: 32 }}>{renderHighlight()}</div>
        <div style={{ marginBottom: 36 }}>{renderHeadline()}</div>
        <div style={{ maxWidth: width * 0.6 }}>{renderBody()}</div>
        {!isLast && <div style={{ marginTop: 50 }}>{renderBadge()}</div>}
      </div>
    </div>
  );

  // ═════════════════════════════════════════
  // 9. 이미지 오버레이
  // ═════════════════════════════════════════
  const renderFullOverlay = () => (
    <>
      {/* 전체 배경 이미지 */}
      {hasImage && renderImage('full', 0)}

      {/* 하단 그라데이션 (배경색으로 진해짐) */}
      {hasImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${color.background}00 0%, ${color.background}22 40%, ${color.background}cc 70%, ${color.background} 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 콘텐츠 - 하단 정렬 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: 24 }}>{renderBadge()}</div>

        {slide.type === 'data' && slide.highlight && (
          <div style={{ marginBottom: 24 }}>
            {renderHighlight({
              fontSize: 160,
              fontWeight: 900,
              color: color.accent,
              lineHeight: 0.9,
            })}
          </div>
        )}

        <div style={{ marginBottom: 24 }}>{renderHeadline({ color: color.text })}</div>
        <div style={{ maxWidth: width * 0.85 }}>{renderBody({ color: color.textMuted })}</div>
      </div>
    </>
  );

  // ═════════════════════════════════════════
  // 10. 매거진
  // ═════════════════════════════════════════
  const renderMagazine = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* 상단: 카테고리 + 라인 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          paddingBottom: 24,
          marginBottom: 60,
          borderBottom: `2px solid ${color.text}`,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: color.accent,
          }}
        >
          MAGAZINE
        </div>
        <div style={{ flex: 1 }} />
        {renderLabel()}
      </div>

      {/* 중앙: 큰 제목 + 부제 */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ marginBottom: 24 }}>
          {renderHeadline({
            fontSize: Math.min(140, typography.headlineSize * 1.5),
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
          })}
        </div>

        {/* 굵은 구분선 */}
        <div
          style={{
            width: 100,
            height: 6,
            backgroundColor: color.accent,
            marginBottom: 32,
          }}
        />
      </div>

      {/* 하단: 컬럼 레이아웃 (이미지 + 본문) */}
      <div style={{ flex: 1, display: 'flex', gap: 40 }}>
        {/* 좌측 이미지 */}
        {hasImage && (
          <div
            style={{
              flex: '0 0 40%',
              borderRadius: decoration.cornerRadius || 12,
              overflow: 'hidden',
            }}
          >
            {renderImage('custom', decoration.cornerRadius || 12, {
              position: 'relative',
              width: '100%',
              height: '100%',
            })}
          </div>
        )}

        {/* 우측 본문 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: color.accent,
            }}
          >
            —
          </div>

          <div>{renderBody({ lineHeight: 1.7 })}</div>

          {slide.type === 'data' && slide.highlight && (
            <div style={{ marginTop: 'auto' }}>
              {renderHighlight({
                fontSize: 72,
                fontWeight: 900,
                color: color.accent,
                letterSpacing: '-0.03em',
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────
  // 레이아웃 분기
  // ─────────────────────────────────────
  const renderContent = () => {
    switch (layout) {
      case 'centered':
        return renderCentered();
      case 'bottom-focus':
        return renderBottomFocus();
      case 'left-bold':
        return renderLeftBold();
      case 'top-label':
        return renderTopLabel();
      case 'number-focus':
        return renderNumberFocus();
      case 'quote-style':
        return renderQuoteStyle();
      case 'card-grid':
        return renderCardGrid();
      case 'side-bar':
        return renderSideBar();
      case 'full-overlay':
        return renderFullOverlay();
      case 'magazine':
        return renderMagazine();
      default:
        return renderCentered();
    }
  };

  // 배경 이미지 표시 여부 (레이아웃별로 다름)
  const showImageAsBackground =
    hasImage &&
    (layout === 'centered' ||
      layout === 'left-bold' ||
      layout === 'top-label' ||
      layout === 'number-focus' ||
      layout === 'side-bar') &&
    imgLayout === 'full-bleed';

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
      {/* 배경 패턴 */}
      <BackgroundLayer color={color} pattern={decoration.backgroundPattern} />

      {/* 배경 이미지 (특정 레이아웃만) */}
      {showImageAsBackground && renderImage('full', decoration.cornerRadius)}

      {/* 상단 이미지 (일반 레이아웃) */}
      {hasImage &&
        imgLayout === 'top-image' &&
        layout !== 'bottom-focus' &&
        layout !== 'card-grid' && (
          <>
            {renderImage('top', decoration.cornerRadius)}
            <div
              style={{
                position: 'absolute',
                top: height * 0.45,
                left: 0,
                right: 0,
                height: height * 0.25,
                background: `linear-gradient(180deg, ${color.background}00 0%, ${color.background}cc 60%, ${color.background} 100%)`,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          </>
        )}

      {/* 좌우 분할 이미지 */}
      {hasImage && imgLayout === 'split' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: width * 0.5,
            height: '100%',
            zIndex: 0,
          }}
        >
          {renderImage('right', decoration.cornerRadius)}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '35%',
              background: `linear-gradient(90deg, ${color.background} 0%, ${color.background}00 100%)`,
              zIndex: 1,
            }}
          />
        </div>
      )}

      {/* 콘텐츠 */}
      {renderContent()}

      {/* 푸터 */}
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
          textMuted={color.textMuted}
          accent={color.accent}
        />
      </div>
    </div>
  );
}