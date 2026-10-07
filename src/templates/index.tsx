import React from 'react';
import type { Slide, Preset, ColorVariant, ElementPosition } from '@/lib/types';

// ─────────────────────────────────────────────
// 배경 렌더 (solid / gradient / mesh / pattern)
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
                         radial-gradient(circle at 80% 60%, ${color.accent}30 0%, transparent 45%)`,
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
// 드래그 가능한 요소 wrapper
// ─────────────────────────────────────────────
function DraggableElement({
  elementKey,
  position,
  defaultX,
  defaultY,
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
  defaultX: number;
  defaultY: number;
  editable: boolean;
  selectedElement?: string | null;
  onElementClick?: (el: any) => void;
  onElementDrag?: (el: string, pos: ElementPosition) => void;
  accent: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const resolved = position ?? { x: defaultX, y: defaultY };

  if (!editable) {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${resolved.x * 100}%`,
          top: `${resolved.y * 100}%`,
          maxWidth: `calc(100% - ${resolved.x * 200}px)`,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  const isSelected = selectedElement === elementKey;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const container = e.currentTarget.closest('[data-card-container]') as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const startPos = { ...resolved };

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      const newX = Math.max(0, Math.min(1, startPos.x + dx));
      const newY = Math.max(0, Math.min(1, startPos.y + dy));
      onElementDrag?.(elementKey, { x: newX, y: newY });
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
        position: 'absolute',
        left: `${resolved.x * 100}%`,
        top: `${resolved.y * 100}%`,
        cursor: 'move',
        outline: isSelected ? `3px solid ${accent}` : '2px dashed transparent',
        outlineOffset: 8,
        borderRadius: 4,
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
// 공통 Props
// ─────────────────────────────────────────────
interface CardSlideProps {
  slide: Slide;
  preset: Preset;
  /** 색상 variant (없으면 프리셋 첫 번째) */
  colorId?: string;
  editable?: boolean;
  onElementClick?: (el: any) => void;
  selectedElement?: string | null;
  onElementDrag?: (el: string, pos: ElementPosition) => void;
  width?: number;
  height?: number;
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export function CardSlide({
  slide,
  preset,
  colorId,
  editable = false,
  onElementClick,
  selectedElement,
  onElementDrag,
  width = 1080,
  height = 1350,
}: CardSlideProps) {
  const color =
    preset.colorVariants.find((c) => c.id === colorId) || preset.colorVariants[0];
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

  const hasImage = !!slide.imageUrl;
  const hasFullBleed = !!(slide.imageUrl && slide.imageLayout === 'full-bleed');
  const hasTopImage = !!(slide.imageUrl && slide.imageLayout === 'top-image');
  const hasSplit = !!(slide.imageUrl && slide.imageLayout === 'split');

  // 공통 요소 props
  const commonDragProps = {
    editable,
    selectedElement,
    onElementClick,
    onElementDrag,
    accent: color.accent,
  };

  // 텍스트 색상 — 사진 배경이면 흰색 강제
  const textColor = hasFullBleed ? '#ffffff' : color.text;
  const textMutedColor = hasFullBleed ? '#ffffffcc' : color.textMuted;

  // ─────────────────────────────────────────
  // 레이아웃별 렌더 함수
  // ─────────────────────────────────────────

  // 1. 다크 볼드
  const renderDarkBold = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 2,
        color: textColor,
      }}
    >
      {/* 상단 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top / 2,
          left: padding.left,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: color.textMuted,
        }}
      >
        {slide.type === 'cover' ? 'FEATURED' : 'NEXT'}
      </div>

      {/* 우측 상단 페이지 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top / 2,
          right: padding.right,
          fontSize: 22,
          fontWeight: 700,
          color: color.textMuted,
        }}
      >
        ● ● ●
      </div>

      <DraggableElement
        elementKey="badge"
        position={badgePos}
        defaultX={0}
        defaultY={0.35}
        {...commonDragProps}
      >
        {slide.type === 'cover' && (
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              backgroundColor: color.accent,
              color: color.background,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 32,
            }}
          >
            {slide.type.toUpperCase()}
          </div>
        )}
      </DraggableElement>

      {slide.type === 'data' && slide.highlight && (
        <DraggableElement
          elementKey="highlight"
          position={highlightPos}
          defaultX={0}
          defaultY={0.35}
          {...commonDragProps}
        >
          <div
            style={{
              fontSize: 200,
              fontWeight: 900,
              lineHeight: 0.95,
              color: color.accent,
              letterSpacing: '-0.04em',
              marginBottom: 32,
            }}
          >
            {slide.highlight}
          </div>
        </DraggableElement>
      )}

      <DraggableElement
        elementKey="headline"
        position={headlinePos}
        defaultX={0}
        defaultY={slide.type === 'data' && slide.highlight ? 0.62 : 0.45}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        <h1
          style={{
            fontSize: typography.headlineSize,
            fontWeight: typography.headlineWeight,
            lineHeight: typography.lineHeight,
            letterSpacing: typography.headlineLetterSpacing,
            textTransform: typography.headlineUppercase ? 'uppercase' : 'none',
            color: textColor,
            margin: 0,
            wordBreak: 'keep-all',
          }}
        >
          {slide.headline}
        </h1>
      </DraggableElement>

      <DraggableElement
        elementKey="body"
        position={bodyPos}
        defaultX={0}
        defaultY={slide.type === 'data' && slide.highlight ? 0.82 : 0.72}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        {slide.body && (
          <p
            style={{
              fontSize: typography.bodySize,
              lineHeight: 1.5,
              color: textMutedColor,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {slide.body}
          </p>
        )}
      </DraggableElement>
    </div>
  );

  // 2. 넘버링
  const renderNumbering = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        zIndex: 2,
        color: color.text,
      }}
    >
      {/* 상단 라인 */}
      {decoration.topLine && (
        <div
          style={{
            position: 'absolute',
            top: padding.top - 40,
            left: padding.left,
            right: padding.right,
            height: 2,
            backgroundColor: color.accent,
          }}
        />
      )}

      {/* 좌측 큰 숫자 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top,
          left: padding.left,
          fontSize: 56,
          fontWeight: 800,
          color: color.accent,
          letterSpacing: '-0.03em',
        }}
      >
        01
      </div>

      {/* 우측 상단 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top + 12,
          right: padding.right,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: color.textMuted,
        }}
      >
        STEP 01
      </div>

      {/* 본문 콘텐츠 (숫자 아래) */}
      <div
        style={{
          marginTop: 120,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <DraggableElement
          elementKey="headline"
          position={headlinePos}
          defaultX={0}
          defaultY={0.32}
          {...commonDragProps}
          style={{ position: 'relative', left: 0, top: 0, maxWidth: width - padding.left - padding.right }}
        >
          <h1
            style={{
              fontSize: typography.headlineSize,
              fontWeight: typography.headlineWeight,
              lineHeight: typography.lineHeight,
              letterSpacing: typography.headlineLetterSpacing,
              color: color.text,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {slide.headline}
          </h1>
        </DraggableElement>

        {slide.body && (
          <DraggableElement
            elementKey="body"
            position={bodyPos}
            defaultX={0}
            defaultY={0.55}
            {...commonDragProps}
            style={{ position: 'relative', left: 0, top: 0, maxWidth: width - padding.left - padding.right }}
          >
            <p
              style={{
                fontSize: typography.bodySize,
                lineHeight: 1.6,
                color: color.textMuted,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {slide.body}
            </p>
          </DraggableElement>
        )}
      </div>
    </div>
  );

  // 3. 포토 감성
  const renderPhotoMood = () => (
    <>
      {/* 사진 배경이 있으면 하단 그라데이션 오버레이 */}
      {hasFullBleed && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${color.background}00 0%, ${color.background}99 55%, ${color.background}ee 100%)`,
            zIndex: 1,
          }}
        />
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
          color: textColor,
        }}
      >
        {/* 상단 뱃지 */}
        <DraggableElement
          elementKey="badge"
          position={badgePos}
          defaultX={0}
          defaultY={0.08}
          {...commonDragProps}
          style={{ position: 'absolute', top: padding.top, left: padding.left }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              backgroundColor: color.accent,
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              borderRadius: 999,
            }}
          >
            TRAVEL
          </div>
        </DraggableElement>

        <DraggableElement
          elementKey="headline"
          position={headlinePos}
          defaultX={0}
          defaultY={0.6}
          {...commonDragProps}
          style={{ position: 'relative', left: 0, top: 0, maxWidth: width - padding.left - padding.right }}
        >
          <h1
            style={{
              fontSize: typography.headlineSize,
              fontWeight: typography.headlineWeight,
              lineHeight: typography.lineHeight,
              letterSpacing: typography.headlineLetterSpacing,
              color: '#ffffff',
              margin: 0,
              wordBreak: 'keep-all',
              marginBottom: 24,
            }}
          >
            {slide.headline}
          </h1>
        </DraggableElement>

        <DraggableElement
          elementKey="body"
          position={bodyPos}
          defaultX={0}
          defaultY={0.78}
          {...commonDragProps}
          style={{ position: 'relative', left: 0, top: 0, maxWidth: width - padding.left - padding.right }}
        >
          {slide.body && (
            <p
              style={{
                fontSize: typography.bodySize,
                lineHeight: 1.5,
                color: '#ffffffdd',
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {slide.body}
            </p>
          )}
        </DraggableElement>
      </div>
    </>
  );

  // 4. 미니멀 리스트
  const renderMinimalList = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        zIndex: 2,
        color: color.text,
      }}
    >
      {/* 상단 탑 넘버링 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top,
          left: padding.left,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: color.accent,
        }}
      >
        TOP 3
      </div>

      {/* 상단 우측 페이지 번호 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top,
          right: padding.right,
          fontSize: 20,
          fontWeight: 700,
          color: color.textMuted,
        }}
      >
        01/05
      </div>

      {/* 헤드라인 (중앙 상단) */}
      <DraggableElement
        elementKey="headline"
        position={headlinePos}
        defaultX={0}
        defaultY={0.28}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        <h1
          style={{
            fontSize: typography.headlineSize,
            fontWeight: typography.headlineWeight,
            lineHeight: typography.lineHeight,
            letterSpacing: typography.headlineLetterSpacing,
            color: color.text,
            margin: 0,
            wordBreak: 'keep-all',
          }}
        >
          {slide.headline}
        </h1>
      </DraggableElement>

      {/* 하단 리스트 */}
      <DraggableElement
        elementKey="body"
        position={bodyPos}
        defaultX={0}
        defaultY={0.62}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: color.accent,
                  minWidth: 40,
                }}
              >
                {n}.
              </div>
              <div
                style={{
                  fontSize: typography.bodySize,
                  lineHeight: 1.5,
                  color: color.textMuted,
                  flex: 1,
                }}
              >
                {n === 1 ? slide.body : `리스트 항목 ${n}`}
              </div>
            </div>
          ))}
        </div>
      </DraggableElement>

      {/* 우측 하단 로고 */}
      <div
        style={{
          position: 'absolute',
          bottom: padding.bottom - 40,
          right: padding.right,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: color.textMuted,
        }}
      >
        BRAND
      </div>
    </div>
  );

  // 5. 비즈니스 뱃지
  const renderBusinessBadge = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        zIndex: 2,
        color: color.text,
      }}
    >
      {/* 좌측 accent bar */}
      {decoration.accentBar === 'left' && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            bottom: 80,
            left: 60,
            width: 6,
            backgroundColor: color.accent,
            borderRadius: 3,
          }}
        />
      )}

      {/* 원형 뱃지 (좌측 상단) */}
      <div
        style={{
          position: 'absolute',
          top: padding.top,
          left: padding.left,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: color.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          fontWeight: 800,
          color: '#ffffff',
        }}
      >
        01
      </div>

      {/* 우측 상단 카테고리 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top + 30,
          right: padding.right,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: color.textMuted,
        }}
      >
        STRATEGY
      </div>

      {/* 헤드라인 */}
      <DraggableElement
        elementKey="headline"
        position={headlinePos}
        defaultX={0}
        defaultY={0.32}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        <h1
          style={{
            fontSize: typography.headlineSize,
            fontWeight: typography.headlineWeight,
            lineHeight: typography.lineHeight,
            letterSpacing: typography.headlineLetterSpacing,
            color: color.text,
            margin: 0,
            wordBreak: 'keep-all',
          }}
        >
          {slide.headline}
        </h1>
      </DraggableElement>

      {/* 본문 */}
      <DraggableElement
        elementKey="body"
        position={bodyPos}
        defaultX={0}
        defaultY={0.58}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        {slide.body && (
          <p
            style={{
              fontSize: typography.bodySize,
              lineHeight: 1.6,
              color: color.textMuted,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {slide.body}
          </p>
        )}
      </DraggableElement>

      {/* CTA 버튼 (하단) */}
      <div
        style={{
          position: 'absolute',
          bottom: padding.bottom,
          left: padding.left,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 28px',
            backgroundColor: color.accent,
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 999,
          }}
        >
          자세히 보기 →
        </div>
      </div>
    </div>
  );

  // 6. 그라데이션 볼드
  const renderGradientBold = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 2,
        color: color.text,
      }}
    >
      {/* 좌측 상단 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top,
          left: padding.left,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: color.textMuted,
        }}
      >
        {slide.type === 'cover' ? 'CHAPTER' : 'STEP'}
      </div>

      {/* 우측 상단 아이콘 */}
      <div
        style={{
          position: 'absolute',
          top: padding.top - 8,
          right: padding.right,
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: '#ffffff22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 22,
        }}
      >
        ⌘
      </div>

      {slide.type === 'data' && slide.highlight && (
        <DraggableElement
          elementKey="highlight"
          position={highlightPos}
          defaultX={0}
          defaultY={0.3}
          {...commonDragProps}
        >
          <div
            style={{
              fontSize: 220,
              fontWeight: 900,
              lineHeight: 0.9,
              color: '#ffffff',
              letterSpacing: '-0.05em',
              marginBottom: 40,
              opacity: 0.95,
            }}
          >
            {slide.highlight}
          </div>
        </DraggableElement>
      )}

      <DraggableElement
        elementKey="headline"
        position={headlinePos}
        defaultX={0}
        defaultY={slide.type === 'data' && slide.highlight ? 0.58 : 0.45}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        <h1
          style={{
            fontSize: typography.headlineSize,
            fontWeight: typography.headlineWeight,
            lineHeight: typography.lineHeight,
            letterSpacing: typography.headlineLetterSpacing,
            color: '#ffffff',
            margin: 0,
            wordBreak: 'keep-all',
            marginBottom: 28,
          }}
        >
          {slide.headline}
        </h1>
      </DraggableElement>

      <DraggableElement
        elementKey="body"
        position={bodyPos}
        defaultX={0}
        defaultY={slide.type === 'data' && slide.highlight ? 0.78 : 0.68}
        {...commonDragProps}
        style={{ maxWidth: width - padding.left - padding.right }}
      >
        {slide.body && (
          <p
            style={{
              fontSize: typography.bodySize,
              lineHeight: 1.5,
              color: '#ffffffcc',
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {slide.body}
          </p>
        )}
      </DraggableElement>

      {/* 하단 원형 화살표 */}
      {decoration.bottomCircle && (
        <div
          style={{
            position: 'absolute',
            bottom: padding.bottom,
            left: padding.left,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#ffffff22',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 28,
          }}
        >
          →
        </div>
      )}

      {/* 우측 하단 브랜드 */}
      <div
        style={{
          position: 'absolute',
          bottom: padding.bottom + 24,
          right: padding.right,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.3em',
          color: color.textMuted,
        }}
      >
        BRAND
      </div>
    </div>
  );

  // 레이아웃 분기
  const renderLayout = () => {
    switch (layout) {
      case 'dark-bold':
        return renderDarkBold();
      case 'numbering':
        return renderNumbering();
      case 'photo-mood':
        return renderPhotoMood();
      case 'minimal-list':
        return renderMinimalList();
      case 'business-badge':
        return renderBusinessBadge();
      case 'gradient-bold':
        return renderGradientBold();
      default:
        return renderDarkBold();
    }
  };

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
      {/* 배경 */}
      <BackgroundLayer color={color} pattern={decoration.backgroundPattern} />

      {/* 이미지 (photo-mood는 배경으로, 나머지는 레이아웃별 처리) */}
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
          {layout !== 'photo-mood' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${color.background}66 0%, ${color.background}dd 100%)`,
                zIndex: 1,
              }}
            />
          )}
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
        </div>
      )}

      {/* 레이아웃 렌더 */}
      {renderLayout()}

      {/* 그림자 */}
      {decoration.shadow && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 160px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
}