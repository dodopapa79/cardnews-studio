'use client';
import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PhoneMockup } from '@/components/ui/PhoneMockup';
import { renderNodeToDataUrl } from '@/lib/card-renderer';
import { generateShorts, downloadBlob } from '@/lib/video-generator';
import { getPresetById } from '@/presets';
import { CardSlide } from '@/templates';
import { BGM_SOURCES, BGM_CATEGORY_LABELS, getAudioDuration } from '@/lib/bgm';
import type {
  Slide,
  Preset,
  CardNewsProject,
  BrandInfo,
  UploadedBgm,
  VideoStyle,
  VideoTransition,
  TextAnimation,
} from '@/lib/types';
import { DEFAULT_VIDEO_STYLE } from '@/lib/types';
import {
  Film,
  AlertCircle,
  Music,
  X,
  Play,
  Pause,
  RotateCcw,
  FolderOpen,
  Smartphone,
  Check,
  Loader2,
} from 'lucide-react';

const TRANSITIONS: { id: VideoTransition; name: string }[] = [
  { id: 'fade', name: '페이드' },
  { id: 'slide', name: '슬라이드' },
  { id: 'slide-up', name: '슬라이드업' },
  { id: 'zoom', name: '줌' },
  { id: 'blur', name: '블러' },
];

const TEXT_ANIMS: { id: TextAnimation; name: string }[] = [
  { id: 'none', name: '없음' },
  { id: 'fade-in', name: '페이드인' },
  { id: 'slide-up', name: '위로' },
  { id: 'slide-down', name: '아래로' },
  { id: 'slide-left', name: '좌측' },
  { id: 'slide-right', name: '우측' },
  { id: 'zoom-in', name: '줌인' },
];

export function VideoView({
  slides: currentSlides,
  preset: currentPreset,
  presetColorId: currentColorId,
  brand: currentBrand,
  projects,
  currentProjectId,
  onSelectProject,
}: {
  slides: Slide[];
  preset: Preset;
  presetColorId?: string;
  brand?: BrandInfo;
  projects: CardNewsProject[];
  currentProjectId: string | null;
  onSelectProject: (p: CardNewsProject) => void;
}) {
  const [selectedSlides, setSelectedSlides] = useState<Slide[]>(currentSlides);
  const [selectedPreset, setSelectedPreset] = useState<Preset>(currentPreset);
  const [selectedColorId, setSelectedColorId] = useState<string>(
    currentColorId || currentPreset.colorVariants[0]?.id || ''
  );
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | undefined>(currentBrand);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(currentProjectId);

  const [videoStyle, setVideoStyle] = useState<VideoStyle>(DEFAULT_VIDEO_STYLE);

  const localCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [bgm, setBgm] = useState<UploadedBgm | null>(null);
  const [bgmCategory, setBgmCategory] = useState<string>('all');
  const [phoneMockupOpen, setPhoneMockupOpen] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const previewRafRef = useRef<number>();
  const previewStartRef = useRef<number>(0);
  const [previewImages, setPreviewImages] = useState<HTMLImageElement[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const updateVideo = (patch: Partial<VideoStyle>) => {
    setVideoStyle((prev) => ({ ...prev, ...patch }));
    setPreviewPlaying(false);
  };

  function loadFromProject(project: CardNewsProject) {
    const p = getPresetById(project.presetId);
    setSelectedSlides(project.slides);
    setSelectedPreset(p);
    setSelectedColorId(project.presetColorId || p.colorVariants[0]?.id || '');
    setSelectedBrand(project.brand);
    setSelectedProjectId(project.id);
    setPreviewPlaying(false);
  }

  useEffect(() => {
    if (currentProjectId) {
      const proj = projects.find((p) => p.id === currentProjectId);
      if (proj && proj.id !== selectedProjectId) loadFromProject(proj);
    } else if (currentSlides.length > 0 && selectedSlides.length === 0) {
      setSelectedSlides(currentSlides);
      setSelectedPreset(currentPreset);
      setSelectedColorId(currentColorId || currentPreset.colorVariants[0]?.id || '');
      setSelectedBrand(currentBrand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId, projects]);

  useEffect(() => {
    if (selectedSlides.length === 0) {
      setPreviewImages([]);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);

    async function loadImages() {
      await new Promise((r) => setTimeout(r, 400));
      const nodes = localCardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (nodes.length === 0) {
        setPreviewLoading(false);
        return;
      }
      const urls: string[] = [];
      for (const node of nodes) {
        try {
          const url = await renderNodeToDataUrl(node);
          urls.push(url);
        } catch (e) {
          console.warn('카드 렌더 실패:', e);
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
      if (!cancelled) {
        setPreviewImages(imgs);
        setPreviewLoading(false);
      }
    }
    loadImages();
    return () => {
      cancelled = true;
    };
  }, [selectedSlides, selectedColorId, selectedPreset.id]);

  function getPreviewCardRect(img: HTMLImageElement, W: number, H: number, extraScale = 1) {
    const maxW = W * 0.9;
    const maxH = H * 0.75;
    const ratio = img.width / img.height;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    w *= extraScale;
    h *= extraScale;
    const x = (W - w) / 2;
    const y = (H - h) / 2;
    return { x, y, w, h };
  }

  function drawPreviewCard(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    W: number,
    H: number,
    alpha: number = 1,
    offsetX = 0,
    offsetY = 0,
    scale = 1,
    blur = 0
  ) {
    const rect = getPreviewCardRect(img, W, H, scale);
    const cx = rect.x + rect.w / 2 + offsetX;
    const cy = rect.y + rect.h / 2 + offsetY;
    const sw = rect.w;
    const sh = rect.h;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (blur > 0) ctx.filter = `blur(${blur}px)`;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;

    const radius = 10;
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, radius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (blur > 0) ctx.filter = 'none';

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, radius);
    ctx.clip();
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.restore();

    ctx.restore();
  }

  function renderPreviewTransition(
    ctx: CanvasRenderingContext2D,
    fromImg: HTMLImageElement,
    toImg: HTMLImageElement,
    t: number,
    W: number,
    H: number,
    type: VideoTransition
  ) {
    if (type === 'fade') {
      drawPreviewCard(ctx, fromImg, W, H, 1 - t);
      drawPreviewCard(ctx, toImg, W, H, t);
    } else if (type === 'slide') {
      drawPreviewCard(ctx, fromImg, W, H, 1, -t * W, 0);
      drawPreviewCard(ctx, toImg, W, H, 1, (1 - t) * W, 0);
    } else if (type === 'slide-up') {
      drawPreviewCard(ctx, fromImg, W, H, 1, 0, -t * H * 0.5);
      drawPreviewCard(ctx, toImg, W, H, 1, 0, (1 - t) * H * 0.5);
    } else if (type === 'zoom') {
      drawPreviewCard(ctx, fromImg, W, H, 1 - t, 0, 0, 1 + t * 0.15);
      drawPreviewCard(ctx, toImg, W, H, t, 0, 0, 0.85 + t * 0.15);
    } else if (type === 'blur') {
      drawPreviewCard(ctx, fromImg, W, H, 1 - t, 0, 0, 1, t * 12);
      drawPreviewCard(ctx, toImg, W, H, t, 0, 0, 1, (1 - t) * 12);
    }
  }

  function applyPreviewTextAnimation(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    slideProgress: number,
    animation: TextAnimation,
    W: number,
    H: number
  ) {
    const t = Math.min(slideProgress * 2, 1);
    if (animation === 'none') {
      drawPreviewCard(ctx, img, W, H, 1);
    } else if (animation === 'fade-in') {
      drawPreviewCard(ctx, img, W, H, t);
    } else if (animation === 'slide-up') {
      drawPreviewCard(ctx, img, W, H, Math.min(t * 1.5, 1), 0, (1 - t) * 30);
    } else if (animation === 'slide-down') {
      drawPreviewCard(ctx, img, W, H, Math.min(t * 1.5, 1), 0, -(1 - t) * 30);
    } else if (animation === 'slide-left') {
      drawPreviewCard(ctx, img, W, H, Math.min(t * 1.5, 1), (1 - t) * 40, 0);
    } else if (animation === 'slide-right') {
      drawPreviewCard(ctx, img, W, H, Math.min(t * 1.5, 1), -(1 - t) * 40, 0);
    } else if (animation === 'zoom-in') {
      drawPreviewCard(ctx, img, W, H, Math.min(t * 1.5, 1), 0, 0, 0.85 + t * 0.15);
    } else {
      drawPreviewCard(ctx, img, W, H, 1);
    }
  }

  useEffect(() => {
    if (previewPlaying) return;
    const canvas = previewCanvasRef.current;
    if (!canvas || previewImages.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    const img = previewImages[previewSlideIdx] || previewImages[0];
    drawPreviewCard(ctx, img, W, H, 1);
  }, [previewImages, previewSlideIdx, previewPlaying]);

  useEffect(() => {
    if (!previewPlaying || previewImages.length === 0) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    const totalMs = previewImages.length * videoStyle.slideDurationMs;
    previewStartRef.current = performance.now();

    const tick = () => {
      const e = performance.now() - previewStartRef.current;
      if (e >= totalMs) {
        previewStartRef.current = performance.now();
        return;
      }
      const slideIdx = Math.min(
        Math.floor(e / videoStyle.slideDurationMs),
        previewImages.length - 1
      );
      const slideElapsed = e - slideIdx * videoStyle.slideDurationMs;
      const slideProgress = slideElapsed / videoStyle.slideDurationMs;
      const isTransition =
        slideElapsed > videoStyle.slideDurationMs - videoStyle.transitionMs &&
        slideIdx < previewImages.length - 1;
      const nextIdx = Math.min(slideIdx + 1, previewImages.length - 1);

      setPreviewSlideIdx(slideIdx);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      if (isTransition) {
        const t =
          (slideElapsed - (videoStyle.slideDurationMs - videoStyle.transitionMs)) /
          videoStyle.transitionMs;
        renderPreviewTransition(
          ctx,
          previewImages[slideIdx],
          previewImages[nextIdx],
          t,
          W,
          H,
          videoStyle.transition
        );
      } else {
        applyPreviewTextAnimation(
          ctx,
          previewImages[slideIdx],
          slideProgress,
          videoStyle.textAnimation,
          W,
          H
        );
      }

      previewRafRef.current = requestAnimationFrame(tick);
    };

    previewRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
    };
  }, [previewPlaying, previewImages, videoStyle]);

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

  async function handleGenerate() {
    const nodes = localCardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (nodes.length === 0) {
      setError('카드뉴스가 없습니다.');
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
        ...videoStyle,
        bgm: bgm
          ? {
              file: bgm.file,
              volume: bgm.volume,
              fadeIn: bgm.fadeIn,
              fadeOut: bgm.fadeOut,
            }
          : undefined,
        onProgress: setProgress,
        onStatus: setStatus,
      });

      downloadBlob(blob, `shorts-${Date.now()}.webm`);
      setStatus('완료!');
    } catch (e: any) {
      setError(e.message || '영상 생성 중 오류');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProgress(0);
        setStatus('');
      }, 2000);
    }
  }

  if (selectedSlides.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <Film size={28} />
            </div>
            <div className="text-base font-semibold mb-1">
              저장된 카드뉴스가 없습니다
            </div>
            <div className="text-sm text-ink-secondary">
              먼저 카드뉴스를 만들어주세요
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentProjectName = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)?.name
    : undefined;

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* 프로젝트 선택 가로 스크롤 */}
        <Card padding={false} className="p-3">
          <div className="flex items-center gap-3 mb-2 px-1">
            <FolderOpen size={14} className="text-primary-600" />
            <span className="text-sm font-semibold">카드뉴스 선택</span>
            <span className="text-xs text-ink-muted">({projects.length}개)</span>
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {projects.map((p) => {
              const preset = getPresetById(p.presetId);
              const cover = p.slides[0];
              const isCurrent = selectedProjectId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => loadFromProject(p)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all text-left ${
                    isCurrent
                      ? 'border-primary-500 shadow-md'
                      : 'border-surface-border hover:border-primary-300'
                  }`}
                  style={{ width: 90 }}
                >
                  <div
                    className="relative bg-white"
                    style={{
                      aspectRatio: p.cardSize === 'square' ? '1 / 1' : '4 / 5',
                    }}
                  >
                    <div
                      style={{
                        width: 1080,
                        height: p.cardSize === 'square' ? 1080 : 1350,
                        transform: 'scale(0.083)',
                        transformOrigin: 'top left',
                      }}
                    >
                      {cover && (
                        <CardSlide
                          slide={cover}
                          preset={preset}
                          colorId={p.presetColorId}
                          brand={p.brand}
                          width={1080}
                          height={p.cardSize === 'square' ? 1080 : 1350}
                          isLast={false}
                        />
                      )}
                    </div>
                    {isCurrent && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 bg-white">
                    <div className="text-[10px] font-semibold truncate">
                      {p.name}
                    </div>
                    <div className="text-[9px] text-ink-muted">
                      {p.slides.length}장
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-3">
            <Card>
              <CardHeader
                title="현재 카드뉴스"
                subtitle={currentProjectName || ''}
              />
              <div className="text-sm text-ink-secondary">
                {selectedSlides.length}장 · {selectedPreset.name}
              </div>
            </Card>

            <Card>
              <CardHeader title="🎬 전환 효과" />
              <div className="grid grid-cols-5 gap-2 mb-3">
                {TRANSITIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateVideo({ transition: t.id })}
                    className={`py-2.5 rounded-lg border text-xs font-medium transition ${
                      videoStyle.transition === t.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-surface-border hover:border-primary-300'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-ink-secondary">
                      전환 시간
                    </span>
                    <span className="text-ink-muted">
                      {videoStyle.transitionMs}ms
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={1000}
                    step={50}
                    value={videoStyle.transitionMs}
                    onChange={(e) =>
                      updateVideo({ transitionMs: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-ink-secondary">
                      슬라이드 시간
                    </span>
                    <span className="text-ink-muted">
                      {(videoStyle.slideDurationMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={5000}
                    step={100}
                    value={videoStyle.slideDurationMs}
                    onChange={(e) =>
                      updateVideo({ slideDurationMs: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="✨ 텍스트 등장 효과" />
              <div className="grid grid-cols-4 gap-2">
                {TEXT_ANIMS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateVideo({ textAnimation: t.id })}
                    className={`py-2 rounded-lg border text-xs font-medium transition ${
                      videoStyle.textAnimation === t.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-surface-border hover:border-primary-300'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </Card>

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
                      <div className="text-sm font-medium truncate">
                        {bgm.fileName}
                      </div>
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
                      <div className="font-medium mb-1">
                        페이드 인: {bgm.fadeIn}s
                      </div>
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
                    <div className="border-2 border-dashed border-surface-border rounded-lg p-5 text-center hover:border-primary-400 hover:bg-primary-50/30 transition">
                      <Music size={22} className="mx-auto text-ink-muted mb-2" />
                      <div className="text-sm font-medium">음원 파일 업로드</div>
                      <div className="text-xs text-ink-muted mt-1">
                        mp3, wav, m4a
                      </div>
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
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {(bgmCategory === 'all'
                        ? BGM_SOURCES
                        : BGM_SOURCES.filter((s) => s.category === bgmCategory)
                      ).map((track) => (
                        <a
                          key={track.id}
                          href={track.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border border-surface-border hover:border-primary-400 hover:bg-primary-50/30 transition group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                            <Music size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">
                              {track.name}
                            </div>
                            <div className="text-[10px] text-ink-muted">
                              {track.source} ·{' '}
                              {BGM_CATEGORY_LABELS[track.category]}
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
          </div>

          {/* 우측 미리보기 + 생성 */}
          <div className="lg:col-span-5 space-y-3">
            <Card padding={false} className="sticky top-20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">📱 미리보기</div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Smartphone size={14} />}
                  onClick={() => setPhoneMockupOpen(true)}
                >
                  폰
                </Button>
              </div>

              <div className="flex justify-center bg-black rounded-xl overflow-hidden p-2">
                <canvas
                  ref={previewCanvasRef}
                  width={360}
                  height={640}
                  style={{
                    width: '100%',
                    maxWidth: 280,
                    aspectRatio: '9 / 16',
                    borderRadius: 12,
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => {
                    if (previewImages.length === 0) return;
                    setPreviewPlaying(!previewPlaying);
                  }}
                  disabled={previewImages.length === 0 || previewLoading}
                  className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50"
                >
                  {previewLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : previewPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} fill="white" />
                  )}
                </button>
                <div className="text-xs text-ink-secondary">
                  {previewLoading
                    ? '로딩 중...'
                    : previewImages.length === 0
                    ? '준비 안 됨'
                    : previewPlaying
                    ? `${previewSlideIdx + 1}/${previewImages.length}`
                    : '플레이 버튼을 눌러주세요'}
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
              <div className="space-y-2 text-sm">
                <Row label="해상도" value="1080 × 1920" />
                <Row label="슬라이드" value={`${selectedSlides.length}장`} />
                <Row
                  label="예상 길이"
                  value={`약 ${Math.round(
                    (selectedSlides.length * videoStyle.slideDurationMs) / 1000
                  )}초`}
                />
                <Row label="포맷" value="WebM" />
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
              disabled={loading || previewImages.length === 0}
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

      <div
        style={{
          position: 'fixed',
          left: -99999,
          top: 0,
          pointerEvents: 'none',
          opacity: 0,
        }}
        aria-hidden="true"
      >
        {selectedSlides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => (localCardRefs.current[i] = el)}
            style={{ width: 1080, height: 1350 }}
          >
            <CardSlide
              slide={slide}
              preset={selectedPreset}
              colorId={selectedColorId}
              brand={selectedBrand}
              isLast={i === selectedSlides.length - 1}
            />
          </div>
        ))}
      </div>

      <Modal
        open={phoneMockupOpen}
        onClose={() => setPhoneMockupOpen(false)}
        title="스마트폰에서 보기"
        maxWidth="md"
      >
        {selectedSlides[0] && (
          <PhoneMockup
            slide={selectedSlides[0]}
            preset={selectedPreset}
            colorId={selectedColorId}
            brand={selectedBrand}
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