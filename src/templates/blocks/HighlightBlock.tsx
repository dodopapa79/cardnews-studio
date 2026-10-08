'use client';
import React from 'react';
import type { Block, HighlightStyle } from '@/lib/types';

export function HighlightBlock({
  block,
  style,
  editable,
  selected,
  accent,
  onClick,
}: {
  block: Block;
  style: HighlightStyle;
  editable?: boolean;
  selected?: boolean;
  accent?: string;
  onClick?: () => void;
}) {
  const text = block.content.text || '';
  if (!text) return null;

  return (
    <div
      data-block={block.id}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onClick?.();
      }}
      style={{
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: style.color,
        lineHeight: 0.95,
        letterSpacing: '-0.04em',
        wordBreak: 'keep-all',
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
      {text}
    </div>
  );
}