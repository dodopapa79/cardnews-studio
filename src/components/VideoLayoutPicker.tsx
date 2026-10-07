'use client';
import { Card, CardHeader } from '@/components/ui/Card';
import type { VideoLayout } from '@/lib/types';

export function VideoLayoutPicker({
  layout,
  onChange,
}: {
  layout: VideoLayout;
  onChange: (l: VideoLayout) => void;
}) {
  return (
    <Card>
      <CardHeader title="영상 레이아웃" subtitle="숏츠 스타일을 선택하세요" />
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange('split-news')}
          className={`text-left rounded-lg border-2 p-3 transition ${
            layout === 'split-news'
              ? 'border-primary-500 bg-primary-50'
              : 'border-surface-border hover:border-primary-300'
          }`}
        >
          <div className="w-full aspect-[9/16] rounded-lg overflow-hidden border bg-black mb-2">
            <div className="h-[42%] bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-[10px] font-bold">
              상단 카드
            </div>
            <div className="h-[58%] bg-gray-900 relative">
              <div className="absolute bottom-2 left-2 right-2 h-4 bg-black/60 rounded text-[7px] text-white flex items-center justify-center">
                자막
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold">뉴스형</div>
          <div className="text-xs text-ink-muted mt-0.5">상단 카드 + 하단 여백</div>
        </button>

        <button
          onClick={() => onChange('full-screen')}
          className={`text-left rounded-lg border-2 p-3 transition ${
            layout === 'full-screen'
              ? 'border-primary-500 bg-primary-50'
              : 'border-surface-border hover:border-primary-300'
          }`}
        >
          <div className="w-full aspect-[9/16] rounded-lg overflow-hidden border bg-black flex items-center justify-center mb-2">
            <div className="w-[70%] h-[85%] bg-white rounded flex items-center justify-center text-[9px]">
              카드 전체
            </div>
          </div>
          <div className="text-sm font-semibold">전체 화면</div>
          <div className="text-xs text-ink-muted mt-0.5">카드가 화면 중앙에</div>
        </button>
      </div>
    </Card>
  );
}