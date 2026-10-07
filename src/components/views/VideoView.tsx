'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { VideoLayoutPicker } from '@/components/VideoLayoutPicker';
import { renderNodeToDataUrl } from '@/lib/card-renderer';
import { generateShorts, downloadBlob } from '@/lib/video-generator';
import type { Slide, Preset, VideoLayout } from '@/lib/types';
import { Film, Download, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function VideoView({
  slides,
  preset,
  cardRefs,
}: {
  slides: Slide[];
  preset: Preset;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const [layout, setLayout] = useState<VideoLayout>('split-news');
  const [transition, setTransition] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function handleGenerate() {
    const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) {
      setError('카드뉴스가 없습니다. 먼저 카드뉴스를 만들어주세요.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError('');
    setStatus('카드 이미지 준비 중...');

    try {
      const cardPngs: string[] = [];
      for (let i = 0; i < nodes.length; i++) {
        setStatus(`카드 렌더링 (${i + 1}/${nodes.length})`);
        const url = await renderNodeToDataUrl(nodes[i]);
        cardPngs.push(url);
      }

      setStatus('영상 녹화 중...');
      const blob = await generateShorts(cardPngs, {
        layout,
        transition,
        subtitleTexts: slides.map((s) => s.headline),
        showSubtitle: false,
        onProgress: setProgress,
        onStatus: setStatus,
      });

      downloadBlob(blob, `shorts-${Date.now()}.webm`);
      setStatus('완료!');
    } catch (e: any) {
      setError(e.message || '영상 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProgress(0);
        setStatus('');
      }, 2000);
    }
  }

  if (slides.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <Film size={28} />
            </div>
            <div className="text-base font-semibold mb-1">카드뉴스가 필요합니다</div>
            <div className="text-sm text-ink-secondary">
              먼저 &quot;카드뉴스 만들기&quot;에서 카드뉴스를 생성해주세요
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <VideoLayoutPicker layout={layout} onChange={setLayout} />

        <Card>
          <CardHeader title="전환 효과" />
          <div className="flex gap-2">
            {(['fade', 'slide', 'zoom'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTransition(t)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                  transition === t
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-border hover:border-primary-300'
                }`}
              >
                {t === 'fade' ? '페이드' : t === 'slide' ? '슬라이드' : '줌'}
              </button>
            ))}
          </div>
        </Card>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="lg"
          className="w-full"
          loading={loading}
          icon={!loading && <Film size={18} />}
        >
          {loading ? status || '생성 중...' : '숏츠 영상 생성'}
        </Button>

        {loading && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-center text-ink-secondary">
              {progress}% — {status}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader title="영상 정보" />
          <div className="space-y-3 text-sm">
            <Row label="해상도" value="1080 × 1920" />
            <Row label="슬라이드" value={`${slides.length}장`} />
            <Row label="예상 길이" value={`약 ${Math.round(slides.length * 2.5)}초`} />
            <Row label="포맷" value="WebM" />
            <Row label="테마" value={preset.name} />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-primary-50 text-xs text-primary-700">
            💡 WebM은 유튜브/인스타 업로드 시 자동 변환됩니다. MP4가 필요하면 변환 사이트를 이용하세요.
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}