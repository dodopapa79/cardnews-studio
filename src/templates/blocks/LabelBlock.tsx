'use client';
import React from 'react';
import type { Block, LabelStyle } from '@/lib/types';

function hexToRgba(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function LabelBlock({
  block,
  style,
  editable,
  selected,
  accent,
  onClick,
}: {
  block: Block;
  style: LabelStyle;
  editable?: boolean;
  selected?: boolean;
  accent?: string;
  onClick?: () => void;
}) {
  const text = block.content.text || '';
  if (!text) return null;

  const hasBg = !!style.background;
  const bgColor = hasBg
    ? hexToRgba(style.background!, style.backgroundOpacity ?? 1)
    : undefined;

  const innerStyle: React.CSSProperties = {
    display: hasBg ? 'inline-block' : 'inline-block',
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    color: style.color,
    textAlign: style.align,
    letterSpacing: '0.05em',
    background: bgColor,
    padding: hasBg ? style.padding ?? 12 : undefined,
    borderRadius: hasBg ? style.borderRadius ?? 999 : undefined,
    wordBreak: 'keep-all',
    textTransform: 'uppercase',
  };

  return (
    <div
      data-block={block.id}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onClick?.();
      }}
      style={{
        display: 'flex',
        justifyContent:
          style.align === 'center'
            ? 'center'
            : style.align === 'right'
            ? 'flex-end'
            : 'flex-start',
        cursor: editable ? 'pointer' : 'default',
        outline: editable
          ? selected
            ? `2px solid ${accent || '#8b5cf6'}`
            : '2px dashed transparent'
          : 'none',
        outlineOffset: 6,
        borderRadius: 4,
        transition: 'outline-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (editable && !selected) {
          e.currentTarget.style.outline = `2px dashed ${accent || '#8b5cf6'}88`;
        }
      }}
      onMouseLeave={(e) => {
        if (editable && !selected) {
          e.currentTarget.style.outline = '2px dashed transparent';
        }
      }}
    >
      <div style={innerStyle}>{text}</div>
    </div>
  );
}