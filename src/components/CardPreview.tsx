'use client';
import type { Slide, Preset } from '@/lib/types';
import { CardSlide } from '@/templates';

export function CardPreview({
  slides,
  preset,
  registerRef,
}: {
  slides: Slide[];
  preset: Preset;
  registerRef: (idx: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="space-y-3">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="border rounded-xl overflow-hidden shadow-sm bg-white"
          style={{ aspectRatio: '1080 / 1350' }}
        >
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: 'scale(0.25)',
              transformOrigin: 'top left',
            }}
          >
            <div ref={(el) => registerRef(i, el)}>
              <CardSlide slide={s} preset={preset} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}