'use client';
import { useState } from 'react';
import { generateCardNews, expandKeyword, fetchBlogContent } from '@/lib/gemini';
import type { Settings, Slide } from '@/lib/types';

export function InputPanel({
  settings,
  onSlides,
}: {
  settings: Settings;
  onSlides: (s: Slide[]) => void;
}) {
  const [mode, setMode] = useState<'keyword' | 'blog' | 'manual'>('keyword');
  const [keyword, setKeyword] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [manual, setManual] = useState('');
  const [slideCount, setSlideCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ready = settings.geminiApiKey;

  async function handleGenerate() {
    if (!ready) {
      setError('설정에서 Gemini API 키를 입력하세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let source = '';
      if (mode === 'keyword') {
        if (!keyword.trim()) throw new Error('키워드를 입력하세요.');
        source = await expandKeyword(settings.geminiApiKey, keyword.trim());
      } else if (mode === 'blog') {
        if (!blogUrl.trim()) throw new Error('블로그 URL을 입력하세요.');
        const { text } = await fetchBlogContent(blogUrl.trim());
        source = text;
      } else {
        if (!manual.trim()) throw new Error('내용을 입력하세요.');
        source = manual;
      }

      const slides = await generateCardNews(settings.geminiApiKey, source, { slideCount });
      onSlides(slides);
    } catch (e: any) {
      setError(e.message || '오류 발생');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-xl p-4 bg-white space-y-4">
      <h3 className="font-semibold">📝 카드뉴스 소스</h3>

      <div className="flex gap-2">
        {(['keyword', 'blog', 'manual'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              mode === m ? 'bg-brand-500 text-white' : 'bg-gray-100'
            }`}
          >
            {m === 'keyword' ? '키워드' : m === 'blog' ? '블로그 URL' : '직접 입력'}
          </button>
        ))}
      </div>

      {mode === 'keyword' && (
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="예: 2026 청년 지원금"
          className="w-full border rounded-lg px-3 py-2"
        />
      )}
      {mode === 'blog' && (
        <input
          value={blogUrl}
          onChange={(e) => setBlogUrl(e.target.value)}
          placeholder="https://blog.naver.com/..."
          className="w-full border rounded-lg px-3 py-2"
        />
      )}
      {mode === 'manual' && (
        <textarea
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          rows={6}
          placeholder="카드뉴스로 만들 텍스트를 붙여넣으세요."
          className="w-full border rounded-lg px-3 py-2"
        />
      )}

      <div className="flex items-center gap-3">
        <label className="text-sm">슬라이드</label>
        <input
          type="number"
          min={3}
          max={10}
          value={slideCount}
          onChange={(e) => setSlideCount(Number(e.target.value))}
          className="w-20 border rounded-lg px-2 py-1"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="ml-auto bg-brand-600 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? '생성 중...' : '✨ 카드뉴스 생성'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>
      )}
    </div>
  );
}