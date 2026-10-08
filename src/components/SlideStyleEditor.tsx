'use client';
import { ColorPicker } from '@/components/ColorPicker';
import type {
  Slide,
  TextElementConfig,
  BackgroundConfig,
  TextAlign,
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
  Palette,
  Eye,
  EyeOff,
} from 'lucide-react';

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#f5f5f5', '#0a0a0a',
  '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#d946ef', '#ec4899', '#f43f5e',
];

const BG_COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#faf7f2', '#fffbf5',
  '#0a0a0a', '#0f172a', '#3b0764', '#7f1d1d',
  '#052e16', '#7c3aed', '#2563eb', '#ec4899',
];

type TextKey = 'label' | 'headline' | 'body' | 'highlight' | 'footer';

const TEXT_LABELS: Record<TextKey, string> = {
  label: '라벨',
  headline: '헤드라인',
  body: '본문',
  highlight: '강조 숫자',
  footer: '푸터',
};

interface SlideStyleEditorProps {
  slide: Slide;
  selectedElement: string | null;
  onChangeText: (key: TextKey, patch: Partial<TextElementConfig>) => void;
  onChangeBackground: (patch: Partial<BackgroundConfig>) => void;
  onResetText: (key: TextKey) => void;
  onToggleVisible: (key: TextKey) => void;
}

export function SlideStyleEditor({
  slide,
  selectedElement,
  onChangeText,
  onChangeBackground,
  onResetText,
  onToggleVisible,
}: SlideStyleEditorProps) {
  // ─────────────────────────────────
  // 아무것도 선택 안 됨
  // ─────────────────────────────────
  if (!selectedElement || selectedElement === 'none') {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
          <MousePointerClick size={24} />
        </div>
        <div className="text-sm font-semibold text-ink-primary mb-1">
          요소를 선택하세요
        </div>
        <div className="text-xs text-ink-muted leading-relaxed">
          미리보기에서 배경, 텍스트, 이미지를 클릭하면
          <br />
          해당 요소만 편집할 수 있습니다
        </div>
      </div>
    );
  }

  // ─────────────────────────────────
  // 배경 선택
  // ─────────────────────────────────
  if (selectedElement === 'background') {
    const bg = slide.background;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
          <Palette size={14} className="text-primary-600" />
          <span className="text-sm font-bold">배경 설정</span>
        </div>

        {/* 배경 타입 */}
        <div>
          <div className="text-sm font-medium text-ink-secondary mb-1.5">
            배경 종류
          </div>
          <div className="grid grid-cols-4 gap-1">
            {(['color', 'gradient', 'pattern', 'image'] as const).map((t) => (
              <button
                key={t}
                onClick={() =>
                  onChangeBackground({
                    type: t,
                    // 이미지 타입으로 바꿀 때 imageUrl 없으면 유지
                  })
                }
                className={`py-2 text-xs rounded border transition ${
                  bg.type === t
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                    : 'border-surface-border'
                }`}
              >
                {t === 'color' ? '단색' : t === 'gradient' ? '그라데이션' : t === 'pattern' ? '패턴' : '이미지'}
              </button>
            ))}
          </div>
        </div>

        {/* 색상 */}
        {bg.type !== 'image' && (
          <ColorPicker
            label="배경색"
            value={bg.color}
            onChange={(v) => onChangeBackground({ color: v })}
            presets={BG_COLOR_PRESETS}
          />
        )}

        {/* 그라데이션 끝 색상 */}
        {(bg.type === 'gradient' || bg.pattern === 'mesh') && (
          <ColorPicker
            label="그라데이션 끝 색상"
            value={bg.colorEnd || '#000000'}
            onChange={(v) => onChangeBackground({ colorEnd: v })}
            presets={BG_COLOR_PRESETS}
          />
        )}

        {/* 패턴 */}
        {(bg.type === 'pattern' || bg.type === 'color' || bg.type === 'gradient') && (
          <div>
            <div className="text-sm font-medium text-ink-secondary mb-1.5">
              패턴
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(['none', 'grid', 'dots', 'noise', 'mesh'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onChangeBackground({ pattern: p })}
                  className={`py-1.5 text-[10px] rounded border transition ${
                    bg.pattern === p
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                      : 'border-surface-border'
                  }`}
                >
                  {p === 'none' ? '없음' : p === 'grid' ? '격자' : p === 'dots' ? '점' : p === 'noise' ? '노이즈' : '메시'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 이미지 옵션 */}
        {bg.type === 'image' && bg.imageUrl && (
          <>
            <div className="pt-3 border-t">
              <div className="text-sm font-semibold mb-2">이미지 효과</div>
              <SliderRow
                label="밝기"
                value={bg.imageBrightness ?? 100}
                min={0}
                max={200}
                step={5}
                unit="%"
                onUpdate={(v) => onChangeBackground({ imageBrightness: v })}
              />
              <SliderRow
                label="대비"
                value={bg.imageContrast ?? 100}
                min={0}
                max={200}
                step={5}
                unit="%"
                onUpdate={(v) => onChangeBackground({ imageContrast: v })}
              />
              <SliderRow
                label="채도"
                value={bg.imageSaturation ?? 100}
                min={0}
                max={200}
                step={5}
                unit="%"
                onUpdate={(v) => onChangeBackground({ imageSaturation: v })}
              />
              <SliderRow
                label="흐림"
                value={bg.imageBlur ?? 0}
                min={0}
                max={20}
                step={1}
                unit="px"
                onUpdate={(v) => onChangeBackground({ imageBlur: v })}
              />
              <SliderRow
                label="회색조"
                value={bg.imageGrayscale ?? 0}
                min={0}
                max={100}
                step={5}
                unit="%"
                onUpdate={(v) => onChangeBackground({ imageGrayscale: v })}
              />
              <SliderRow
                label="투명도"
                value={Math.round((bg.imageOpacity ?? 1) * 100)}
                min={0}
                max={100}
                step={5}
                unit="%"
                onUpdate={(v) => onChangeBackground({ imageOpacity: v / 100 })}
              />
            </div>

            <div className="pt-3 border-t">
              <ColorPicker
                label="오버레이 색상"
                value={bg.overlayColor || '#000000'}
                onChange={(v) => onChangeBackground({ overlayColor: v })}
                presets={COLOR_PRESETS}
              />
              {bg.overlayColor && (
                <div className="mt-2">
                  <SliderRow
                    label="오버레이 강도"
                    value={Math.round((bg.overlayOpacity ?? 0.4) * 100)}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                    onUpdate={(v) => onChangeBackground({ overlayOpacity: v / 100 })}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* 하단 페이드 */}
        <div className="pt-3 border-t space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!bg.bottomFade}
              onChange={(e) => onChangeBackground({ bottomFade: e.target.checked })}
            />
            하단 검정 페이드
          </label>
          {bg.type === 'image' && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!!bg.topImageFade}
                onChange={(e) => onChangeBackground({ topImageFade: e.target.checked })}
              />
              이미지 하단 배경색 페이드
            </label>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────
  // 텍스트 요소 선택
  // ─────────────────────────────────
  const textKey = selectedElement as TextKey;
  if (!['label', 'headline', 'body', 'highlight', 'footer'].includes(textKey)) {
    return null;
  }

  const cfg = slide.texts[textKey];
  if (!cfg) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-ink-muted">
          이 슬라이드에 {TEXT_LABELS[textKey]}가 없습니다
        </div>
      </div>
    );
  }

  const currentAlign = cfg.align ?? 'left';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
        <Type size={14} className="text-primary-600" />
        <span className="text-sm font-bold">{TEXT_LABELS[textKey]} 편집</span>
      </div>

      {/* 내용 */}
      <label className="block">
        <div className="text-sm font-medium text-ink-secondary mb-1.5">
          내용
        </div>
        <textarea
          value={cfg.content}
          onChange={(e) => onChangeText(textKey, { content: e.target.value })}
          rows={textKey === 'body' ? 3 : 2}
          className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </label>

      {/* 크기 */}
      <SliderRow
        label="크기"
        value={cfg.fontSize}
        min={12}
        max={240}
        step={2}
        unit="px"
        onUpdate={(v) => onChangeText(textKey, { fontSize: v })}
      />

      {/* 두께 */}
      <div>
        <div className="text-sm font-medium text-ink-secondary mb-1.5">
          두께
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[400, 600, 700, 800, 900].map((w) => (
            <button
              key={w}
              onClick={() => onChangeText(textKey, { fontWeight: w })}
              className={`py-1.5 text-xs rounded border transition ${
                cfg.fontWeight === w
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
        <div className="text-sm font-medium text-ink-secondary mb-1.5">
          정렬
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
            <button
              key={a}
              onClick={() => onChangeText(textKey, { align: a })}
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
          onClick={() => onChangeText(textKey, { italic: !cfg.italic })}
          className={`py-2 rounded border transition flex items-center justify-center gap-1.5 text-sm ${
            cfg.italic
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-surface-border'
          }`}
        >
          <Italic size={14} />
          이탤릭
        </button>
        <button
          onClick={() => onChangeText(textKey, { underline: !cfg.underline })}
          className={`py-2 rounded border transition flex items-center justify-center gap-1.5 text-sm ${
            cfg.underline
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
        value={cfg.color}
        onChange={(v) => onChangeText(textKey, { color: v })}
        presets={COLOR_PRESETS}
      />

      {/* 자간 */}
      <SliderRow
        label="자간"
        value={cfg.letterSpacing}
        min={-0.1}
        max={0.3}
        step={0.01}
        suffix="em"
        onUpdate={(v) => onChangeText(textKey, { letterSpacing: v })}
      />

      {/* 줄 간격 */}
      <SliderRow
        label="줄 간격"
        value={cfg.lineHeight}
        min={0.8}
        max={2.5}
        step={0.05}
        onUpdate={(v) => onChangeText(textKey, { lineHeight: v })}
      />

      {/* 배경 박스 */}
      <div className="pt-3 border-t">
        <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={!!cfg.background}
            onChange={(e) => {
              if (e.target.checked) {
                onChangeText(textKey, {
                  background: '#000000',
                  backgroundOpacity: 0.7,
                  padding: 16,
                  borderRadius: 8,
                });
              } else {
                onChangeText(textKey, {
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
        {cfg.background && (
          <div className="pl-1 space-y-3">
            <ColorPicker
              label="박스 색상"
              value={cfg.background}
              onChange={(v) => onChangeText(textKey, { background: v })}
              presets={COLOR_PRESETS}
            />
            <SliderRow
              label="투명도"
              value={Math.round((cfg.backgroundOpacity ?? 1) * 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              onUpdate={(v) =>
                onChangeText(textKey, { backgroundOpacity: v / 100 })
              }
            />
            <SliderRow
              label="패딩"
              value={cfg.padding ?? 16}
              min={0}
              max={60}
              step={2}
              unit="px"
              onUpdate={(v) => onChangeText(textKey, { padding: v })}
            />
            <SliderRow
              label="둥글기"
              value={cfg.borderRadius ?? 8}
              min={0}
              max={40}
              step={2}
              unit="px"
              onUpdate={(v) => onChangeText(textKey, { borderRadius: v })}
            />
          </div>
        )}
      </div>

      {/* 표시/숨김 + 초기화 */}
      <div className="pt-3 border-t flex gap-2">
        <button
          onClick={() => onToggleVisible(textKey)}
          className="flex-1 py-2 rounded-lg border border-surface-border hover:bg-surface-hover text-xs font-medium flex items-center justify-center gap-1.5"
        >
          {cfg.visible === false ? (
            <>
              <Eye size={12} />
              표시하기
            </>
          ) : (
            <>
              <EyeOff size={12} />
              숨기기
            </>
          )}
        </button>
        <button
          onClick={() => {
            if (confirm(`${TEXT_LABELS[textKey]} 스타일을 초기화할까요?`)) {
              onResetText(textKey);
            }
          }}
          className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={12} />
          초기화
        </button>
      </div>
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
  suffix,
  onUpdate,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  suffix?: string;
  onUpdate: (v: number) => void;
}) {
  const display = suffix ? `${value.toFixed(2)}${suffix}` : `${value}${unit || ''}`;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-medium text-ink-secondary">{label}</span>
        <span className="text-ink-muted">{display}</span>
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