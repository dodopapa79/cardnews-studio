import type {
  VideoStyle,
  VideoTransition,
  TextAnimation,
  Slide,
  Preset,
} from './types';

export interface BgmOption {
  file: File;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface VideoOptions extends VideoStyle {
  slides: Slide[];
  preset: Preset;
  width?: number;
  height?: number;
  fps?: number;
  bgm?: BgmOption;
  onProgress?: (pct: number) => void;
  onStatus?: (msg: string) => void;
}

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function isDarkColor(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

function hexToRgba(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function buildImageFilter(bg: any): string {
  const parts: string[] = [];
  if (bg.imageBrightness !== undefined && bg.imageBrightness !== 100) parts.push(`brightness(${bg.imageBrightness}%)`);
  if (bg.imageContrast !== undefined && bg.imageContrast !== 100) parts.push(`contrast(${bg.imageContrast}%)`);
  if (bg.imageSaturation !== undefined && bg.imageSaturation !== 100) parts.push(`saturate(${bg.imageSaturation}%)`);
  if (bg.imageBlur !== undefined && bg.imageBlur > 0) parts.push(`blur(${bg.imageBlur}px)`);
  if (bg.imageGrayscale !== undefined && bg.imageGrayscale > 0) parts.push(`grayscale(${bg.imageGrayscale}%)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

function getAnimProgress(elapsed: number, delay: number, duration: number): number {
  if (elapsed < delay) return 0;
  if (elapsed > delay + duration) return 1;
  return (elapsed - delay) / duration;
}

interface AnimTransform { alpha: number; offsetX: number; offsetY: number; scale: number; }

function applyAnimation(type: TextAnimation, progress: number): AnimTransform {
  const t = progress;
  if (type === 'none' || t >= 1) return { alpha: 1, offsetX: 0, offsetY: 0, scale: 1 };
  switch (type) {
    case 'fade-in': return { alpha: t, offsetX: 0, offsetY: 0, scale: 1 };
    case 'slide-up': return { alpha: t, offsetX: 0, offsetY: (1 - t) * 60, scale: 1 };
    case 'slide-down': return { alpha: t, offsetX: 0, offsetY: -(1 - t) * 60, scale: 1 };
    case 'slide-left': return { alpha: t, offsetX: (1 - t) * 80, offsetY: 0, scale: 1 };
    case 'slide-right': return { alpha: t, offsetX: -(1 - t) * 80, offsetY: 0, scale: 1 };
    case 'zoom-in': return { alpha: t, offsetX: 0, offsetY: 0, scale: 0.85 + t * 0.15 };
    default: return { alpha: 1, offsetX: 0, offsetY: 0, scale: 1 };
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (!para) { lines.push(''); continue; }
    let currentLine = '';
    for (const char of para.split('')) {
      const test = currentLine + char;
      if (ctx.measureText(test).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else currentLine = test;
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

// ─────────────────────────────────────────────
// 배경 그리기
// ─────────────────────────────────────────────
async function drawBackground(ctx: CanvasRenderingContext2D, slide: Slide, width: number, height: number, imageCache: Map<string, HTMLImageElement>) {
  const bg = slide.background;
  if (bg.type === 'color') { ctx.fillStyle = bg.color; ctx.fillRect(0, 0, width, height); }
  else if (bg.type === 'gradient' && bg.colorEnd) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, bg.color); grad.addColorStop(1, bg.colorEnd);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
  } else { ctx.fillStyle = bg.color; ctx.fillRect(0, 0, width, height); }

  if (bg.type === 'image' && bg.imageUrl) {
    let img = imageCache.get(bg.imageUrl);
    if (!img) {
      try {
        img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image(); im.crossOrigin = 'anonymous';
          im.onload = () => resolve(im); im.onerror = reject;
          im.src = bg.imageUrl!;
        });
        imageCache.set(bg.imageUrl, img);
      } catch {}
    }
    if (img) {
      const layout = bg.imageLayout || 'full-bleed';
      const focalX = bg.imageFocalX ?? 0.5;
      const focalY = bg.imageFocalY ?? 0.5;
      const drawCover = (x: number, y: number, w: number, h: number) => {
        const scale = Math.max(w / img!.width, h / img!.height);
        const dw = img!.width * scale, dh = img!.height * scale;
        ctx.drawImage(img!, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      };
      if (layout === 'full-bleed') {
        ctx.save(); ctx.filter = buildImageFilter(bg); ctx.globalAlpha = bg.imageOpacity ?? 1;
        drawCover(0, 0, width, height); ctx.restore();
        if (bg.overlayColor) {
          ctx.fillStyle = hexToRgba(bg.overlayColor, bg.overlayOpacity ?? 0.4);
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, width, height);
        }
      } else if (layout === 'top-image') {
        const topH = height * 0.55;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, width, topH); ctx.clip();
        ctx.filter = buildImageFilter(bg); ctx.globalAlpha = bg.imageOpacity ?? 1;
        drawCover(0, 0, width, topH); ctx.restore();
        const grad = ctx.createLinearGradient(0, height * 0.42, 0, height * 0.62);
        grad.addColorStop(0, `${bg.color}00`); grad.addColorStop(0.6, `${bg.color}cc`); grad.addColorStop(1, bg.color);
        ctx.fillStyle = grad; ctx.fillRect(0, height * 0.42, width, height * 0.2);
      }
    }
  }

  if (bg.bottomFade) {
    const grad = ctx.createLinearGradient(0, height * 0.75, 0, height);
    grad.addColorStop(0, '#00000000'); grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad; ctx.fillRect(0, height * 0.75, width, height * 0.25);
  }
}

// ─────────────────────────────────────────────
// 블록 그리기 (오프스크린)
// ─────────────────────────────────────────────
function drawBlock(ctx: CanvasRenderingContext2D, block: any, preset: Preset, width: number, height: number, paddingLeft: number, paddingRight: number, y: number, slideElapsed: number, staggerMs: number, orderIndex: number) {
  const bs = preset.blockStyles;
  const contentWidth = width - paddingLeft - paddingRight;
  const delay = orderIndex * staggerMs;
  const anim = applyAnimation(block.animation || 'fade-in', getAnimProgress(slideElapsed, delay, 500));
  if (anim.alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = anim.alpha;
  ctx.translate(anim.offsetX, anim.offsetY);
  ctx.scale(anim.scale, anim.scale);

  if (block.type === 'headline' && block.content.text) {
    const s = bs.headline;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.color;
    ctx.textBaseline = 'top';
    const lines = wrapText(ctx, block.content.text, contentWidth);
    lines.forEach((line, i) => {
      let x = paddingLeft;
      if (s.align === 'center') { ctx.textAlign = 'center'; x = width / 2; }
      else if (s.align === 'right') { ctx.textAlign = 'right'; x = width - paddingRight; }
      else ctx.textAlign = 'left';
      ctx.fillText(line, x, y + i * s.fontSize * s.lineHeight);
    });
  } else if (block.type === 'body' && block.content.text) {
    const s = bs.body;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.color; ctx.textBaseline = 'top';
    const lines = wrapText(ctx, block.content.text, contentWidth);
    lines.forEach((line, i) => {
      let x = paddingLeft;
      if (s.align === 'center') { ctx.textAlign = 'center'; x = width / 2; }
      else if (s.align === 'right') { ctx.textAlign = 'right'; x = width - paddingRight; }
      else ctx.textAlign = 'left';
      ctx.fillText(line, x, y + i * s.fontSize * s.lineHeight);
    });
  } else if (block.type === 'label' && block.content.text) {
    const s = bs.label;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.textBaseline = 'top';
    const text = block.content.text.toUpperCase();
    const tw = ctx.measureText(text).width;
    let x = paddingLeft;
    if (s.align === 'center') x = (width - tw) / 2;
    else if (s.align === 'right') x = width - paddingRight - tw;
    if (s.background) {
      const pad = s.padding ?? 12;
      ctx.fillStyle = hexToRgba(s.background, s.backgroundOpacity ?? 1);
      ctx.beginPath();
      ctx.roundRect(x - pad, y, tw + pad * 2, s.fontSize + pad * 2 - 6, s.borderRadius ?? 999);
      ctx.fill();
      ctx.fillStyle = s.color;
      ctx.fillText(text, x, y + pad - 6);
    } else {
      ctx.fillStyle = s.color;
      ctx.fillText(text, x, y);
    }
  } else if (block.type === 'highlight' && block.content.text) {
    const s = bs.highlight;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.color;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(block.content.text, paddingLeft, y);
  } else if (block.type === 'list' && block.content.items) {
    const s = bs.list;
    let curY = y;
    for (const item of block.content.items) {
      const itemH = (item.desc ? s.titleSize * 1.4 + s.descSize * 1.5 + 12 : s.titleSize * 1.4) + s.itemPadding * 2;
      ctx.fillStyle = hexToRgba(s.itemBg, s.itemBgOpacity ?? 1);
      ctx.beginPath();
      ctx.roundRect(paddingLeft, curY, contentWidth, itemH, s.itemBorderRadius);
      ctx.fill();
      let textX = paddingLeft + s.itemPadding;
      if (item.number) {
        ctx.font = `900 ${s.numberSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.numberColor;
        ctx.textBaseline = 'top';
        ctx.fillText(item.number, textX, curY + s.itemPadding);
        textX += s.numberSize * 1.3;
      }
      ctx.font = `700 ${s.titleSize}px ${preset.fontFamily}`;
      ctx.fillStyle = s.titleColor;
      ctx.textBaseline = 'top';
      ctx.fillText(item.title, textX, curY + s.itemPadding);
      if (item.desc) {
        ctx.font = `400 ${s.descSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.descColor;
        ctx.fillText(item.desc, textX, curY + s.itemPadding + s.titleSize * 1.4);
      }
      curY += itemH + s.itemGap;
    }
  } else if (block.type === 'numbered-card' && block.content.items) {
    const s = bs.numberedCard;
    let curY = y;
    for (const item of block.content.items) {
      const itemH = (item.desc ? s.titleSize * 1.4 + s.descSize * 1.5 + 12 : s.titleSize * 1.4) + s.cardPadding * 2;
      ctx.fillStyle = hexToRgba(s.cardBg, s.cardBgOpacity ?? 1);
      ctx.beginPath();
      ctx.roundRect(paddingLeft, curY, contentWidth, itemH, s.cardBorderRadius);
      ctx.fill();
      let textX = paddingLeft + s.cardPadding;
      if (item.number) {
        ctx.font = `900 ${s.numberSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.numberColor;
        ctx.textBaseline = 'top';
        ctx.fillText(item.number, textX, curY + s.cardPadding);
        textX += s.numberSize * 1.5;
      }
      ctx.font = `800 ${s.titleSize}px ${preset.fontFamily}`;
      ctx.fillStyle = s.titleColor;
      ctx.textBaseline = 'top';
      ctx.fillText(item.title, textX, curY + s.cardPadding);
      if (item.desc) {
        ctx.font = `400 ${s.descSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.descColor;
        ctx.fillText(item.desc, textX, curY + s.cardPadding + s.titleSize * 1.4);
      }
      curY += itemH + s.cardGap;
    }
  } else if (block.type === 'point-box') {
    const s = bs.pointBox;
    const text = block.content.text || '';
    const boxLabel = block.content.boxLabel || '';
    ctx.font = `500 ${s.textSize}px ${preset.fontFamily}`;
    const lines = wrapText(ctx, text, contentWidth - s.padding * 2);
    const labelH = boxLabel ? s.labelSize + 12 : 0;
    const boxH = labelH + lines.length * s.textSize * 1.55 + s.padding * 2;
    ctx.fillStyle = hexToRgba(s.bgColor, s.bgOpacity ?? 1);
    ctx.beginPath();
    ctx.roundRect(paddingLeft, y, contentWidth, boxH, s.borderRadius);
    ctx.fill();
    ctx.fillStyle = s.borderLeftColor;
    ctx.beginPath();
    ctx.roundRect(paddingLeft, y, s.borderLeftWidth, boxH, s.borderRadius);
    ctx.fill();
    let textY = y + s.padding;
    if (boxLabel) {
      ctx.font = `800 ${s.labelSize}px ${preset.fontFamily}`;
      ctx.fillStyle = s.labelColor;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(boxLabel.toUpperCase(), paddingLeft + s.padding + 8, textY);
      textY += s.labelSize + 12;
    }
    ctx.font = `500 ${s.textSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.textColor;
    lines.forEach((line, i) => ctx.fillText(line, paddingLeft + s.padding + 8, textY + i * s.textSize * 1.55));
  } else if (block.type === 'divider') {
    const s = bs.divider;
    ctx.fillStyle = s.color;
    ctx.fillRect(paddingLeft, y, contentWidth, s.thickness);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────
export async function generateShorts(options: VideoOptions): Promise<Blob> {
  const {
    slides, preset,
    width = 1080, height = 1920, fps = 30,
    transition = 'fade', transitionMs = 400, slideDurationMs = 2500, textStaggerMs = 200,
    bgm, onProgress, onStatus,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageCache = new Map<string, HTMLImageElement>();

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
      bgmSource.buffer = audioBuffer; bgmSource.loop = true;
      bgmSource.connect(bgmGain);
    } catch (e) { console.warn('BGM 로드 실패:', e); }
  }

  const canvasStream = canvas.captureStream(fps);
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  tracks.push(...audioDest.stream.getAudioTracks());
  const mixedStream = new MediaStream(tracks);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm';
  const recorder = new MediaRecorder(mixedStream, { mimeType, videoBitsPerSecond: 6_000_000, audioBitsPerSecond: 128_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const totalMs = slides.length * slideDurationMs;
  const totalSec = totalMs / 1000;

  // 프리로드
  onStatus?.('배경 준비 중...');
  for (const slide of slides) {
    if (slide.background.type === 'image' && slide.background.imageUrl) {
      try { await drawBackground(ctx, slide, width, height, imageCache); } catch {}
    }
  }

  // 슬라이드별 오프스크린 렌더
  async function renderSlideToOffscreen(slide: Slide, slideElapsed: number): Promise<HTMLCanvasElement> {
    const off = document.createElement('canvas');
    off.width = width; off.height = height;
    const offCtx = off.getContext('2d')!;
    await drawBackground(offCtx, slide, width, height, imageCache);

    const paddingLeft = 90;
    const paddingRight = 90;
    const paddingTop = height * (slide.isLast ? 0.08 : 0.1);
    const paddingBottom = slide.isLast ? height * 0.32 : height * 0.1;
    const availableH = height - paddingTop - paddingBottom;

    // 블록 순차 배치 (y 비율 기반)
    const blocks = slide.blocks.filter((b) => b.visible !== false).sort((a, b) => a.y - b.y);
    const totalWeight = blocks.reduce((sum, b) => sum + 1, 0) || 1;
    let cursor = paddingTop;

    blocks.forEach((block, i) => {
      const blockH = availableH / totalWeight;
      const y = paddingTop + block.y * (availableH - blockH) + (i * 4);
      drawBlock(offCtx, block, preset, width, height, paddingLeft, paddingRight, y, slideElapsed, textStaggerMs, i);
      cursor += blockH;
    });

    return off;
  }

  async function drawSlide(slide: Slide, slideElapsed: number, alpha: number = 1) {
    ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, width, height);
    const cardW = width * 0.9;
    const cardH = cardW * (1350 / 1080);
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    const off = await renderSlideToOffscreen(slide, slideElapsed);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.clip();
    ctx.drawImage(off, cardX, cardY, cardW, cardH);
    ctx.restore();
  }

  async function drawTransition(from: Slide, to: Slide, fromElapsed: number, t: number, type: VideoTransition) {
    if (type === 'fade') {
      await drawSlide(from, fromElapsed, 1 - t);
      await drawSlide(to, 0, t);
    } else if (type === 'slide') {
      const offset = t * width;
      ctx.save(); ctx.translate(-offset, 0); await drawSlide(from, fromElapsed, 1); ctx.restore();
      ctx.save(); ctx.translate(width - offset, 0); await drawSlide(to, 0, 1); ctx.restore();
    } else if (type === 'slide-up') {
      const offset = t * height;
      ctx.save(); ctx.translate(0, -offset); await drawSlide(from, fromElapsed, 1); ctx.restore();
      ctx.save(); ctx.translate(0, height - offset); await drawSlide(to, 0, 1); ctx.restore();
    } else if (type === 'zoom') {
      await drawSlide(from, fromElapsed, 1 - t);
      await drawSlide(to, 0, t);
    } else if (type === 'blur') {
      await drawSlide(from, fromElapsed, 1 - t);
      await drawSlide(to, 0, t);
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
    const tick = async () => {
      const elapsed = performance.now() - startWallTime;
      if (elapsed >= totalMs) { resolve(); return; }
      const slideIdx = Math.min(Math.floor(elapsed / slideDurationMs), slides.length - 1);
      const slideElapsed = elapsed - slideIdx * slideDurationMs;
      const isTransition = slideElapsed > slideDurationMs - transitionMs && slideIdx < slides.length - 1;
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
  try { bgmSource?.stop(); await audioCtx.close(); } catch {}
  return new Blob(chunks, { type: 'video/webm' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}