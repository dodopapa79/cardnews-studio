'use client';
import {
  LayoutDashboard,
  PencilRuler,
  Palette,
  Film,
  Settings as SettingsIcon,
  Sparkles,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';

export type ViewId = 'dashboard' | 'create' | 'presets' | 'video' | 'settings';

const MENU: { id: ViewId; label: string; icon: any }[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'create', label: '카드뉴스 만들기', icon: PencilRuler },
  { id: 'presets', label: '프리셋', icon: Palette },
  { id: 'video', label: '영상 만들기', icon: Film },
  { id: 'settings', label: '설정', icon: SettingsIcon },
];

export function Sidebar({
  active,
  onChange,
  hasSlides,
  projectName,
  onCreateNew,
}: {
  active: ViewId;
  onChange: (v: ViewId) => void;
  hasSlides: boolean;
  projectName?: string;
  onCreateNew?: () => void;
}) {
  return (
    <aside className="w-64 bg-white border-r border-surface-border flex flex-col h-screen sticky top-0 shrink-0">
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-bold text-sm">CardNews Studio</div>
            <div className="text-[10px] text-ink-muted">v3.0</div>
          </div>
        </div>
      </div>

      {/* 새 카드뉴스 버튼 */}
      {onCreateNew && (
        <div className="p-3">
          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            새 카드뉴스 만들기
          </button>
        </div>
      )}

      {/* 메뉴 */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {MENU.map((m) => {
          const Icon = m.icon;
          const isActive = active === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              )}
            >
              <Icon size={18} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 하단 - 현재 프로젝트 */}
      <div className="p-4 border-t border-surface-border space-y-2">
        {hasSlides && projectName && (
          <div className="text-xs p-2.5 rounded-lg bg-primary-50 border border-primary-100">
            <div className="text-[10px] text-primary-600 mb-0.5 font-medium">
              편집 중
            </div>
            <div className="font-medium text-primary-900 truncate">
              {projectName}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <div
            className={clsx(
              'w-2 h-2 rounded-full',
              hasSlides ? 'bg-primary-500' : 'bg-gray-300'
            )}
          />
          {hasSlides ? '카드뉴스 준비됨' : '카드뉴스 없음'}
        </div>
      </div>
    </aside>
  );
}