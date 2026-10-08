'use client';
import { useEffect, useRef, useState } from 'react';

export function InlineEditableText({
  value,
  onChange,
  onFocusElement,
  editable,
  style,
  as = 'span',
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocusElement?: () => void;
  editable?: boolean;
  style?: React.CSSProperties;
  as?: 'span' | 'h1' | 'p' | 'div';
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      // 커서를 끝으로
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  function handleBlur() {
    setEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setLocalValue(value);
      setEditing(false);
      return;
    }
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
  }

  function handleDoubleClick(e: React.MouseEvent) {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    setEditing(true);
  }

  if (!editable) {
    return <div style={style}>{value}</div>;
  }

  return (
    <div
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={(e) => setLocalValue(e.currentTarget.textContent || '')}
      onClick={(e) => {
        e.stopPropagation();
        onFocusElement?.();
      }}
      style={{
        ...style,
        cursor: editing ? 'text' : 'pointer',
        outline: editing ? '2px solid #8b5cf6' : 'none',
        outlineOffset: 4,
        borderRadius: 4,
        minWidth: 20,
        minHeight: '1em',
      }}
      title={editing ? '' : '더블클릭하여 편집'}
    >
      {localValue}
    </div>
  );
}