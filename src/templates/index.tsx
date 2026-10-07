import React from 'react';
import type { Slide, Preset } from '@/lib/types';

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
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '0.1em',
    fontFamily: typography.fontFamily,
    marginBottom: 40,
    alignSelf: 'flex-start',
  };

  if (decoration.badgeStyle === 'none') return null;

  if (decoration.badgeStyle === 'pill') {
    return (
      <div
        style={{
          ...base,
          padding: '10px 22px',
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
          padding: '10px 22px',
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

export function CardSlide({ slide, preset }: { slide: Slide; preset: Preset }) {
  const { theme, typography, decoration } = preset;
  const hasFullBleed = !!slide.imageUrl && slide.imageLayout === 'full-bleed';
  const hasTopImage = !!slide.imageUrl && slide.imageLayout === 'top-image';
  const hasSplit = !!slide.imageUrl && slide.imageLayout === 'split';

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

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: typography.fontFamily,
        position: 'relative',
        overflow: 'hidden',
      }}
      data-card
    >
      {!hasFullBleed && (
        <PatternOverlay type={decoration.backgroundPattern} color={theme.text} />
      )}

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
              filter: imageFilter,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.78) 100%)',
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
            height: 680,
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
            width: 540,
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
              filter: imageFilter,
            }}
          />
        </div>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: hasSplit ? '90px 60px 90px 90px' : '90px',
          paddingLeft: decoration.accentBar === 'left' ? 106 : undefined,
          paddingTop: decoration.accentBar === 'top' ? 106 : undefined,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: hasTopImage ? 'flex-end' : 'center',
          color: hasFullBleed ? '#ffffff' : theme.text,
        }}
      >
        <Badge type={slide.type} preset={preset} invert={hasFullBleed} />

        {slide.type === 'data' && slide.highlight && (
          <div
            style={{
              fontSize: 180,
              fontWeight: 900,
              lineHeight: 1,
              color: hasFullBleed ? '#ffffff' : theme.accent,
              marginBottom: 24,
              letterSpacing: '-0.04em',
              fontFamily: typography.fontFamily,
            }}
          >
            {slide.highlight}
          </div>
        )}

        <h1
          style={{
            fontSize:
              slide.type === 'cover'
                ? typography.headlineSize
                : typography.headlineSize * 0.78,
            fontWeight: typography.headlineWeight,
            lineHeight: typography.lineHeight,
            letterSpacing: typography.headlineLetterSpacing,
            marginBottom: 32,
            color: hasFullBleed ? '#ffffff' : theme.text,
            fontFamily: typography.fontFamily,
          }}
        >
          {slide.headline}
        </h1>

        {slide.body && (
          <p
            style={{
              fontSize: typography.bodySize,
              lineHeight: 1.55,
              fontWeight: 400,
              opacity: hasFullBleed ? 0.95 : 0.8,
              maxWidth: hasSplit ? 500 : '100%',
              fontFamily: typography.fontFamily,
            }}
          >
            {slide.body}
          </p>
        )}
      </div>

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
