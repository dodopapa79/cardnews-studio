'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSlide } from '@/templates';
import type { Slide, Preset, ElementPosition } from '@/lib/types';
import { RotateCcw, Grid3x3, Smartphone } from 'lucide-react';

export function DraggableCardPreview({
  slide,
  preset,
  colorId,
  onSlideChange,
  onOpenPhoneMockup,
}: {
  slide: Slide;
  preset: Preset;
  colorId?: string;
  onSlideChange: (slide: Slide) => void;
  onOpenPhoneMockup: () => void;
}) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  function handleElementDrag(element: string, pos: ElementPosition) {
    const positions = { ...(slide.positions || {}) };
    if (element === 'headline') positions.headline = pos;
    else if (element === 'body') positions.body = pos;
    else if (element === 'highlight') positions.highlight = pos;
    else if (element === 'badge') positions.badge = pos;
    onSlideChange({ ...slide, positions });
  }

  function resetPositions() {
    if (!confirm('이 슬라이드의 위치 조정을 초기화할까요?')) return;
    onSlideChange({ ...slide, positions: undefined });
    setSelectedElement(null);
  }

  function resetElement() {
    if (!selectedElement) return;
    const positions = { ...(slide.positions || {}) };
    if (selectedElement === 'headline') delete positions.headline;
    else if (selectedElement === 'body') delete positions.body;
    else if (selectedElement === 'highlight') delete positions.highlight;
    else if (selectedElement === 'badge') delete positions.badge;
    onSlideChange({ ...slide, positions });
    setSelectedElement(null);
  }

  return (
    <Card padding={false} className="p-3">
      <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
        <div className="text-sm font-semibold">
          미리보기 — <span className="text-primary-600">드래그로 위치 조정</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg transition-colors ${
              showGrid
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-surface-hover text-ink-secondary'
            }`}
            title="그리드 표시"
          >
            <Grid3x3 size={16} />
          </button>
          {selectedElement && (
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={resetElement}>
              요소 초기화
            </Button>
          )}
          <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={resetPositions}>
            전체 초기화
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Smartphone size={14} />}
            onClick={onOpenPhoneMockup}
          >
            폰으로 보기
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6">
        <div
          className="relative"
          style={{
            width: '100%',
            maxWidth: 420,
            aspectRatio: '1080 / 1350',
          }}
        >
          {showGrid && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
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
                width: 1080,
                height: 1350,
                transform: `scale(${420 / 1080})`,
                transformOrigin: 'top left',
              }}
            >
              <CardSlide
                slide={slide}
                preset={preset}
                colorId={colorId}
                editable
                selectedElement={selectedElement}
                onElementClick={setSelectedElement}
                onElementDrag={handleElementDrag}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedElement && (
        <div className="mt-3 text-xs text-center text-primary-700 bg-primary-50 rounded-lg py-2">
          선택됨: <strong>{selectedElement}</strong> — 드래그로 이동하세요
        </div>
      )}
    </Card>
  );
}