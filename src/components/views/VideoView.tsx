'use client';
import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VideoLayoutPicker } from '@/components/VideoLayoutPicker';
import { Modal } from '@/components/ui/Modal';
import { PhoneMockup } from '@/components/ui/PhoneMockup';
import { renderNodeToDataUrl } from '@/lib/card-renderer';
import { generateShorts, downloadBlob } from '@/lib/video-generator';
import type {
  Slide,
  Preset,
  VideoLayout,
  CardNewsProject,
  BrandInfo,
  UploadedBgm,
  LogoConfig,
} from '@/lib/types';
import { EMPTY_LOGO } from '@/lib/types';
import { BGM_SOURCES, BGM_CATEGORY_LABELS, getAudioDuration } from '@/lib/bgm';
import { formatRelativeTime } from '@/lib/utils';
import { getPresetById } from '@/presets';
import { CardSlide } from '@/templates';
import {
  Film,
  AlertCircle,
  Music,
  Image as ImageIcon,
  X,
  Play,
  Pause,
  RotateCcw,
  FolderOpen,
  Smartphone,
} from 'lucide-react';

export function VideoView({
  slides,
  preset,
  presetColorId,
  brand,
  cardRefs,
  projects,
  currentProjectId,
  onSelectProject,
}: {
  slides: Slide[];
  preset: Preset;
  presetColorId?: string;
  brand?: BrandInfo;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  projects: CardNewsProject[];
  currentProjectId: string | null;
  onSelectProject: (p: CardNewsProject) => void;
}) {
  const [layout, setLayout] = useState<VideoLayout>('split-news');
  const [transition, setTransition] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [bgm, setBgm] = useState<UploadedBgm | null>(null);
  const [bgmCategory, setBgmCategory] = useState<string>('all');
  const [logo, setLogo] = useState<LogoConfig>(EMPTY_LOGO);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [phoneMockupOpen, setPhoneMockupOpen] = useState(false);

  // 미리보기
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const previewRafRef = useRef<number>();
  const previewStartRef = useRef<number>(0);
  const [previewImages, setPreviewImages] = useState<HTMLImageElement[]>([]);

  // 슬라이드별 소요 시간 (TTS 없으므로 2.5초 고정)
  const SLIDE_DURATION_MS = 2500;
  const TRANSITION_MS = 400;

  // ─────────────────────────────────────────
  // 카드 이미지 로드 (실시간 미리보기용)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (slides.length === 0) return;
    let cancelled = false;

    async function loadImages() {
      const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (nodes.length === 0) return;
      const urls: string[] = [];
      for (const node of nodes) {
        try {
          const url = await renderNodeToDataUrl(node);
          urls.push(url);
        } catch (e) {
          console.warn('미리보기 카드 렌더 실패:', e);
        }
      }
      if (cancelled) return;
      const imgs = await Promise.all(
        urls.map(
          (src) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            })
        )
      );
      if (!cancelled) setPreviewImages(imgs);
    }

    const timer = setTimeout(loadImages, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slides, presetColorId, layout, cardRefs]);

  // ─────────────────────────────────────────
  // 미리보기 재생 루프
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!previewPlaying || previewImages.length === 0) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const W = canvas.width;
    const H = canvas.height;
    const TOP_RATIO = 0.42;

    const totalMs = previewImages.length * SLIDE_DURATION_MS;
    previewStartRef.current = performance.now();

    const drawTopCard = (img: HTMLImageElement, alpha = 1) => {
      const topH = H * TOP_RATIO;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, topH);
      const scale = Math.max(W / img.width, topH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (W - w) / 2, (topH - h) / 2, w, h);
      const grad = ctx.createLinearGradient(0, topH - 60, 0, topH);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, topH - 60, W, 60);
      ctx.restore();
    };

    const drawBottomArea = () => {
      const topH = H * TOP_RATIO;
      const grad = ctx.createLinearGradient(0, topH, 0, H);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, topH, W, H - topH);
    };

    const drawFullScreenCard = (img: HTMLImageElement, alpha: number, scale = 1) => {
      const cardH = H * 0.82;
      const fit = Math.min(cardH / img.height, (W * 0.9) / img.width) * scale;
      const w = img.width * fit;
      const h = img.height * fit;
      const x = (W - w) / 2;
      const y = (H - h) / 2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 20);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.clip();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    };

    const tick = () => {
      const elapsed = performance.now() - previewStartRef.current;
      if (elapsed >= totalMs) {
        // 루프
        previewStartRef.current = performance.now();
      }
      const e = performance.now() - previewStartRef.current;

      const slideIdx = Math.min(
        Math.floor(e / SLIDE_DURATION_MS),
        previewImages.length - 1
      );
      const slideElapsed = e - slideIdx * SLIDE_DURATION_MS;
      const slideProgress = slideElapsed / SLIDE_DURATION_MS;
      const isTransition =
        slideElapsed > SLIDE_DURATION_MS - TRANSITION_MS &&
        slideIdx < previewImages.length - 1;
      const nextIdx = Math.min(slideIdx + 1, previewImages.length - 1);

      setPreviewSlideIdx(slideIdx);

      if (layout === 'split-news') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        if (isTransition) {
          const t = (slideElapsed - (SLIDE_DURATION_MS - TRANSITION_MS)) / TRANSITION_MS;
          drawTopCard(previewImages[slideIdx], 1 - t);
          drawTopCard(previewImages[nextIdx], t);
        } else {
          drawTopCard(previewImages[slideIdx], 1);
        }
        drawBottomArea();
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        if (isTransition) {
          const t = (slideElapsed - (SLIDE_DURATION_MS - TRANSITION_MS)) / TRANSITION_MS;
          if (transition === 'fade') {
            drawFullScreenCard(previewImages[slideIdx], 1 - t);
            drawFullScreenCard(previewImages[nextIdx], t);
          } else if (transition === 'slide') {
            drawFullScreenCard(previewImages[slideIdx], 1 - t);
            drawFullScreenCard(previewImages[nextIdx], t, 0.9 + t * 0.1);
          } else {
            drawFullScreenCard(previewImages[slideIdx], 1 - t, 1 - t * 0.15);
            drawFullScreenCard(previewImages[nextIdx], t, 0.85 + t * 0.15);
          }
        } else {
          const zoom = 1 + slideProgress * 0.04;
          drawFullScreenCard(previewImages[slideIdx], 1, zoom);
        }
      }

      previewRafRef.current = requestAnimationFrame(tick);
    };

    previewRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
    };
  }, [previewPlaying, previewImages, layout, transition]);

  // ─────────────────────────────────────────
  // 정지 상태일 때 첫 프레임 그리기
  // ─────────────────────────────────────────
  useEffect(() => {
    if (previewPlaying) return;
    const canvas = previewCanvasRef.current;
    if (!canvas || previewImages.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    const TOP_RATIO = 0.42;

    if (layout === 'split-news') {
      const img = previewImages[previewSlideIdx] || previewImages[0];
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      const topH = H * TOP_RATIO;
      const scale = Math.max(W / img.width, topH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (W - w) / 2, (topH - h) / 2, w, h);
      const grad = ctx.createLinearGradient(0, topH - 60, 0, topH);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, topH - 60, W, 60);

      const botGrad = ctx.createLinearGradient(0, topH, 0, H);
      botGrad.addColorStop(0, '#0f172a');
      botGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, topH, W, H - topH);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const img = previewImages[previewSlideIdx] || previewImages[0];
      const cardH = H * 0.82;
      const fit = Math.min(cardH / img.height, (W * 0.9) / img.width);
      const w = img.width * fit;
      const h = img.height * fit;
      const x = (W - w) / 2;
      const y = (H - h) / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 20);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.clip();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    }
  }, [previewImages, previewSlideIdx, previewPlaying, layout]);

  // ─────────────────────────────────────────
  // BGM 업로드
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // 로고 업로드
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // 영상 생성
  // ─────────────────────────────────────────
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
        bgm: bgm
          ? {
              file: bgm.file,
              volume: bgm.volume,
              fadeIn: bgm.fadeIn,
              fadeOut: bgm.fadeOut,
            }
          : undefined,
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

  // ─────────────────────────────────────────
  // 빈 상태
  // ─────────────────────────────────────────
  if (slides.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <Film size={28} />
            </div>
            <div className="text-base font-semibold mb-1">카드뉴스가 필요합니다</div>
            <div className="text-sm text-ink-secondary mb-6">
              먼저 &quot;카드뉴스 만들기&quot;에서 카드뉴스를 생성해주세요
            </div>
            {projects.length > 0 && (
              <Button
                variant="secondary"
                icon={<FolderOpen size={16} />}
                onClick={() => setProjectListOpen(true)}
              >
                저장된 카드뉴스 열기 ({projects.length})
              </Button>
            )}
          </div>
        </Card>

        <ProjectPickerModal
          open={projectListOpen}
          onClose={() => setProjectListOpen(false)}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelect={onSelectProject}
        />
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* 프로젝트 선택 바 */}
        <Card padding={false} className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Film size={16} className="text-primary-600" />
            <span className="text-sm font-medium">
              {currentProject?.name || '카드뉴스'}
            </span>
            <span className="text-xs text-ink-muted">({slides.length}장)</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon={<FolderOpen size={14} />}
            onClick={() => setProjectListOpen(true)}
            className="ml-auto"
          >
            다른 카드뉴스 ({projects.length})
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 좌측: 컨트롤 */}
          <div className="lg:col-span-7 space-y-4">
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

            {/* BGM */}
            <Card>
              <CardHeader
                title="🎵 배경음악"
                subtitle="무료 사이트에서 다운로드 후 업로드"
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
                      <div className="font-medium mb-1">
                        볼륨: {Math.round(bgm.volume * 100)}%
                      </div>
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
                      <div className="font-medium mb-1">
                        페이드 아웃: {bgm.fadeOut}s
                      </div>
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
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleBgmUpload}
                    />
                    <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50/30 transition">
                      <Music size={24} className="mx-auto text-ink-muted mb-2" />
                      <div className="text-sm font-medium">음원 파일 업로드</div>
                      <div className="text-xs text-ink-muted mt-1">mp3, wav, m4a 등</div>
                    </div>
                  </label>

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
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {(bgmCategory === 'all'
                        ? BGM_SOURCES
                        : BGM_SOURCES.filter((s) => s.category === bgmCategory)
                      ).map((track) => (
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

            {/* 로고 */}
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
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50/30 transition">
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

          {/* 우측: 실시간 미리보기 + 생성 */}
          <div className="lg:col-span-5 space-y-4">
            <Card padding={false} className="sticky top-20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">📱 실시간 미리보기</div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Smartphone size={14} />}
                  onClick={() => setPhoneMockupOpen(true)}
                >
                  폰 목업
                </Button>
              </div>

              <div className="flex justify-center bg-gray-900 rounded-xl overflow-hidden p-2">
                <canvas
                  ref={previewCanvasRef}
                  width={360}
                  height={640}
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    aspectRatio: '9 / 16',
                    borderRadius: 12,
                  }}
                />
              </div>

              {/* 재생 컨트롤 */}
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => setPreviewPlaying(!previewPlaying)}
                  disabled={previewImages.length === 0}
                  className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50"
                >
                  {previewPlaying ? <Pause size={18} /> : <Play size={18} fill="white" />}
                </button>
                <div className="text-xs text-ink-secondary">
                  {previewImages.length === 0
                    ? '로딩 중...'
                    : previewPlaying
                    ? `재생 중 ${previewSlideIdx + 1}/${previewImages.length}`
                    : `${previewSlideIdx + 1}/${previewImages.length} (일시정지)`}
                </div>
                <button
                  onClick={() => {
                    setPreviewPlaying(false);
                    setPreviewSlideIdx(0);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-surface-hover text-ink-secondary flex items-center justify-center"
                  title="처음으로"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </Card>

            <Card>
              <CardHeader title="영상 정보" />
              <div className="space-y-2.5 text-sm">
                <Row label="해상도" value="1080 × 1920" />
                <Row label="슬라이드" value={`${slides.length}장`} />
                <Row
                  label="예상 길이"
                  value={`약 ${Math.round((slides.length * 2.5) / 10) * 10}초`}
                />
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
              {loading ? status || '생성 중...' : '🎬 숏츠 영상 생성'}
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

      {/* 프로젝트 선택 모달 */}
      <ProjectPickerModal
        open={projectListOpen}
        onClose={() => setProjectListOpen(false)}
        projects={projects}
        currentProjectId={currentProjectId}
        onSelect={onSelectProject}
      />

      {/* 폰 목업 모달 */}
      <Modal
        open={phoneMockupOpen}
        onClose={() => setPhoneMockupOpen(false)}
        title="스마트폰에서 보기"
        maxWidth="md"
      >
        {slides[0] && (
          <PhoneMockup
            slide={slides[0]}
            preset={preset}
            colorId={presetColorId}
            brand={brand}
            isLast={false}
          />
        )}
      </Modal>
    </>
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

// ─────────────────────────────────────────
// 프로젝트 선택 모달
// ─────────────────────────────────────────
function ProjectPickerModal({
  open,
  onClose,
  projects,
  currentProjectId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  projects: CardNewsProject[];
  currentProjectId: string | null;
  onSelect: (p: CardNewsProject) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={`카드뉴스 선택 (${projects.length})`} maxWidth="lg">
      {projects.length === 0 ? (
        <div className="text-center py-8 text-sm text-ink-muted">
          저장된 카드뉴스가 없습니다
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {projects.map((p) => {
            const preset = getPresetById(p.presetId);
            const cover = p.slides[0];
            const isCurrent = currentProjectId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-border hover:border-primary-300 hover:bg-surface-hover'
                }`}
              >
                <div
                  className="shrink-0 rounded-lg overflow-hidden border bg-white"
                  style={{ width: 50, aspectRatio: '4 / 5' }}
                >
                  <div
                    style={{
                      width: 1080,
                      height: 1350,
                      transform: 'scale(0.046)',
                      transformOrigin: 'top left',
                    }}
                  >
                    {cover && (
                      <CardSlide
                        slide={cover}
                        preset={preset}
                        colorId={p.presetColorId}
                        brand={p.brand}
                        isLast={false}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded shrink-0">
                        현재
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {p.slides.length}장 · {formatRelativeTime(p.updatedAt)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}