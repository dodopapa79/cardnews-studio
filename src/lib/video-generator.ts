import type { VideoLayout } from './types';

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

  const canvasStream = canvas.captureStream(fps);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const TOP_RATIO = 0.42;
  const BOTTOM_RATIO = 0.58;
  const totalMs = images.length * slideDurationMs;
  const startWallTime = performance.now();

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

  onStatus?.('영상 녹화 중...');
  recorder.start();

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