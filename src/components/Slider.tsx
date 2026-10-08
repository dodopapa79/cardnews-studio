'use client';

export function Slider({
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