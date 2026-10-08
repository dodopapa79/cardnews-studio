'use client';
import React from 'react';
import type { Block, ListStyle } from '@/lib/types';

function hexToRgba(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function ListBlock({
  block,
  style,
  editable,
  selected,
  accent,
  onClick,
}: {
  block: Block;
  style: ListStyle;
  editable?: boolean;
  selected?: boolean;
  accent?: string;
  onClick?: () => void;
}) {
  const items = block.content.items || [];
  if (items.length === 0) return null;

  const itemBg = hexToRgba(style.itemBg, style.itemBgOpacity ?? 1);

  return (
    <div
      data-block={block.id}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onClick?.();
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: style.itemGap,
        cursor: editable ? 'pointer' : 'default',
        outline: editable
          ? selected
            ? `2px solid ${accent || '#8b5cf6'}`
            : '2px dashed transparent'
          : 'none',
        outlineOffset: 6,
        borderRadius: 8,
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
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
            background: itemBg,
            borderRadius: style.itemBorderRadius,
            padding: style.itemPadding,
          }}
        >
          {/* 번호 (있으면) */}
          {item.number && (
            <div
              style={{
                fontSize: style.numberSize,
                fontWeight: 900,
                color: style.numberColor,
                lineHeight: 1,
                flexShrink: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {item.number}
            </div>
          )}

          {/* 텍스트 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: style.titleSize,
                fontWeight: 700,
                color: style.titleColor,
                lineHeight: 1.35,
                wordBreak: 'keep-all',
                overflowWrap: 'break-word',
              }}
            >
              {item.title}
            </div>
            {item.desc && (
              <div
                style={{
                  fontSize: style.descSize,
                  color: style.descColor,
                  lineHeight: 1.5,
                  marginTop: 8,
                  wordBreak: 'keep-all',
                  overflowWrap: 'break-word',
                }}
              >
                {item.desc}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}