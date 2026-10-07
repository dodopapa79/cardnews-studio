'use client';
import { ColorPicker } from '@/components/ColorPicker';
import { Button } from '@/components/ui/Button';
import type { Slide, Preset, SlideTextOverride } from '@/lib/types';
import { RotateCcw, Type, Palette } from 'lucide-react';

/** 자주 쓰는 색상 팔레트 */
const COLOR_PRESETS = [
  '#ffffff',
  '#000000',
  '#f5f5f5',
  '#0a0a0a',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
];

export function SlideStyleEditor({
  slide,
  preset,
  onChange,
}: {
  slide: Slide;
  preset: Preset;
  onChange: (patch: Partial<Slide>) => void;
}) {
  const ov: SlideTextOverride = slide.textOverride || {};
  const color =
    preset.colorVariants.find((c) => c.id === undefined) || preset.colorVariants[0];

  const update = (patch: Partial<SlideTextOverride>) => {
    onChange({ textOverride: { ...ov, ...patch } });
  };

  const reset = () => {
    onChange({ textOverride: undefined });
  };

  const hasOverride = !!slide.textOverride && Object.keys(slide.textOverride).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-ink-secondary flex items-center gap-1.5">
          <Type size={12} />
          텍스트 스타일
        </div>
        {hasOverride && (
          <button
            onClick={reset}
            className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5"
          >
            <RotateCcw size={9} />
            전체 초기화
          </button>
        )}
      </div>

      {/* 헤드라인 */}
      <div className="space-y-2 p-3 rounded-lg bg-surface-bg">
        <div className="text-xs font-semibold text-ink-primary">헤드라인</div>
        <ColorPicker
          label="색상"
          value={ov.headlineColor || color.text}
          onChange={(v) => update({ headlineColor: v })}
          onReset={ov.headlineColor ? () => {
            const next = { ...ov };
            delete next.headlineColor;
            onChange({ textOverride: next });
          } : undefined}
          presets={COLOR_PRESETS}
        />
        <label className="block">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-ink-secondary">크기</span>
            <span className="text-ink-muted">
              {ov.headlineSize ?? preset.typography.headlineSize}px
            </span>
          </div>
          <input
            type="range"
            min={40}
            max={160}
            step={2}
            value={ov.headlineSize ?? preset.typography.headlineSize}
            onChange={(e) => update({ headlineSize: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="block">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-ink-secondary">두께</span>
            <span className="text-ink-muted">
              {ov.headlineWeight ?? preset.typography.headlineWeight}
            </span>
          </div>
          <input
            type="range"
            min={400}
            max={900}
            step={100}
            value={ov.headlineWeight ?? preset.typography.headlineWeight}
            onChange={(e) => update({ headlineWeight: Number(e.target.value) })}
            className="w-full"
          />
        </label>
      </div>

      {/* 본문 */}
      {slide.body && (
        <div className="space-y-2 p-3 rounded-lg bg-surface-bg">
          <div className="text-xs font-semibold text-ink-primary">본문</div>
          <ColorPicker
            label="색상"
            value={ov.bodyColor || color.textMuted}
            onChange={(v) => update({ bodyColor: v })}
            onReset={ov.bodyColor ? () => {
              const next = { ...ov };
              delete next.bodyColor;
              onChange({ textOverride: next });
            } : undefined}
            presets={COLOR_PRESETS}
          />
          <label className="block">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-ink-secondary">크기</span>
              <span className="text-ink-muted">
                {ov.bodySize ?? preset.typography.bodySize}px
              </span>
            </div>
            <input
              type="range"
              min={16}
              max={60}
              step={1}
              value={ov.bodySize ?? preset.typography.bodySize}
              onChange={(e) => update({ bodySize: Number(e.target.value) })}
              className="w-full"
            />
          </label>
        </div>
      )}

      {/* 강조 숫자 */}
      {slide.type === 'data' && slide.highlight && (
        <div className="space-y-2 p-3 rounded-lg bg-surface-bg">
          <div className="text-xs font-semibold text-ink-primary">강조 숫자</div>
          <ColorPicker
            label="색상"
            value={ov.highlightColor || color.accent}
            onChange={(v) => update({ highlightColor: v })}
            onReset={ov.highlightColor ? () => {
              const next = { ...ov };
              delete next.highlightColor;
              onChange({ textOverride: next });
            } : undefined}
            presets={COLOR_PRESETS}
          />
        </div>
      )}

      {/* 자동 축소 */}
      <label className="flex items-center gap-2 text-xs p-3 rounded-lg bg-primary-50 cursor-pointer">
        <input
          type="checkbox"
          checked={ov.autoShrink !== false}
          onChange={(e) => update({ autoShrink: e.target.checked })}
        />
        <div>
          <div className="font-semibold text-primary-800">텍스트 자동 축소</div>
          <div className="text-[10px] text-primary-700 mt-0.5">
            텍스트가 카드 밖으로 나가지 않도록 자동으로 크기 조정
          </div>
        </div>
      </label>

      {/* 배경/강조 색상 오버라이드 (고급) */}
      <details className="p-3 rounded-lg bg-surface-bg">
        <summary className="text-xs font-semibold text-ink-primary cursor-pointer flex items-center gap-1.5">
          <Palette size={12} />
          배경/강조 색상 (고급)
        </summary>
        <div className="space-y-2 mt-3">
          <ColorPicker
            label="배경색"
            value={ov.backgroundOverride || color.background}
            onChange={(v) => update({ backgroundOverride: v })}
            onReset={ov.backgroundOverride ? () => {
              const next = { ...ov };
              delete next.backgroundOverride;
              onChange({ textOverride: next });
            } : undefined}
            presets={COLOR_PRESETS}
          />
          <ColorPicker
            label="강조색"
            value={ov.accentOverride || color.accent}
            onChange={(v) => update({ accentOverride: v })}
            onReset={ov.accentOverride ? () => {
              const next = { ...ov };
              delete next.accentOverride;
              onChange({ textOverride: next });
            } : undefined}
            presets={COLOR_PRESETS}
          />
        </div>
      </details>
    </div>
  );
}