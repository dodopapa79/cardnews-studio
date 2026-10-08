'use client';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { STYLE_PRESETS, INDUSTRY_PRESETS } from '@/presets';
import { CardSlide } from '@/templates';
import { sortPresets } from '@/lib/utils';
import type { Preset, BrandInfo } from '@/lib/types';
import { Check, Plus, Trash2, Download, Upload, Star } from 'lucide-react';

const SAMPLE_SLIDE = {
  id: 'preview',
  type: 'cover' as const,
  headline: '미리보기',
  body: '이것은 샘플 본문입니다',
  highlight: '',
  label: 'FEATURED',
  imageUrl: '',
  imagePrompt: '',
  imageLayout: 'none' as const,
};

export function PresetPicker({
  current,
  currentColorId,
  customPresets,
  favorites,
  stats,
  brand,
  onSelect,
  onColorChange,
  onSaveCustom,
  onDeleteCustom,
  onImport,
  onToggleFavorite,
  inline = false,
}: {
  current: Preset;
  currentColorId?: string;
  customPresets: Preset[];
  favorites: string[];
  stats: Record<string, number>;
  brand?: BrandInfo;
  onSelect: (p: Preset, colorId?: string) => void;
  onColorChange?: (colorId: string) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImport?: (presets: Preset[]) => void;
  onToggleFavorite?: (id: string) => void;
  inline?: boolean;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');
  const [saveModal, setSaveModal] = useState(false);
  const [newName, setNewName] = useState('');

  const rawList =
    tab === 'style' ? STYLE_PRESETS : tab === 'industry' ? INDUSTRY_PRESETS : customPresets;

  const list = useMemo(
    () => sortPresets(rawList, favorites, stats),
    [rawList, favorites, stats]
  );

  function handleExport(preset: Preset) {
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preset-${preset.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const presets = Array.isArray(data) ? data : [data];
        onImport(presets);
      } catch {
        alert('올바른 프리셋 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const content = (
    <div className="space-y-3">
      {/* 탭 + 액션 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <Tabs
            tabs={[
              { id: 'style', label: `스타일 (${STYLE_PRESETS.length})` },
              { id: 'industry', label: `업종 (${INDUSTRY_PRESETS.length})` },
              { id: 'custom', label: `커스텀 (${customPresets.length})` },
            ]}
            active={tab}
            onChange={(v) => setTab(v as any)}
          />
        </div>
        <div className="flex gap-1">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
            <span className="inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1.5 font-medium rounded-lg bg-gray-100 hover:bg-gray-200">
              <Upload size={12} />
              가져오기
            </span>
          </label>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={12} />}
            onClick={() => {
              setNewName('');
              setSaveModal(true);
            }}
          >
            저장
          </Button>
        </div>
      </div>

      {/* 프리셋 그리드 — 잘림 없이 */}
      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-8 text-sm text-ink-muted">
          저장된 커스텀 프리셋이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              selected={current.id === p.id}
              currentColorId={currentColorId}
              favorite={favorites.includes(p.id)}
              brand={brand}
              onSelect={(colorId) => onSelect(p, colorId)}
              onColorChange={(colorId) => {
                onSelect(p, colorId);
                onColorChange?.(colorId);
              }}
              onToggleFavorite={() => onToggleFavorite?.(p.id)}
              onExport={() => handleExport(p)}
              onDelete={!p.builtin && tab === 'custom' ? () => onDeleteCustom(p.id) : undefined}
            />
          ))}
        </div>
      )}

      <Modal
        open={saveModal}
        onClose={() => setSaveModal(false)}
        title="커스텀 프리셋 저장"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="프리셋 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="예: 우리 회사 브랜드"
            autoFocus
          />
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

  if (inline) return content;

  return <div className="space-y-3">{content}</div>;
}

// ─────────────────────────────────────────────
// 프리셋 카드 — 잘림 방지 + 인라인 색상 선택
// ─────────────────────────────────────────────
function PresetCard({
  preset,
  selected,
  currentColorId,
  favorite,
  brand,
  onSelect,
  onColorChange,
  onToggleFavorite,
  onExport,
  onDelete,
}: {
  preset: Preset;
  selected: boolean;
  currentColorId?: string;
  favorite: boolean;
  brand?: BrandInfo;
  onSelect: (colorId?: string) => void;
  onColorChange: (colorId: string) => void;
  onToggleFavorite: () => void;
  onExport: () => void;
  onDelete?: () => void;
}) {
  const [previewColorId, setPreviewColorId] = useState(
    selected && currentColorId ? currentColorId : preset.colorVariants[0].id
  );

  // selected가 바뀌면 프리뷰 색상 동기화
  const activeColorId = selected && currentColorId ? currentColorId : previewColorId;

  return (
    <div className="group">
      <button
        onClick={() => onSelect(activeColorId)}
        className={`w-full rounded-xl overflow-hidden text-left transition-all ${
          selected
            ? 'ring-2 ring-primary-500 ring-offset-2 shadow-card-hover'
            : 'border border-surface-border hover:border-primary-300 shadow-card'
        }`}
      >
        {/* 미리보기 - 잘림 없이 aspect ratio로 */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: 'scale(0.215)',
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <CardSlide
              slide={SAMPLE_SLIDE}
              preset={preset}
              colorId={activeColorId}
              brand={brand}
              isLast={false}
            />
          </div>

          {selected && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <Check size={14} strokeWidth={3} />
            </div>
          )}

          {onToggleFavorite && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                favorite
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/80 text-ink-secondary opacity-0 group-hover:opacity-100'
              }`}
              title={favorite ? '즐겨찾기 해제' : '즐겨찾기'}
            >
              <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
            </div>
          )}

          {onDelete && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`"${preset.name}" 삭제할까요?`)) onDelete();
              }}
              className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
              title="삭제"
            >
              <Trash2 size={13} />
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="p-2.5 bg-white border-t border-surface-border">
          <div className="text-xs font-semibold truncate">{preset.name}</div>
          {preset.description && (
            <div className="text-[10px] text-ink-muted truncate mt-0.5">
              {preset.description}
            </div>
          )}
        </div>
      </button>

      {/* 색상 선택 (프리셋 카드 하단) */}
      <div className="flex gap-1 mt-1.5 px-1 justify-center flex-wrap">
        {preset.colorVariants.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setPreviewColorId(c.id);
              onColorChange(c.id);
            }}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              activeColorId === c.id
                ? 'border-primary-500 scale-125'
                : 'border-white shadow-sm hover:scale-110'
            }`}
            style={{ background: c.accent }}
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
}