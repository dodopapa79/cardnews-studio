'use client';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ViewId } from '@/components/layout/Sidebar';
import type { Settings, Slide } from '@/lib/types';
import {
  PencilRuler,
  Palette,
  Film,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export function DashboardView({
  settings,
  slides,
  onNavigate,
}: {
  settings: Settings;
  slides: Slide[];
  onNavigate: (v: ViewId) => void;
}) {
  const geminiOk = !!settings.geminiApiKey;
  const cfOk = !!settings.cfAccountId && !!settings.cfApiToken;
  const hasSlides = slides.length > 0;
  const slidesWithImages = slides.filter((s) => s.imageUrl).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 환영 */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <div className="text-xs font-medium opacity-80 mb-1">WELCOME BACK</div>
        <h2 className="text-2xl font-bold mb-2">카드뉴스와 숏츠를 자동으로 만들어보세요</h2>
        <p className="text-sm opacity-90 mb-5">
          키워드나 블로그 URL 하나로 인스타 카드뉴스와 유튜브 숏츠를 완성합니다.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => onNavigate('create')}
            variant="secondary"
            className="!bg-white !text-primary-700 !border-transparent hover:!bg-primary-50"
            icon={<PencilRuler size={16} />}
          >
            카드뉴스 만들기
          </Button>
          {hasSlides && (
            <Button
              onClick={() => onNavigate('video')}
              variant="ghost"
              className="!text-white hover:!bg-white/10"
              icon={<Film size={16} />}
            >
              영상 만들기
            </Button>
          )}
        </div>
      </div>

      {/* 현황 카드 4개 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Gemini API"
          value={geminiOk ? '연결됨' : '미설정'}
          status={geminiOk ? 'success' : 'warning'}
          onClick={() => onNavigate('settings')}
        />
        <StatCard
          icon={<ImageIcon size={20} />}
          label="Cloudflare"
          value={cfOk ? '연결됨' : '미설정'}
          status={cfOk ? 'success' : 'warning'}
          onClick={() => onNavigate('settings')}
        />
        <StatCard
          icon={<Layers size={20} />}
          label="슬라이드"
          value={hasSlides ? `${slides.length}장` : '없음'}
          status={hasSlides ? 'success' : 'default'}
          onClick={() => hasSlides && onNavigate('create')}
        />
        <StatCard
          icon={<ImageIcon size={20} />}
          label="생성된 이미지"
          value={`${slidesWithImages} / ${slides.length}`}
          status={
            slidesWithImages === slides.length && hasSlides
              ? 'success'
              : slidesWithImages > 0
              ? 'warning'
              : 'default'
          }
          onClick={() => hasSlides && onNavigate('create')}
        />
      </div>

      {/* 빠른 시작 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="빠른 시작" subtitle="3단계로 완성" />
          <div className="space-y-3">
            <Step
              n={1}
              title="API 키 설정"
              desc="Gemini + Cloudflare 키 입력"
              done={geminiOk && cfOk}
              onClick={() => onNavigate('settings')}
            />
            <Step
              n={2}
              title="카드뉴스 생성"
              desc="키워드 또는 블로그 URL 입력"
              done={hasSlides}
              onClick={() => onNavigate('create')}
            />
            <Step
              n={3}
              title="영상 만들기"
              desc="숏츠 WebM 다운로드"
              done={false}
              onClick={() => hasSlides ? onNavigate('video') : onNavigate('create')}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="최근 카드뉴스" subtitle={hasSlides ? `${slides.length}장` : ''} />
          {hasSlides ? (
            <div className="space-y-2">
              {slides.slice(0, 3).map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                  onClick={() => onNavigate('create')}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 shrink-0 text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{s.headline}</div>
                    <div className="text-xs text-ink-muted truncate">{s.body}</div>
                  </div>
                  {s.imageUrl && <Badge variant="success">이미지</Badge>}
                </div>
              ))}
              {slides.length > 3 && (
                <button
                  onClick={() => onNavigate('create')}
                  className="w-full text-xs text-primary-600 hover:text-primary-700 py-2"
                >
                  전체 {slides.length}장 보기 →
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-sm text-ink-secondary mb-3">
                아직 카드뉴스가 없습니다
              </div>
              <Button
                size="sm"
                onClick={() => onNavigate('create')}
                icon={<PencilRuler size={14} />}
              >
                첫 카드뉴스 만들기
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  status,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'success' | 'warning' | 'default';
  onClick?: () => void;
}) {
  const iconColor =
    status === 'success'
      ? 'bg-green-100 text-green-600'
      : status === 'warning'
      ? 'bg-orange-100 text-orange-600'
      : 'bg-gray-100 text-gray-500';

  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''}
    >
      <div onClick={onClick}>
        <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <div className="text-xs text-ink-secondary mb-1">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </Card>
  );
}

function Step({
  n,
  title,
  desc,
  done,
  onClick,
}: {
  n: number;
  title: string;
  desc: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          done ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-700'
        }`}
      >
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