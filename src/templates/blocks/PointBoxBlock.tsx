'use client';
import React from 'react';
import type { Block, PointBoxStyle } from '@/lib/types';

function hexToRgba(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function PointBoxBlock({
  block,
  style,
  editable,
  selected,
  accent,
  onClick,
}: {
  block: Block;
  style: PointBoxStyle;
  editable?: boolean;
  selected?: boolean;
  accent?: string;
  onClick?: () => void;
}) {
  const text = block.content.text || '';
  const boxLabel = block.content.boxLabel || '';
  if (!text && !boxLabel) return null;

  const bgColor = hexToRgba(style.bgColor, style.bgOpacity ?? 1);

  return (
    <div
      data-block={block.id}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onClick?.();
      }}
      style={{
        background: bgColor,
        borderLeft: `${style.borderLeftWidth}px solid ${style.borderLeftColor}`,
        padding: style.padding,
        borderRadius: style.borderRadius,
        cursor: editable ? 'pointer' : 'default',
        outline: editable
          ? selected
            ? `2px solid ${accent || '#8b5cf6'}`
            : '2px dashed transparent'
          : 'none',
        outlineOffset: 6,
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
      {boxLabel && (
        <div
          style={{
            fontSize: style.labelSize,
            fontWeight: 800,
            color: style.labelColor,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          {boxLabel}
        </div>
      )}
      {text && (
        <div
          style={{
            fontSize: style.textSize,
            color: style.textColor,
            lineHeight: 1.55,
            fontWeight: 500,
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}