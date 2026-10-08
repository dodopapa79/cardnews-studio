'use client';
import type { Slide, Preset, BrandInfo, CardSize } from '@/lib/types';
import { CARD_SIZE_DIMENSIONS } from '@/lib/types';
import { CardSlide } from '@/templates';

export function CardPreview({
  slides,
  preset,
  colorId,
  brand,
  cardSize = 'instagram',
  registerRef,
}: {
  slides: Slide[];
  preset: Preset;
  colorId?: string;
  brand?: BrandInfo;
  cardSize?: CardSize;
  registerRef: (idx: number, el: HTMLDivElement | null) => void;
}) {
  const dim = CARD_SIZE_DIMENSIONS[cardSize];
  return (
    <div className="grid grid-cols-2 gap-4">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="border rounded-xl overflow-hidden shadow-card bg-white"
          style={{ aspectRatio: `${dim.width} / ${dim.height}` }}
        >
          <div
            style={{
              width: dim.width,
              height: dim.height,
              transform: `scale(${240 / dim.width})`,
              transformOrigin: 'top left',
            }}
          >
            <div ref={(el) => registerRef(i, el)}>
              <CardSlide
                slide={s}
                preset={preset}
                colorId={colorId}
                brand={brand}
                width={dim.width}
                height={dim.height}
                isLast={i === slides.length - 1}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}