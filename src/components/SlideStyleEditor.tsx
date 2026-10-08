'use client';
import { ColorPicker } from '@/components/ColorPicker';
import type {
  Slide,
  Preset,
  TextStyleOverride,
  ImageStyleOverride,
} from '@/lib/types';
import {
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Italic,
  Underline,
  Type,
  Image as ImageIcon,
  MousePointerClick,
} from 'lucide-react';

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

type ElementKey = 'headline' | 'body' | 'highlight' | 'label';

const ELEMENT_LABELS: Record<ElementKey, string> = {
  headline: '헤드라인',
  body: '본문',
  highlight: '강조 숫자',
  label: '라벨',
};

export function SlideStyleEditor({
  slide,
  preset,
  colorId,
  onChange,
  selectedElement,
}: {
  slide: Slide;
  preset: Preset;
  colorId?: string;
  onChange: (patch: Partial<Slide>) => void;
  selectedElement?: string | null;
}) {
  const baseColor =
    preset.colorVariants.find((c) => c.id === colorId) || preset.colorVariants[0];
  const color = baseColor;

  // ─────────────────────────────────
  // 어떤 요소가 선택되었는지 판단
  // ─────────────────────────────────
  const activeElement: ElementKey | null =
    selectedElement && ['headline', 'body', 'highlight', 'label'].includes(selectedElement)
      ? (selectedElement as ElementKey)
      : null;

  const isImageSelected = selectedElement === 'image';

  // ─────────────────────────────────
  // 오버라이드 헬퍼
  // ─────────────────────────────────
  const getOverride = (key: ElementKey): TextStyleOverride => {
    if (key === 'headline') return slide.headlineStyle || {};
    if (key === 'body') return slide.bodyStyle || {};
    if (key === 'highlight') return slide.highlightStyle || {};
    return slide.labelStyle || {};
  };

  const setOverride = (key: ElementKey, patch: Partial<TextStyleOverride>) => {
    const current = getOverride(key);
    const next = { ...current, ...patch };
    const field =
      key === 'headline'
        ? 'headlineStyle'
        : key === 'body'
        ? 'bodyStyle'
        : key === 'highlight'
        ? 'highlightStyle'
        : 'labelStyle';
    onChange({ [field]: next } as any);
  };

  const resetOverride = (key: ElementKey) => {
    const field =
      key === 'headline'
        ? 'headlineStyle'
        : key === 'body'
        ? 'bodyStyle'
        : key === 'highlight'
        ? 'highlightStyle'
        : 'labelStyle';
    onChange({ [field]: undefined } as any);
  };

  const imgOv: ImageStyleOverride = slide.imageStyle || {};
  const setImgOv = (patch: Partial<ImageStyleOverride>) =>
    onChange({ imageStyle: { ...imgOv, ...patch } });
  const resetImgOv = () => onChange({ imageStyle: undefined });

  // ─────────────────────────────────
  // 요소별 기본값
  // ─────────────────────────────────
  const getBase = (key: ElementKey) => {
    if (key === 'headline')
      return {
        size: preset.typography.headlineSize,
        weight: preset.typography.headlineWeight,
        color: color.text,
      };
    if (key === 'body')
      return {
        size: preset.typography.bodySize,
        weight: 400,
        color: color.textMuted,
      };
    if (key === 'highlight')
      return {
        size: Math.min(220, preset.typography.headlineSize * 2),
        weight: 900,
        color: color.accent,
      };
    return { size: 22, weight: 700, color: color.accent };
  };

  // ─────────────────────────────────
  // 아무것도 선택 안 됨 → 안내
  // ─────────────────────────────────
  if (!activeElement && !isImageSelected) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
          <MousePointerClick size={24} />
        </div>
        <div className="text-sm font-semibold text-ink-primary mb-1">
          요소를 선택하세요
        </div>
        <div className="text-xs text-ink-muted leading-relaxed">
          미리보기에서 텍스트나 이미지를 클릭하면
          <br />
          해당 요소만 편집할 수 있습니다
        </div>
      </div>
    );
  }

  // ─────────────────────────────────
  // 이미지 선택됨
  // ─────────────────────────────────
  if (isImageSelected && slide.imageUrl) {
    const hasOverride = Object.keys(imgOv).length > 0;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
          <ImageIcon size={14} className="text-primary-600" />
          <span className="text-sm font-bold">이미지 설정</span>
        </div>

        <Slider
          label="밝기"
          value={imgOv.brightness ?? 100}
          min={0}
          max={200}
          step={5}
          unit="%"
          onUpdate={(v) => setImgOv({ brightness: v })}
        />
        <Slider
          label="대비"
          value={imgOv.contrast ?? 100}
          min={0}
          max={200}
          step={5}
          unit="%"
          onUpdate={(v) => setImgOv({ contrast: v })}
        />
        <Slider
          label="채도"
          value={imgOv.saturation ?? 100}
          min={0}
          max={200}
          step={5}
          unit="%"
          onUpdate={(v) => setImgOv({ saturation: v })}
        />
        <Slider
          label="흐림"
          value={imgOv.blur ?? 0}
          min={0}
          max={20}
          step={1}
          unit="px"
          onUpdate={(v) => setImgOv({ blur: v })}
        />
        <Slider
          label="회색조"
          value={imgOv.grayscale ?? 0}
          min={0}
          max={100}
          step={5}
          unit="%"
          onUpdate={(v) => setImgOv({ grayscale: v })}
        />
        <Slider
          label="세피아"
          value={imgOv.sepia ?? 0}
          min={0}
          max={100}
          step={5}
          unit="%"
          onUpdate={(v) => setImgOv({ sepia: v })}
        />
        <Slider
          label="색조"
          value={imgOv.hueRotate ?? 0}
          min={0}
          max={360}
          step={10}
          unit="°"
          onUpdate={(v) => setImgOv({ hueRotate: v })}
        />
        <Slider
          label="투명도"
          value={Math.round((imgOv.opacity ?? 1) * 100)}
          min={0}
          max={100}
          step={5}
          unit="%"
          onUpdate={(v) => setImgOv({ opacity: v / 100 })}
        />

        <div className="pt-3 border-t border-surface-border">
          <ColorPicker
            label="오버레이 색상"
            value={imgOv.overlayColor || '#000000'}
            onChange={(v) => setImgOv({ overlayColor: v })}
            presets={COLOR_PRESETS}
          />
          {imgOv.overlayColor && (
            <div className="mt-2">
              <Slider
                label="오버레이 강도"
                value={Math.round((imgOv.overlayOpacity ?? 0.4) * 100)}
                min={0}
                max={100}
                step={5}
                unit="%"
                onUpdate={(v) => setImgOv({ overlayOpacity: v / 100 })}
              />
            </div>
          )}
        </div>

        {hasOverride && (
          <button
            onClick={resetImgOv}
            className="w-full text-xs text-red-500 hover:text-red-700 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center gap-1"
          >
            <RotateCcw size={12} />
            이미지 효과 초기화
          </button>
        )}
      </div>
    );
  }

  // ─────────────────────────────────
  // 텍스트 요소 선택됨
  // ─────────────────────────────────
  if (activeElement) {
    const override = getOverride(activeElement);
    const base = getBase(activeElement);
    const currentSize = override.fontSize ?? base.size;
    const currentWeight = override.weight ?? base.weight;
    const currentColor = override.color ?? base.color;
    const currentAlign = override.align ?? 'left';
    const hasOverride = Object.keys(override).length > 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
          <Type size={14} className="text-primary-600" />
          <span className="text-sm font-bold">
            {ELEMENT_LABELS[activeElement]} 스타일
          </span>
        </div>

        {/* 크기 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-ink-secondary">크기</span>
            <span className="text-ink-muted">{currentSize}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={240}
            step={2}
            value={currentSize}
            onChange={(e) => setOverride(activeElement, { fontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* 두께 */}
        <div>
          <div className="text-sm font-medium text-ink-secondary mb-1.5">두께</div>
          <div className="grid grid-cols-5 gap-1">
            {[400, 600, 700, 800, 900].map((w) => (
              <button
                key={w}
                onClick={() => setOverride(activeElement, { weight: w })}
                className={`py-1.5 text-xs rounded border transition ${
                  currentWeight === w
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                    : 'border-surface-border'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* 정렬 */}
        <div>
          <div className="text-sm font-medium text-ink-secondary mb-1.5">정렬</div>
          <div className="grid grid-cols-3 gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setOverride(activeElement, { align: a })}
                className={`py-2 flex items-center justify-center rounded border transition ${
                  currentAlign === a
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-border'
                }`}
              >
                {a === 'left' ? (
                  <AlignLeft size={14} />
                ) : a === 'center' ? (
                  <AlignCenter size={14} />
                ) : (
                  <AlignRight size={14} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 이탤릭/밑줄 */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setOverride(activeElement, { italic: !override.italic })}
            className={`py-2 rounded border transition flex items-center justify-center gap-1.5 text-sm ${
              override.italic
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-surface-border'
            }`}
          >
            <Italic size={14} />
            이탤릭
          </button>
          <button
            onClick={() => setOverride(activeElement, { underline: !override.underline })}
            className={`py-2 rounded border transition flex items-center justify-center gap-1.5 text-sm ${
              override.underline
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-surface-border'
            }`}
          >
            <Underline size={14} />
            밑줄
          </button>
        </div>

        {/* 색상 */}
        <ColorPicker
          label="색상"
          value={currentColor}
          onChange={(v) => setOverride(activeElement, { color: v })}
          presets={COLOR_PRESETS}
        />

        {/* 자간 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-ink-secondary">자간</span>
            <span className="text-ink-muted">
              {(override.letterSpacing ?? 0).toFixed(2)}em
            </span>
          </div>
          <input
            type="range"
            min={-0.1}
            max={0.3}
            step={0.01}
            value={override.letterSpacing ?? 0}
            onChange={(e) =>
              setOverride(activeElement, { letterSpacing: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        {/* 줄 간격 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-ink-secondary">줄 간격</span>
            <span className="text-ink-muted">
              {(override.lineHeight ?? 1.2).toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.8}
            max={2.5}
            step={0.05}
            value={override.lineHeight ?? 1.2}
            onChange={(e) =>
              setOverride(activeElement, { lineHeight: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        {/* 배경 박스 */}
        <div className="pt-3 border-t border-surface-border">
          <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={!!override.background}
              onChange={(e) => {
                if (e.target.checked) {
                  setOverride(activeElement, {
                    background: color.accentSoft || '#e5e5e5',
                    backgroundOpacity: 1,
                    padding: 16,
                    borderRadius: 8,
                  });
                } else {
                  setOverride(activeElement, {
                    background: undefined,
                    backgroundOpacity: undefined,
                    padding: undefined,
                    borderRadius: undefined,
                  });
                }
              }}
            />
            <span className="font-medium">배경 박스</span>
          </label>
          {override.background && (
            <div className="pl-1 space-y-3">
              <ColorPicker
                label="박스 색상"
                value={override.background}
                onChange={(v) => setOverride(activeElement, { background: v })}
                presets={COLOR_PRESETS}
              />
              <Slider
                label="투명도"
                value={Math.round((override.backgroundOpacity ?? 1) * 100)}
                min={0}
                max={100}
                step={5}
                unit="%"
                onUpdate={(v) =>
                  setOverride(activeElement, { backgroundOpacity: v / 100 })
                }
              />
              <Slider
                label="패딩"
                value={override.padding ?? 16}
                min={0}
                max={60}
                step={2}
                unit="px"
                onUpdate={(v) => setOverride(activeElement, { padding: v })}
              />
              <Slider
                label="둥글기"
                value={override.borderRadius ?? 8}
                min={0}
                max={40}
                step={2}
                unit="px"
                onUpdate={(v) => setOverride(activeElement, { borderRadius: v })}
              />
            </div>
          )}
        </div>

        {hasOverride && (
          <button
            onClick={() => resetOverride(activeElement)}
            className="w-full text-xs text-red-500 hover:text-red-700 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center gap-1"
          >
            <RotateCcw size={12} />
            이 요소 초기화
          </button>
        )}
      </div>
    );
  }

  return null;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onUpdate,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onUpdate: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-medium text-ink-secondary">{label}</span>
        <span className="text-ink-muted">
          {value}
          {unit || ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onUpdate(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}