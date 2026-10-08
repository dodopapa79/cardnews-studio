'use client';
import React from 'react';
import type { Block, DividerStyle } from '@/lib/types';

export function DividerBlock({
  block,
  style,
  editable,
  selected,
  accent,
  onClick,
}: {
  block: Block;
  style: DividerStyle;
  editable?: boolean;
  selected?: boolean;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <div
      data-block={block.id}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onClick?.();
      }}
      style={{
        width: '100%',
        height: style.thickness,
        background: style.color,
        borderRadius: style.thickness / 2,
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
    />
  );
}