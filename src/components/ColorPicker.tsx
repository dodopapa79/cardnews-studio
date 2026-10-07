'use client';
import { useState } from 'react';
import { Palette, RotateCcw } from 'lucide-react';

export function ColorPicker({
  label,
  value,
  onChange,
  onReset,
  presets,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onReset?: () => void;
  presets?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-ink-secondary">{label}</div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-[10px] text-ink-muted hover:text-primary-600 flex items-center gap-0.5"
            title="초기화"
          >
            <RotateCcw size={9} />
            초기화
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* 색상 프리뷰 (클릭 시 컬러피커 열림) */}
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <div
            className="w-9 h-9 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform"
            style={{ background: value }}
          />
        </label>

        {/* Hex 입력 */}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v) || v === '') {
              onChange(v);
            }
          }}
          className="flex-1 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="#000000"
        />

        {/* 프리셋 색상 (있으면) */}
        {presets && presets.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-secondary"
            title="추천 색상"
          >
            <Palette size={14} />
          </button>
        )}
      </div>

      {/* 추천 색상 팔레트 */}
      {open && presets && (
        <div className="flex gap-1 flex-wrap mt-1 p-2 rounded-lg bg-surface-bg">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
              className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ background: p }}
              title={p}
            />
          ))}
        </div>
      )}
    </div>
  );
}