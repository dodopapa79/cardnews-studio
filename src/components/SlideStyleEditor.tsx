'use client';
import { useState } from 'react';
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
  Type,
  Image as ImageIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  ChevronRight,
  Sparkles,
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

export function SlideStyleEditor({
  slide,
  preset,
  onChange,
  selectedElement,
}: {
  slide: Slide;
  preset: Preset;
  onChange: (patch: Partial<Slide>) => void;
  selectedElement?: string | null;
}) {
  const color = preset.colorVariants[0];

  // 아코디언 상태
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    text: true,
    image: false,
    color: false,
  });

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ─────────────────────────────────
  // 텍스트 오버라이드 헬퍼
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
  // 이미지 오버라이드
  // ─────────────────────────────────
  const imgOv: ImageStyleOverride = slide.imageStyle || {};
  const setImgOv = (patch: Partial<ImageStyleOverride>) => {
    onChange({ imageStyle: { ...imgOv, ...patch } });
  };
  const resetImgOv = () => onChange({ imageStyle: undefined });

  // ─────────────────────────────────
  // 전체 초기화
  // ─────────────────────────────────
  const hasAnyOverride =
    !!slide.headlineStyle ||
    !!slide.bodyStyle ||
    !!slide.highlightStyle ||
    !!slide.labelStyle ||
    !!slide.imageStyle;

  const resetAll = () => {
    if (!confirm('이 슬라이드의 모든 스타일 조정을 초기화할까요?')) return;
    onChange({
      headlineStyle: undefined,
      bodyStyle: undefined,
      highlightStyle: undefined,
      labelStyle: undefined,
      imageStyle: undefined,
    });
  };

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-ink-secondary flex items-center gap-1.5">
          <Sparkles size={12} />
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

      {/* 요소 선택 안내 */}
      {!selectedElement && (
        <div className="text-[10px] text-primary-700 bg-primary-50 rounded-lg p-2 text-center">
          💡 미리보기에서 텍스트를 클릭하면 해당 요소를 편집할 수 있습니다
        </div>
      )}

      {/* ═══════════════════════════════ */}
      {/* 텍스트 섹션 */}
      {/* ═══════════════════════════════ */}
      <div className="border border-surface-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggle('text')}
          className="w-full flex items-center gap-2 p-3 bg-surface-bg hover:bg-surface-hover transition"
        >
          {openSections.text ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Type size={14} className="text-primary-600" />
          <span className="text-xs font-semibold">텍스트</span>
        </button>

        {openSections.text && (
          <div className="p-3 space-y-3">
            {/* 헤드라인 */}
            <TextStyleSection
              title="헤드라인"
              elementKey="headline"
              override={getOverride('headline')}
              base={getBase('headline')}
              highlighted={selectedElement === 'headline'}
              onUpdate={(patch) => setOverride('headline', patch)}
              onReset={() => resetOverride('headline')}
            />

            {/* 본문 */}
            {slide.body && (
              <TextStyleSection
                title="본문"
                elementKey="body"
                override={getOverride('body')}
                base={getBase('body')}
                highlighted={selectedElement === 'body'}
                onUpdate={(patch) => setOverride('body', patch)}
                onReset={() => resetOverride('body')}
              />
            )}

            {/* 강조 숫자 */}
            {slide.type === 'data' && slide.highlight && (
              <TextStyleSection
                title="강조 숫자"
                elementKey="highlight"
                override={getOverride('highlight')}
                base={getBase('highlight')}
                highlighted={selectedElement === 'highlight'}
                onUpdate={(patch) => setOverride('highlight', patch)}
                onReset={() => resetOverride('highlight')}
              />
            )}

            {/* 라벨 */}
            {slide.label && (
              <TextStyleSection
                title="라벨"
                elementKey="label"
                override={getOverride('label')}
                base={getBase('label')}
                highlighted={selectedElement === 'label'}
                onUpdate={(patch) => setOverride('label', patch)}
                onReset={() => resetOverride('label')}
              />
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════ */}
      {/* 이미지 섹션 */}
      {/* ═══════════════════════════════ */}
      {slide.imageUrl && (
        <div className="border border-surface-border rounded-lg overflow-hidden">
          <button
            onClick={() => toggle('image')}
            className="w-full flex items-center gap-2 p-3 bg-surface-bg hover:bg-surface-hover transition"
          >
            {openSections.image ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <ImageIcon size={14} className="text-primary-600" />
            <span className="text-xs font-semibold">이미지 효과</span>
          </button>

          {openSections.image && (
            <div className="p-3 space-y-3">
              {/* 밝기 */}
              <SliderRow
                label="밝기"
                value={imgOv.brightness ?? 100}
                min={0}
                max={200}
                step={5}
                unit="%"
                onUpdate={(v) => setImgOv({ brightness: v })}
                onReset={
                  imgOv.brightness !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.brightness;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 대비 */}
              <SliderRow
                label="대비"
                value={imgOv.contrast ?? 100}
                min={0}
                max={200}
                step={5}
                unit="%"
                onUpdate={(v) => setImgOv({ contrast: v })}
                onReset={
                  imgOv.contrast !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.contrast;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 채도 */}
              <SliderRow
                label="채도"
                value={imgOv.saturation ?? 100}
                min={0}
                max={200}
                step={5}
                unit="%"
                onUpdate={(v) => setImgOv({ saturation: v })}
                onReset={
                  imgOv.saturation !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.saturation;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 흐림 */}
              <SliderRow
                label="흐림"
                value={imgOv.blur ?? 0}
                min={0}
                max={20}
                step={1}
                unit="px"
                onUpdate={(v) => setImgOv({ blur: v })}
                onReset={
                  imgOv.blur !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.blur;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 회색조 */}
              <SliderRow
                label="회색조"
                value={imgOv.grayscale ?? 0}
                min={0}
                max={100}
                step={5}
                unit="%"
                onUpdate={(v) => setImgOv({ grayscale: v })}
                onReset={
                  imgOv.grayscale !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.grayscale;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 세피아 */}
              <SliderRow
                label="세피아"
                value={imgOv.sepia ?? 0}
                min={0}
                max={100}
                step={5}
                unit="%"
                onUpdate={(v) => setImgOv({ sepia: v })}
                onReset={
                  imgOv.sepia !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.sepia;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 색조 회전 */}
              <SliderRow
                label="색조"
                value={imgOv.hueRotate ?? 0}
                min={0}
                max={360}
                step={10}
                unit="°"
                onUpdate={(v) => setImgOv({ hueRotate: v })}
                onReset={
                  imgOv.hueRotate !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.hueRotate;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 투명도 */}
              <SliderRow
                label="투명도"
                value={Math.round((imgOv.opacity ?? 1) * 100)}
                min={0}
                max={100}
                step={5}
                unit="%"
                onUpdate={(v) => setImgOv({ opacity: v / 100 })}
                onReset={
                  imgOv.opacity !== undefined
                    ? () => {
                        const n = { ...imgOv };
                        delete n.opacity;
                        onChange({ imageStyle: n });
                      }
                    : undefined
                }
              />

              {/* 오버레이 색상 */}
              <div className="pt-2 border-t">
                <ColorPicker
                  label="오버레이 색상"
                  value={imgOv.overlayColor || '#000000'}
                  onChange={(v) => setImgOv({ overlayColor: v })}
                  onReset={
                    imgOv.overlayColor
                      ? () => {
                          const n = { ...imgOv };
                          delete n.overlayColor;
                          delete n.overlayOpacity;
                          onChange({ imageStyle: n });
                        }
                      : undefined
                  }
                  presets={COLOR_PRESETS}
                />
                {imgOv.overlayColor && (
                  <div className="mt-2">
                    <SliderRow
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

              {/* 그라데이션 마스크 */}
              <div className="pt-2 border-t">
                <label className="flex items-center gap-2 text-xs mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={imgOv.gradientMask?.enabled || false}
                    onChange={(e) =>
                      setImgOv({
                        gradientMask: {
                          enabled: e.target.checked,
                          direction: imgOv.gradientMask?.direction || 'bottom',
                          start: imgOv.gradientMask?.start ?? 0,
                          end: imgOv.gradientMask?.end ?? 100,
                        },
                      })
                    }
                  />
                  <span className="font-semibold">그라데이션 마스크</span>
                </label>

                {imgOv.gradientMask?.enabled && (
                  <div className="space-y-2 pl-4">
                    <div className="grid grid-cols-4 gap-1">
                      {(['top', 'bottom', 'left', 'right'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setImgOv({
                              gradientMask: {
                                ...imgOv.gradientMask!,
                                direction: d,
                              },
                            })
                          }
                          className={`py-1.5 text-[10px] rounded border transition ${
                            imgOv.gradientMask?.direction === d
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-surface-border'
                          }`}
                        >
                          {d === 'top'
                            ? '위'
                            : d === 'bottom'
                            ? '아래'
                            : d === 'left'
                            ? '좌'
                            : '우'}
                        </button>
                      ))}
                    </div>
                    <SliderRow
                      label="시작"
                      value={imgOv.gradientMask.start}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                      onUpdate={(v) =>
                        setImgOv({
                          gradientMask: { ...imgOv.gradientMask!, start: v },
                        })
                      }
                    />
                    <SliderRow
                      label="끝"
                      value={imgOv.gradientMask.end}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                      onUpdate={(v) =>
                        setImgOv({
                          gradientMask: { ...imgOv.gradientMask!, end: v },
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* 이미지 전체 초기화 */}
              <button
                onClick={resetImgOv}
                className="w-full text-[11px] text-red-500 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 flex items-center justify-center gap-1"
              >
                <RotateCcw size={11} />
                이미지 효과 초기화
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════ */}
      {/* 배경/강조 색상 */}
      {/* ═══════════════════════════════ */}
      <div className="border border-surface-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggle('color')}
          className="w-full flex items-center gap-2 p-3 bg-surface-bg hover:bg-surface-hover transition"
        >
          {openSections.color ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Palette size={14} className="text-primary-600" />
          <span className="text-xs font-semibold">배경 / 강조 색상</span>
        </button>

        {openSections.color && (
          <div className="p-3 space-y-3">
            <div className="text-[10px] text-ink-muted">
              이 슬라이드만 색상을 다르게 지정할 수 있습니다
            </div>

            <ColorPicker
              label="배경색"
              value={slide.headlineStyle?.background || color.background}
              onChange={(v) => {
                setOverride('headline', { background: slide.headlineStyle?.background || v });
                // 실제로는 slide 레벨 backgroundOverride가 필요하지만, 텍스트 배경으로만 사용
              }}
              presets={COLOR_PRESETS}
            />

            <div className="p-2 rounded-lg bg-primary-50 text-[10px] text-primary-700">
              💡 프리셋 전체 색상은 상단 색상 도트로 변경하세요
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 텍스트 스타일 섹션
// ─────────────────────────────────────────────
function TextStyleSection({
  title,
  elementKey,
  override,
  base,
  highlighted,
  onUpdate,
  onReset,
}: {
  title: string;
  elementKey: ElementKey;
  override: TextStyleOverride;
  base: { size: number; weight: number; color: string };
  highlighted: boolean;
  onUpdate: (patch: Partial<TextStyleOverride>) => void;
  onReset: () => void;
}) {
  const [expanded, setExpanded] = useState(highlighted);

  const currentSize = override.fontSize ?? base.size;
  const currentWeight = override.weight ?? base.weight;
  const currentColor = override.color ?? base.color;
  const currentAlign = override.align ?? 'left';

  const hasOverride = Object.keys(override).length > 0;

  return (
    <div
      className={`rounded-lg border transition ${
        highlighted ? 'border-primary-500 bg-primary-50/40' : 'border-surface-border'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-2.5 hover:bg-surface-hover/50 rounded-lg transition"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="text-xs font-medium flex-1 text-left">{title}</span>
        {hasOverride && (
          <span className="text-[9px] text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded">
            수정됨
          </span>
        )}
      </button>

      {expanded && (
        <div className="p-3 pt-0 space-y-3">
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
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-ink-secondary">두께</span>
              <span className="text-ink-muted">{currentWeight}</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                <button
                  key={w}
                  onClick={() => onUpdate({ weight: w })}
                  className={`py-1 text-[10px] rounded border transition ${
                    currentWeight === w
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
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
            <div className="text-[11px] font-medium text-ink-secondary mb-1">정렬</div>
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
          <div>
            <div className="text-[11px] font-medium text-ink-secondary mb-1">스타일</div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onUpdate({ weight: 800 })}
                className="py-1.5 rounded border border-surface-border hover:bg-surface-hover flex items-center justify-center"
                title="볼드"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => onUpdate({ italic: !override.italic })}
                className={`py-1.5 rounded border transition flex items-center justify-center ${
                  override.italic
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-border'
                }`}
                title="이탤릭"
              >
                <Italic size={13} />
              </button>
              <button
                onClick={() => onUpdate({ underline: !override.underline })}
                className={`py-1.5 rounded border transition flex items-center justify-center ${
                  override.underline
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-border'
                }`}
                title="밑줄"
              >
                <Underline size={13} />
              </button>
            </div>
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
              onChange={(e) =>
                onUpdate({ letterSpacing: Number(e.target.value) })
              }
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
              onChange={(e) =>
                onUpdate({ lineHeight: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          {/* 배경 박스 */}
          <div className="pt-2 border-t">
            <label className="flex items-center gap-2 text-[11px] mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!override.background}
                onChange={(e) => {
                  if (e.target.checked) {
                    onUpdate({
                      background: color.accentSoft,
                      padding: 16,
                      borderRadius: 8,
                    });
                  } else {
                    onUpdate({
                      background: undefined,
                      padding: undefined,
                      borderRadius: undefined,
                    });
                  }
                }}
              />
              <span className="font-medium">배경 박스</span>
            </label>

            {override.background && (
              <div className="pl-4 space-y-2">
                <ColorPicker
                  label="박스 색상"
                  value={override.background}
                  onChange={(v) => onUpdate({ background: v })}
                  presets={COLOR_PRESETS}
                />
                <SliderRow
                  label="패딩"
                  value={override.padding ?? 16}
                  min={0}
                  max={60}
                  step={2}
                  unit="px"
                  onUpdate={(v) => onUpdate({ padding: v })}
                />
                <SliderRow
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

          {/* 초기화 */}
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

// ─────────────────────────────────────────────
// 슬라이더 행
// ─────────────────────────────────────────────
function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onUpdate,
  onReset,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onUpdate: (v: number) => void;
  onReset?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink-secondary">{label}</span>
          {onReset && (
            <button
              onClick={onReset}
              className="text-[9px] text-ink-muted hover:text-red-500"
              title="초기화"
            >
              <RotateCcw size={9} />
            </button>
          )}
        </div>
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