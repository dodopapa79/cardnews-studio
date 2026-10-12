'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { generateCardNews, expandKeyword, fetchBlogContent } from '@/lib/gemini';
import type { Settings, Slide, Preset } from '@/lib/types';
import { Sparkles, AlertCircle, Link2, Search, PencilRuler } from 'lucide-react';

export function InputPanel({
  settings,
  onSlides,
  preset,
  compact = false,
}: {
  settings: Settings;
  onSlides: (s: Slide[]) => void;
  preset?: Preset;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<'keyword' | 'blog' | 'manual'>('keyword');
  const [keyword, setKeyword] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [manual, setManual] = useState('');
  const [slideCount, setSlideCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🆕 CTA용 블로그 정보
  const [myBlogUrl, setMyBlogUrl] = useState(settings.workerUrl ? '' : '');
  const [myBlogName, setMyBlogName] = useState('');

  const ready = !!settings.geminiApiKey;

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

      // 🆕 CTA용 블로그 정보
      const ctaBlogUrl = myBlogUrl.trim() || (mode === 'blog' ? blogUrl.trim() : '');
      const ctaBlogName = myBlogName.trim();

      const slides = await generateCardNews(settings.geminiApiKey, source, {
        slideCount,
        preset,
        blogUrl: ctaBlogUrl,
        blogName: ctaBlogName,
      });
      onSlides(slides);
    } catch (e: any) {
      setError(e.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Tabs
          tabs={[
            { id: 'keyword', label: '키워드', icon: <Search size={13} /> },
            { id: 'blog', label: '블로그', icon: <Link2 size={13} /> },
            { id: 'manual', label: '직접 입력', icon: <PencilRuler size={13} /> },
          ]}
          active={mode}
          onChange={(v) => setMode(v as any)}
        />
      </div>

      <div className="space-y-3">
        {mode === 'keyword' && (
          <Input
            placeholder="예: 2026 청년 지원금"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        )}
        {mode === 'blog' && (
          <Input
            placeholder="https://blog.naver.com/..."
            value={blogUrl}
            onChange={(e) => setBlogUrl(e.target.value)}
          />
        )}
        {mode === 'manual' && (
          <Textarea
            placeholder="카드뉴스로 만들 텍스트를 붙여넣으세요"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            rows={compact ? 4 : 6}
          />
        )}

        {/* 🆕 CTA용 블로그 정보 */}
        <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 space-y-2">
          <div className="text-xs font-semibold text-primary-800 flex items-center gap-1.5">
            🎯 블로그 유입 정보 (마지막 카드 CTA에 반영)
          </div>
          <Input
            placeholder="내 블로그 주소 (예: https://blog.naver.com/myblog)"
            value={myBlogUrl}
            onChange={(e) => setMyBlogUrl(e.target.value)}
          />
          <Input
            placeholder="블로그 이름 (선택, 예: 우리집 살림노트)"
            value={myBlogName}
            onChange={(e) => setMyBlogName(e.target.value)}
          />
          <div className="text-[10px] text-primary-700 leading-relaxed">
            💡 마지막 카드에 "지금 블로그에서 확인하세요" 문구와 함께 표시됩니다.
            <br />
            비워두면 AI가 자연스럽게 "블로그에서 자세히" 문구를 생성합니다.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-ink-secondary">슬라이드</label>
          <input
            type="number"
            min={3}
            max={10}
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-16 rounded-lg border border-surface-border px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !ready}
          loading={loading}
          className="w-full"
          size="lg"
          icon={!loading && <Sparkles size={16} />}
        >
          {loading ? 'AI가 생성 중...' : '카드뉴스 생성'}
        </Button>

        {!ready && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary-50 border border-primary-200 text-xs text-primary-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>설정에서 Gemini API 키를 먼저 입력하세요</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}