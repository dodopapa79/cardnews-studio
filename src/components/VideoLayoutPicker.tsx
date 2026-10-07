'use client';
import type { VideoLayout } from '@/lib/types';

export function VideoLayoutPicker({
  layout,
  onChange,
}: {
  layout: VideoLayout;
  onChange: (l: VideoLayout) => void;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white space-y-3">
      <h3 className="font-semibold">📐 영상 레이아웃</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange('split-news')}
          className={`text-left rounded-lg border-2 p-2 transition ${
            layout === 'split-news' ? 'border-brand-600' : 'border-gray-200'
          }`}
        >
          <div className="w-full aspect-[9/16] rounded overflow-hidden border">
            <div className="h-[42%] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-bold">
              상단 카드
            </div>
            <div className="h-[58%] bg-gray-900 relative">
              <div className="absolute bottom-2 left-2 right-2 h-4 bg-black/60 rounded text-[7px] text-white flex items-center justify-center">
                자막
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold">뉴스형 (추천)</div>
          <div className="text-[10px] text-gray-500">상단 카드 + 하단 자막</div>
        </button>

        <button
          onClick={() => onChange('full-screen')}
          className={`text-left rounded-lg border-2 p-2 transition ${
            layout === 'full-screen' ? 'border-brand-600' : 'border-gray-200'
          }`}
        >
          <div className="w-full aspect-[9/16] rounded overflow-hidden border bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="w-[70%] h-[85%] bg-white rounded flex items-center justify-center text-[9px]">
              카드 전체
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold">전체 화면</div>
          <div className="text-[10px] text-gray-500">카드뉴스가 배경</div>
        </button>
      </div>
    </div>
  );
}