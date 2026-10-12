'use client';
import { useState } from 'react';
import { ChevronRight, Sparkles, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PresetCard } from '@/components/PresetCard';
import { PresetImportModal } from '@/components/PresetImportModal';
import { Button } from '@/components/ui/Button';
import { STYLE_PRESETS } from '@/lib/presets';
import { sortPresets } from '@/lib/utils';
import type { Preset, BrandInfo, Slide } from '@/lib/types';
import { makeBlockId } from '@/lib/blocks';
import { CardRenderer } from '@/templates/CardRenderer';

// 프리셋 미리보기용 샘플 슬라이드
function makeSampleSlide(preset: Preset): Slide {
  return {
    id: 'sample',
    type: 'cover',
    background: {
      type: 'color',
      color: '#ffffff',
      pattern: 'none',
      ...preset.background,
    } as any,
    blocks: [
      {
        id: makeBlockId(),
        type: 'headline',
        y: 0.3,
        content: { text: '미리보기' },
        animation: 'slide-up',
        visible: true,
      },
      {
        id: makeBlockId(),
        type: 'body',
        y: 0.5,
        content: { text: '본문 예시입니다' },
        animation: 'fade-in',
        visible: true,
      },
    ],
    imagePrompt: '',
    imagePromptKo: '',
    isLast: false,
  };
}

export function PresetStrip({
  current,
  customPresets,
  favorites,
  brand,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
  onImportCustom,
  onToggleFavorite,
}: {
  current: Preset;
  customPresets: Preset[];
  favorites: string[];
  brand?: BrandInfo;
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImportCustom: (preset: Preset) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [openAll, setOpenAll] = useState(false);

  const allPresets = sortPresets([...STYLE_PRESETS, ...customPresets], favorites);

  const stripItems = (() => {
    const result: Preset[] = [];
    const seen = new Set<string>();
    if (current) {
      result.push(current);
      seen.add(current.id);
    }
    for (const p of allPresets) {
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
            <MiniStripCard
              key={p.id}
              preset={p}
              selected={current.id === p.id}
              brand={brand}
              onClick={() => onSelect(p)}
            />
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
        title="프리셋 전체보기"
        maxWidth="2xl"
      >
        <PresetGallery
          current={current}
          customPresets={customPresets}
          favorites={favorites}
          brand={brand}
          onSelect={(p) => {
            onSelect(p);
            setOpenAll(false);
          }}
          onSaveCustom={onSaveCustom}
          onDeleteCustom={onDeleteCustom}
          onImportCustom={onImportCustom}
          onToggleFavorite={onToggleFavorite}
        />
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────
// 미니 스트립 카드 (1줄용)
// ─────────────────────────────────────────
function MiniStripCard({
  preset,
  selected,
  brand,
  onClick,
}: {
  preset: Preset;
  selected: boolean;
  brand?: BrandInfo;
  onClick: () => void;
}) {
  let sample: Slide | null = null;
  try {
    sample = makeSampleSlide(preset);
  } catch {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-lg border-2 overflow-hidden transition-all relative ${
        selected
          ? 'border-primary-500 shadow-md'
          : 'border-surface-border hover:border-primary-300'
      }`}
      style={{ width: 60, height: 78 }}
      title={preset.name}
    >
      <div className="relative w-full h-full bg-gray-100 overflow-hidden">
        <div
          style={{
            width: 1080,
            height: 1350,
            transform: `scale(${60 / 1080})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <CardRenderer
            slide={sample}
            preset={preset}
            brand={brand}
            width={1080}
            height={1350}
          />
        </div>
        {selected && (
          <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center text-white">
            <Check size={9} strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 text-[9px] font-medium text-center py-0.5 truncate px-1">
        {preset.name}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────
// 프리셋 갤러리
// ─────────────────────────────────────────
function PresetGallery({
  current,
  customPresets,
  favorites,
  brand,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
  onImportCustom,
  onToggleFavorite,
}: {
  current: Preset;
  customPresets: Preset[];
  favorites: string[];
  brand?: BrandInfo;
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImportCustom: (preset: Preset) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [tab, setTab] = useState<'builtin' | 'custom'>('builtin');
  const [saveModal, setSaveModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [newName, setNewName] = useState('');

  const list =
    tab === 'builtin' ? STYLE_PRESETS : sortPresets(customPresets, favorites);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setTab('builtin')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              tab === 'builtin'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-ink-secondary'
            }`}
          >
            기본 ({STYLE_PRESETS.length})
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              tab === 'custom'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-ink-secondary'
            }`}
          >
            커스텀 ({customPresets.length})
          </button>
        </div>

        <div className="flex-1" />

        <Button size="sm" icon={<Sparkles size={13} />} onClick={() => setImportModal(true)}>
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

      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-lg">
          <div className="text-sm text-ink-muted mb-3">커스텀 프리셋이 없습니다</div>
          <Button size="sm" onClick={() => setImportModal(true)} icon={<Sparkles size={12} />}>
            첫 프리셋 가져오기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {list.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              selected={current.id === p.id}
              favorite={favorites.includes(p.id)}
              brand={brand}
              size="md"
              onSelect={() => onSelect(p)}
              onToggleFavorite={() => onToggleFavorite(p.id)}
              onDelete={
                !p.builtin && tab === 'custom'
                  ? () => onDeleteCustom(p.id)
                  : undefined
              }
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

      <PresetImportModal
        open={importModal}
        onClose={() => setImportModal(false)}
        onSave={(preset) => {
          onImportCustom(preset);
          setImportModal(false);
        }}
      />
    </div>
  );
}