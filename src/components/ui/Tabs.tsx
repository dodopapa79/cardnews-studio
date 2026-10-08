'use client';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-all',
            active === t.id
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-ink-secondary hover:text-ink-primary'
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}