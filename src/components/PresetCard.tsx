'use client';
import { useState } from 'react';
import { Star, Check, Trash2, Download, Palette } from 'lucide-react';
import { CardSlide } from '@/templates';
import type { Preset, BrandInfo } from '@/lib/types';

const SAMPLE_SLIDE = {
  id: 'preview',
  type: 'cover' as const,
  headline: '미리보기',
  body: '예시 본문입니다',
  highlight: '100%',
  label: 'FEATURED',
  imageUrl: '',
  imagePrompt: '',
  imagePromptKo: '',
  imageLayout: 'none' as const,
};

export function PresetCard({
  preset,
  selected,
  currentColorId,
  favorite,
  brand,
  size = 'md',
  onSelect,
  onColorChange,
  onToggleFavorite,
  onExport,
  onDelete,
  onCustomize,
}: {
  preset: Preset;
  selected: boolean;
  currentColorId?: string;
  favorite: boolean;
  brand?: BrandInfo;
  size?: 'sm' | 'md' | 'lg';
  onSelect: () => void;
  onColorChange?: (colorId: string) => void;
  onToggleFavorite?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onCustomize?: () => void;
}) {
  const [previewColorId, setPreviewColorId] = useState(
    selected && currentColorId ? currentColorId : preset.colorVariants[0].id
  );

  const activeColorId = selected && currentColorId ? currentColorId : previewColorId;

  // 크기별 치수
  const dims = {
    sm: { width: 100, scale: 0.093 },
    md: { width: 160, scale: 0.148 },
    lg: { width: 220, scale: 0.204 },
  }[size];

  return (
    <div className="group">
      <button
        onClick={onSelect}
        className={`w-full rounded-lg overflow-hidden text-left transition-all ${
          selected
            ? 'ring-2 ring-primary-500 ring-offset-1 shadow-card-hover'
            : 'border border-surface-border hover:border-primary-300 shadow-card'
        }`}
      >
        {/* 미리보기 */}
        <div
          className="relative w-full overflow-hidden bg-gray-100"
          style={{ aspectRatio: '4 / 5' }}
        >
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: `scale(${dims.scale})`,
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
            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg">
              <Check size={12} strokeWidth={3} />
            </div>
          )}

          {onToggleFavorite && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                favorite
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/80 text-ink-secondary opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star size={11} fill={favorite ? 'currentColor' : 'none'} />
            </div>
          )}

          {/* 액션 (hover) */}
          <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onCustomize && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize();
                }}
                className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white"
                title="커스터마이즈"
              >
                <Palette size={11} />
              </div>
            )}
            {onExport && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
                className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white"
                title="내보내기"
              >
                <Download size={11} />
              </div>
            )}
            {onDelete && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`"${preset.name}" 삭제할까요?`)) onDelete();
                }}
                className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer"
                title="삭제"
              >
                <Trash2 size={11} />
              </div>
            )}
          </div>
        </div>

        {/* 정보 */}
        <div className="p-2 bg-white border-t border-surface-border">
          <div className="text-[11px] font-semibold truncate">{preset.name}</div>
        </div>
      </button>

      {/* 색상 도트 */}
      {onColorChange && preset.colorVariants.length > 0 && (
        <div className="flex gap-1 mt-1.5 px-0.5 justify-center flex-wrap">
          {preset.colorVariants.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setPreviewColorId(c.id);
                onColorChange(c.id);
              }}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                activeColorId === c.id
                  ? 'border-primary-500 scale-125 shadow-md'
                  : 'border-white shadow-sm hover:scale-110'
              }`}
              style={{ background: c.accent }}
              title={c.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}