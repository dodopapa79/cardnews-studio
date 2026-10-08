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
  const [showColors, setShowColors] = useState(false);

  const activeColorId = selected && currentColorId ? currentColorId : previewColorId;

  // 크기별 스케일
  const scales = {
    sm: 0.075, // 100px
    md: 0.098, // 106px
    lg: 0.135, // 146px
  };
  const scale = scales[size];

  return (
    <div className="group relative">
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
              transform: `scale(${scale})`,
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

          {/* 선택됨 표시 */}
          {selected && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg">
              <Check size={11} strokeWidth={3} />
            </div>
          )}

          {/* 즐겨찾기 */}
          {onToggleFavorite && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                favorite
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/80 text-ink-secondary opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star size={10} fill={favorite ? 'currentColor' : 'none'} />
            </div>
          )}

          {/* 액션 */}
          <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onExport && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
                className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white"
              >
                <Download size={10} />
              </div>
            )}
            {onDelete && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`"${preset.name}" 삭제할까요?`)) onDelete();
                }}
                className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer"
              >
                <Trash2 size={10} />
              </div>
            )}
          </div>

          {/* 색상 도트 (카드 내부 좌측 하단, hover 시 펼침) */}
          {onColorChange && preset.colorVariants.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setShowColors(true)}
              onMouseLeave={() => setShowColors(false)}
              className="absolute bottom-1 left-1 flex items-center"
            >
              {/* 대표 색 */}
              <div
                className={`w-5 h-5 rounded-full border-2 shadow-md cursor-pointer ${
                  activeColorId === preset.colorVariants[0].id
                    ? 'border-primary-500'
                    : 'border-white'
                }`}
                style={{ background: preset.colorVariants[0].accent }}
              />

              {/* 확장 도트 */}
              <div
                className={`ml-1 flex gap-1 transition-all overflow-hidden ${
                  showColors ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                }`}
              >
                {preset.colorVariants.slice(1).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setPreviewColorId(c.id);
                      onColorChange(c.id);
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${
                      activeColorId === c.id
                        ? 'border-primary-500 scale-110'
                        : 'border-white shadow-sm hover:scale-110'
                    }`}
                    style={{ background: c.accent }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 이름 */}
        <div className="p-1.5 bg-white border-t border-surface-border">
          <div className="text-[11px] font-semibold truncate leading-tight">
            {preset.name}
          </div>
        </div>
      </button>
    </div>
  );
}