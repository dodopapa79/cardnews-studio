'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/ColorPicker';
import { BG_PRESETS } from '@/lib/presets';
import type { BackgroundConfig, ImageLayout } from '@/lib/types';
import { Palette, Image as ImageIcon } from 'lucide-react';

const BG_COLOR_PRESETS = [
  '#ffffff', '#f5f4f0', '#faf7f2', '#f0ebe1',
  '#0a0a0a', '#0f172a', '#3b0764', '#450a0a',
  '#052e16', '#7c3aed', '#2563eb', '#ec4899',
];

const IMAGE_LAYOUTS: { id: ImageLayout; name: string; desc: string }[] = [
  { id: 'full-bleed', name: '전체 배경', desc: '이미지가 전체' },
  { id: 'top-image', name: '상단', desc: '상단 55%' },
  { id: 'split', name: '좌우 분할', desc: '우측 절반' },
  { id: 'none', name: '이미지 없음', desc: '색상만' },
];

export function BackgroundEditor({
  background,
  onChange,
  onChangeImage,
}: {
  background: BackgroundConfig;
  onChange: (patch: Partial<BackgroundConfig>) => void;
  onChangeImage: () => void;
}) {
  const [bgTab, setBgTab] = useState<'preset' | 'custom'>('preset');

  const hasImage = !!background.imageUrl;
  // 오버레이 색을 따로 지정하지 않으면 기본 어둡기(약 55%)가 적용되므로 같은 값으로 표시
  const overlayValue = background.overlayColor
    ? background.overlayOpacity ?? 0.4
    : 0.55;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
        <Palette size={14} className="text-primary-600" />
        <span className="text-sm font-bold">배경</span>
      </div>

      {/* 프리셋 / 커스텀 탭 */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setBgTab('preset')}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
            bgTab === 'preset'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-ink-secondary'
          }`}
        >
          프리셋
        </button>
        <button
          onClick={() => setBgTab('custom')}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
            bgTab === 'custom'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-ink-secondary'
          }`}
        >
          커스텀
        </button>
      </div>

      {/* 프리셋 갤러리 */}
      {bgTab === 'preset' && (
        <div className="space-y-3">
          {/* 단색 */}
          <div>
            <div className="text-xs font-semibold text-ink-secondary mb-2">
              단색
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {BG_PRESETS.filter((p) => p.category === 'solid').map((p) => (
                <button
                  key={p.id}
                  onClick={() => onChange(p.background)}
                  className={`aspect-square rounded-lg border-2 transition hover:scale-105 ${
                    background.color === p.background.color &&
                    background.type === 'color' &&
                    !background.pattern
                      ? 'border-primary-500'
                      : 'border-white shadow-sm'
                  }`}
                  style={{ background: p.background.color }}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          {/* 그라데이션 */}
          <div>
            <div className="text-xs font-semibold text-ink-secondary mb-2">
              그라데이션
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {BG_PRESETS.filter((p) => p.category === 'gradient').map((p) => (
                <button
                  key={p.id}
                  onClick={() => onChange(p.background)}
                  className="aspect-square rounded-lg border-2 border-white shadow-sm hover:scale-105 transition"
                  style={{
                    background: `linear-gradient(135deg, ${p.background.color}, ${p.background.colorEnd})`,
                  }}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          {/* 패턴 */}
          <div>
            <div className="text-xs font-semibold text-ink-secondary mb-2">
              패턴
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {BG_PRESETS.filter((p) => p.category === 'pattern').map((p) => (
                <button
                  key={p.id}
                  onClick={() => onChange(p.background)}
                  className="aspect-square rounded-lg border-2 border-white shadow-sm hover:scale-105 transition flex items-center justify-center"
                  style={{
                    background: p.background.colorEnd
                      ? `linear-gradient(135deg, ${p.background.color}, ${p.background.colorEnd})`
                      : p.background.color,
                  }}
                  title={p.name}
                >
                  <span className="text-[8px] font-bold text-white/70">
                    {p.background.pattern === 'grid' ? '▦' :
                     p.background.pattern === 'dots' ? '⋮' :
                     p.background.pattern === 'mesh' ? '◈' :
                     p.background.pattern === 'noise' ? '◌' : '·'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 색상 */}
      {bgTab === 'custom' && (
        <div className="space-y-3">
          <ColorPicker
            label="배경색"
            value={background.color}
            onChange={(v) => onChange({ color: v, type: 'color' })}
            presets={BG_COLOR_PRESETS}
          />

          <div className="pt-2 border-t">
            <label className="flex items-center gap-2 text-xs cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={background.type === 'gradient'}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange({
                      type: 'gradient',
                      colorEnd: background.colorEnd || '#000000',
                    });
                  } else {
                    onChange({ type: 'color' });
                  }
                }}
              />
              <span className="font-medium">그라데이션 사용</span>
            </label>

            {background.type === 'gradient' && (
              <ColorPicker
                label="끝 색상"
                value={background.colorEnd || '#000000'}
                onChange={(v) => onChange({ colorEnd: v })}
                presets={BG_COLOR_PRESETS}
              />
            )}
          </div>
        </div>
      )}

      {/* 이미지가 있으면 이미지 배치 옵션 */}
      {hasImage && (
        <div className="pt-3 border-t space-y-3">
          <div className="text-xs font-semibold text-ink-secondary flex items-center gap-1.5">
            <ImageIcon size={12} />
            이미지 배치
          </div>
          <div className="grid grid-cols-2 gap-2">
            {IMAGE_LAYOUTS.map((l) => (
              <button
                key={l.id}
                onClick={() => onChange({ imageLayout: l.id })}
                className={`p-2 rounded-lg border-2 transition text-left ${
                  (background.imageLayout || 'full-bleed') === l.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-border hover:border-primary-300'
                }`}
              >
                <div className="text-xs font-semibold">{l.name}</div>
                <div className="text-[10px] text-ink-muted mt-0.5">{l.desc}</div>
              </button>
            ))}
          </div>

          {/* 오버레이 강도 */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-ink-secondary">어둡게 처리</span>
              <span className="text-ink-muted">
                {Math.round(overlayValue * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={overlayValue}
              onChange={(e) => {
                onChange({
                  overlayColor: background.overlayColor || '#000000',
                  overlayOpacity: Number(e.target.value),
                });
              }}
              className="w-full"
            />
          </div>

          {/* 하단 그라데이션 */}
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={!!background.topImageFade}
              onChange={(e) => onChange({ topImageFade: e.target.checked })}
            />
            이미지 하단 배경색 페이드
          </label>
        </div>
      )}

      <Button
        size="sm"
        variant="ghost"
        icon={<ImageIcon size={14} />}
        onClick={onChangeImage}
        className="w-full"
      >
        {hasImage ? '이미지 다시 생성' : '배경 이미지 생성'}
      </Button>
    </div>
  );
}