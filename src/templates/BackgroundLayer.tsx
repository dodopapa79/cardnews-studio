import React from 'react';
import type { BackgroundConfig } from '@/lib/types';

// ─────────────────────────────────────────────
// HEX 색상 + 투명도 → rgba
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
// 이미지 필터 문자열 생성
// ─────────────────────────────────────────────
function buildImageFilter(bg: BackgroundConfig): string {
  const parts: string[] = [];
  if (bg.imageBrightness !== undefined && bg.imageBrightness !== 100) {
    parts.push(`brightness(${bg.imageBrightness}%)`);
  }
  if (bg.imageContrast !== undefined && bg.imageContrast !== 100) {
    parts.push(`contrast(${bg.imageContrast}%)`);
  }
  if (bg.imageSaturation !== undefined && bg.imageSaturation !== 100) {
    parts.push(`saturate(${bg.imageSaturation}%)`);
  }
  if (bg.imageBlur !== undefined && bg.imageBlur > 0) {
    parts.push(`blur(${bg.imageBlur}px)`);
  }
  if (bg.imageGrayscale !== undefined && bg.imageGrayscale > 0) {
    parts.push(`grayscale(${bg.imageGrayscale}%)`);
  }
  return parts.length > 0 ? parts.join(' ') : 'none';
}

// ─────────────────────────────────────────────
// 배경 레이어 (텍스트 없음, 순수 배경만)
// ─────────────────────────────────────────────
interface BackgroundLayerProps {
  background: BackgroundConfig;
  width: number;
  height: number;
  /** 편집용 클릭 핸들러 */
  onClick?: () => void;
  /** 편집 가능 여부 */
  editable?: boolean;
  /** 선택됨 (outline 표시) */
  isSelected?: boolean;
  /** 강조 색 (선택 시 outline 색상) */
  accent?: string;
}

export function BackgroundLayer({
  background: bg,
  width,
  height,
  onClick,
  editable,
  isSelected,
  accent = '#8b5cf6',
}: BackgroundLayerProps) {
  const isImage = bg.type === 'image' && bg.imageUrl;
  const isGradient = bg.type === 'gradient' && !!bg.colorEnd;
  const filter = buildImageFilter(bg);
  const focalX = bg.imageFocalX ?? 0.5;
  const focalY = bg.imageFocalY ?? 0.5;

  // 베이스 배경
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  };

  let backgroundColor: string | undefined;
  let backgroundImage: string | undefined;

  if (isGradient) {
    backgroundImage = `linear-gradient(135deg, ${bg.color} 0%, ${bg.colorEnd} 100%)`;
  } else {
    backgroundColor = bg.color;
  }

  return (
    <div
      data-background-layer
      onClick={onClick}
      style={{
        ...baseStyle,
        backgroundColor,
        backgroundImage,
        cursor: editable ? 'pointer' : 'default',
        outline: isSelected ? `3px solid ${accent}` : 'none',
        outlineOffset: -3,
        zIndex: 0,
      }}
    >
      {/* 배경 이미지 */}
      {isImage && (
        <img
          src={bg.imageUrl!}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${focalX * 100}% ${focalY * 100}%`,
            filter,
            opacity: bg.imageOpacity ?? 1,
            display: 'block',
          }}
        />
      )}

      {/* 배경 패턴 (그리드/도트/노이즈/메시) */}
      {bg.pattern === 'mesh' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 20% 20%, ${bg.colorEnd || bg.color}66 0%, transparent 45%),
                         radial-gradient(circle at 80% 60%, ${bg.colorEnd || bg.color}55 0%, transparent 50%),
                         radial-gradient(circle at 50% 90%, ${bg.colorEnd || bg.color}44 0%, transparent 45%)`,
            pointerEvents: 'none',
          }}
        />
      )}
      {bg.pattern === 'grid' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${bg.color} 1px, transparent 1px), linear-gradient(90deg, ${bg.color} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            opacity: 0.06,
            pointerEvents: 'none',
          }}
        />
      )}
      {bg.pattern === 'dots' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${bg.color} 2px, transparent 2px)`,
            backgroundSize: '40px 40px',
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        />
      )}
      {bg.pattern === 'noise' && (
        <svg
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="bg-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#bg-noise)" />
        </svg>
      )}

      {/* 상단 이미지 하단 그라데이션 (배경색으로 자연스럽게 이어짐) */}
      {isImage && bg.topImageFade && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: height * 0.4,
            height: height * 0.25,
            background: `linear-gradient(180deg, ${bg.color}00 0%, ${bg.color}cc 60%, ${bg.color} 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 하단 검정 그라데이션 (어두운 배경) */}
      {bg.bottomFade && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '25%',
            background: `linear-gradient(180deg, ${bg.color}00 0%, #000000 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 이미지 위 오버레이 (어둡게/밝게) */}
      {isImage && bg.overlayColor && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: hexToRgba(bg.overlayColor, bg.overlayOpacity ?? 0.4),
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}