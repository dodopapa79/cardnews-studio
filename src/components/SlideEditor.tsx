'use client';
import { useState } from 'react';
import type { Slide, Settings } from '@/lib/types';
import { generateImage } from '@/lib/imagegen';

export function SlideEditor({
  slides,
  onChange,
  settings,
}: {
  slides: Slide[];
  onChange: (s: Slide[]) => void;
  settings: Settings;
}) {
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Slide>) => {
    onChange(slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const remove = (i: number) => onChange(slides.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  async function genImg(i: number) {
    const s = slides[i];
    if (!s.imagePrompt.trim()) return alert('이미지 프롬프트가 비어 있습니다.');
    if (!settings.cfAccountId || !settings.cfApiToken) {
      return alert('설정에서 Cloudflare 정보를 입력하세요. (선택 사항)');
    }
    setGeneratingIdx(i);
    try {
      const url = await generateImage(settings.cfAccountId, settings.cfApiToken, s.imagePrompt, {
        width: 1080,
        height: 1350,
        steps: 8,
      });
      update(i, { imageUrl: url });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGeneratingIdx(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">✏️ 슬라이드 편집 ({slides.length}장)</h3>
      </div>

      {slides.map((s, i) => (
        <div key={s.id} className="border rounded-xl p-3 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100">
              #{i + 1} {s.type.toUpperCase()}
            </span>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-xs px-2 py-1 bg-gray-100 rounded disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === slides.length - 1}
                className="text-xs px-2 py-1 bg-gray-100 rounded disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => remove(i)}
                className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded"
              >
                삭제
              </button>
            </div>
          </div>

          <input
            value={s.headline}
            onChange={(e) => update(i, { headline: e.target.value })}
            placeholder="헤드라인"
            className="w-full border rounded-lg px-3 py-2 text-sm font-semibold"
          />
          <textarea
            value={s.body}
            onChange={(e) => update(i, { body: e.target.value })}
            placeholder="본문"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {s.type === 'data' && (
            <input
              value={s.highlight}
              onChange={(e) => update(i, { highlight: e.target.value })}
              placeholder="강조 숫자 (예: 300만원)"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          )}

          <textarea
            value={s.imagePrompt}
            onChange={(e) => update(i, { imagePrompt: e.target.value })}
            placeholder="영어 이미지 프롬프트"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-xs font-mono bg-gray-50"
          />

          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={s.imageLayout}
              onChange={(e) => update(i, { imageLayout: e.target.value as any })}
              className="border rounded-lg px-2 py-1 text-xs"
            >
              <option value="none">이미지 없음</option>
              <option value="full-bleed">전체 배경</option>
              <option value="top-image">상단</option>
              <option value="split">좌우 분할</option>
            </select>
            <button
              onClick={() => genImg(i)}
              disabled={generatingIdx !== null}
              className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {generatingIdx === i ? '생성 중...' : '🖼 이미지 생성'}
            </button>
            {s.imageUrl && (
              <>
                <img src={s.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
                <button
                  onClick={() => update(i, { imageUrl: '' })}
                  className="text-xs text-red-500"
                >
                  제거
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}