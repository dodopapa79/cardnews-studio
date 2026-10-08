'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { BLOCK_LABELS, createEmptyBlock } from '@/lib/blocks';
import type { Block, BlockType, BlockItem } from '@/lib/types';
import { Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';

const BLOCK_TYPES: BlockType[] = [
  'headline',
  'body',
  'label',
  'highlight',
  'list',
  'numbered-card',
  'point-box',
  'divider',
];

export function BlockEditor({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onReplace,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onReplace: (newType: BlockType) => void;
}) {
  const [showReplace, setShowReplace] = useState(false);

  const updateContent = (patch: Partial<Block['content']>) => {
    onChange({ content: { ...block.content, ...patch } });
  };

  return (
    <div className="space-y-3">
      {/* 블록 헤더 */}
      <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
        <span className="text-sm font-bold">{BLOCK_LABELS[block.type]}</span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1.5 rounded-lg bg-surface-hover hover:bg-gray-200 disabled:opacity-30"
          >
            <ArrowUp size={12} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1.5 rounded-lg bg-surface-hover hover:bg-gray-200 disabled:opacity-30"
          >
            <ArrowDown size={12} />
          </button>
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="p-1.5 rounded-lg bg-surface-hover hover:bg-gray-200 text-xs"
            title="블록 교체"
          >
            🔄
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* 블록 교체 */}
      {showReplace && (
        <div className="p-3 rounded-lg bg-surface-bg border border-surface-border">
          <div className="text-xs font-semibold text-ink-secondary mb-2">
            블록 종류 변경
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  onReplace(t);
                  setShowReplace(false);
                }}
                className={`text-left p-2 rounded border text-xs ${
                  t === block.type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-border hover:border-primary-300'
                }`}
              >
                {BLOCK_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 블록별 편집 UI */}
      {block.type === 'divider' ? (
        <div className="text-xs text-ink-muted text-center py-2">
          구분선 (편집 없음)
        </div>
      ) : block.type === 'list' || block.type === 'numbered-card' ? (
        <ItemsEditor
          items={block.content.items || []}
          onChange={(items) => updateContent({ items })}
          withNumber={block.type === 'numbered-card'}
        />
      ) : block.type === 'point-box' ? (
        <div className="space-y-2">
          <Input
            label="박스 라벨"
            value={block.content.boxLabel || ''}
            onChange={(e) => updateContent({ boxLabel: e.target.value })}
            placeholder="POINT"
          />
          <Textarea
            label="본문"
            value={block.content.text || ''}
            onChange={(e) => updateContent({ text: e.target.value })}
            rows={3}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {block.type === 'headline' ? (
            <Input
              label="제목"
              value={block.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
            />
          ) : (
            <Textarea
              label="텍스트"
              value={block.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              rows={block.type === 'body' ? 3 : 2}
            />
          )}
        </div>
      )}
    </div>
  );
}

// 항목 편집기
function ItemsEditor({
  items,
  onChange,
  withNumber,
}: {
  items: BlockItem[];
  onChange: (items: BlockItem[]) => void;
  withNumber: boolean;
}) {
  function update(i: number, patch: Partial<BlockItem>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function add() {
    const nextNumber = String(items.length + 1).padStart(2, '0');
    onChange([
      ...items,
      { number: withNumber ? nextNumber : undefined, title: '새 항목', desc: '' },
    ]);
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-ink-secondary">항목</div>
      {items.map((item, i) => (
        <div
          key={i}
          className="p-2.5 rounded-lg border border-surface-border bg-surface-bg space-y-1.5"
        >
          <div className="flex gap-1.5 items-center">
            {withNumber && (
              <input
                value={item.number || ''}
                onChange={(e) => update(i, { number: e.target.value })}
                placeholder="01"
                className="w-12 text-xs border rounded px-1.5 py-1 text-center"
              />
            )}
            <input
              value={item.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="제목"
              className="flex-1 text-xs border rounded px-2 py-1"
            />
            <button
              onClick={() => remove(i)}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <X size={12} />
            </button>
          </div>
          <input
            value={item.desc || ''}
            onChange={(e) => update(i, { desc: e.target.value })}
            placeholder="설명 (선택)"
            className="w-full text-xs border rounded px-2 py-1"
          />
        </div>
      ))}
      <Button size="sm" variant="ghost" icon={<Plus size={12} />} onClick={add} className="w-full">
        항목 추가
      </Button>
    </div>
  );
}