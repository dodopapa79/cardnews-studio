'use client';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PresetCard } from '@/components/PresetCard';
import { PresetImportModal } from '@/components/PresetImportModal';
import { STYLE_PRESETS, INDUSTRY_PRESETS } from '@/presets';
import { presetToJSON } from '@/lib/preset-import';
import { sortPresets } from '@/lib/utils';
import type { Preset, BrandInfo } from '@/lib/types';
import { Plus, Upload, Download, Sparkles } from 'lucide-react';

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
  onImportCustom,
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
  onImportCustom?: (preset: Preset) => void;
  inline?: boolean;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');
  const [saveModal, setSaveModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [newName, setNewName] = useState('');

  const rawList =
    tab === 'style' ? STYLE_PRESETS : tab === 'industry' ? INDUSTRY_PRESETS : customPresets;

  const list = useMemo(
    () => sortPresets(rawList, favorites, stats),
    [rawList, favorites, stats]
  );

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
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-1.5 flex-wrap">
        <Button
          size="sm"
          icon={<Sparkles size={13} />}
          onClick={() => setImportModal(true)}
        >
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

      {/* 그리드 */}
      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-lg">
          <div className="text-sm text-ink-muted mb-2">커스텀 프리셋이 없습니다</div>
          <Button
            size="sm"
            onClick={() => setImportModal(true)}
            icon={<Sparkles size={12} />}
          >
            첫 프리셋 가져오기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
              onToggleFavorite={() => onToggleFavorite?.(p.id)}
              onExport={() => handleExport(p)}
              onDelete={
                !p.builtin && tab === 'custom' ? () => onDeleteCustom(p.id) : undefined
              }
            />
          ))}
        </div>
      )}

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

      {/* AI 프리셋 가져오기 모달 */}
      <PresetImportModal
        open={importModal}
        onClose={() => setImportModal(false)}
        onSave={(preset) => {
          if (onImportCustom) {
            onImportCustom(preset);
          } else {
            onImport?.([preset]);
          }
        }}
        brand={brand}
      />
    </div>
  );

  if (inline) return content;

  return <div className="space-y-3">{content}</div>;
}