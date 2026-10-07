'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { VideoLayoutPicker } from '@/components/VideoLayoutPicker';
import { renderNodeToDataUrl } from '@/lib/card-renderer';
import { generateShorts, downloadBlob } from '@/lib/video-generator';
import type { Slide, Preset, VideoLayout } from '@/lib/types';
import { Film, AlertCircle, Music, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UploadedBgm, LogoConfig, EMPTY_LOGO } from '@/lib/types';
import { BGM_SOURCES, BGM_CATEGORY_LABELS, getAudioDuration } from '@/lib/bgm';

export function VideoView({
  slides,
  preset,
  presetColorId,
  cardRefs,
}: {
  slides: Slide[];
  preset: Preset;
  presetColorId?: string;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const [layout, setLayout] = useState<VideoLayout>('split-news');
  const [transition, setTransition] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // BGM
  const [bgm, setBgm] = useState<UploadedBgm | null>(null);
  const [bgmCategory, setBgmCategory] = useState<string>('all');

  // 로고
  const [logo, setLogo] = useState<LogoConfig>(EMPTY_LOGO);

  async function handleBgmUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      alert('오디오 파일만 업로드할 수 있습니다.');
      return;
    }
    try {
      await getAudioDuration(file);
      setBgm({
        fileName: file.name,
        fileType: file.type,
        file,
        volume: 0.3,
        fadeIn: 1,
        fadeOut: 1.5,
      });
    } catch {
      alert('오디오 파일을 읽을 수 없습니다.');
    }
    e.target.value = '';
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

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
        bgm: bgm ? { file: bgm.file, volume: bgm.volume, fadeIn: bgm.fadeIn, fadeOut: bgm.fadeOut } : undefined,
        logo: logo.imageUrl ? logo : undefined,
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

  const filteredBgmSources =
    bgmCategory === 'all'
      ? BGM_SOURCES
      : BGM_SOURCES.filter((s) => s.category === bgmCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* 편집기 + 미리보기 2컬럼 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 좌: 편집 컨트롤 */}
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

          {/* BGM 섹션 */}
          <Card>
            <CardHeader
              title="🎵 배경음악"
              subtitle="무료 음원 사이트에서 다운로드 후 업로드하세요"
            />

            {bgm ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 border border-primary-200">
                  <Music size={20} className="text-primary-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{bgm.fileName}</div>
                    <div className="text-xs text-ink-muted">업로드됨</div>
                  </div>
                  <button
                    onClick={() => setBgm(null)}
                    className="p-1.5 rounded text-primary-600 hover:bg-primary-100"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <label className="text-xs">
                    <div className="font-medium mb-1">볼륨: {Math.round(bgm.volume * 100)}%</div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={bgm.volume}
                      onChange={(e) =>
                        setBgm({ ...bgm, volume: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </label>
                  <label className="text-xs">
                    <div className="font-medium mb-1">페이드 인: {bgm.fadeIn}s</div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={bgm.fadeIn}
                      onChange={(e) =>
                        setBgm({ ...bgm, fadeIn: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </label>
                  <label className="text-xs">
                    <div className="font-medium mb-1">페이드 아웃: {bgm.fadeOut}s</div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={bgm.fadeOut}
                      onChange={(e) =>
                        setBgm({ ...bgm, fadeOut: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block">
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleBgmUpload}
                  />
                  <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition">
                    <Music size={24} className="mx-auto text-ink-muted mb-2" />
                    <div className="text-sm font-medium">음원 파일 업로드</div>
                    <div className="text-xs text-ink-muted mt-1">
                      mp3, wav, m4a 등
                    </div>
                  </div>
                </label>

                {/* 무료 음원 사이트 리스트 */}
                <div>
                  <div className="text-xs font-semibold text-ink-secondary mb-2">
                    무료 음원 사이트
                  </div>
                  <div className="flex gap-1 mb-2 flex-wrap">
                    <button
                      onClick={() => setBgmCategory('all')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        bgmCategory === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      전체
                    </button>
                    {Object.entries(BGM_CATEGORY_LABELS).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => setBgmCategory(k)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                          bgmCategory === k
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {filteredBgmSources.map((track) => (
                      <a
                        key={track.id}
                        href={track.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-surface-border hover:border-primary-400 hover:bg-primary-50/30 transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                          <Music size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {track.name}
                          </div>
                          <div className="text-[10px] text-ink-muted">
                            {track.source} · {BGM_CATEGORY_LABELS[track.category]}
                          </div>
                        </div>
                        <div className="text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition">
                          열기 →
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 로고 섹션 */}
          <Card>
            <CardHeader
              title="🏷 로고 / 도메인"
              subtitle="첫 프레임 또는 마지막 프레임에 삽입"
            />

            {logo.imageUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 border border-primary-200">
                  <img
                    src={logo.imageUrl}
                    alt="logo"
                    className="w-12 h-12 object-contain bg-white rounded"
                  />
                  <div className="flex-1 text-sm font-medium">로고 준비됨</div>
                  <button
                    onClick={() => setLogo(EMPTY_LOGO)}
                    className="p-1.5 rounded text-primary-600 hover:bg-primary-100"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label>
                    <div className="font-medium mb-1">표시 위치</div>
                    <select
                      value={logo.frame}
                      onChange={(e) =>
                        setLogo({ ...logo, frame: e.target.value as any })
                      }
                      className="w-full border rounded px-2 py-1.5"
                    >
                      <option value="first">첫 프레임</option>
                      <option value="last">마지막 프레임</option>
                      <option value="both">양쪽 다</option>
                    </select>
                  </label>
                  <label>
                    <div className="font-medium mb-1">화면 위치</div>
                    <select
                      value={logo.position}
                      onChange={(e) =>
                        setLogo({ ...logo, position: e.target.value as any })
                      }
                      className="w-full border rounded px-2 py-1.5"
                    >
                      <option value="bottom-right">우측 하단</option>
                      <option value="bottom-left">좌측 하단</option>
                      <option value="top-right">우측 상단</option>
                      <option value="top-left">좌측 상단</option>
                      <option value="center">중앙</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label>
                    <div className="font-medium mb-1">크기: {logo.size}px</div>
                    <input
                      type="range"
                      min={80}
                      max={500}
                      step={10}
                      value={logo.size}
                      onChange={(e) =>
                        setLogo({ ...logo, size: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </label>
                  <label>
                    <div className="font-medium mb-1">
                      투명도: {Math.round(logo.opacity * 100)}%
                    </div>
                    <input
                      type="range"
                      min={0.3}
                      max={1}
                      step={0.05}
                      value={logo.opacity}
                      onChange={(e) =>
                        setLogo({ ...logo, opacity: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition">
                  <ImageIcon size={24} className="mx-auto text-ink-muted mb-2" />
                  <div className="text-sm font-medium">로고 이미지 업로드</div>
                  <div className="text-xs text-ink-muted mt-1">
                    PNG, SVG 권장 (투명 배경)
                  </div>
                </div>
              </label>
            )}
          </Card>
        </div>

        {/* 우: 영상 정보 + 생성 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader title="영상 정보" />
            <div className="space-y-2.5 text-sm">
              <Row label="해상도" value="1080 × 1920" />
              <Row label="슬라이드" value={`${slides.length}장`} />
              <Row label="예상 길이" value={`약 ${Math.round(slides.length * 2.5)}초`} />
              <Row label="포맷" value="WebM" />
              <Row label="테마" value={preset.name} />
              {bgm && <Row label="배경음악" value="포함" />}
              {logo.imageUrl && <Row label="로고" value="포함" />}
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