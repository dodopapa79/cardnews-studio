import type { VideoLayout } from './types';

export interface BgmOption {
  file: File;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface LogoOption {
  imageUrl: string;
  position: 'bottom-left' | 'bottom-right' | 'center' | 'top-left' | 'top-right';
  frame: 'first' | 'last' | 'both';
  size: number;
  opacity: number;
}

export interface VideoOptions {
  width?: number;
  height?: number;
  fps?: number;
  slideDurationMs?: number;
  transitionMs?: number;
  transition?: 'fade' | 'slide' | 'zoom';
  layout?: VideoLayout;
  showProgressBar?: boolean;
  showSubtitle?: boolean;
  subtitleTexts?: string[];
  bgm?: BgmOption;
  logo?: LogoOption;
  onProgress?: (pct: number) => void;
  onStatus?: (msg: string) => void;
}

export async function generateShorts(
  cardImageUrls: string[],
  options: VideoOptions = {}
): Promise<Blob> {
  const {
    width = 1080,
    height = 1920,
    fps = 30,
    slideDurationMs = 2500,
    transitionMs = 400,
    transition = 'fade',
    layout = 'split-news',
    showProgressBar = true,
    showSubtitle = false,
    subtitleTexts = [],
    bgm,
    logo,
    onProgress,
    onStatus,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  onStatus?.('이미지 준비 중...');
  const images = await Promise.all(
    cardImageUrls.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('이미지 로드 실패'));
          img.src = src;
        })
    )
  );

  // ─────────────────────────────────────────
  // 오디오 세팅
  // ─────────────────────────────────────────
  const audioCtx = new AudioContext();
  const audioDest = audioCtx.createMediaStreamDestination();
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioDest);

  let bgmSource: AudioBufferSourceNode | null = null;
  let bgmGain: GainNode | null = null;

  if (bgm?.file) {
    try {
      const arrayBuffer = await bgm.file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      bgmGain = audioCtx.createGain();
      bgmGain.gain.value = bgm.volume;
      bgmGain.connect(masterGain);

      bgmSource = audioCtx.createBufferSource();
      bgmSource.buffer = audioBuffer;
      bgmSource.loop = true;
      bgmSource.connect(bgmGain);
    } catch (e) {
      console.warn('BGM 로드 실패:', e);
    }
  }

  // ─────────────────────────────────────────
  // MediaRecorder
  // ─────────────────────────────────────────
  const canvasStream = canvas.captureStream(fps);
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  tracks.push(...audioDest.stream.getAudioTracks());
  const mixedStream = new MediaStream(tracks);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(mixedStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
    audioBitsPerSecond: 128_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const TOP_RATIO = 0.42;
  const BOTTOM_RATIO = 0.58;
  const totalMs = images.length * slideDurationMs;
  const totalSec = totalMs / 1000;

  // ─────────────────────────────────────────
  // 로고 프리로드
  // ─────────────────────────────────────────
  let logoImg: HTMLImageElement | null = null;
  if (logo?.imageUrl) {
    try {
      logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = logo.imageUrl;
      });
    } catch {
      console.warn('로고 로드 실패');
    }
  }

  // ─────────────────────────────────────────
  // 그리기 헬퍼
  // ─────────────────────────────────────────
  function drawFullScreenCard(img: HTMLImageElement, alpha: number, scale = 1, offsetX = 0) {
    const cardH = height * 0.82;
    const scaleFit = Math.min(cardH / img.height, (width * 0.9) / img.width) * scale;
    const w = img.width * scaleFit;
    const h = img.height * scaleFit;
    const x = (width - w) / 2 + offsetX;
    const y = (height - h) / 2;

    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawTopCard(img: HTMLImageElement, alpha = 1) {
    const topH = height * TOP_RATIO;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, topH);

    const scale = Math.max(width / img.width, topH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (width - w) / 2;
    const y = (topH - h) / 2;
    ctx.drawImage(img, x, y, w, h);

    const grad = ctx.createLinearGradient(0, topH - 150, 0, topH);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, topH - 150, width, 150);
    ctx.restore();
  }

  function drawBottomArea(alpha = 1) {
    const topH = height * TOP_RATIO;
    const botH = height * BOTTOM_RATIO;
    ctx.save();
    ctx.globalAlpha = alpha;
    const grad = ctx.createLinearGradient(0, topH, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, topH, width, botH);
    ctx.restore();
  }

  function drawSubtitle(text: string, slideProgress: number) {
    if (!text) return;
    const topH = height * TOP_RATIO;
    const botH = height * BOTTOM_RATIO;
    const centerY = topH + botH * 0.82;

    ctx.save();
    ctx.font = '700 52px Pretendard, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const alpha = Math.min(1, Math.sin(Math.min(slideProgress, 1) * Math.PI) * 1.5);
    ctx.globalAlpha = alpha;

    const metrics = ctx.measureText(text);
    const padX = 36;
    const padY = 22;
    const boxW = Math.min(metrics.width + padX * 2, width - 80);
    const boxH = 52 + padY * 2;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    ctx.roundRect((width - boxW) / 2, centerY - boxH / 2, boxW, boxH, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, width / 2, centerY);
    ctx.restore();
  }

  function drawLogo() {
    if (!logoImg || !logo) return;
    const pad = 60;
    const logoW = logo.size;
    const logoH = (logoImg.height / logoImg.width) * logoW;

    let x = 0;
    let y = 0;

    switch (logo.position) {
      case 'bottom-left':
        x = pad;
        y = height - pad - logoH;
        break;
      case 'bottom-right':
        x = width - pad - logoW;
        y = height - pad - logoH;
        break;
      case 'top-left':
        x = pad;
        y = pad;
        break;
      case 'top-right':
        x = width - pad - logoW;
        y = pad;
        break;
      case 'center':
        x = (width - logoW) / 2;
        y = (height - logoH) / 2;
        break;
    }

    ctx.save();
    ctx.globalAlpha = logo.opacity;
    ctx.drawImage(logoImg, x, y, logoW, logoH);
    ctx.restore();
  }

  const shouldShowLogoAt = (elapsed: number) => {
    if (!logo || !logoImg) return false;
    const showFirst = logo.frame === 'first' || logo.frame === 'both';
    const showLast = logo.frame === 'last' || logo.frame === 'both';
    if (showFirst && elapsed < 2000) return true;
    if (showLast && elapsed > totalMs - 2000) return true;
    return false;
  };

  // ─────────────────────────────────────────
  // 렌더 루프
  // ─────────────────────────────────────────
  onStatus?.('영상 녹화 중...');
  await audioCtx.resume();

  if (bgmSource) {
    const startAt = audioCtx.currentTime;
    bgmSource.start(startAt);

    // 페이드 인/아웃
    if (bgmGain && bgm) {
      const fadeIn = Math.min(bgm.fadeIn, totalSec / 2);
      const fadeOut = Math.min(bgm.fadeOut, totalSec / 2);
      bgmGain.gain.setValueAtTime(0, startAt);
      bgmGain.gain.linearRampToValueAtTime(bgm.volume, startAt + fadeIn);
      bgmGain.gain.setValueAtTime(bgm.volume, startAt + totalSec - fadeOut);
      bgmGain.gain.linearRampToValueAtTime(0, startAt + totalSec);
    }
  }

  recorder.start();
  const startWallTime = performance.now();

  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - startWallTime;
      if (elapsed >= totalMs) {
        resolve();
        return;
      }

      const slideIdx = Math.min(Math.floor(elapsed / slideDurationMs), images.length - 1);
      const slideElapsed = elapsed - slideIdx * slideDurationMs;
      const slideProgress = slideElapsed / slideDurationMs;
      const isTransition =
        slideElapsed > slideDurationMs - transitionMs && slideIdx < images.length - 1;
      const nextIdx = Math.min(slideIdx + 1, images.length - 1);

      if (layout === 'split-news') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        if (isTransition) {
          const t = (slideElapsed - (slideDurationMs - transitionMs)) / transitionMs;
          drawTopCard(images[slideIdx], 1 - t);
          drawTopCard(images[nextIdx], t);
          drawBottomArea(1);
        } else {
          drawTopCard(images[slideIdx], 1);
          drawBottomArea(1);
        }

        if (showSubtitle && subtitleTexts[slideIdx]) {
          drawSubtitle(subtitleTexts[slideIdx], slideProgress);
        }
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        if (isTransition) {
          const t = (slideElapsed - (slideDurationMs - transitionMs)) / transitionMs;
          if (transition === 'fade') {
            drawFullScreenCard(images[slideIdx], 1 - t);
            drawFullScreenCard(images[nextIdx], t);
          } else if (transition === 'slide') {
            drawFullScreenCard(images[slideIdx], 1, 1, -t * width);
            drawFullScreenCard(images[nextIdx], 1, 1, (1 - t) * width);
          } else {
            drawFullScreenCard(images[slideIdx], 1 - t, 1 - t * 0.15);
            drawFullScreenCard(images[nextIdx], t, 0.85 + t * 0.15);
          }
        } else {
          const zoom = 1 + slideProgress * 0.04;
          drawFullScreenCard(images[slideIdx], 1, zoom);
        }
      }

      // 로고
      if (shouldShowLogoAt(elapsed)) {
        drawLogo();
      }

      // 진행 바
      if (showProgressBar) {
        const progress = elapsed / totalMs;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(0, 0, width, 6);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(0, 0, width * progress, 6);

        const dotY = 34;
        const dotSpacing = 18;
        const startX = (width - (images.length - 1) * dotSpacing) / 2;
        for (let i = 0; i < images.length; i++) {
          ctx.beginPath();
          ctx.arc(startX + i * dotSpacing, dotY, i === slideIdx ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = i <= slideIdx ? '#8b5cf6' : 'rgba(255,255,255,0.3)';
          ctx.fill();
        }
      }

      onProgress?.(Math.min(100, Math.round((elapsed / totalMs) * 100)));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  recorder.stop();
  await new Promise<void>((r) => (recorder.onstop = () => r()));

  try {
    bgmSource?.stop();
    await audioCtx.close();
  } catch {}

  return new Blob(chunks, { type: 'video/webm' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}