'use client';
import React from 'react';
import type { Block, Preset } from '@/lib/types';
import {
  HeadlineBlock,
  BodyBlock,
  LabelBlock,
  HighlightBlock,
  ListBlock,
  NumberedCardBlock,
  PointBoxBlock,
  DividerBlock,
} from './blocks';

export function BlockRenderer({
  block,
  preset,
  editable,
  selected,
  onSelect,
}: {
  block: Block;
  preset: Preset;
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  if (block.visible === false) return null;

  const common = {
    block,
    editable,
    selected,
    accent: '#8b5cf6',
    onClick: onSelect,
  };

  switch (block.type) {
    case 'headline':
      return <HeadlineBlock {...common} style={preset.blockStyles.headline} />;
    case 'body':
      return <BodyBlock {...common} style={preset.blockStyles.body} />;
    case 'label':
      return <LabelBlock {...common} style={preset.blockStyles.label} />;
    case 'highlight':
      return <HighlightBlock {...common} style={preset.blockStyles.highlight} />;
    case 'list':
      return <ListBlock {...common} style={preset.blockStyles.list} />;
    case 'numbered-card':
      return <NumberedCardBlock {...common} style={preset.blockStyles.numberedCard} />;
    case 'point-box':
      return <PointBoxBlock {...common} style={preset.blockStyles.pointBox} />;
    case 'divider':
      return <DividerBlock {...common} style={preset.blockStyles.divider} />;
    default:
      return null;
  }
}