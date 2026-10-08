'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardRenderer } from '@/templates/CardRenderer';
import type { Slide, Preset, BrandInfo, CardSize } from '@/lib/types';
import { CARD_SIZE_DIMENSIONS } from '@/lib/types';
import { Grid3x3, Smartphone } from 'lucide-react';

export function DraggableCardPreview({
  slide,
  preset,
  brand,
  cardSize = 'instagram',
  onSelectBlock,
  onSelectBackground,
  onOpenPhoneMockup,
}: {
  slide: Slide;
  preset: Preset;
  brand?: BrandInfo;
  cardSize?: CardSize;
  onSelectBlock: (blockId: string | null) => void;
  onSelectBackground: () => void;
  onOpenPhoneMockup: () => void;
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const dim = CARD_SIZE_DIMENSIONS[cardSize];

  function handleSelectBlock(id: string | null) {
    setSelectedBlockId(id);
    onSelectBlock(id);
  }

  function handleBackgroundClick() {
    setSelectedBlockId(null);
    onSelectBackground();
  }

  return (
    <Card padding={false} className="p-3">
      <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
        <div className="text-sm font-semibold">
          미리보기 — <span className="text-primary-600">블록 클릭해서 선택</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg transition-colors ${
              showGrid
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-surface-hover text-ink-secondary'
            }`}
            title="그리드"
          >
            <Grid3x3 size={16} />
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSelectBlock(null)}
          >
            선택 해제
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Smartphone size={14} />}
            onClick={onOpenPhoneMockup}
          >
            폰
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4">
        <div
          className="relative"
          style={{
            width: '100%',
            maxWidth: cardSize === 'square' ? 420 : 400,
            aspectRatio: `${dim.width} / ${dim.height}`,
          }}
        >
          {showGrid && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {[...Array(11)].map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * 10}
                    y1="0"
                    x2={i * 10}
                    y2="100"
                    stroke="#7c3aed"
                    strokeWidth="0.15"
                    opacity="0.4"
                  />
                ))}
                {[...Array(11)].map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1="0"
                    y1={i * 10}
                    x2="100"
                    y2={i * 10}
                    stroke="#7c3aed"
                    strokeWidth="0.15"
                    opacity="0.4"
                  />
                ))}
              </svg>
            </div>
          )}

          <div className="overflow-hidden shadow-xl bg-white w-full h-full">
            <div
              style={{
                width: dim.width,
                height: dim.height,
                transform: `scale(${(cardSize === 'square' ? 420 : 400) / dim.width})`,
                transformOrigin: 'top left',
              }}
            >
              <CardRenderer
                slide={slide}
                preset={preset}
                brand={brand}
                width={dim.width}
                height={dim.height}
                editable
                selectedBlockId={selectedBlockId}
                onSelectBlock={handleSelectBlock}
                onSelectBackground={handleBackgroundClick}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedBlockId && (
        <div className="mt-3 text-xs text-center text-primary-700 bg-primary-50 rounded-lg py-2">
          블록 선택됨 — 우측 패널에서 편집
        </div>
      )}
    </Card>
  );
}