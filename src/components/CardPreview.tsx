'use client';
import type { Slide, Preset } from '@/lib/types';
import { CardSlide } from '@/templates';

export function CardPreview({
  slides,
  preset,
  colorId,
  registerRef,
}: {
  slides: Slide[];
  preset: Preset;
  colorId?: string;
  registerRef: (idx: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="border rounded-xl overflow-hidden shadow-card bg-white"
          style={{ aspectRatio: '1080 / 1350' }}
        >
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: 'scale(0.18)',
              transformOrigin: 'top left',
            }}
          >
            <div ref={(el) => registerRef(i, el)}>
              <CardSlide slide={s} preset={preset} colorId={colorId} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

CardPreview.Single = function Single({
  slide,
  preset,
  colorId,
}: {
  slide: Slide;
  preset: Preset;
  colorId?: string;
}) {
  return <CardSlide slide={slide} preset={preset} colorId={colorId} />;
};