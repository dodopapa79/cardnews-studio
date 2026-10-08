'use client';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useRef } from 'react';
import { CardRenderer } from '@/templates/CardRenderer';
import type { Slide, Preset, BrandInfo, CardSize } from '@/lib/types';
import { CARD_SIZE_DIMENSIONS } from '@/lib/types';

export function HorizontalSlideStrip({
  slides,
  preset,
  brand,
  cardSize = 'instagram',
  selectedIdx,
  onSelect,
  onAdd,
}: {
  slides: Slide[];
  preset?: Preset;
  colorId?: string;
  brand?: BrandInfo;
  cardSize?: CardSize;
  selectedIdx: number;
  onSelect: (i: number) => void;
  onAdd?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dim = CARD_SIZE_DIMENSIONS[cardSize];
  const THUMB_W = 90;

  function scrollBy(dx: number) {
    scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <button
        onClick={() => scrollBy(-320)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-ink-secondary hover:text-primary-700"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scrollBy(320)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-ink-secondary hover:text-primary-700"
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 px-10 scrollbar-hide"
      >
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            className={`shrink-0 relative rounded-lg overflow-hidden transition-all ${
              selectedIdx === i
                ? 'ring-2 ring-primary-500 ring-offset-2'
                : 'border border-surface-border hover:border-primary-300'
            }`}
            style={{
              width: THUMB_W,
              aspectRatio: `${dim.width} / ${dim.height}`,
            }}
          >
            <div
              style={{
                width: dim.width,
                height: dim.height,
                transform: `scale(${THUMB_W / dim.width})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <CardRenderer
                slide={s}
                preset={preset}
                brand={brand}
                width={dim.width}
                height={dim.height}
              />
            </div>

            <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              #{i + 1}
            </div>
            {s.background.imageUrl && (
              <div className="absolute top-1 right-1 bg-primary-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                IMG
              </div>
            )}
          </button>
        ))}

        {onAdd && (
          <button
            onClick={onAdd}
            className="shrink-0 rounded-lg border-2 border-dashed border-surface-border hover:border-primary-400 flex flex-col items-center justify-center gap-1 text-ink-muted hover:text-primary-600 transition-colors"
            style={{
              width: THUMB_W,
              aspectRatio: `${dim.width} / ${dim.height}`,
            }}
          >
            <Plus size={20} />
            <span className="text-[10px]">추가</span>
          </button>
        )}
      </div>
    </div>
  );
}