import type { VideoStyle, VideoTransition } from './types';

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

export interface VideoOptions extends VideoStyle {
  width?: number;
  height?: number;
  fps?: number;
  subtitleTexts?: string[];
  bgm?: BgmOption;
  logo?: LogoOption;
  onProgress?: (pct: number) => void;
  onStatus?: (msg: string) => void;
}

export async function generateShorts(
  cardImageUrls: string[],
  options: VideoOptions
): Promise<Blob> {
  const {
    width = 1080,
    height = 1920,
    fps = 30,
    backgroundType = 'gradient',
    backgroundColor = '#000000',
    backgroundColorEnd = '#1a1a1a',
    cardPosition = 'center',
    cardScale = 0.85,
    transition = 'fade',
    transitionMs = 400,
    slideDurationMs = 2500,
    showSubtitle = false,
    subtitleColor = '#ffffff',
    subtitleBg = 'rgba(0,0,0,0.7)',
    showProgressBar = true,
    progressBarColor = '#8b5cf6',
    cardRadius = 32,
    cardShadow = true,
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

  // 오디오
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

  // MediaRecorder
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
    videoBitsPerSecond: 6_000_000,
    audioBitsPerSecond: 128_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const totalMs = images.length * slideDurationMs;
  const totalSec = totalMs / 1000;

  // 로고
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

  // ─────────────────────────────────
  // 배경
  // ─────────────────────────────────
  function drawBackground() {
    if (backgroundType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, backgroundColor);
      grad.addColorStop(1, backgroundColorEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundType === 'mesh') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      const r1 = ctx.createRadialGradient(
        width * 0.2, height * 0.2, 0,
        width * 0.2, height * 0.2, width * 0.7
      );
      r1.addColorStop(0, backgroundColorEnd + 'cc');
      r1.addColorStop(1, 'transparent');
      ctx.fillStyle = r1;
      ctx.fillRect(0, 0, width, height);
      const r2 = ctx.createRadialGradient(
        width * 0.8, height * 0.7, 0,
        width * 0.8, height * 0.7, width * 0.8
      );
      r2.addColorStop(0, backgroundColorEnd + '99');
      r2.addColorStop(1, 'transparent');
      ctx.fillStyle = r2;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function getCardRect(img: HTMLImageElement, scale: number = 1) {
    const targetH = height * cardScale * scale;
    const ratio = img.width / img.height;
    let w = targetH * ratio;
    let h = targetH;
    const maxW = width * 0.92;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    let y = 0;
    if (cardPosition === 'top') y = height * 0.08;
    else if (cardPosition === 'bottom') y = height - h - height * 0.08;
    else y = (height - h) / 2;
    const x = (width - w) / 2;
    return { x, y, w, h };
  }

  function drawCard(
    img: HTMLImageElement,
    alpha: number = 1,
    offsetX: number = 0,
    offsetY: number = 0,
    scale: number = 1,
    blurPx: number = 0
  ) {
    const rect = getCardRect(img, scale);
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const sw = rect.w * scale;
    const sh = rect.h * scale;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(offsetX, offsetY);
    if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`;

    if (cardShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 30;
    }

    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, cardRadius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (blurPx > 0) ctx.filter = 'none';

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, cardRadius);
    ctx.clip();
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.restore();
    ctx.restore();
  }

  function drawSubtitle(text: string, progress: number) {
    if (!text || !showSubtitle) return;
    const rect = getCardRect(images[0]);
    const centerY = rect.y + rect.h + 80;
    const finalY = Math.min(centerY, height - 140);

    ctx.save();
    ctx.font = '700 52px Pretendard, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const alpha = Math.min(1, Math.sin(Math.min(progress, 1) * Math.PI) * 1.5);
    ctx.globalAlpha = alpha;

    const metrics = ctx.measureText(text);
    const padX = 36;
    const padY = 22;
    const boxW = Math.min(metrics.width + padX * 2, width - 80);
    const boxH = 52 + padY * 2;

    ctx.fillStyle = subtitleBg;
    ctx.beginPath();
    ctx.roundRect((width - boxW) / 2, finalY - boxH / 2, boxW, boxH, 16);
    ctx.fill();

    ctx.fillStyle = subtitleColor;
    ctx.fillText(text, width / 2, finalY);
    ctx.restore();
  }

  function renderTransition(
    fromImg: HTMLImageElement,
    toImg: HTMLImageElement,
    t: number,
    type: VideoTransition
  ) {
    if (type === 'fade') {
      drawCard(fromImg, 1 - t);
      drawCard(toImg, t);
    } else if (type === 'slide') {
      drawCard(fromImg, 1, -t * width, 0);
      drawCard(toImg, 1, (1 - t) * width, 0);
    } else if (type === 'slide-up') {
      drawCard(fromImg, 1, 0, -t * height * 0.3);
      drawCard(toImg, 1, 0, (1 - t) * height * 0.3);
    } else if (type === 'zoom') {
      drawCard(fromImg, 1 - t, 0, 0, 1 - t * 0.15);
      drawCard(toImg, t, 0, 0, 0.85 + t * 0.15);
    } else if (type === 'blur') {
      drawCard(fromImg, 1 - t, 0, 0, 1, t * 15);
      drawCard(toImg, t, 0, 0, 1, (1 - t) * 15);
    }
  }

  function drawProgressBar(elapsed: number, slideIdx: number) {
    if (!showProgressBar) return;
    const progress = elapsed / totalMs;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, 0, width, 6);
    ctx.fillStyle = progressBarColor;
    ctx.fillRect(0, 0, width * progress, 6);

    const dotY = 34;
    const dotSpacing = 18;
    const startX = (width - (images.length - 1) * dotSpacing) / 2;
    for (let i = 0; i < images.length; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * dotSpacing, dotY, i === slideIdx ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i <= slideIdx ? progressBarColor : 'rgba(255,255,255,0.3)';
      ctx.fill();
    }
  }

  function drawLogo() {
    if (!logoImg || !logo) return;
    const pad = 60;
    const logoW = logo.size;
    const logoH = (logoImg.height / logoImg.width) * logoW;
    let x = 0;
    let y = 0;
    switch (logo.position) {
      case 'bottom-left': x = pad; y = height - pad - logoH; break;
      case 'bottom-right': x = width - pad - logoW; y = height - pad - logoH; break;
      case 'top-left': x = pad; y = pad; break;
      case 'top-right': x = width - pad - logoW; y = pad; break;
      case 'center': x = (width - logoW) / 2; y = (height - logoH) / 2; break;
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

  // 렌더 루프
  onStatus?.('영상 녹화 중...');
  await audioCtx.resume();

  if (bgmSource) {
    const startAt = audioCtx.currentTime;
    bgmSource.start(startAt);
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

      drawBackground();

      if (isTransition) {
        const t = (slideElapsed - (slideDurationMs - transitionMs)) / transitionMs;
        renderTransition(images[slideIdx], images[nextIdx], t, transition);
      } else {
        drawCard(images[slideIdx], 1);
      }

      drawSubtitle(subtitleTexts[slideIdx] || '', slideProgress);

      if (shouldShowLogoAt(elapsed)) drawLogo();

      drawProgressBar(elapsed, slideIdx);

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