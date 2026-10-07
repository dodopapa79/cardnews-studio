'use client';
import { Search, Moon, User } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-surface-border flex items-center px-6 sticky top-0 z-40">
      <h1 className="text-lg font-bold text-ink-primary">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            placeholder="검색..."
            className="w-64 pl-9 pr-3 py-2 text-sm rounded-lg bg-surface-bg border border-transparent focus:bg-white focus:border-surface-border focus:outline-none"
          />
        </div>

        <button className="p-2 rounded-lg hover:bg-surface-hover text-ink-secondary">
          <Moon size={18} />
        </button>

        <button className="p-2 rounded-lg hover:bg-surface-hover text-ink-secondary">
          <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
            <User size={14} />
          </div>
        </button>
      </div>
    </header>
  );
}