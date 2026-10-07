'use client';
import { useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
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
  body: '본문 텍스트입니다',
  highlight: '',
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
  onExport,
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
  onImport?: (presets: Preset[]) => void;
  onExport?: (preset: Preset) => void;
  onToggleFavorite?: (id: string) => void;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');
  const [saveModal, setSaveModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [detailPreset, setDetailPreset] = useState<Preset | null>(null);

  const rawList =
    tab === 'style' ? STYLE_PRESETS : tab === 'industry' ? INDUSTRY_PRESETS : customPresets;

  // 정렬 (즐겨찾기 → 사용 빈도 → 이름)
  const list = useMemo(
    () => sortPresets(rawList, favorites, stats),
    [rawList, favorites, stats]
  );

  function handleExport(preset: Preset) {
    if (onExport) return onExport(preset);
    const blob = new Blob([JSON.stringify(preset, null, 2)], {
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

  return (
    <Card>
      <CardHeader
        title="프리셋"
        subtitle="클릭하면 즉시 적용됩니다"
        action={
          <div className="flex gap-1">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
              <span className="inline-flex items-center justify-center gap-2 text-xs px-3 py-1.5 font-medium rounded-lg transition-colors bg-gray-100 hover:bg-gray-200">
                <Upload size={13} />
                가져오기
              </span>
            </label>
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus size={13} />}
              onClick={() => {
                setNewName('');
                setSaveModal(true);
              }}
            >
              저장
            </Button>
          </div>
        }
      />

      <div className="mb-3">
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

      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-8 text-sm text-ink-muted">
          저장된 커스텀 프리셋이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {list.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              selected={current.id === p.id}
              favorite={favorites.includes(p.id)}
              brand={brand}
              onClick={() => {
                onSelect(p);
                setDetailPreset(p);
              }}
              onToggleFavorite={() => onToggleFavorite?.(p.id)}
              onDelete={
                !p.builtin && tab === 'custom' ? () => onDeleteCustom(p.id) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* 프리셋 상세 모달 — 적용 시 자동 닫힘 */}
      <Modal
        open={!!detailPreset}
        onClose={() => setDetailPreset(null)}
        title={detailPreset?.name || ''}
        maxWidth="lg"
      >
        {detailPreset && (
          <PresetDetail
            preset={detailPreset}
            currentColorId={currentColorId}
            brand={brand}
            onApply={(cid) => {
              onColorChange?.(cid);
              onSelect(detailPreset, cid);
              setDetailPreset(null); // ← 자동 닫힘
            }}
            onClose={() => setDetailPreset(null)}
            onExport={() => handleExport(detailPreset)}
          />
        )}
      </Modal>

      {/* 저장 모달 */}
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
    </Card>
  );
}

// ─────────────────────────────────────────────
// 프리셋 카드 (그리드용)
// ─────────────────────────────────────────────
function PresetCard({
  preset,
  selected,
  favorite,
  brand,
  onClick,
  onToggleFavorite,
  onDelete,
}: {
  preset: Preset;
  selected: boolean;
  favorite: boolean;
  brand?: BrandInfo;
  onClick: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full rounded-xl overflow-hidden text-left transition-all ${
          selected
            ? 'ring-2 ring-primary-500 ring-offset-2 shadow-card-hover'
            : 'border border-surface-border hover:border-primary-300 shadow-card'
        }`}
      >
        {/* 미리보기 — aspect ratio로 잘림 방지 */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: 'scale(0.19)',
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <CardSlide
              slide={SAMPLE_SLIDE}
              preset={preset}
              brand={brand}
              isLast={false}
            />
          </div>
          {selected && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <Check size={14} strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="p-3 border-t border-surface-border bg-white">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-semibold truncate flex-1">{preset.name}</div>
            {favorite && (
              <Star size={12} className="text-amber-500 shrink-0" fill="currentColor" />
            )}
          </div>
          {preset.description && (
            <div className="text-xs text-ink-muted truncate mt-0.5">
              {preset.description}
            </div>
          )}
          <div className="flex gap-1 mt-2">
            {preset.colorVariants.slice(0, 4).map((c) => (
              <span
                key={c.id}
                className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                style={{ background: c.accent }}
                title={c.name}
              />
            ))}
            {preset.colorVariants.length > 4 && (
              <span className="text-[10px] text-ink-muted self-center">
                +{preset.colorVariants.length - 4}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* 즐겨찾기 버튼 */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            favorite
              ? 'bg-amber-500 text-white opacity-100'
              : 'bg-white/80 text-ink-secondary opacity-0 group-hover:opacity-100'
          }`}
          title={favorite ? '즐겨찾기 해제' : '즐겨찾기'}
        >
          <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* 삭제 버튼 */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`"${preset.name}" 프리셋을 삭제할까요?`)) onDelete();
          }}
          className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="삭제"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 프리셋 상세 모달
// ─────────────────────────────────────────────
function PresetDetail({
  preset,
  currentColorId,
  brand,
  onApply,
  onClose,
  onExport,
}: {
  preset: Preset;
  currentColorId?: string;
  brand?: BrandInfo;
  onApply: (colorId: string) => void;
  onClose: () => void;
  onExport: () => void;
}) {
  const [previewColorId, setPreviewColorId] = useState(
    currentColorId || preset.colorVariants[0].id
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div
          className="rounded-xl overflow-hidden border-2 border-white shadow-lg bg-white"
          style={{ width: 320, aspectRatio: '1080 / 1350' }}
        >
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: `scale(${320 / 1080})`,
              transformOrigin: 'top left',
            }}
          >
            <CardSlide
              slide={SAMPLE_SLIDE}
              preset={preset}
              colorId={previewColorId}
              brand={brand}
              isLast={false}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-ink-secondary mb-2">색상 선택</div>
        <div className="flex gap-2 flex-wrap">
          {preset.colorVariants.map((c) => (
            <button
              key={c.id}
              onClick={() => setPreviewColorId(c.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                previewColorId === c.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-surface-border hover:border-primary-300'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ background: c.accent }}
              />
              <span className="text-xs font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-between pt-2 border-t">
        <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={onExport}>
          파일로 내보내기
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
          <Button onClick={() => onApply(previewColorId)}>
            이 프리셋 적용
          </Button>
        </div>
      </div>
    </div>
  );
}