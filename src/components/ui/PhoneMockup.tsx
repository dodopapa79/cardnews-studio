'use client';
import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Music, MoreVertical, ThumbsUp, ThumbsDown, Play, Home, Search, PlusSquare, User } from 'lucide-react';
import type { PhoneApp, Slide, Preset } from '@/lib/types';
import { CardSlide } from '@/templates';

export function PhoneMockup({
  slide,
  preset,
  initialApp = 'tiktok',
}: {
  slide: Slide;
  preset: Preset;
  initialApp?: PhoneApp;
}) {
  const [app, setApp] = useState<PhoneApp>(initialApp);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 앱 선택 탭 */}
      <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-lg">
        {(['tiktok', 'youtube', 'instagram'] as PhoneApp[]).map((a) => (
          <button
            key={a}
            onClick={() => setApp(a)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              app === a ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-secondary'
            }`}
          >
            {a === 'tiktok' ? 'TikTok' : a === 'youtube' ? 'YouTube' : 'Instagram'}
          </button>
        ))}
      </div>

      {/* 폰 목업 */}
      <div className="relative" style={{ width: 320, aspectRatio: '9 / 19.5' }}>
        {/* 폰 프레임 */}
        <div className="absolute inset-0 rounded-[3rem] bg-black p-2 shadow-2xl">
          {/* 노치 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />

          {/* 스크린 */}
          <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-black">
            {/* 카드뉴스 (전체 화면) */}
            <div className="absolute inset-0">
              <div
                style={{
                  width: 1080,
                  height: 1350,
                  transform: 'scale(' + (320 - 16) / 1080 + ')',
                  transformOrigin: 'top left',
                }}
              >
                <CardSlide slide={slide} preset={preset} />
              </div>
            </div>

            {/* 앱별 오버레이 */}
            {app === 'tiktok' && <TikTokOverlay />}
            {app === 'youtube' && <YouTubeOverlay />}
            {app === 'instagram' && <InstagramOverlay />}
          </div>
        </div>
      </div>

      <div className="text-xs text-ink-secondary text-center max-w-xs">
        회색/반투명 영역은 실제 앱에서 <strong>UI가 가려지는 부분</strong>입니다.
        중요한 텍스트는 이 영역을 피해서 배치하세요.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TikTok 오버레이
// ─────────────────────────────────────────────
function TikTokOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 우측 하단 아이콘 */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 text-white">
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <Heart size={22} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">12.4K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <MessageCircle size={22} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">324</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <Bookmark size={22} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">1.2K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <Share2 size={22} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">89</span>
        </div>
      </div>

      {/* 좌측 하단 프로필 */}
      <div className="absolute left-3 bottom-20 text-white max-w-[60%]">
        <div className="text-sm font-bold mb-1">@your_handle</div>
        <div className="text-xs opacity-90 leading-snug">
          여기에 캡션과 해시태그가 표시됩니다 #추천 #정보
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px]">
          <Music size={11} />
          <span>원본 오디오 - your_handle</span>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/60 backdrop-blur flex items-center justify-around text-white text-[9px]">
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <Home size={18} />
          <span>홈</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <Search size={18} />
          <span>검색</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <PlusSquare size={18} />
          <span>만들기</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <MessageCircle size={18} />
          <span>받은함</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <User size={18} />
          <span>프로필</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// YouTube Shorts 오버레이
// ─────────────────────────────────────────────
function YouTubeOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 우측 하단 아이콘 */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 text-white">
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <ThumbsUp size={20} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">8.1K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <ThumbsDown size={20} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">싫어요</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <MessageCircle size={20} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">142</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
            <Share2 size={20} fill="white" />
          </div>
          <span className="text-[10px] font-semibold">공유</span>
        </div>
      </div>

      {/* 좌측 하단 채널 */}
      <div className="absolute left-3 bottom-20 flex items-center gap-2 text-white">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold">
          YT
        </div>
        <div className="text-xs font-semibold">@your_channel</div>
        <button className="ml-1 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold">
          구독
        </button>
      </div>

      {/* 하단 제목 */}
      <div className="absolute left-3 right-20 bottom-10 text-white">
        <div className="text-xs font-medium leading-snug">
          여기에 영상 제목이 표시됩니다 #shorts
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/60 backdrop-blur flex items-center justify-around text-white text-[9px]">
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <Home size={18} />
          <span>홈</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Play size={18} />
          <span>Shorts</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <PlusSquare size={18} />
          <span>만들기</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <MessageCircle size={18} />
          <span>구독</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <User size={18} />
          <span>내 페이지</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Instagram Reels 오버레이
// ─────────────────────────────────────────────
function InstagramOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 우측 하단 아이콘 */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 text-white">
        <div className="flex flex-col items-center">
          <Heart size={26} fill="white" />
          <span className="text-[10px] font-semibold mt-1">15.2K</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle size={26} fill="white" />
          <span className="text-[10px] font-semibold mt-1">524</span>
        </div>
        <div className="flex flex-col items-center">
          <Share2 size={26} fill="white" />
          <span className="text-[10px] font-semibold mt-1">201</span>
        </div>
        <MoreVertical size={22} />
      </div>

      {/* 좌측 하단 프로필 + 캡션 */}
      <div className="absolute left-3 right-14 bottom-20 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[9px] font-bold">
              IG
            </div>
          </div>
          <div className="text-xs font-semibold">your_handle</div>
          <button className="px-2.5 py-0.5 rounded-md border border-white/60 text-[10px]">
            팔로우
          </button>
        </div>
        <div className="text-xs opacity-90 leading-snug">
          여기에 릴스 캡션이 표시됩니다 ✨ #reels #추천
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] opacity-80">
          <Music size={11} />
          <span>Original audio</span>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/60 backdrop-blur flex items-center justify-around text-white text-[9px]">
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <Home size={18} />
          <span>홈</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <Search size={18} />
          <span>검색</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <PlusSquare size={18} />
          <span>만들기</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Play size={18} />
          <span>릴스</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 opacity-60">
          <User size={18} />
          <span>프로필</span>
        </div>
      </div>
    </div>
  );
}