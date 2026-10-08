import type {
  VideoStyle,
  VideoTransition,
  TextAnimation,
  Slide,
  TextElementConfig,
} from './types';

export interface BgmOption {
  file: File;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface VideoOptions extends VideoStyle {
  slides: Slide[];
  width?: number;
  height?: number;
  fps?: number;
  bgm?: BgmOption;
  onProgress?: (pct: number) => void;
  onStatus?: (msg: string) => void;
}

// ─────────────────────────────────────────────
// 색상 밝기 판단
// ─────────────────────────────────────────────
function isDarkColor(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}

// ─────────────────────────────────────────────
// HEX + 투명도 → rgba
// ─────────────────────────────────────────────
function hexToRgba(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ─────────────────────────────────────────────
// 캔버스용 필터 문자열
// ─────────────────────────────────────────────
function buildImageFilter(bg: any): string {
  const parts: string[] = [];
  if (bg.imageBrightness !== undefined && bg.imageBrightness !== 100)
    parts.push(`brightness(${bg.imageBrightness}%)`);
  if (bg.imageContrast !== undefined && bg.imageContrast !== 100)
    parts.push(`contrast(${bg.imageContrast}%)`);
  if (bg.imageSaturation !== undefined && bg.imageSaturation !== 100)
    parts.push(`saturate(${bg.imageSaturation}%)`);
  if (bg.imageBlur !== undefined && bg.imageBlur > 0)
    parts.push(`blur(${bg.imageBlur}px)`);
  if (bg.imageGrayscale !== undefined && bg.imageGrayscale > 0)
    parts.push(`grayscale(${bg.imageGrayscale}%)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

// ─────────────────────────────────────────────
// 텍스트 애니메이션 값 계산
// ─────────────────────────────────────────────
function getAnimationProgress(
  elapsed: number,
  delay: number,
  duration: number
): number {
  if (elapsed < delay) return 0;
  if (elapsed > delay + duration) return 1;
  return (elapsed - delay) / duration;
}

interface AnimTransform {
  alpha: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

function applyAnimation(
  type: TextAnimation,
  progress: number
): AnimTransform {
  const t = progress;
  if (type === 'none' || t >= 1) {
    return { alpha: 1, offsetX: 0, offsetY: 0, scale: 1 };
  }
  switch (type) {
    case 'fade-in':
      return { alpha: t, offsetX: 0, offsetY: 0, scale: 1 };
    case 'slide-up':
      return { alpha: t, offsetX: 0, offsetY: (1 - t) * 60, scale: 1 };
    case 'slide-down':
      return { alpha: t, offsetX: 0, offsetY: -(1 - t) * 60, scale: 1 };
    case 'slide-left':
      return { alpha: t, offsetX: (1 - t) * 80, offsetY: 0, scale: 1 };
    case 'slide-right':
      return { alpha: t, offsetX: -(1 - t) * 80, offsetY: 0, scale: 1 };
    case 'zoom-in':
      return { alpha: t, offsetX: 0, offsetY: 0, scale: 0.85 + t * 0.15 };
    default:
      return { alpha: 1, offsetX: 0, offsetY: 0, scale: 1 };
  }
}

// ─────────────────────────────────────────────
// 텍스트 줄바꿈 (캔버스)
// ─────────────────────────────────────────────
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (!para) {
      lines.push('');
      continue;
    }
    // 한글은 단어 단위로 끊기 어려우므로 글자 단위로 계산
    let currentLine = '';
    const chars = para.split('');

    for (const char of chars) {
      const test = currentLine + char;
      const width = ctx.measureText(test).width;
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  return lines;
}

// ─────────────────────────────────────────────
// 단일 텍스트 요소 캔버스에 그리기
// ─────────────────────────────────────────────
interface DrawTextParams {
  ctx: CanvasRenderingContext2D;
  config: TextElementConfig;
  cardWidth: number;
  cardHeight: number;
  animationProgress: number;
  fontFamily: string;
  isDark: boolean;
}

function drawTextElement({
  ctx,
  config,
  cardWidth,
  cardHeight,
  animationProgress,
  fontFamily,
  isDark,
}: DrawTextParams) {
  if (config.visible === false) return;
  if (!config.content) return;

  // 애니메이션 변환
  const anim = applyAnimation(config.animation || 'none', animationProgress);
  if (anim.alpha <= 0) return;

  const fontSize = config.fontSize;
  const fontWeight = config.fontWeight;
  const color = config.color;

  const x = config.x * cardWidth;
  const y = config.y * cardHeight;
  const maxW = (config.maxWidth ?? 0.8) * cardWidth;

  ctx.save();
  ctx.globalAlpha = anim.alpha;

  // 폰트 설정
  ctx.font = `${config.italic ? 'italic ' : ''}${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  // 텍스트 색상
  ctx.fillStyle = color;

  // 줄바꿈
  const lines = wrapText(ctx, config.content, maxW);

  // 텍스트 총 높이 계산
  const lineHeightPx = fontSize * config.lineHeight;
  const totalHeight = lines.length * lineHeightPx;

  // 정렬에 따른 시작 X 좌표
  let startX = x;
  let textAlign: CanvasTextAlign = 'left';
  if (config.align === 'center') {
    startX = x;
    textAlign = 'center';
  } else if (config.align === 'right') {
    startX = x;
    textAlign = 'right';
  }

  // 애니메이션 오프셋
  ctx.translate(anim.offsetX, anim.offsetY);

  // 배경 박스 (있으면)
  if (config.background) {
    const bgColor = hexToRgba(
      config.background,
      config.backgroundOpacity ?? 1
    );
    const pad = config.padding ?? 16;
    const radius = config.borderRadius ?? 8;

    // 배경 박스 크기 계산
    let boxW = 0;
    lines.forEach((line) => {
      const w = ctx.measureText(line).width;
      if (w > boxW) boxW = w;
    });
    const boxH = totalHeight;

    let boxX = startX - pad;
    if (config.align === 'center') boxX = startX - boxW / 2 - pad;
    else if (config.align === 'right') boxX = startX - boxW - pad;

    const boxY = y - pad;

    // 라운드 사각형
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW + pad * 2, boxH + pad * 2, radius);
    ctx.fill();
  }

  // 텍스트 그리기
  ctx.textAlign = textAlign;
  ctx.fillStyle = color;

  lines.forEach((line, i) => {
    ctx.fillText(line, startX, y + i * lineHeightPx);
  });

  ctx.restore();
}

// ─────────────────────────────────────────────
// 배경 그리기
// ─────────────────────────────────────────────
async function drawBackground(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  width: number,
  height: number,
  imageCache: Map<string, HTMLImageElement>
) {
  const bg = slide.background;

  // 단색 배경
  if (bg.type === 'color') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'gradient' && bg.colorEnd) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, bg.color);
    grad.addColorStop(1, bg.colorEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'image' && bg.imageUrl) {
    // 이미지 로드
    let img = imageCache.get(bg.imageUrl);
    if (!img) {
      img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error('배경 이미지 로드 실패'));
        im.src = bg.imageUrl!;
      });
      imageCache.set(bg.imageUrl, img);
    }

    // 배경색 먼저
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);

    // 이미지 cover
    const focalX = bg.imageFocalX ?? 0.5;
    const focalY = bg.imageFocalY ?? 0.5;
    const scale = Math.max(width / img.width, height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const dx = (width - w) * focalX;
    const dy = (height - h) * focalY;

    ctx.save();
    ctx.filter = buildImageFilter(bg);
    ctx.globalAlpha = bg.imageOpacity ?? 1;
    ctx.drawImage(img, dx, dy, w, h);
    ctx.restore();

    // 오버레이
    if (bg.overlayColor) {
      ctx.fillStyle = hexToRgba(bg.overlayColor, bg.overlayOpacity ?? 0.4);
      ctx.fillRect(0, 0, width, height);
    }

    // 상단 이미지 하단 페이드
    if (bg.topImageFade) {
      const grad = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.65);
      grad.addColorStop(0, `${bg.color}00`);
      grad.addColorStop(0.6, `${bg.color}cc`);
      grad.addColorStop(1, bg.color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, height * 0.4, width, height * 0.25);
    }
  } else {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  }

  // 패턴 (mesh / grid / dots)
  if (bg.pattern === 'mesh') {
    const accent = bg.colorEnd || bg.color;
    const r1 = ctx.createRadialGradient(
      width * 0.2, height * 0.2, 0,
      width * 0.2, height * 0.2, width * 0.7
    );
    r1.addColorStop(0, accent + '66');
    r1.addColorStop(1, 'transparent');
    ctx.fillStyle = r1;
    ctx.fillRect(0, 0, width, height);

    const r2 = ctx.createRadialGradient(
      width * 0.8, height * 0.6, 0,
      width * 0.8, height * 0.6, width * 0.8
    );
    r2.addColorStop(0, accent + '55');
    r2.addColorStop(1, 'transparent');
    ctx.fillStyle = r2;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.pattern === 'grid') {
    ctx.save();
    ctx.strokeStyle = bg.color;
    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 1;
    const size = 60;
    for (let x = 0; x < width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  } else if (bg.pattern === 'dots') {
    ctx.save();
    ctx.fillStyle = bg.color;
    ctx.globalAlpha = 0.1;
    const size = 40;
    for (let x = 0; x < width; x += size) {
      for (let y = 0; y < height; y += size) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 하단 검정 페이드
  if (bg.bottomFade) {
    const grad = ctx.createLinearGradient(0, height * 0.75, 0, height);
    grad.addColorStop(0, '#00000000');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, height * 0.75, width, height * 0.25);
  }
}

// ─────────────────────────────────────────────
// 마지막 카드 브랜드 (캔버스)
// ─────────────────────────────────────────────
async function drawBrand(
  ctx: CanvasRenderingContext2D,
  brand: any,
  width: number,
  height: number,
  isDark: boolean,
  imageCache: Map<string, HTMLImageElement>
) {
  if (!brand) return;
  const mainColor = isDark ? '#ffffff' : '#0a0a0a';
  const mutedColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(10,10,10,0.7)';

  const startY = height * 0.68;
  let currentY = startY;
  const centerX = width / 2;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 로고
  if (brand.logoUrl) {
    try {
      let logo = imageCache.get(brand.logoUrl);
      if (!logo) {
        logo = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.crossOrigin = 'anonymous';
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = brand.logoUrl;
        });
        imageCache.set(brand.logoUrl, logo);
      }
      const logoSize = 100;
      ctx.drawImage(
        logo,
        centerX - logoSize / 2,
        currentY,
        logoSize,
        logoSize
      );
      currentY += logoSize + 20;
    } catch (e) {
      // 로고 로드 실패 시 스킵
    }
  }

  // 브랜드명
  if (brand.brandName) {
    ctx.fillStyle = mainColor;
    ctx.font = `900 40px Pretendard, system-ui, sans-serif`;
    ctx.fillText(brand.brandName, centerX, currentY);
    currentY += 50;
  }

  // 웹사이트
  if (brand.website) {
    ctx.fillStyle = mutedColor;
    ctx.font = `500 28px Pretendard, system-ui, sans-serif`;
    ctx.fillText(brand.website, centerX, currentY);
    currentY += 38;
  }

  // 핸들
  if (brand.handle) {
    ctx.fillStyle = mutedColor;
    ctx.globalAlpha = 0.8;
    ctx.font = `500 24px Pretendard, system-ui, sans-serif`;
    ctx.fillText(brand.handle, centerX, currentY);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
// 텍스트 순서 (등장 순)
// ─────────────────────────────────────────────
const TEXT_ORDER: (keyof Slide['texts'])[] = [
  'label',
  'headline',
  'highlight',
  'body',
];

// ─────────────────────────────────────────────
// 메인: 영상 생성
// ─────────────────────────────────────────────
export async function generateShorts(
  options: VideoOptions
): Promise<Blob> {
  const {
    slides,
    width = 1080,
    height = 1920,
    fps = 30,
    transition = 'fade',
    transitionMs = 400,
    slideDurationMs = 2500,
    textStaggerMs = 200,
    bgm,
    onProgress,
    onStatus,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageCache = new Map<string, HTMLImageElement>();

  // 오디오 준비
  onStatus?.('오디오 준비 중...');
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

  const totalMs = slides.length * slideDurationMs;
  const totalSec = totalMs / 1000;

  // 배경 이미지 프리로드
  onStatus?.('배경 이미지 준비 중...');
  for (const slide of slides) {
    if (slide.background.type === 'image' && slide.background.imageUrl) {
      try {
        await drawBackground(ctx, slide, width, height, imageCache);
      } catch (e) {
        console.warn('배경 이미지 프리로드 실패:', e);
      }
    }
  }

  // ─────────────────────────────────
  // 화면에 슬라이드 그리기
  // ─────────────────────────────────
  async function drawSlide(
    slide: Slide,
    slideElapsedMs: number,
    alpha: number = 1
  ) {
    const slideDark = isDarkColor(slide.background.color);

    // 캔버스 초기화 (완전 검정 배경으로 시작)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 카드 영역 계산 (화면 중앙, 세로 75% 정도)
    const cardMaxW = width * 0.9;
    const cardMaxH = height * 0.75;
    const cardRatio = 1080 / 1350;
    let cardW = cardMaxW;
    let cardH = cardW / cardRatio;
    if (cardH > cardMaxH) {
      cardH = cardMaxH;
      cardW = cardH * cardRatio;
    }
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 카드 배경 + 텍스트를 오프스크린 캔버스에 그림
    const offscreen = document.createElement('canvas');
    offscreen.width = 1080;
    offscreen.height = 1350;
    const offCtx = offscreen.getContext('2d')!;

    // 배경 그리기
    await drawBackground(offCtx, slide, 1080, 1350, imageCache);

    // 텍스트 요소 순차 등장
    const presetFamily = 'Pretendard, system-ui, sans-serif';
    let orderIndex = 0;
    for (const key of TEXT_ORDER) {
      const textConfig = slide.texts[key];
      if (!textConfig) continue;
      if (textConfig.visible === false) continue;

      const delay = orderIndex * textStaggerMs;
      const animDuration = 500; // ms
      const progress = getAnimationProgress(slideElapsedMs, delay, animDuration);

      drawTextElement({
        ctx: offCtx,
        config: textConfig,
        cardWidth: 1080,
        cardHeight: 1350,
        animationProgress: progress,
        fontFamily: presetFamily,
        isDark: slideDark,
      });
      orderIndex++;
    }

    // 푸터 (별도)
    if (slide.texts.footer && slide.texts.footer.visible !== false) {
      const delay = orderIndex * textStaggerMs;
      const progress = getAnimationProgress(slideElapsedMs, delay, 500);
      drawTextElement({
        ctx: offCtx,
        config: slide.texts.footer,
        cardWidth: 1080,
        cardHeight: 1350,
        animationProgress: progress,
        fontFamily: presetFamily,
        isDark: slideDark,
      });
    }

    // 마지막 카드 브랜드
    if (slide.isLast && (slide as any).__brand) {
      await drawBrand(
        offCtx,
        (slide as any).__brand,
        1080,
        1350,
        slideDark,
        imageCache
      );
    }

    // 오프스크린 → 메인 캔버스 (라운드 클립)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.clip();
    ctx.drawImage(offscreen, cardX, cardY, cardW, cardH);
    ctx.restore();

    ctx.restore();
  }

  // ─────────────────────────────────
  // 전환 효과
  // ─────────────────────────────────
  async function drawTransition(
    fromSlide: Slide,
    toSlide: Slide,
    fromElapsed: number,
    t: number,
    type: VideoTransition
  ) {
    if (type === 'fade') {
      await drawSlide(fromSlide, fromElapsed, 1 - t);
      await drawSlide(toSlide, 0, t);
    } else if (type === 'slide') {
      // 좌우 슬라이드
      const offset = t * width;
      ctx.save();
      ctx.translate(-offset, 0);
      await drawSlide(fromSlide, fromElapsed, 1);
      ctx.restore();
      ctx.save();
      ctx.translate(width - offset, 0);
      await drawSlide(toSlide, 0, 1);
      ctx.restore();
    } else if (type === 'slide-up') {
      const offset = t * height;
      ctx.save();
      ctx.translate(0, -offset);
      await drawSlide(fromSlide, fromElapsed, 1);
      ctx.restore();
      ctx.save();
      ctx.translate(0, height - offset);
      await drawSlide(toSlide, 0, 1);
      ctx.restore();
    } else if (type === 'zoom') {
      // 간단히 fade + scale 효과
      await drawSlide(fromSlide, fromElapsed, 1 - t);
      await drawSlide(toSlide, 0, t);
    } else if (type === 'blur') {
      await drawSlide(fromSlide, fromElapsed, 1 - t);
      await drawSlide(toSlide, 0, t);
    }
  }

  // ─────────────────────────────────
  // 렌더 루프
  // ─────────────────────────────────
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
    const tick = async () => {
      const elapsed = performance.now() - startWallTime;
      if (elapsed >= totalMs) {
        resolve();
        return;
      }

      const slideIdx = Math.min(
        Math.floor(elapsed / slideDurationMs),
        slides.length - 1
      );
      const slideElapsed = elapsed - slideIdx * slideDurationMs;
      const isTransition =
        slideElapsed > slideDurationMs - transitionMs &&
        slideIdx < slides.length - 1;
      const nextIdx = Math.min(slideIdx + 1, slides.length - 1);

      if (isTransition) {
        const t = (slideElapsed - (slideDurationMs - transitionMs)) / transitionMs;
        await drawTransition(slides[slideIdx], slides[nextIdx], slideElapsed, t, transition);
      } else {
        await drawSlide(slides[slideIdx], slideElapsed, 1);
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