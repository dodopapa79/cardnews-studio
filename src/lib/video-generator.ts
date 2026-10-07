import { decodeToAudioBuffer } from './tts';
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
  audioBuffers?: ArrayBuffer[];
  minSlideDurationMs?: number;
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
    audioBuffers = [],
    minSlideDurationMs = 1500,
    onProgress,
    onStatus,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // ── 이미지 프리로드
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

  // ── 오디오 그래프
  const audioCtx = new AudioContext();
  const hasAudio =
    audioBuffers.length > 0 && audioBuffers.some((b) => b && b.byteLength > 0);

  const audioDest = audioCtx.createMediaStreamDestination();
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(audioDest);
  masterGain.connect(audioCtx.destination);

  // ── 오디오 디코딩 및 슬라이드 길이 계산
  const decodedAudios: (AudioBuffer | null)[] = [];
  const slideDurations: number[] = [];

  for (let i = 0; i < images.length; i++) {
    const raw = audioBuffers[i];
    if (hasAudio && raw && raw.byteLength > 0) {
      try {
        const decoded = await decodeToAudioBuffer(audioCtx, raw);
        decodedAudios.push(decoded);
        slideDurations.push(
          Math.max(minSlideDurationMs, decoded.duration * 1000 + 500)
        );
      } catch {
        decodedAudios.push(null);
        slideDurations.push(slideDurationMs);
      }
    } else {
      decodedAudios.push(null);
      slideDurations.push(slideDurationMs);
    }
  }
  const totalMs = slideDurations.reduce((a, b) => a + b, 0);

  // ── 오디오 소스 예약
  if (hasAudio) {
    await audioCtx.resume();
    let offsetMs = 0;
    for (let i = 0; i < decodedAudios.length; i++) {
      const decoded = decodedAudios[i];
      if (decoded) {
        const src = audioCtx.createBufferSource();
        src.buffer = decoded;
        src.connect(masterGain);
        src.start(audioCtx.currentTime + offsetMs / 1000);
      }
      offsetMs += slideDurations[i];
    }
  }

  // ── MediaRecorder 준비
  const canvasStream = canvas.captureStream(fps);
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (hasAudio) tracks.push(...audioDest.stream.getAudioTracks());
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

  // ── 그리기 헬퍼
  function drawFullScreenCard(img: HTMLImageElement, alpha: number, scale = 1, offsetX = 0) {
    const cardH = height * 0.82;
    const scaleFit = Math.min((height * 0.82) / img.height, width / img.width) * scale;
    const w = img.width * scaleFit;
    const h = img.height * scaleFit;
    const x = (width - w) / 2 + offsetX;
    const y = (height - cardH) / 2 - 20;

    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
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

    const grad = ctx.createLinearGradient(0, topH - 120, 0, topH);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, topH - 120, width, 120);
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

  function drawSubtitle(text: string, progress: number) {
    if (!text) return;
    const topH = height * TOP_RATIO;
    const botH = height * BOTTOM_RATIO;
    const centerY = topH + botH * 0.82;

    ctx.save();
    ctx.font = '700 48px Pretendard, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const alpha = Math.min(1, Math.sin(Math.min(progress, 1) * Math.PI) * 1.5);
    ctx.globalAlpha = alpha;

    const metrics = ctx.measureText(text);
    const padX = 32;
    const padY = 18;
    const boxW = Math.min(metrics.width + padX * 2, width - 80);
    const boxH = 48 + padY * 2;

    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.beginPath();
    ctx.roundRect((width - boxW) / 2, centerY - boxH / 2, boxW, boxH, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, width / 2, centerY);
    ctx.restore();
  }

  function getSlideIdx(elapsed: number): number {
    let acc = 0;
    for (let i = 0; i < slideDurations.length; i++) {
      acc += slideDurations[i];
      if (elapsed < acc) return i;
    }
    return slideDurations.length - 1;
  }

  function getSlideElapsed(elapsed: number, idx: number): number {
    let acc = 0;
    for (let i = 0; i < idx; i++) acc += slideDurations[i];
    return elapsed - acc;
  }

  // ── 렌더 루프
  onStatus?.('영상 녹화 중...');
  recorder.start();
  const startWallTime = performance.now();

  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - startWallTime;
      if (elapsed >= totalMs) {
        resolve();
        return;
      }

      const slideIdx = getSlideIdx(elapsed);
      const slideElapsed = getSlideElapsed(elapsed, slideIdx);
      const slideDur = slideDurations[slideIdx];
      const slideProgress = slideElapsed / slideDur;
      const isTransition =
        slideElapsed > slideDur - transitionMs && slideIdx < images.length - 1;
      const nextIdx = Math.min(slideIdx + 1, images.length - 1);

      if (layout === 'split-news') {
        // 배경
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        if (isTransition) {
          const t = (slideElapsed - (slideDur - transitionMs)) / transitionMs;
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
        // full-screen
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        if (isTransition) {
          const t = (slideElapsed - (slideDur - transitionMs)) / transitionMs;
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

      // 진행 바
      if (showProgressBar) {
        const progress = elapsed / totalMs;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(0, 0, width, 6);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, 0, width * progress, 6);

        const dotY = 34;
        const dotSpacing = 18;
        const startX = (width - (images.length - 1) * dotSpacing) / 2;
        for (let i = 0; i < images.length; i++) {
          ctx.beginPath();
          ctx.arc(startX + i * dotSpacing, dotY, i === slideIdx ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = i <= slideIdx ? '#3b82f6' : 'rgba(255,255,255,0.3)';
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