'use client';
import { useMemo, useState } from 'react';
import type { Preset } from '@/lib/types';
import { STYLE_PRESETS, INDUSTRY_PRESETS } from '@/presets';
import { CardSlide } from '@/templates';

const SAMPLE_SLIDE = {
  id: 'preview',
  type: 'cover' as const,
  headline: '미리보기',
  body: '본문 텍스트',
  highlight: '',
  imageUrl: '',
  imagePrompt: '',
  imageLayout: 'none' as const,
};

export function PresetPicker({
  current,
  customPresets,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
}: {
  current: Preset;
  customPresets: Preset[];
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');

  const list = useMemo(() => {
    if (tab === 'style') return STYLE_PRESETS;
    if (tab === 'industry') return INDUSTRY_PRESETS;
    return customPresets;
  }, [tab, customPresets]);

  return (
    <div className="border rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🎨 프리셋</h3>
        <button
          onClick={() => {
            const name = prompt('커스텀 프리셋 이름을 입력하세요');
            if (name?.trim()) onSaveCustom(name.trim());
          }}
          className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg"
        >
          + 현재 설정 저장
        </button>
      </div>

      <div className="flex gap-1 text-sm">
        {(['style', 'industry', 'custom'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg ${
              tab === t ? 'bg-brand-500 text-white' : 'bg-gray-100'
            }`}
          >
            {t === 'style'
              ? '스타일'
              : t === 'industry'
              ? '업종'
              : `커스텀(${customPresets.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 && tab === 'custom' && (
        <div className="text-xs text-gray-400 text-center py-6">
          아직 저장된 커스텀 프리셋이 없습니다.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto">
        {list.map((p) => (
          <PresetCard
            key={p.id}
            preset={p}
            selected={current.id === p.id}
            onClick={() => onSelect(p)}
            onDelete={!p.builtin ? () => onDeleteCustom(p.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  selected,
  onClick,
  onDelete,
}: {
  preset: Preset;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-full rounded-lg border-2 overflow-hidden text-left transition ${
          selected ? 'border-brand-600 shadow-md' : 'border-transparent hover:border-gray-200'
        }`}
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: 'scale(0.13)',
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <CardSlide slide={SAMPLE_SLIDE} preset={preset} />
          </div>
        </div>
        <div className="p-2 border-t bg-white">
          <div className="text-xs font-semibold truncate" style={{ color: preset.theme.text }}>
            {preset.name}
          </div>
          {preset.description && (
            <div className="text-[10px] text-gray-500 truncate">{preset.description}</div>
          )}
        </div>
      </button>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs leading-none"
          title="삭제"
        >
          ×
        </button>
      )}
    </div>
  );
}