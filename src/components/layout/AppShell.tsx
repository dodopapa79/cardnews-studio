'use client';
import { Sidebar, type ViewId } from './Sidebar';
import { Header } from './Header';
import type { ReactNode } from 'react';

const TITLES: Record<ViewId, string> = {
  dashboard: '대시보드',
  create: '카드뉴스 만들기',
  presets: '프리셋 관리',
  video: '영상 만들기',
  settings: '설정',
};

export function AppShell({
  active,
  onChange,
  hasSlides,
  projectName,
  children,
}: {
  active: ViewId;
  onChange: (v: ViewId) => void;
  hasSlides: boolean;
  projectName?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-bg">
      <Sidebar
        active={active}
        onChange={onChange}
        hasSlides={hasSlides}
        projectName={projectName}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={TITLES[active]} />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}