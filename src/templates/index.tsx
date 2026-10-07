import React from 'react';
import type {
  Slide,
  Preset,
  ColorVariant,
  ElementPosition,
  BrandInfo,
  SlideTextOverride,
} from '@/lib/types';

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
            background: `radial-gradient(circle at 20% 20%, ${color.accent}40 0%, transparent 40%),
                         radial-gradient(circle at 80% 60%, ${color.accent}30 0%, transparent 45%),
                         radial-gradient(circle at 50% 90%, ${color.accent}20 0%, transparent 40%)`,
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
            opacity: 0.06,
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
            opacity: 0.1,
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
// 자동 축소: 텍스트 길이 기반 크기 계산
// ─────────────────────────────────────────────
function calcAutoSize(
  text: string,
  baseSize: number,
  maxWidthPx: number,
  charWidthFactor = 1.05
): number {
  if (!text) return baseSize;
  // 각 줄 최대 글자 수 추정 (한글 기준)
  // maxWidth / (baseSize * charWidthFactor)
  const maxChars = Math.floor(maxWidthPx / (baseSize * charWidthFactor));
  if (maxChars < 1) return baseSize * 0.5;

  // 단어 단위로 줄바꿈 시 몇 줄이 되는지 추정
  const lines = Math.ceil(text.length / Math.max(1, maxChars));
  // 3줄까지는 OK, 넘으면 축소
  if (lines <= 3) return baseSize;
  return Math.max(baseSize * 0.6, baseSize * (3 / lines));
}

// ─────────────────────────────────────────────
// 드래그 wrapper
// ─────────────────────────────────────────────
function DraggableBox({
  elementKey,
  position,
  editable,
  selectedElement,
  onElementClick,
  onElementDrag,
  accent,
  style,
  children,
}: {
  elementKey: string;
  position?: ElementPosition;
  editable: boolean;
  selectedElement?: string | null;
  onElementClick?: (el: any) => void;
  onElementDrag?: (el: string, pos: ElementPosition) => void;
  accent: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (!editable) return <div style={style}>{children}</div>;

  const isSelected = selectedElement === elementKey;
  const offsetX = position?.x ?? 0;
  const offsetY = position?.y ?? 0;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const container = e.currentTarget.closest('[data-card-container]') as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startOffset = { x: offsetX, y: offsetY };

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      onElementDrag?.(elementKey, {
        x: Math.max(-0.5, Math.min(0.5, startOffset.x + dx)),
        y: Math.max(-0.5, Math.min(0.5, startOffset.y + dy)),
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
        cursor: 'move',
        outline: isSelected ? `3px solid ${accent}` : '2px dashed transparent',
        outlineOffset: 8,
        borderRadius: 6,
        transition: 'outline-color 0.15s',
        transform: `translate(${offsetX * 100}%, ${offsetY * 100}%)`,
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
// 푸터
// ─────────────────────────────────────────────
function CardFooter({
  brand,
  isLast,
  accent,
  textMuted,
}: {
  brand?: BrandInfo;
  isLast: boolean;
  accent: string;
  textMuted: string;
}) {
  if (isLast) {
    const hasBrand = brand?.brandName || brand?.website || brand?.handle;
    if (!hasBrand) {
      return (
        <div style={{ textAlign: 'center', color: textMuted, fontSize: 24 }}>
          @your_handle
        </div>
      );
    }
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          textAlign: 'center',
        }}
      >
        {brand?.logoUrl && (
          <img
            src={brand.logoUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              width: 140,
              height: 140,
              objectFit: 'contain',
              opacity: 0.95,
            }}
          />
        )}
        {brand?.brandName && (
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: accent,
              letterSpacing: '0.05em',
            }}
          >
            {brand.brandName}
          </div>
        )}
        {brand?.website && (
          <div
            style={{
              fontSize: 30,
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
              fontSize: 26,
              color: textMuted,
              opacity: 0.75,
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
        fontSize: 16,
        color: textMuted,
      }}
    >
      <div style={{ fontWeight: 500, opacity: 0.85 }}>
        {brand?.website || brand?.brandName || ''}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
        }}
      >
        SWIPE
        <span style={{ color: accent, fontSize: 20 }}>→</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 뱃지
// ─────────────────────────────────────────────
function Badge({
  slide,
  color,
  layout,
}: {
  slide: Slide;
  color: ColorVariant;
  layout: string;
}) {
  const labels: Record<string, string> = {
    cover: 'FEATURED',
    point: 'INFO',
    data: 'DATA',
    quote: 'QUOTE',
    cta: 'READY',
  };
  const label = labels[slide.type] || slide.type.toUpperCase();

  if (layout === 'dark-minimal' || layout === 'light-minimal') {
    return (
      <div
        style={{
          display: 'inline-block',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.25em',
          color: color.accent,
          textTransform: 'uppercase',
          borderBottom: `2px solid ${color.accent}`,
          paddingBottom: 6,
        }}
      >
        {label}
      </div>
    );
  }

  if (layout.startsWith('light')) {
    return (
      <div
        style={{
          display: 'inline-block',
          padding: '8px 20px',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: color.accent,
          backgroundColor: color.accentSoft,
          borderRadius: 999,
        }}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '8px 20px',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: color.background,
        backgroundColor: color.accent,
        borderRadius: 4,
      }}
    >
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인
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
  const ov: SlideTextOverride = slide.textOverride || {};

  // 색상 오버라이드 반영
  const color: ColorVariant = {
    ...baseColor,
    background: ov.backgroundOverride || baseColor.background,
    backgroundEnd: ov.backgroundEndOverride || baseColor.backgroundEnd,
    accent: ov.accentOverride || baseColor.accent,
    accentSoft: ov.accentSoftOverride || baseColor.accentSoft,
    text: ov.textOverride || baseColor.text,
    textMuted: ov.textMutedOverride || baseColor.textMuted,
  };

  const { typography, decoration, padding, layout } = preset;
  const { positions } = slide;
  const presetPositions = preset.positions;

  const headlinePos = positions?.headline ?? presetPositions?.headline;
  const bodyPos = positions?.body ?? presetPositions?.body;
  const highlightPos = positions?.highlight ?? presetPositions?.highlight;
  const badgePos = positions?.badge ?? presetPositions?.badge;

  const focal = positions?.imageFocal ?? { x: 0.5, y: 0.5 };

  const imageFilter =
    decoration.imageTreatment === 'grayscale'
      ? 'grayscale(1)'
      : decoration.imageTreatment === 'duotone'
      ? 'contrast(1.2) saturate(0.6) hue-rotate(180deg)'
      : 'none';

  const hasFullBleed = !!(slide.imageUrl && slide.imageLayout === 'full-bleed');
  const hasTopImage = !!(slide.imageUrl && slide.imageLayout === 'top-image');
  const hasSplit = !!(slide.imageUrl && slide.imageLayout === 'split');

  const commonDragProps = {
    editable,
    selectedElement,
    onElementClick,
    onElementDrag,
    accent: color.accent,
  };

  const onImageOverlay = hasFullBleed;
  const textColor = ov.headlineColor || (onImageOverlay ? '#ffffff' : color.text);
  const bodyTextColor = ov.bodyColor || (onImageOverlay ? '#ffffffcc' : color.textMuted);
  const highlightColor = ov.highlightColor || (onImageOverlay ? '#ffffff' : color.accent);

  // 자동 축소
  const maxTextWidth = width - padding.left - padding.right;
  const baseHeadlineSize = ov.headlineSize ?? typography.headlineSize;
  const baseBodySize = ov.bodySize ?? typography.bodySize;

  const headlineSize =
    ov.autoShrink !== false
      ? calcAutoSize(slide.headline, baseHeadlineSize, maxTextWidth, 1.05)
      : baseHeadlineSize;

  const bodySize =
    ov.autoShrink !== false
      ? calcAutoSize(slide.body, baseBodySize, maxTextWidth, 0.55)
      : baseBodySize;

  const headlineWeight = ov.headlineWeight ?? typography.headlineWeight;

  const headlineEl = (
    <DraggableBox elementKey="headline" position={headlinePos} {...commonDragProps}>
      <h1
        style={{
          fontSize: slide.type === 'cover' ? headlineSize : headlineSize * 0.82,
          fontWeight: headlineWeight,
          lineHeight: typography.lineHeight,
          letterSpacing: typography.headlineLetterSpacing,
          color: textColor,
          margin: 0,
          wordBreak: 'keep-all',
          overflowWrap: 'anywhere',
        }}
      >
        {slide.headline}
      </h1>
    </DraggableBox>
  );

  const bodyEl = slide.body ? (
    <DraggableBox elementKey="body" position={bodyPos} {...commonDragProps}>
      <p
        style={{
          fontSize: bodySize,
          lineHeight: 1.55,
          color: bodyTextColor,
          margin: 0,
          wordBreak: 'keep-all',
          overflowWrap: 'anywhere',
        }}
      >
        {slide.body}
      </p>
    </DraggableBox>
  ) : null;

  const highlightEl =
    slide.type === 'data' && slide.highlight ? (
      <DraggableBox elementKey="highlight" position={highlightPos} {...commonDragProps}>
        <div
          style={{
            fontSize: Math.min(220, headlineSize * 2),
            fontWeight: 900,
            lineHeight: 0.95,
            color: highlightColor,
            letterSpacing: '-0.04em',
            wordBreak: 'keep-all',
          }}
        >
          {slide.highlight}
        </div>
      </DraggableBox>
    ) : null;

  const badgeEl = (
    <DraggableBox elementKey="badge" position={badgePos} {...commonDragProps}>
      <Badge slide={slide} color={color} layout={layout} />
    </DraggableBox>
  );

  const content = (
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
      {!isLast && <div style={{ marginBottom: 24 }}>{badgeEl}</div>}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isLast
            ? 'center'
            : layout.includes('minimal')
            ? 'flex-start'
            : 'center',
          alignItems: isLast ? 'center' : 'stretch',
          gap: 28,
          minHeight: 0,
        }}
      >
        {!isLast ? (
          <>
            {highlightEl}
            {headlineEl}
            {bodyEl}
          </>
        ) : (
          <>
            {headlineEl}
            {bodyEl}
          </>
        )}
      </div>

      <div style={{ marginTop: 24, minHeight: isLast ? 200 : 60 }}>
        <CardFooter
          brand={brand}
          isLast={isLast}
          accent={color.accent}
          textMuted={onImageOverlay ? '#ffffffcc' : color.textMuted}
        />
      </div>
    </div>
  );

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

      {hasFullBleed && (
        <>
          <img
            src={slide.imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
              filter: imageFilter,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, ${color.background}cc 0%, ${color.background}66 30%, ${color.background}cc 75%, ${color.background} 100%)`,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {hasTopImage && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: height * 0.55,
              overflow: 'hidden',
              zIndex: 0,
            }}
          >
            <img
              src={slide.imageUrl}
              alt=""
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
                filter: imageFilter,
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              top: height * 0.35,
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

      {hasSplit && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: width * 0.5,
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <img
            src={slide.imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
              filter: imageFilter,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '40%',
              background: `linear-gradient(90deg, ${color.background} 0%, ${color.background}00 100%)`,
            }}
          />
        </div>
      )}

      {content}

      {decoration.shadow && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 160px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
}