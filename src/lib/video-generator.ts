import type { VideoStyle, VideoTransition, TextAnimation } from './types';

export interface BgmOption {
  file: File;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface VideoOptions extends VideoStyle {
  width?: number;
  height?: number;
  fps?: number;
  bgm?: BgmOption;
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
    transition = 'fade',
    transitionMs = 400,
    slideDurationMs = 2500,
    textAnimation = 'fade-in',
    bgm,
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

  function getCardRect(img: HTMLImageElement, extraScale: number = 1) {
    const maxW = width * 0.9;
    const maxH = height * 0.75;
    const ratio = img.width / img.height;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    w *= extraScale;
    h *= extraScale;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
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
    const cx = rect.x + rect.w / 2 + offsetX;
    const cy = rect.y + rect.h / 2 + offsetY;
    const sw = rect.w;
    const sh = rect.h;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;

    const radius = 24;
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, radius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (blurPx > 0) ctx.filter = 'none';

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, radius);
    ctx.clip();
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.restore();

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
      drawCard(fromImg, 1, 0, -t * height * 0.5);
      drawCard(toImg, 1, 0, (1 - t) * height * 0.5);
    } else if (type === 'zoom') {
      drawCard(fromImg, 1 - t, 0, 0, 1 + t * 0.15);
      drawCard(toImg, t, 0, 0, 0.85 + t * 0.15);
    } else if (type === 'blur') {
      drawCard(fromImg, 1 - t, 0, 0, 1, t * 20);
      drawCard(toImg, t, 0, 0, 1, (1 - t) * 20);
    }
  }

  function applyTextAnimation(
    img: HTMLImageElement,
    slideProgress: number,
    animation: TextAnimation
  ) {
    const t = Math.min(slideProgress * 2, 1);
    if (animation === 'none') {
      drawCard(img, 1);
    } else if (animation === 'fade-in') {
      drawCard(img, t);
    } else if (animation === 'slide-up') {
      drawCard(img, Math.min(t * 1.5, 1), 0, (1 - t) * 80);
    } else if (animation === 'slide-down') {
      drawCard(img, Math.min(t * 1.5, 1), 0, -(1 - t) * 80);
    } else if (animation === 'slide-left') {
      drawCard(img, Math.min(t * 1.5, 1), (1 - t) * 120, 0);
    } else if (animation === 'slide-right') {
      drawCard(img, Math.min(t * 1.5, 1), -(1 - t) * 120, 0);
    } else if (animation === 'zoom-in') {
      drawCard(img, Math.min(t * 1.5, 1), 0, 0, 0.85 + t * 0.15);
    } else {
      drawCard(img, 1);
    }
  }

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

      const slideIdx = Math.min(
        Math.floor(elapsed / slideDurationMs),
        images.length - 1
      );
      const slideElapsed = elapsed - slideIdx * slideDurationMs;
      const slideProgress = slideElapsed / slideDurationMs;
      const isTransition =
        slideElapsed > slideDurationMs - transitionMs && slideIdx < images.length - 1;
      const nextIdx = Math.min(slideIdx + 1, images.length - 1);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      if (isTransition) {
        const t = (slideElapsed - (slideDurationMs - transitionMs)) / transitionMs;
        renderTransition(images[slideIdx], images[nextIdx], t, transition);
      } else {
        applyTextAnimation(images[slideIdx], slideProgress, textAnimation);
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