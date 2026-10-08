'use client';
import { useState } from 'react';
import { ChevronRight, Sparkles, Check, FileJson } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PresetImportModal } from '@/components/PresetImportModal';
import { STYLE_PRESETS } from '@/presets';
import { sortPresets } from '@/lib/utils';
import type { Preset } from '@/lib/types';

export function PresetStrip({
  current,
  customPresets,
  favorites,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
  onImportCustom,
  onToggleFavorite,
}: {
  current: Preset;
  customPresets: Preset[];
  favorites: string[];
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImportCustom: (preset: Preset) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [openAll, setOpenAll] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const all = sortPresets([...STYLE_PRESETS, ...customPresets], favorites);

  // 1줄 표시: 선택된 것 + 앞의 5개
  const stripItems = (() => {
    const result: Preset[] = [];
    const seen = new Set<string>();
    result.push(current);
    seen.add(current.id);
    for (const p of all) {
      if (result.length >= 6) break;
      if (!seen.has(p.id)) {
        result.push(p);
        seen.add(p.id);
      }
    }
    return result;
  })();

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="shrink-0 flex items-center gap-1.5 pr-2 border-r border-surface-border">
          <Sparkles size={14} className="text-primary-600" />
          <span className="text-xs font-semibold text-ink-secondary hidden md:inline">
            프리셋
          </span>
        </div>

        <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {stripItems.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                current.id === p.id
                  ? 'border-primary-500 shadow-md'
                  : 'border-surface-border hover:border-primary-300'
              }`}
              style={{ width: 100, padding: 8 }}
            >
              <div className="text-[10px] font-semibold truncate text-center">
                {p.name}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpenAll(true)}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-semibold transition"
        >
          전체보기
          <ChevronRight size={14} />
        </button>
      </div>

      <Modal
        open={openAll}
        onClose={() => setOpenAll(false)}
        title="프리셋"
        maxWidth="2xl"
      >
        <PresetGallery
          current={current}
          customPresets={customPresets}
          favorites={favorites}
          onSelect={(p) => {
            onSelect(p);
            setOpenAll(false);
          }}
          onSaveCustom={onSaveCustom}
          onDeleteCustom={onDeleteCustom}
          onToggleFavorite={onToggleFavorite}
          onOpenImport={() => {
            setOpenAll(false);
            setOpenImport(true);
          }}
        />
      </Modal>

      <PresetImportModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        onSave={(preset) => onImportCustom(preset)}
      />
    </>
  );
}

// ─────────────────────────────────────────
// 갤러리
// ─────────────────────────────────────────
function PresetGallery({
  current,
  customPresets,
  favorites,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
  onToggleFavorite,
  onOpenImport,
}: {
  current: Preset;
  customPresets: Preset[];
  favorites: string[];
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenImport: () => void;
}) {
  const [tab, setTab] = useState<'builtin' | 'custom'>('builtin');
  const [newName, setNewName] = useState('');
  const [saveModal, setSaveModal] = useState(false);

  const list = tab === 'builtin' ? STYLE_PRESETS : customPresets;

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setTab('builtin')}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
            tab === 'builtin' ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-secondary'
          }`}
        >
          기본 ({STYLE_PRESETS.length})
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
            tab === 'custom' ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-secondary'
          }`}
        >
          커스텀 ({customPresets.length})
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <Button size="sm" icon={<Sparkles size={13} />} onClick={onOpenImport}>
          AI 프리셋 가져오기
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setNewName('');
            setSaveModal(true);
          }}
        >
          현재 설정 저장
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-lg">
          <FileJson size={32} className="mx-auto text-ink-muted mb-2" />
          <div className="text-sm text-ink-muted mb-3">
            커스텀 프리셋이 없습니다
          </div>
          <Button size="sm" onClick={onOpenImport} icon={<Sparkles size={12} />}>
            첫 프리셋 가져오기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`text-left rounded-lg border-2 p-3 transition ${
                current.id === p.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-surface-border hover:border-primary-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                {current.id === p.id && (
                  <Check size={14} className="text-primary-600 shrink-0" />
                )}
              </div>
              {p.description && (
                <div className="text-xs text-ink-muted line-clamp-2">
                  {p.description}
                </div>
              )}
              <div className="mt-2 flex gap-1">
                <div
                  className="w-4 h-4 rounded border border-white shadow-sm"
                  style={{ background: p.defaultBackground?.color || '#ffffff' }}
                />
                <div
                  className="w-4 h-4 rounded border border-white shadow-sm"
                  style={{ background: p.defaultHeadlineStyle?.color || '#000000' }}
                />
                <div
                  className="w-4 h-4 rounded border border-white shadow-sm"
                  style={{ background: p.defaultLabelStyle?.color || '#8b5cf6' }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={saveModal}
        onClose={() => setSaveModal(false)}
        title="프리셋 저장"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <label className="block">
            <div className="text-sm font-medium text-ink-secondary mb-1.5">
              프리셋 이름
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="예: 우리 회사 브랜드"
              autoFocus
              className="w-full rounded-lg border border-surface-border px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setSaveModal(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (newName.trim()) {
                  onSaveCustom(newName.trim());
                  setSaveModal(false);
                }
              }}
            >
              저장
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}