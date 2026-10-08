'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { STYLE_PRESETS, INDUSTRY_PRESETS } from '@/presets';
import { CardSlide } from '@/templates';
import { sortPresets } from '@/lib/utils';
import type { Preset, BrandInfo } from '@/lib/types';
import {
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  Star,
  Palette,
} from 'lucide-react';

const SAMPLE_SLIDE = {
  id: 'preview',
  type: 'cover' as const,
  headline: '이것은 예시 제목입니다',
  body: '이것은 예시 본문입니다. 프리셋의 스타일을 확인해보세요.',
  highlight: '',
  label: 'FEATURED',
  imageUrl: '',
  imagePrompt: '',
  imageLayout: 'none' as const,
};

export function PresetsView({
  current,
  currentColorId,
  onSelect,
  onColorChange,
  customPresets,
  favorites,
  stats,
  brand,
  onSaveCustom,
  onDeleteCustom,
  onImport,
  onToggleFavorite,
}: {
  current: Preset;
  currentColorId?: string;
  onSelect: (p: Preset, colorId?: string) => void;
  onColorChange: (colorId: string) => void;
  customPresets: Preset[];
  favorites: string[];
  stats: Record<string, number>;
  brand?: BrandInfo;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImport: (presets: Preset[]) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');
  const [saveModal, setSaveModal] = useState(false);
  const [newName, setNewName] = useState('');

  const rawList =
    tab === 'style' ? STYLE_PRESETS : tab === 'industry' ? INDUSTRY_PRESETS : customPresets;

  const list = sortPresets(rawList, favorites, stats);

  function handleExport(preset: Preset) {
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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* 안내 */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
            <Star size={18} fill="white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-primary-900 mb-1">프리셋 안내</div>
            <div className="text-xs text-primary-800 leading-relaxed space-y-0.5">
              <div>• 프리셋 카드 하단 색상 도트를 클릭하면 즉시 색상이 변경됩니다</div>
              <div>• 별 아이콘을 클릭하면 즐겨찾기되어 상단에 고정됩니다</div>
              <div>• 자주 사용하는 프리셋은 자동으로 앞에 정렬됩니다</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 탭 + 액션 */}
      <Card padding={false} className="p-2 flex items-center gap-3 flex-wrap">
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
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
            <span className="inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
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
            현재 설정 저장
          </Button>
        </div>
      </Card>

      {/* 프리셋 그리드 */}
      {list.length === 0 && tab === 'custom' ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <Palette size={28} />
            </div>
            <div className="text-base font-semibold mb-1">커스텀 프리셋이 없습니다</div>
            <div className="text-sm text-ink-secondary mb-4">
              카드뉴스 만들기에서 스타일을 조정한 후 저장해보세요
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((p) => (
            <PresetCardLarge
              key={p.id}
              preset={p}
              selected={current.id === p.id}
              currentColorId={currentColorId}
              favorite={favorites.includes(p.id)}
              brand={brand}
              onSelect={(colorId) => onSelect(p, colorId)}
              onColorChange={(colorId) => {
                onSelect(p, colorId);
                onColorChange(colorId);
              }}
              onToggleFavorite={() => onToggleFavorite(p.id)}
              onExport={() => handleExport(p)}
              onDelete={
                !p.builtin && tab === 'custom' ? () => onDeleteCustom(p.id) : undefined
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
}

// ─────────────────────────────────────────────
// 프리셋 카드 (큰 버전, 잘림 없음)
// ─────────────────────────────────────────────
function PresetCardLarge({
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
  onSelect: (colorId: string) => void;
  onColorChange: (colorId: string) => void;
  onToggleFavorite: () => void;
  onExport: () => void;
  onDelete?: () => void;
}) {
  const [previewColorId, setPreviewColorId] = useState(
    selected && currentColorId ? currentColorId : preset.colorVariants[0].id
  );

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
        {/* 미리보기 — aspect ratio로 잘림 방지 */}
        <div
          className="relative w-full overflow-hidden bg-gray-100"
          style={{ aspectRatio: '4 / 5' }}
        >
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: 'scale(0.35)',
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
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg">
              <Check size={14} strokeWidth={3} />
            </div>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              favorite
                ? 'bg-amber-500 text-white opacity-100'
                : 'bg-white/80 text-ink-secondary opacity-0 group-hover:opacity-100'
            }`}
            title={favorite ? '즐겨찾기 해제' : '즐겨찾기'}
          >
            <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
          </div>

          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
              className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white"
              title="내보내기"
            >
              <Download size={12} />
            </div>
            {onDelete && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`"${preset.name}" 삭제할까요?`)) onDelete();
                }}
                className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer"
                title="삭제"
              >
                <Trash2 size={12} />
              </div>
            )}
          </div>
        </div>

        {/* 정보 */}
        <div className="p-3 bg-white border-t border-surface-border">
          <div className="text-sm font-semibold truncate">{preset.name}</div>
          {preset.description && (
            <div className="text-xs text-ink-muted truncate mt-0.5">
              {preset.description}
            </div>
          )}
        </div>
      </button>

      {/* 색상 도트 */}
      <div className="flex gap-1.5 mt-2 px-1 justify-center flex-wrap">
        {preset.colorVariants.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setPreviewColorId(c.id);
              onColorChange(c.id);
            }}
            className={`w-5 h-5 rounded-full border-2 transition-all ${
              activeColorId === c.id
                ? 'border-primary-500 scale-125 shadow-md'
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