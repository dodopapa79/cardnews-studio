import React from 'react';
import type { Slide, Preset, ElementPosition } from '@/lib/types';

// ─────────────────────────────────────────────
// 위치 헬퍼 — 비율(0~1)을 실제 px로 변환
// ─────────────────────────────────────────────
function resolvePosition(
  pos: ElementPosition | undefined,
  defaultX: number,
  defaultY: number
): { x: number; y: number } {
  if (!pos) return { x: defaultX, y: defaultY };
  return { x: pos.x, y: pos.y };
}

// ─────────────────────────────────────────────
// 배경 패턴
// ─────────────────────────────────────────────
function PatternOverlay({ type, color }: { type: string; color: string }) {
  if (type === 'none') return null;
  const common: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  };
  if (type === 'grid') {
    return (
      <div
        style={{
          ...common,
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.08,
        }}
      />
    );
  }
  if (type === 'dots') {
    return (
      <div
        style={{
          ...common,
          backgroundImage: `radial-gradient(${color} 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
          opacity: 0.15,
        }}
      />
    );
  }
  if (type === 'noise') {
    return (
      <svg style={common} xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    );
  }
  if (type === 'mesh') {
    return (
      <div
        style={{
          ...common,
          background: `radial-gradient(circle at 20% 20%, ${color} 0%, transparent 40%),
                       radial-gradient(circle at 80% 60%, ${color} 0%, transparent 45%)`,
          opacity: 0.2,
        }}
      />
    );
  }
  return null;
}

// ─────────────────────────────────────────────
// 뱃지
// ─────────────────────────────────────────────
function Badge({
  type,
  preset,
  invert,
}: {
  type: string;
  preset: Preset;
  invert?: boolean;
}) {
  const { theme, typography, decoration } = preset;
  const labels: Record<string, string> = {
    cover: 'COVER',
    point: 'POINT',
    data: 'DATA',
    quote: 'QUOTE',
    cta: 'CTA',
  };
  const label = labels[type] || type.toUpperCase();
  const baseColor = invert ? '#ffffff' : theme.accent;
  const bgColor = invert ? 'rgba(255,255,255,0.15)' : theme.accentSoft;

  const base: React.CSSProperties = {
    display: 'inline-block',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.1em',
    fontFamily: typography.fontFamily,
    alignSelf: 'flex-start',
  };

  if (decoration.badgeStyle === 'none') return null;

  if (decoration.badgeStyle === 'pill') {
    return (
      <div
        style={{
          ...base,
          padding: '10px 24px',
          borderRadius: 999,
          backgroundColor: bgColor,
          color: baseColor,
        }}
      >
        {label}
      </div>
    );
  }
  if (decoration.badgeStyle === 'square') {
    return (
      <div
        style={{
          ...base,
          padding: '10px 24px',
          borderRadius: 4,
          backgroundColor: bgColor,
          color: baseColor,
        }}
      >
        {label}
      </div>
    );
  }
  return (
    <div
      style={{
        ...base,
        paddingBottom: 6,
        borderBottom: `3px solid ${baseColor}`,
        color: baseColor,
      }}
    >
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 카드
// ─────────────────────────────────────────────
interface CardSlideProps {
  slide: Slide;
  preset: Preset;
  /** 드래그 편집 모드 (개별 요소 드래그 가능) */
  editable?: boolean;
  /** 요소 클릭 시 콜백 */
  onElementClick?: (element: 'headline' | 'body' | 'highlight' | 'badge') => void;
  /** 현재 선택된 요소 (하이라이트 표시용) */
  selectedElement?: string | null;
  /** 드래그 이벤트 */
  onElementDrag?: (element: string, pos: ElementPosition) => void;
  /** 카드 전체 크기 조정 (기본 1080x1350) */
  width?: number;
  height?: number;
}

export function CardSlide({
  slide,
  preset,
  editable = false,
  onElementClick,
  selectedElement,
  onElementDrag,
  width = 1080,
  height = 1350,
}: CardSlideProps) {
  const { theme, typography, decoration } = preset;
  const hasFullBleed = !!(slide.imageUrl && slide.imageLayout === 'full-bleed');
  const hasTopImage = !!(slide.imageUrl && slide.imageLayout === 'top-image');
  const hasSplit = !!(slide.imageUrl && slide.imageLayout === 'split');

  const imageFilter = (() => {
    switch (decoration.imageTreatment) {
      case 'grayscale':
        return 'grayscale(1)';
      case 'duotone':
        return 'contrast(1.2) saturate(0.6) hue-rotate(180deg)';
      default:
        return 'none';
    }
  })();

  // 이미지 focal point (0.5, 0.5 = 중앙)
  const focal = slide.positions?.imageFocal ?? { x: 0.5, y: 0.5 };

  // 요소 위치 (프리셋 기본값 + 슬라이드 override)
  const presetPos = preset.positions;
  const slidePos = slide.positions;

  const headlinePos = slidePos?.headline ?? presetPos?.headline;
  const bodyPos = slidePos?.body ?? presetPos?.body;
  const highlightPos = slidePos?.highlight ?? presetPos?.highlight;
  const badgePos = slidePos?.badge ?? presetPos?.badge;

  // 드래그 핸들러 생성 헬퍼
  const makeDragHandler = (element: string) => {
    if (!editable || !onElementDrag) return undefined;

    return (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const container = (e.currentTarget.closest('[data-card-container]') as HTMLElement);
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scaleFactor = container.offsetWidth / width;

      const el = e.currentTarget;
      const startPos = {
        x: parseFloat(el.dataset.x || '0.5'),
        y: parseFloat(el.dataset.y || '0.5'),
      };

      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startX) / (rect.width);
        const dy = (ev.clientY - startY) / (rect.height);
        const newX = Math.max(0, Math.min(1, startPos.x + dx));
        const newY = Math.max(0, Math.min(1, startPos.y + dy));
        onElementDrag(element, { x: newX, y: newY });
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  };

  // 편집 가능한 요소 wrapper
  const ElementWrapper = ({
    elementKey,
    position,
    defaultX,
    defaultY,
    children,
    style,
  }: {
    elementKey: 'headline' | 'body' | 'highlight' | 'badge';
    position?: ElementPosition;
    defaultX: number;
    defaultY: number;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => {
    const resolved = resolvePosition(position, defaultX, defaultY);

    if (!editable) {
      // 편집 모드 아닐 때는 absolute 위치로 배치 (focal point 적용)
      return (
        <div
          style={{
            position: 'absolute',
            left: `${resolved.x * 100}%`,
            top: `${resolved.y * 100}%`,
            transform: `translate(-${resolved.x * 100}%, -${resolved.y * 100}%)`,
            ...style,
          }}
        >
          {children}
        </div>
      );
    }

    // 편집 모드: 드래그 가능
    const isSelected = selectedElement === elementKey;
    return (
      <div
        data-x={resolved.x}
        data-y={resolved.y}
        onMouseDown={makeDragHandler(elementKey)}
        onClick={(e) => {
          e.stopPropagation();
          onElementClick?.(elementKey);
        }}
        style={{
          position: 'absolute',
          left: `${resolved.x * 100}%`,
          top: `${resolved.y * 100}%`,
          transform: `translate(-${resolved.x * 100}%, -${resolved.y * 100}%)`,
          cursor: 'move',
          outline: isSelected ? `3px solid ${theme.accent}` : '2px dashed transparent',
          outlineOffset: 8,
          borderRadius: 4,
          transition: 'outline-color 0.15s',
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.outline = `2px dashed ${theme.accent}88`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.outline = '2px dashed transparent';
          }
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <div
      data-card
      data-card-container
      style={{
        width,
        height,
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: typography.fontFamily,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 패턴 */}
      {!hasFullBleed && <PatternOverlay type={decoration.backgroundPattern} color={theme.text} />}

      {/* Accent bar */}
      {decoration.accentBar === 'top' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 16,
            backgroundColor: theme.accent,
            zIndex: 3,
          }}
        />
      )}
      {decoration.accentBar === 'left' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 16,
            backgroundColor: theme.accent,
            zIndex: 3,
          }}
        />
      )}
      {decoration.accentBar === 'bottom' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 16,
            backgroundColor: theme.accent,
            zIndex: 3,
          }}
        />
      )}

      {/* 이미지들 */}
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
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.78) 100%)',
            }}
          />
        </>
      )}

      {hasTopImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: height * 0.5,
            overflow: 'hidden',
            borderBottomLeftRadius: decoration.cornerRadius,
            borderBottomRightRadius: decoration.cornerRadius,
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
      )}

      {hasSplit && (
        <div
          style={{
            position: 'absolute',
            top: decoration.accentBar === 'top' ? 16 : 0,
            right: 0,
            width: width * 0.5,
            height: '100%',
            overflow: 'hidden',
            borderTopLeftRadius: decoration.cornerRadius,
            borderBottomLeftRadius: decoration.cornerRadius,
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
      )}

      {/* 텍스트 요소들 (위치 조정 가능) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        {/* 뱃지 */}
        <ElementWrapper
          elementKey="badge"
          position={badgePos}
          defaultX={0.08}
          defaultY={0.12}
        >
          <Badge type={slide.type} preset={preset} invert={hasFullBleed} />
        </ElementWrapper>

        {/* 강조 숫자 (data 타입) */}
        {slide.type === 'data' && slide.highlight && (
          <ElementWrapper
            elementKey="highlight"
            position={highlightPos}
            defaultX={0.08}
            defaultY={0.32}
          >
            <div
              style={{
                fontSize: 180,
                fontWeight: 900,
                lineHeight: 1,
                color: hasFullBleed ? '#ffffff' : theme.accent,
                letterSpacing: '-0.04em',
              }}
            >
              {slide.highlight}
            </div>
          </ElementWrapper>
        )}

        {/* 헤드라인 */}
        <ElementWrapper
          elementKey="headline"
          position={headlinePos}
          defaultX={0.08}
          defaultY={slide.type === 'data' && slide.highlight ? 0.55 : 0.42}
          style={{ maxWidth: hasSplit ? width * 0.42 : width * 0.84 }}
        >
          <h1
            style={{
              fontSize:
                slide.type === 'cover'
                  ? typography.headlineSize
                  : typography.headlineSize * 0.78,
              fontWeight: typography.headlineWeight,
              lineHeight: typography.lineHeight,
              letterSpacing: typography.headlineLetterSpacing,
              color: hasFullBleed ? '#ffffff' : theme.text,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {slide.headline}
          </h1>
        </ElementWrapper>

        {/* 본문 */}
        {slide.body && (
          <ElementWrapper
            elementKey="body"
            position={bodyPos}
            defaultX={0.08}
            defaultY={
              slide.type === 'data' && slide.highlight
                ? 0.78
                : slide.type === 'cover'
                ? 0.7
                : 0.68
            }
            style={{ maxWidth: hasSplit ? width * 0.42 : width * 0.84 }}
          >
            <p
              style={{
                fontSize: typography.bodySize,
                lineHeight: 1.55,
                fontWeight: 400,
                opacity: hasFullBleed ? 0.95 : 0.85,
                color: hasFullBleed ? '#ffffff' : theme.text,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {slide.body}
            </p>
          </ElementWrapper>
        )}
      </div>

      {/* 그림자 */}
      {decoration.shadow && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      )}
    </div>
  );
}