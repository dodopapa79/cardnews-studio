'use client';
import { useState } from 'react';
import {
  Heart, MessageCircle, Share2, Bookmark, Music, MoreVertical,
  ThumbsUp, ThumbsDown, Play, Home, Search, PlusSquare, User,
} from 'lucide-react';
import type { PhoneApp, Slide, Preset, BrandInfo } from '@/lib/types';
import { CardRenderer } from '@/templates/CardRenderer';

export function PhoneMockup({
  slide,
  preset,
  brand,
  isLast,
  initialApp = 'tiktok',
}: {
  slide: Slide;
  preset: Preset;
  colorId?: string;
  brand?: BrandInfo;
  isLast?: boolean;
  initialApp?: PhoneApp;
}) {
  const [app, setApp] = useState<PhoneApp>(initialApp);

  return (
    <div className="flex flex-col items-center gap-4">
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

      <div className="relative" style={{ width: 320, aspectRatio: '9 / 19.5' }}>
        <div className="absolute inset-0 rounded-[3rem] bg-black p-2 shadow-2xl">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
          <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-black">
            <div className="absolute inset-0">
              <div
                style={{
                  width: 1080,
                  height: 1350,
                  transform: `scale(${(320 - 16) / 1080})`,
                  transformOrigin: 'top left',
                }}
              >
                <CardRenderer
                  slide={{ ...slide, isLast }}
                  preset={preset}
                  brand={brand}
                  width={1080}
                  height={1350}
                />
              </div>
            </div>

            {app === 'tiktok' && <TikTokOverlay />}
            {app === 'youtube' && <YouTubeOverlay />}
            {app === 'instagram' && <InstagramOverlay />}
          </div>
        </div>
      </div>

      <div className="text-xs text-ink-secondary text-center max-w-xs">
        회색/반투명 영역은 실제 앱에서 <strong>UI가 가려지는 부분</strong>입니다.
      </div>
    </div>
  );
}

function TikTokOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 text-white">
        <IconBtn icon={<Heart size={22} fill="white" />} label="12.4K" />
        <IconBtn icon={<MessageCircle size={22} fill="white" />} label="324" />
        <IconBtn icon={<Bookmark size={22} fill="white" />} label="1.2K" />
        <IconBtn icon={<Share2 size={22} fill="white" />} label="89" />
      </div>
      <div className="absolute left-3 bottom-20 text-white max-w-[60%]">
        <div className="text-sm font-bold mb-1">@your_handle</div>
        <div className="text-xs opacity-90 leading-snug">여기에 캡션과 해시태그가 표시됩니다</div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px]">
          <Music size={11} />
          <span>원본 오디오 - your_handle</span>
        </div>
      </div>
      <BottomNav items={[Home, Search, PlusSquare, MessageCircle, User]} labels={['홈','검색','만들기','받은함','프로필']} activeIdx={3} />
    </div>
  );
}

function YouTubeOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 text-white">
        <IconBtn icon={<ThumbsUp size={20} fill="white" />} label="8.1K" />
        <IconBtn icon={<ThumbsDown size={20} fill="white" />} label="싫어요" />
        <IconBtn icon={<MessageCircle size={20} fill="white" />} label="142" />
        <IconBtn icon={<Share2 size={20} fill="white" />} label="공유" />
      </div>
      <div className="absolute left-3 bottom-20 flex items-center gap-2 text-white">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold">YT</div>
        <div className="text-xs font-semibold">@your_channel</div>
        <button className="ml-1 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold">구독</button>
      </div>
      <div className="absolute left-3 right-20 bottom-10 text-white">
        <div className="text-xs font-medium leading-snug">여기에 영상 제목이 표시됩니다 #shorts</div>
      </div>
      <BottomNav items={[Home, Play, PlusSquare, MessageCircle, User]} labels={['홈','Shorts','만들기','구독','내 페이지']} activeIdx={1} />
    </div>
  );
}

function InstagramOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 text-white">
        <IconBtn icon={<Heart size={26} fill="white" />} label="15.2K" noCircle />
        <IconBtn icon={<MessageCircle size={26} fill="white" />} label="524" noCircle />
        <IconBtn icon={<Share2 size={26} fill="white" />} label="201" noCircle />
        <MoreVertical size={22} />
      </div>
      <div className="absolute left-3 right-14 bottom-20 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[9px] font-bold">IG</div>
          </div>
          <div className="text-xs font-semibold">your_handle</div>
          <button className="px-2.5 py-0.5 rounded-md border border-white/60 text-[10px]">팔로우</button>
        </div>
        <div className="text-xs opacity-90 leading-snug">여기에 릴스 캡션이 표시됩니다 ✨ #reels</div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] opacity-80">
          <Music size={11} />
          <span>Original audio</span>
        </div>
      </div>
      <BottomNav items={[Home, Search, PlusSquare, Play, User]} labels={['홈','검색','만들기','릴스','프로필']} activeIdx={3} />
    </div>
  );
}

function IconBtn({ icon, label, noCircle }: { icon: React.ReactNode; label: string; noCircle?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={noCircle ? '' : 'w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1'}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </div>
  );
}

function BottomNav({ items, labels, activeIdx }: { items: any[]; labels: string[]; activeIdx: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/60 backdrop-blur flex items-center justify-around text-white text-[9px]">
      {items.map((Icon, i) => (
        <div key={i} className={`flex flex-col items-center gap-0.5 ${i === activeIdx ? '' : 'opacity-60'}`}>
          <Icon size={18} />
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}