'use client';
import { useState, useEffect } from 'react';
import { ColorPicker } from '@/components/ColorPicker';
import { Button } from '@/components/ui/Button';
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
  ChevronDown,
  ChevronRight,
  Type,
  Image as ImageIcon,
  Palette,
} from 'lucide-react';

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#f5f5f5', '#0a0a0a',
  '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#d946ef', '#ec4899', '#f43f5e',
];

type ElementKey = 'headline' | 'body' | 'highlight' | 'label';

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

  const [openElement, setOpenElement] = useState<ElementKey | null>(
    (selectedElement as ElementKey) || 'headline'
  );
  const [openImage, setOpenImage] = useState(false);
  const [openBg, setOpenBg] = useState(false);

  useEffect(() => {
    if (selectedElement && ['headline', 'body', 'highlight', 'label'].includes(selectedElement)) {
      setOpenElement(selectedElement as ElementKey);
    }
  }, [selectedElement]);

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
      key === 'headline' ? 'headlineStyle'
      : key === 'body' ? 'bodyStyle'
      : key === 'highlight' ? 'highlightStyle'
      : 'labelStyle';
    onChange({ [field]: next } as any);
  };

  const resetOverride = (key: ElementKey) => {
    const field =
      key === 'headline' ? 'headlineStyle'
      : key === 'body' ? 'bodyStyle'
      : key === 'highlight' ? 'highlightStyle'
      : 'labelStyle';
    onChange({ [field]: undefined } as any);
  };

  const imgOv: ImageStyleOverride = slide.imageStyle || {};
  const setImgOv = (patch: Partial<ImageStyleOverride>) =>
    onChange({ imageStyle: { ...imgOv, ...patch } });
  const resetImgOv = () => onChange({ imageStyle: undefined });

  const hasAnyOverride =
    !!slide.headlineStyle ||
    !!slide.bodyStyle ||
    !!slide.highlightStyle ||
    !!slide.labelStyle ||
    !!slide.imageStyle;

  const resetAll = () => {
    if (!confirm('모든 스타일 조정을 초기화할까요?')) return;
    onChange({
      headlineStyle: undefined,
      bodyStyle: undefined,
      highlightStyle: undefined,
      labelStyle: undefined,
      imageStyle: undefined,
    });
  };

  // 요소별 기본값
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-ink-secondary flex items-center gap-1.5">
          <Type size={12} />
          스타일 편집
        </div>
        {hasAnyOverride && (
          <button
            onClick={resetAll}
            className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5"
          >
            <RotateCcw size={9} />
            전체 초기화
          </button>
        )}
      </div>

      {/* ═══ 헤드라인 ═══ */}
      <ElementSection
        title="헤드라인"
        elementKey="headline"
        override={getOverride('headline')}
        base={getBase('headline')}
        color={color}
        highlighted={selectedElement === 'headline'}
        open={openElement === 'headline'}
        onToggle={() => setOpenElement(openElement === 'headline' ? null : 'headline')}
        onUpdate={(patch) => setOverride('headline', patch)}
        onReset={() => resetOverride('headline')}
      />

      {/* ═══ 본문 ═══ */}
      {slide.body && (
        <ElementSection
          title="본문"
          elementKey="body"
          override={getOverride('body')}
          base={getBase('body')}
          color={color}
          highlighted={selectedElement === 'body'}
          open={openElement === 'body'}
          onToggle={() => setOpenElement(openElement === 'body' ? null : 'body')}
          onUpdate={(patch) => setOverride('body', patch)}
          onReset={() => resetOverride('body')}
        />
      )}

      {/* ═══ 강조 숫자 ═══ */}
      {slide.type === 'data' && slide.highlight && (
        <ElementSection
          title="강조 숫자"
          elementKey="highlight"
          override={getOverride('highlight')}
          base={getBase('highlight')}
          color={color}
          highlighted={selectedElement === 'highlight'}
          open={openElement === 'highlight'}
          onToggle={() =>
            setOpenElement(openElement === 'highlight' ? null : 'highlight')
          }
          onUpdate={(patch) => setOverride('highlight', patch)}
          onReset={() => resetOverride('highlight')}
        />
      )}

      {/* ═══ 라벨 ═══ */}
      {slide.label && (
        <ElementSection
          title="라벨"
          elementKey="label"
          override={getOverride('label')}
          base={getBase('label')}
          color={color}
          highlighted={selectedElement === 'label'}
          open={openElement === 'label'}
          onToggle={() => setOpenElement(openElement === 'label' ? null : 'label')}
          onUpdate={(patch) => setOverride('label', patch)}
          onReset={() => resetOverride('label')}
        />
      )}

      {/* ═══ 이미지 ═══ */}
      {slide.imageUrl && (
        <div className="border border-surface-border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenImage(!openImage)}
            className="w-full flex items-center gap-2 p-2.5 bg-surface-bg hover:bg-surface-hover transition"
          >
            {openImage ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <ImageIcon size={13} className="text-primary-600" />
            <span className="text-xs font-semibold">이미지 효과</span>
          </button>
          {openImage && (
            <div className="p-3 space-y-3">
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
              {hasAnyOverride && (
                <button
                  onClick={resetImgOv}
                  className="w-full text-[11px] text-red-500 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 flex items-center justify-center gap-1"
                >
                  <RotateCcw size={11} />
                  이미지 효과 초기화
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ 배경 색상 ═══ */}
      <div className="border border-surface-border rounded-lg overflow-hidden">
        <button
          onClick={() => setOpenBg(!openBg)}
          className="w-full flex items-center gap-2 p-2.5 bg-surface-bg hover:bg-surface-hover transition"
        >
          {openBg ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <Palette size={13} className="text-primary-600" />
          <span className="text-xs font-semibold">배경 / 강조 색상</span>
        </button>
        {openBg && (
          <div className="p-3 space-y-3">
            <div className="text-[10px] text-ink-muted">
              이 슬라이드만 색상을 다르게 지정합니다
            </div>
            <div>
              <div className="text-xs font-medium text-ink-secondary mb-1">
                배경색
              </div>
              <ColorPicker
                label=""
                value={color.background}
                onChange={(v) => {
                  // 슬라이드에 배경 override 저장 (headlineStyle.background 아님)
                  onChange({
                    // 임시로 이미지 없을 때 배경색 오버라이드
                    // 실제로는 슬라이드에 별도 필드가 필요하지만 지금은 스킵
                  });
                }}
                presets={COLOR_PRESETS}
              />
            </div>
            <div className="p-2 rounded-lg bg-primary-50 text-[10px] text-primary-700">
              💡 전체 색상은 상단 색상 도트로 변경하세요
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 요소 섹션 (아코디언)
// ─────────────────────────────────────────────
function ElementSection({
  title,
  elementKey,
  override,
  base,
  color,
  highlighted,
  open,
  onToggle,
  onUpdate,
  onReset,
}: {
  title: string;
  elementKey: ElementKey;
  override: TextStyleOverride;
  base: { size: number; weight: number; color: string };
  color: any;
  highlighted: boolean;
  open: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<TextStyleOverride>) => void;
  onReset: () => void;
}) {
  const currentSize = override.fontSize ?? base.size;
  const currentWeight = override.weight ?? base.weight;
  const currentColor = override.color ?? base.color;
  const currentAlign = override.align ?? 'left';
  const hasOverride = Object.keys(override).length > 0;

  return (
    <div
      className={`border rounded-lg overflow-hidden transition ${
        highlighted ? 'border-primary-500 bg-primary-50/40' : 'border-surface-border'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2.5 hover:bg-surface-hover/50 transition"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span className="text-xs font-medium flex-1 text-left">{title}</span>
        {hasOverride && (
          <span className="text-[9px] text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded">
            수정됨
          </span>
        )}
      </button>

      {open && (
        <div className="p-3 pt-0 space-y-3 border-t border-surface-border">
          {/* 크기 */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-ink-secondary">크기</span>
              <span className="text-ink-muted">{currentSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={240}
              step={2}
              value={currentSize}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 두께 */}
          <div>
            <div className="text-[11px] font-medium text-ink-secondary mb-1">
              두께
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[400, 600, 700, 800, 900].map((w) => (
                <button
                  key={w}
                  onClick={() => onUpdate({ weight: w })}
                  className={`py-1 text-[10px] rounded border transition ${
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
            <div className="text-[11px] font-medium text-ink-secondary mb-1">
              정렬
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => onUpdate({ align: a })}
                  className={`py-1.5 flex items-center justify-center rounded border transition ${
                    currentAlign === a
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-surface-border'
                  }`}
                >
                  {a === 'left' ? (
                    <AlignLeft size={13} />
                  ) : a === 'center' ? (
                    <AlignCenter size={13} />
                  ) : (
                    <AlignRight size={13} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 스타일 (이탤릭/밑줄) */}
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => onUpdate({ italic: !override.italic })}
              className={`py-1.5 rounded border transition flex items-center justify-center gap-1 text-[11px] ${
                override.italic
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-surface-border'
              }`}
            >
              <Italic size={12} />
              이탤릭
            </button>
            <button
              onClick={() => onUpdate({ underline: !override.underline })}
              className={`py-1.5 rounded border transition flex items-center justify-center gap-1 text-[11px] ${
                override.underline
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-surface-border'
              }`}
            >
              <Underline size={12} />
              밑줄
            </button>
          </div>

          {/* 색상 */}
          <ColorPicker
            label="색상"
            value={currentColor}
            onChange={(v) => onUpdate({ color: v })}
            presets={COLOR_PRESETS}
          />

          {/* 자간 */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
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
              onChange={(e) => onUpdate({ letterSpacing: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 줄 간격 */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
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
              onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 배경 박스 */}
          <div className="pt-2 border-t">
            <label className="flex items-center gap-2 text-[11px] cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={!!override.background}
                onChange={(e) => {
                  if (e.target.checked) {
                    onUpdate({
                      background: color.accentSoft || '#e5e5e5',
                      backgroundOpacity: 1,
                      padding: 16,
                      borderRadius: 8,
                    });
                  } else {
                    onUpdate({
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
              <div className="pl-1 space-y-2">
                <ColorPicker
                  label="박스 색상"
                  value={override.background}
                  onChange={(v) => onUpdate({ background: v })}
                  presets={COLOR_PRESETS}
                />
                <Slider
                  label="투명도"
                  value={Math.round((override.backgroundOpacity ?? 1) * 100)}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onUpdate={(v) => onUpdate({ backgroundOpacity: v / 100 })}
                />
                <Slider
                  label="패딩"
                  value={override.padding ?? 16}
                  min={0}
                  max={60}
                  step={2}
                  unit="px"
                  onUpdate={(v) => onUpdate({ padding: v })}
                />
                <Slider
                  label="둥글기"
                  value={override.borderRadius ?? 8}
                  min={0}
                  max={40}
                  step={2}
                  unit="px"
                  onUpdate={(v) => onUpdate({ borderRadius: v })}
                />
              </div>
            )}
          </div>

          {hasOverride && (
            <button
              onClick={onReset}
              className="w-full text-[10px] text-red-500 hover:text-red-700 py-1.5 rounded hover:bg-red-50 flex items-center justify-center gap-1"
            >
              <RotateCcw size={10} />
              이 요소 초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
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
      <div className="flex items-center justify-between text-[11px] mb-1">
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