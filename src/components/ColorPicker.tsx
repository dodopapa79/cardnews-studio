'use client';
import { useState } from 'react';
import { Palette, RotateCcw } from 'lucide-react';

export function ColorPicker({
  label,
  value,
  onChange,
  onReset,
  presets,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onReset?: () => void;
  presets?: string[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      {!compact && (
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
      )}

      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer shrink-0">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <div
            className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform"
            style={{ background: value || '#000000' }}
          />
        </label>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v) || v === '') {
              onChange(v);
            }
          }}
          className="flex-1 min-w-0 rounded-lg border border-surface-border px-2 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="#000000"
        />

        {presets && presets.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-secondary shrink-0"
            title="추천 색상"
          >
            <Palette size={13} />
          </button>
        )}
      </div>

      {open && presets && (
        <div className="flex gap-1 flex-wrap p-2 rounded-lg bg-surface-bg">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
              className="w-5 h-5 rounded border border-white shadow-sm hover:scale-110 transition-transform"
              style={{ background: p }}
              title={p}
            />
          ))}
        </div>
      )}
    </div>
  );
}