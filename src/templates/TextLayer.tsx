import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { TextElementConfig } from '@/lib/types';

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

// 어두운 HEX 색인지 판단 (3자리/6자리 지원)
function isDarkHex(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// 서버 렌더링(Next.js 빌드) 시 경고가 나지 않도록 분기
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
  /** 전체 배경 이미지 위에 놓이는지 (어두운 글자를 밝게 자동 보정) */
  onDarkBackdrop: boolean;
  /** 앞 요소와 겹치지 않도록 아래로 밀어줄 거리(px) */
  offsetY: number;
  /** 요소 높이 보고 (겹침 계산용) */
  onMeasure: (key: string, height: number) => void;
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
  onDarkBackdrop,
  offsetY,
  onMeasure,
  onSelect,
  onChange,
}: TextElementProps) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(config.content);
  const ref = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const hidden = config.visible === false || !config.content;

  useEffect(() => {
    setLocalValue(config.content);
  }, [config.content]);

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

  // 높이 측정: offsetHeight는 미리보기 축소(transform)의 영향을 받지 않음
  useIsoLayoutEffect(() => {
    onMeasure(elementKey, hidden ? 0 : boxRef.current?.offsetHeight ?? 0);
  });

  // 폰트 로딩/글자 수정으로 높이가 바뀌면 다시 측정
  useEffect(() => {
    const el = boxRef.current;
    if (!el || hidden || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => onMeasure(elementKey, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden, elementKey, onMeasure]);

  if (hidden) return null;

  // 카드 밖으로 글자가 잘리지 않도록 최대 너비 보정
  const margin = cardWidth * 0.04;
  let maxW = (config.maxWidth ?? 0.84) * cardWidth;
  if (config.align === 'center') {
    const room = Math.min(config.x, 1 - config.x) * 2 * cardWidth - margin * 2;
    maxW = Math.min(maxW, Math.max(room, cardWidth * 0.3));
  } else {
    const room = (1 - config.x) * cardWidth - margin;
    maxW = Math.min(maxW, Math.max(room, cardWidth * 0.3));
  }

  // 배경 박스
  const hasBg = !!config.background;
  const bgColor = hasBg
    ? hexToRgba(config.background!, config.backgroundOpacity ?? 1)
    : undefined;

  // 이미지 위 가독성: 박스(배경색) 없는 어두운 글자는 흰색 + 그림자
  const autoLight = onDarkBackdrop && !hasBg && isDarkHex(config.color);
  const textColor = autoLight ? '#ffffff' : config.color;
  const textShadow =
    onDarkBackdrop && !hasBg ? '0 2px 16px rgba(0,0,0,0.45)' : undefined;

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
    if (localValue !== config.content) {
      onChange({ content: localValue });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalValue(config.content);
      setEditing(false);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && elementKey !== 'body') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
  };

  const textStyle: React.CSSProperties = {
    fontSize: config.fontSize,
    fontWeight: config.fontWeight,
    color: textColor,
    textShadow,
    textAlign: config.align,
    fontStyle: config.italic ? 'italic' : 'normal',
    textDecoration: config.underline ? 'underline' : 'none',
    lineHeight: config.lineHeight,
    letterSpacing: `${config.letterSpacing}em`,
    wordBreak: 'keep-all',
    overflowWrap: 'break-word', // 단어 중간에서 끊기지 않게 (긴 단어만 예외)
    whiteSpace: 'pre-wrap',
    margin: 0,
  };

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
      ref={boxRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: `${config.x * 100}%`,
        top: `calc(${config.y * 100}% + ${offsetY}px)`,
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
      <div style={boxStyle}>
        <div
          ref={ref}
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={(e) => setLocalValue(e.currentTarget.textContent || '')}
          style={textStyle}
        >
          {editing ? localValue : config.content}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 텍스트 레이어
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
  /** 전체 배경 이미지 위에 글자가 올라가는 경우 true */
  onDarkBackdrop?: boolean;
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

// 겹침 방지 계산에서 제외 (페이지 번호/안내문처럼 하단에 고정되는 요소)
const PINNED_KEYS = new Set<string>(['footer']);

export function TextLayer({
  texts,
  cardWidth,
  cardHeight,
  editable,
  selectedElement,
  accent,
  onDarkBackdrop = false,
  onSelectElement,
  onChangeText,
}: TextLayerProps) {
  const [heights, setHeights] = useState<Record<string, number>>({});

  const handleMeasure = useCallback((key: string, h: number) => {
    setHeights((prev) => (prev[key] === h ? prev : { ...prev, [key]: h }));
  }, []);

  // 위에서 아래로 훑으며, 앞 요소와 겹치면 그만큼 아래로 민다
  const offsets: Record<string, number> = {};
  const gap = cardHeight * 0.02;
  const stacked = TEXT_KEYS.filter((k) => {
    const c = texts[k];
    return !!c && c.visible !== false && !!c.content && !PINNED_KEYS.has(k);
  }).sort((a, b) => texts[a]!.y - texts[b]!.y);

  let prevBottom = -Infinity;
  for (const key of stacked) {
    const top = texts[key]!.y * cardHeight;
    const adjusted = Math.max(top, prevBottom + gap);
    offsets[key] = adjusted - top;
    prevBottom = adjusted + (heights[key] ?? 0);
  }

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
                onDarkBackdrop={onDarkBackdrop}
                offsetY={offsets[key] ?? 0}
                onMeasure={handleMeasure}
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
