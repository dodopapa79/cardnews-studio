'use client';
import { useState } from 'react';
import { Star, Check, Trash2, Download } from 'lucide-react';
import { CardRenderer } from '@/templates/CardRenderer';
import type { Preset, BrandInfo, Slide } from '@/lib/types';
import { makeBlockId } from '@/lib/blocks';

// 프리셋 미리보기용 샘플 슬라이드 생성
function makeSampleSlide(preset: Preset): Slide {
  return {
    id: 'preview',
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
        content: { text: '예시 본문입니다' },
        animation: 'fade-in',
        visible: true,
      },
    ],
    imagePrompt: '',
    imagePromptKo: '',
    isLast: false,
  };
}

export function PresetCard({
  preset,
  selected,
  favorite,
  brand,
  size = 'md',
  onSelect,
  onToggleFavorite,
  onExport,
  onDelete,
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
  const [showActions, setShowActions] = useState(false);

  const scales = { sm: 0.075, md: 0.098, lg: 0.135 };
  const scale = scales[size];

  let sample: Slide | null = null;
  try {
    sample = makeSampleSlide(preset);
  } catch {
    return null;
  }

  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
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
            <CardRenderer
              slide={sample}
              preset={preset}
              brand={brand}
              width={1080}
              height={1350}
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
          <div
            className={`absolute bottom-1 right-1 flex gap-1 transition-opacity ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}
          >
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