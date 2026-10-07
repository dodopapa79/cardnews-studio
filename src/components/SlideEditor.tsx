'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { generateImage } from '@/lib/imagegen';
import type { Slide, Settings } from '@/lib/types';
import { ArrowUp, ArrowDown, Trash2, Image as ImageIcon, X, Sparkles } from 'lucide-react';

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
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const update = (i: number, patch: Partial<Slide>) => {
    onChange(slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const remove = (i: number) => {
    if (confirm('이 슬라이드를 삭제할까요?')) {
      onChange(slides.filter((_, idx) => idx !== i));
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  async function genImg(i: number) {
    const s = slides[i];
    if (!s.imagePrompt.trim()) {
      alert('이미지 프롬프트가 비어 있습니다.');
      return;
    }
    if (!settings.cfAccountId || !settings.cfApiToken) {
      alert('설정에서 Cloudflare 정보를 입력하세요.');
      return;
    }
    setGeneratingIdx(i);
    try {
      const url = await generateImage(settings.cfAccountId, settings.cfApiToken, s.imagePrompt, {
        width: 1080,
        height: 1350,
        steps: 8,
        workerUrl: settings.workerUrl,
      });
      update(i, { imageUrl: url });
    } catch (e: any) {
      alert(`이미지 생성 실패: ${e.message}`);
    } finally {
      setGeneratingIdx(null);
    }
  }

  async function genAllImages() {
    if (!settings.cfAccountId || !settings.cfApiToken) {
      alert('설정에서 Cloudflare 정보를 입력하세요.');
      return;
    }
    if (!confirm(`이미지가 없는 ${slides.filter((s) => !s.imageUrl).length}개 슬라이드의 이미지를 생성할까요?`)) {
      return;
    }

    setBatchLoading(true);
    const targets = slides.map((s, i) => ({ s, i })).filter(({ s }) => !s.imageUrl);
    setBatchProgress({ current: 0, total: targets.length });

    for (let k = 0; k < targets.length; k++) {
      const { s, i } = targets[k];
      setBatchProgress({ current: k + 1, total: targets.length });
      if (!s.imagePrompt.trim()) continue;
      try {
        const url = await generateImage(settings.cfAccountId, settings.cfApiToken, s.imagePrompt, {
          width: 1080,
          height: 1350,
          steps: 8,
          workerUrl: settings.workerUrl,
        });
        update(i, { imageUrl: url });
        await new Promise((r) => setTimeout(r, 1200));
      } catch (e: any) {
        console.error(`슬라이드 ${i + 1} 실패:`, e);
      }
    }
    setBatchLoading(false);
    setBatchProgress({ current: 0, total: 0 });
  }

  return (
    <div className="space-y-4">
      <Card padding={false} className="p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">슬라이드 편집</div>
          <div className="text-xs text-ink-secondary mt-0.5">
            {slides.length}장 · 이미지 {slides.filter((s) => s.imageUrl).length}장 생성됨
          </div>
        </div>
        <Button
          size="sm"
          icon={<Sparkles size={14} />}
          loading={batchLoading}
          onClick={genAllImages}
        >
          {batchLoading
            ? `일괄 생성 ${batchProgress.current}/${batchProgress.total}`
            : '모든 이미지 생성'}
        </Button>
      </Card>

      {slides.map((s, i) => (
        <Card key={s.id}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary">#{i + 1}</Badge>
            <Badge>{s.type.toUpperCase()}</Badge>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1.5 rounded-lg bg-surface-hover hover:bg-gray-200 disabled:opacity-30"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === slides.length - 1}
                className="p-1.5 rounded-lg bg-surface-hover hover:bg-gray-200 disabled:opacity-30"
              >
                <ArrowDown size={14} />
              </button>
              <button
                onClick={() => remove(i)}
                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label="헤드라인"
              value={s.headline}
              onChange={(e) => update(i, { headline: e.target.value })}
              placeholder="15자 이내"
            />
            <Textarea
              label="본문"
              value={s.body}
              onChange={(e) => update(i, { body: e.target.value })}
              placeholder="40자 이내"
              rows={2}
            />
            {s.type === 'data' && (
              <Input
                label="강조 숫자"
                value={s.highlight}
                onChange={(e) => update(i, { highlight: e.target.value })}
                placeholder="예: 300만원"
              />
            )}
            <Textarea
              label="이미지 프롬프트 (영어)"
              value={s.imagePrompt}
              onChange={(e) => update(i, { imagePrompt: e.target.value })}
              placeholder="A clean modern office..."
              rows={2}
              className="font-mono text-xs"
            />

            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={s.imageLayout}
                onChange={(e) => update(i, { imageLayout: e.target.value as any })}
                className="!w-auto"
              >
                <option value="none">이미지 없음</option>
                <option value="full-bleed">전체 배경</option>
                <option value="top-image">상단</option>
                <option value="split">좌우 분할</option>
              </Select>

              <Button
                size="sm"
                variant="secondary"
                icon={<ImageIcon size={14} />}
                loading={generatingIdx === i}
                onClick={() => genImg(i)}
                disabled={generatingIdx !== null || batchLoading}
              >
                {generatingIdx === i ? '생성 중...' : '이미지 생성'}
              </Button>

              {s.imageUrl && (
                <>
                  <img
                    src={s.imageUrl}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => update(i, { imageUrl: '' })}
                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}