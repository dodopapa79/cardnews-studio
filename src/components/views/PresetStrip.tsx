'use client';
import { useState } from 'react';
import { ChevronRight, Sparkles, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PresetCard } from '@/components/PresetCard';
import { PresetImportModal } from '@/components/PresetImportModal';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { STYLE_PRESETS, INDUSTRY_PRESETS } from '@/presets';
import { presetToJSON } from '@/lib/preset-import';
import { sortPresets } from '@/lib/utils';
import type { Preset, BrandInfo } from '@/lib/types';
import { Upload, Plus } from 'lucide-react';
import { CardSlide } from '@/templates';

export function PresetStrip({
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
  onImportCustom,
  onToggleFavorite,
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
  onImport: (presets: Preset[]) => void;
  onImportCustom: (preset: Preset) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [openAll, setOpenAll] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const allPresets = sortPresets(
    [...STYLE_PRESETS, ...INDUSTRY_PRESETS, ...customPresets],
    favorites,
    stats
  );

  // 1줄에 표시: 선택된 것 + 사용 빈도 높은 것 5개
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
              colorId={current.id === p.id ? currentColorId : p.colorVariants[0]?.id}
              brand={brand}
              onClick={() => onSelect(p, p.colorVariants[0]?.id)}
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
          currentColorId={currentColorId}
          customPresets={customPresets}
          favorites={favorites}
          stats={stats}
          brand={brand}
          onSelect={(p, cid) => {
            onSelect(p, cid);
            setOpenAll(false);
          }}
          onColorChange={onColorChange}
          onSaveCustom={onSaveCustom}
          onDeleteCustom={onDeleteCustom}
          onImport={onImport}
          onImportCustom={(p) => onImportCustom(p)}
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
        brand={brand}
      />
    </>
  );
}

// ─────────────────────────────────────────
// 미니 스트립 카드 (1줄용, 60x78)
// ─────────────────────────────────────────
function MiniStripCard({
  preset,
  selected,
  colorId,
  brand,
  onClick,
}: {
  preset: Preset;
  selected: boolean;
  colorId?: string;
  brand?: BrandInfo;
  onClick: () => void;
}) {
  const SAMPLE = {
    id: 'strip',
    type: 'cover' as const,
    headline: '미리보기',
    body: '본문',
    highlight: '',
    label: 'FEATURED',
    imageUrl: '',
    imagePrompt: '',
    imagePromptKo: '',
    imageLayout: 'none' as const,
  };

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
          <CardSlide
            slide={SAMPLE}
            preset={preset}
            colorId={colorId}
            brand={brand}
            isLast={false}
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
// 프리셋 갤러리 (팝업 내부, 카드 축소)
// ─────────────────────────────────────────
function PresetGallery({
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
  onOpenImport,
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
  onImport: (presets: Preset[]) => void;
  onToggleFavorite: (id: string) => void;
  onOpenImport: () => void;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');
  const [newName, setNewName] = useState('');
  const [saveModal, setSaveModal] = useState(false);

  const rawList =
    tab === 'style' ? STYLE_PRESETS : tab === 'industry' ? INDUSTRY_PRESETS : customPresets;

  const list = sortPresets(rawList, favorites, stats);

  function handleExport(preset: Preset) {
    const data = presetToJSON(preset);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preset-${preset.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  return (
    <div className="space-y-3">
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
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <Button size="sm" icon={<Sparkles size={13} />} onClick={onOpenImport}>
          AI 프리셋 가져오기
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
          <span className="inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <Upload size={12} />
            JSON 파일
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
          현재 설정 저장
        </Button>
      </div>

      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-lg">
          <div className="text-sm text-ink-muted mb-2">
            커스텀 프리셋이 없습니다
          </div>
          <Button size="sm" onClick={onOpenImport} icon={<Sparkles size={12} />}>
            첫 프리셋 가져오기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {list.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              selected={current.id === p.id}
              currentColorId={currentColorId}
              favorite={favorites.includes(p.id)}
              brand={brand}
              size="md"
              onSelect={() => onSelect(p, p.colorVariants[0]?.id)}
              onColorChange={(colorId) => {
                onSelect(p, colorId);
                onColorChange?.(colorId);
              }}
              onToggleFavorite={() => onToggleFavorite(p.id)}
              onExport={() => handleExport(p)}
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
    </div>
  );
}