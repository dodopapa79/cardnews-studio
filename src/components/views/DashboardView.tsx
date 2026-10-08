'use client';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ViewId } from '@/components/layout/Sidebar';
import type { Settings, Slide, CardNewsProject } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle2, Layers, Image as ImageIcon, Plus, FolderOpen, FileText, PencilRuler, Film } from 'lucide-react';

export function DashboardView({
  settings,
  slides,
  projects,
  onNavigate,
  onSelectProject,
  onNewProject,
}: {
  settings: Settings;
  slides: Slide[];
  projects: CardNewsProject[];
  onNavigate: (v: ViewId) => void;
  onSelectProject: (p: CardNewsProject) => void;
  onNewProject: () => void;
}) {
  const geminiOk = !!settings.geminiApiKey;
  const cfOk = !!settings.cfAccountId && !!settings.cfApiToken;
  const hasSlides = slides.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
        <div className="relative z-10">
          <div className="text-xs font-medium opacity-80 mb-1 tracking-widest">WELCOME BACK</div>
          <h2 className="text-2xl font-bold mb-2">카드뉴스와 숏츠를 자동으로 만들어보세요</h2>
          <p className="text-sm opacity-90 mb-5 max-w-lg">키워드나 블로그 URL 하나로 인스타 카드뉴스와 유튜브 숏츠를 완성합니다.</p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onNewProject} size="lg" icon={<Plus size={18} />} className="!bg-white !text-primary-700 !border-transparent hover:!bg-primary-50">새 카드뉴스 만들기</Button>
            {hasSlides && (
              <>
                <Button onClick={() => onNavigate('create')} variant="ghost" className="!text-white hover:!bg-white/10" icon={<PencilRuler size={16} />}>편집 계속</Button>
                <Button onClick={() => onNavigate('video')} variant="ghost" className="!text-white hover:!bg-white/10" icon={<Film size={16} />}>영상 만들기</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<CheckCircle2 size={20} />} label="Gemini API" value={geminiOk ? '연결됨' : '미설정'} status={geminiOk ? 'success' : 'warning'} onClick={() => onNavigate('settings')} />
        <StatCard icon={<ImageIcon size={20} />} label="Cloudflare" value={cfOk ? '연결됨' : '미설정'} status={cfOk ? 'success' : 'warning'} onClick={() => onNavigate('settings')} />
        <StatCard icon={<Layers size={20} />} label="저장된 카드뉴스" value={`${projects.length}개`} status={projects.length > 0 ? 'success' : 'default'} onClick={() => projects.length > 0 && onNavigate('create')} />
        <StatCard icon={<ImageIcon size={20} />} label="현재 슬라이드" value={hasSlides ? `${slides.length}장` : '없음'} status={hasSlides ? 'success' : 'default'} onClick={() => hasSlides && onNavigate('create')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title={`내 카드뉴스 (${projects.length})`} subtitle="최근 수정 순" action={<Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={onNewProject}>새로</Button>} />
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-3"><FileText size={20} /></div>
              <div className="text-sm text-ink-secondary mb-3">아직 카드뉴스가 없습니다</div>
              <Button size="sm" onClick={onNewProject} icon={<Plus size={13} />}>첫 카드뉴스 만들기</Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {projects.slice(0, 6).map((p) => (
                <button key={p.id} onClick={() => onSelectProject(p)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-hover transition-colors text-left">
                  <div className="shrink-0 rounded-lg overflow-hidden border flex items-center justify-center bg-primary-100 text-primary-700" style={{ width: 40, aspectRatio: p.cardSize === 'square' ? '1/1' : '4/5' }}>
                    <span className="text-[10px] font-bold">{p.slides.length}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-ink-muted">{p.slides.length}장 · {formatRelativeTime(p.updatedAt)}</div>
                  </div>
                  <FolderOpen size={14} className="text-ink-muted shrink-0" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="빠른 시작" subtitle="3단계로 완성" />
          <div className="space-y-3">
            <Step n={1} title="API 키 설정" desc="Gemini + Cloudflare 키 입력" done={geminiOk && cfOk} onClick={() => onNavigate('settings')} />
            <Step n={2} title="카드뉴스 생성" desc="키워드 또는 블로그 URL 입력" done={projects.length > 0} onClick={onNewProject} />
            <Step n={3} title="영상 만들기" desc="숏츠 WebM 다운로드" done={false} onClick={() => (hasSlides ? onNavigate('video') : onNewProject())} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, status, onClick }: { icon: React.ReactNode; label: string; value: string; status: 'success' | 'warning' | 'default'; onClick?: () => void; }) {
  const iconColor = status === 'success' ? 'bg-primary-100 text-primary-600' : status === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500';
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''}>
      <div onClick={onClick}>
        <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center mb-3`}>{icon}</div>
        <div className="text-xs text-ink-secondary mb-1">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </Card>
  );
}

function Step({ n, title, desc, done, onClick }: { n: number; title: string; desc: string; done: boolean; onClick: () => void; }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'}`}>
        {done ? <CheckCircle2 size={14} /> : n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-ink-muted">{desc}</div>
      </div>
      <div className="text-ink-muted text-xs">→</div>
    </button>
  );
}