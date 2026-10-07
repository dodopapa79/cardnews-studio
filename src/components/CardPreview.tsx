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
              <CardSlide slide={s} preset={preset} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

CardPreview.Single = function Single({ slide, preset }: { slide: Slide; preset: Preset }) {
  return <CardSlide slide={slide} preset={preset} />;
};