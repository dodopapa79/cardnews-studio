'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardRenderer } from '@/templates/CardRenderer';
import type { Slide, Preset, BrandInfo, CardSize, TextElementConfig } from '@/lib/types';
import { CARD_SIZE_DIMENSIONS } from '@/lib/types';
import { RotateCcw, Grid3x3, Smartphone } from 'lucide-react';

export function DraggableCardPreview({
  slide,
  preset,
  brand,
  cardSize = 'instagram',
  onSlideChange,
  onOpenPhoneMockup,
  onElementSelect,
}: {
  slide: Slide;
  preset?: Preset;
  colorId?: string;
  brand?: BrandInfo;
  isLast?: boolean;
  cardSize?: CardSize;
  onSlideChange: (patch: Partial<Slide>) => void;
  onOpenPhoneMockup: () => void;
  onElementSelect?: (el: string | null) => void;
}) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const dim = CARD_SIZE_DIMENSIONS[cardSize];

  function handleSelectElement(el: string) {
    setSelectedElement(el);
    onElementSelect?.(el);
  }

  function handleChangeText(key: string, patch: Partial<TextElementConfig>) {
    const texts = { ...slide.texts };
    const current = texts[key as keyof typeof texts];
    if (!current) return;
    texts[key as keyof typeof texts] = { ...current, ...patch };
    onSlideChange({ texts });
  }

  function resetAll() {
    if (!confirm('이 슬라이드의 모든 편집을 초기화할까요?')) return;
    // 위치만 초기화 (텍스트 내용은 유지)
    const texts = { ...slide.texts };
    Object.keys(texts).forEach((k) => {
      const t = texts[k as keyof typeof texts];
      if (t) {
        // 위치는 그대로 두고 나머지만 초기화하는 것보다
        // 전체 슬라이드 재생성 유도
      }
    });
    setSelectedElement(null);
    onElementSelect?.(null);
  }

  return (
    <Card padding={false} className="p-3">
      <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
        <div className="text-sm font-semibold">
          미리보기 — <span className="text-primary-600">클릭 후 드래그 / 더블클릭 편집</span>
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
            icon={<RotateCcw size={14} />}
            onClick={() => {
              setSelectedElement(null);
              onElementSelect?.(null);
            }}
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

          <div className="rounded-xl overflow-hidden border-2 border-white shadow-xl bg-white w-full h-full">
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
                selectedElement={selectedElement}
                onSelectElement={handleSelectElement}
                onChangeText={handleChangeText}
                onSelectBackground={() => handleSelectElement('background')}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedElement && (
        <div className="mt-3 text-xs text-center text-primary-700 bg-primary-50 rounded-lg py-2">
          선택됨:{' '}
          <strong>
            {selectedElement === 'background'
              ? '배경'
              : selectedElement === 'headline'
              ? '헤드라인'
              : selectedElement === 'body'
              ? '본문'
              : selectedElement === 'highlight'
              ? '강조 숫자'
              : selectedElement === 'label'
              ? '라벨'
              : selectedElement === 'footer'
              ? '푸터'
              : selectedElement}
          </strong>{' '}
          — 우측 패널에서 편집
        </div>
      )}
    </Card>
  );
}