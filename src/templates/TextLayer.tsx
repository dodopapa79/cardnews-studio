import React, { useEffect, useRef, useState } from 'react';
import type { TextElementConfig, TextAnimation } from '@/lib/types';

// ─────────────────────────────────────────────
// HEX + 투명도 → rgba
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
// 개별 텍스트 요소 (편집 + 드래그 + 인라인 편집)
// ─────────────────────────────────────────────
interface TextElementProps {
  elementKey: string;
  config: TextElementConfig;
  cardWidth: number;
  cardHeight: number;
  editable: boolean;
  selected: boolean;
  accent: string;
  onSelect: (key: string) => void;
  onChange: (patch: Partial<TextElementConfig>) => void;
}

function TextElement({
  elementKey,
  config,
  cardWidth,
  cardHeight,
  editable,
  selected,
  accent,
  onSelect,
  onChange,
}: TextElementProps) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  if (config.visible === false) return null;
  if (!config.content) return null;

  const maxW = (config.maxWidth ?? 0.8) * cardWidth;

  // 배경 박스
  const hasBg = !!config.background;
  const bgColor = hasBg
    ? hexToRgba(config.background!, config.backgroundOpacity ?? 1)
    : undefined;

  // 드래그 핸들
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || editing) return;
    e.preventDefault();
    e.stopPropagation();

    const card = e.currentTarget.closest('[data-card-container]') as HTMLElement;
    if (!card) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = card.getBoundingClientRect();
    const startPos = { x: config.x, y: config.y };

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      onChange({
        x: Math.max(0, Math.min(0.98, startPos.x + dx)),
        y: Math.max(0, Math.min(0.98, startPos.y + dy)),
      });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editable) onSelect(elementKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditing(false);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
  };

  // 텍스트 스타일
  const textStyle: React.CSSProperties = {
    fontSize: config.fontSize,
    fontWeight: config.fontWeight,
    color: config.color,
    textAlign: config.align,
    fontStyle: config.italic ? 'italic' : 'normal',
    textDecoration: config.underline ? 'underline' : 'none',
    lineHeight: config.lineHeight,
    letterSpacing: `${config.letterSpacing}em`,
    wordBreak: 'keep-all',
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
    margin: 0,
  };

  // 배경 박스 스타일 (인라인)
  const boxStyle: React.CSSProperties = hasBg
    ? {
        background: bgColor,
        padding: config.padding ?? 16,
        borderRadius: config.borderRadius ?? 8,
        display: 'inline-block',
      }
    : {};

  const transform = config.align === 'center' ? 'translateX(-50%)' : undefined;

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: `${config.x * 100}%`,
        top: `${config.y * 100}%`,
        transform,
        maxWidth: maxW,
        cursor: editable ? (editing ? 'text' : 'move') : 'default',
        outline: editable
          ? selected
            ? `2px solid ${accent}`
            : editing
            ? `2px solid ${accent}88`
            : '2px dashed transparent'
          : 'none',
        outlineOffset: 6,
        borderRadius: 4,
        transition: 'outline-color 0.15s',
        zIndex: 3,
        userSelect: editing ? 'text' : 'none',
      }}
      onMouseEnter={(e) => {
        if (editable && !selected && !editing) {
          e.currentTarget.style.outline = `2px dashed ${accent}88`;
        }
      }}
      onMouseLeave={(e) => {
        if (editable && !selected && !editing) {
          e.currentTarget.style.outline = '2px dashed transparent';
        }
      }}
    >
      {/* 배경 박스 wrap */}
      <div style={boxStyle}>
        <div
          ref={ref}
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            // contentEditable 입력은 blur 시점에 반영
          }}
          style={textStyle}
        >
          {config.content}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 텍스트 레이어 (모든 텍스트 요소 관리)
// ─────────────────────────────────────────────
export interface TextLayerProps {
  texts: {
    label?: TextElementConfig;
    headline?: TextElementConfig;
    body?: TextElementConfig;
    highlight?: TextElementConfig;
    footer?: TextElementConfig;
  };
  cardWidth: number;
  cardHeight: number;
  editable: boolean;
  selectedElement?: string | null;
  accent: string;
  onSelectElement?: (key: string) => void;
  onChangeText?: (key: string, patch: Partial<TextElementConfig>) => void;
}

const TEXT_KEYS: (keyof TextLayerProps['texts'])[] = [
  'label',
  'headline',
  'body',
  'highlight',
  'footer',
];

export function TextLayer({
  texts,
  cardWidth,
  cardHeight,
  editable,
  selectedElement,
  accent,
  onSelectElement,
  onChangeText,
}: TextLayerProps) {
  return (
    <div
      data-text-layer
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      {TEXT_KEYS.map((key) => {
        const config = texts[key];
        if (!config) return null;
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              <TextElement
                elementKey={key}
                config={config}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                editable={editable}
                selected={selectedElement === key}
                accent={accent}
                onSelect={(k) => onSelectElement?.(k)}
                onChange={(patch) => onChangeText?.(key, patch)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}