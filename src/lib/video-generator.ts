import type {
  VideoStyle,
  VideoTransition,
  TextAnimation,
  Slide,
  Preset,
  Block,
  BlockItem,
  BrandInfo,
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
  brand?: BrandInfo;
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

function getAnimProgress(
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
  if (type === 'none' || t >= 1)
    return { alpha: 1, offsetX: 0, offsetY: 0, scale: 1 };
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
// 배경 그리기 (imageLayout 처리 강화)
// ─────────────────────────────────────────────
async function drawBackground(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  width: number,
  height: number,
  imageCache: Map<string, HTMLImageElement>
) {
  const bg = slide.background;

  // 기본 배경색/그라디언트
  if (bg.type === 'gradient' && bg.colorEnd) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, bg.color);
    grad.addColorStop(1, bg.colorEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  }

  // 이미지: type 무관, imageUrl 있으면 그림
  if (bg.imageUrl) {
    let img = imageCache.get(bg.imageUrl);
    if (!img) {
      try {
        img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.crossOrigin = 'anonymous';
          im.onload = () => resolve(im);
          im.onerror = () => reject(new Error('bg image load fail'));
          im.src = bg.imageUrl!;
        });
        imageCache.set(bg.imageUrl, img);
      } catch {
        img = undefined as any;
      }
    }

    if (img) {
      const layout = bg.imageLayout || 'full-bleed';
      const focalX = bg.imageFocalX ?? 0.5;
      const focalY = bg.imageFocalY ?? 0.5;

      const drawCover = (x: number, y: number, w: number, h: number) => {
        const scale = Math.max(w / img!.width, h / img!.height);
        const dw = img!.width * scale;
        const dh = img!.height * scale;
        const dx = x + (w - dw) * focalX;
        const dy = y + (h - dh) * focalY;
        ctx.drawImage(img!, dx, dy, dw, dh);
      };

      if (layout === 'full-bleed') {
        ctx.save();
        ctx.filter = buildImageFilter(bg);
        ctx.globalAlpha = bg.imageOpacity ?? 1;
        drawCover(0, 0, width, height);
        ctx.restore();
        if (bg.overlayColor) {
          ctx.fillStyle = hexToRgba(bg.overlayColor, bg.overlayOpacity ?? 0.4);
          ctx.fillRect(0, 0, width, height);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, 'rgba(0,0,0,0.40)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
          grad.addColorStop(1, 'rgba(0,0,0,0.70)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
      } else if (layout === 'top-image') {
        const topH = height * 0.55;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, topH);
        ctx.clip();
        ctx.filter = buildImageFilter(bg);
        ctx.globalAlpha = bg.imageOpacity ?? 1;
        drawCover(0, 0, width, topH);
        ctx.restore();
        const grad = ctx.createLinearGradient(0, height * 0.42, 0, height * 0.62);
        grad.addColorStop(0, `${bg.color}00`);
        grad.addColorStop(0.6, `${bg.color}cc`);
        grad.addColorStop(1, bg.color);
        ctx.fillStyle = grad;
        ctx.fillRect(0, height * 0.42, width, height * 0.2);
      } else if (layout === 'split') {
        const splitW = width * 0.5;
        ctx.save();
        ctx.beginPath();
        ctx.rect(width - splitW, 0, splitW, height);
        ctx.clip();
        ctx.filter = buildImageFilter(bg);
        ctx.globalAlpha = bg.imageOpacity ?? 1;
        drawCover(width - splitW, 0, splitW, height);
        ctx.restore();
        const grad = ctx.createLinearGradient(0, 0, width * 0.6, 0);
        grad.addColorStop(0, bg.color);
        grad.addColorStop(0.6, `${bg.color}cc`);
        grad.addColorStop(1, `${bg.color}00`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width * 0.6, height);
      }
      // layout === 'none'이면 이미지 안 그림
    }
  }

  // topImageFade (top-image 아닐 때만)
  if (bg.topImageFade && (bg.imageLayout || 'full-bleed') !== 'top-image') {
    const grad = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.65);
    grad.addColorStop(0, `${bg.color}00`);
    grad.addColorStop(0.6, `${bg.color}cc`);
    grad.addColorStop(1, bg.color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, height * 0.4, width, height * 0.25);
  }

  // bottomFade
  if (bg.bottomFade) {
    const grad = ctx.createLinearGradient(0, height * 0.75, 0, height);
    grad.addColorStop(0, '#00000000');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, height * 0.75, width, height * 0.25);
  }

  // 패턴 (이미지 없을 때만)
  if (!bg.imageUrl) {
    if (bg.pattern === 'mesh') {
      const accent = bg.colorEnd || bg.color;
      const r1 = ctx.createRadialGradient(
        width * 0.2, height * 0.2, 0,
        width * 0.2, height * 0.2, width * 0.7
      );
      r1.addColorStop(0, hexToRgba(accent, 0.4));
      r1.addColorStop(1, 'transparent');
      ctx.fillStyle = r1;
      ctx.fillRect(0, 0, width, height);

      const r2 = ctx.createRadialGradient(
        width * 0.8, height * 0.6, 0,
        width * 0.8, height * 0.6, width * 0.8
      );
      r2.addColorStop(0, hexToRgba(accent, 0.33));
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
  }
}

// ─────────────────────────────────────────────
// 블록 하나 그리기 (y 반환)
// ─────────────────────────────────────────────
interface DrawBlockParams {
  ctx: CanvasRenderingContext2D;
  block: Block;
  preset: Preset;
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  y: number;
  slideElapsed: number;
  staggerMs: number;
  orderIndex: number;
}

function drawBlock({
  ctx,
  block,
  preset,
  width,
  paddingLeft,
  paddingRight,
  y,
  slideElapsed,
  staggerMs,
  orderIndex,
}: DrawBlockParams): number {
  const bs = preset.blockStyles;
  const contentWidth = width - paddingLeft - paddingRight;
  const delay = orderIndex * staggerMs;
  const anim = applyAnimation(
    block.animation || 'fade-in',
    getAnimProgress(slideElapsed, delay, 500)
  );
  if (anim.alpha <= 0) return y;

  ctx.save();
  ctx.globalAlpha = anim.alpha;
  ctx.translate(anim.offsetX, anim.offsetY);

  let nextY = y;

  // ── headline ──
  if (block.type === 'headline' && block.content.text) {
    const s = bs.headline;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.color;
    ctx.textBaseline = 'top';
    ctx.textAlign = s.align;
    const lines = wrapText(ctx, block.content.text, contentWidth);
    const lineHeightPx = s.fontSize * s.lineHeight;
    let cy = y;
    for (const line of lines) {
      const x =
        s.align === 'center'
          ? paddingLeft + contentWidth / 2
          : s.align === 'right'
          ? width - paddingRight
          : paddingLeft;
      ctx.fillText(line, x, cy);
      cy += lineHeightPx;
    }
    nextY = cy + 24;
  }

  // ── body ──
  else if (block.type === 'body' && block.content.text) {
    const s = bs.body;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.color;
    ctx.textBaseline = 'top';
    ctx.textAlign = s.align;
    const lines = wrapText(ctx, block.content.text, contentWidth);
    const lineHeightPx = s.fontSize * s.lineHeight;
    let cy = y;
    for (const line of lines) {
      const x =
        s.align === 'center'
          ? paddingLeft + contentWidth / 2
          : s.align === 'right'
          ? width - paddingRight
          : paddingLeft;
      ctx.fillText(line, x, cy);
      cy += lineHeightPx;
    }
    nextY = cy + 24;
  }

  // ── label ──
  else if (block.type === 'label' && block.content.text) {
    const s = bs.label;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    const pad = s.padding ?? 12;
    const radius = s.borderRadius ?? 8;
    const textW = ctx.measureText(block.content.text).width;
    const boxW = textW + pad * 2;
    const boxH = s.fontSize + pad * 2;
    if (s.background) {
      ctx.fillStyle = hexToRgba(s.background, s.backgroundOpacity ?? 1);
      ctx.beginPath();
      ctx.rect(paddingLeft, y, boxW, boxH); // 라운드 제거
      ctx.fill();
    }
    ctx.fillStyle = s.color;
    ctx.fillText(block.content.text, paddingLeft + pad, y + pad);
    nextY = y + boxH + 20;
  }

  // ── highlight ──
  else if (block.type === 'highlight' && block.content.text) {
    const s = bs.highlight;
    ctx.font = `${s.fontWeight} ${s.fontSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.color;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    const lines = wrapText(ctx, block.content.text, contentWidth);
    const lineHeightPx = s.fontSize * 1.3;
    let cy = y;
    for (const line of lines) {
      ctx.fillText(line, paddingLeft, cy);
      cy += lineHeightPx;
    }
    nextY = cy + 24;
  }

  // ── list ──
  else if (block.type === 'list' && block.content.items) {
    const s = bs.list;
    let cy = y;
    for (const item of block.content.items) {
      const itemY = cy;
      const itemH = s.itemPadding * 2 + s.titleSize * 1.4 +
        (item.desc ? s.descSize * 1.4 + 6 : 0);
      // 배경
      ctx.fillStyle = hexToRgba(s.itemBg, s.itemBgOpacity ?? 1);
      ctx.beginPath();
      ctx.rect(paddingLeft, itemY, contentWidth, itemH); // 라운드 제거
      ctx.fill();
      // 번호
      let textX = paddingLeft + s.itemPadding;
      if (item.number) {
        ctx.font = `700 ${s.numberSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.numberColor;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText(item.number, textX, itemY + s.itemPadding);
        textX += s.numberSize + 16;
      }
      // 제목
      ctx.font = `700 ${s.titleSize}px ${preset.fontFamily}`;
      ctx.fillStyle = s.titleColor;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText(item.title, textX, itemY + s.itemPadding);
      // 설명
      if (item.desc) {
        ctx.font = `400 ${s.descSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.descColor;
        ctx.fillText(
          item.desc,
          textX,
          itemY + s.itemPadding + s.titleSize * 1.4 + 6
        );
      }
      cy = itemY + itemH + s.itemGap;
    }
    nextY = cy + 8;
  }

  // ── numbered-card ──
  else if (block.type === 'numbered-card' && block.content.items) {
    const s = bs.numberedCard;
    let cy = y;
    for (const item of block.content.items) {
      const itemH = s.cardPadding * 2 + s.titleSize * 1.4 +
        (item.desc ? s.descSize * 1.4 + 6 : 0);
      ctx.fillStyle = hexToRgba(s.cardBg, s.cardBgOpacity ?? 1);
      ctx.beginPath();
      ctx.rect(paddingLeft, cy, contentWidth, itemH); // 라운드 제거
      ctx.fill();
      let textX = paddingLeft + s.cardPadding;
      if (item.number) {
        ctx.font = `900 ${s.numberSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.numberColor;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText(item.number, textX, cy + s.cardPadding);
        textX += s.numberSize + 16;
      }
      ctx.font = `700 ${s.titleSize}px ${preset.fontFamily}`;
      ctx.fillStyle = s.titleColor;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText(item.title, textX, cy + s.cardPadding);
      if (item.desc) {
        ctx.font = `400 ${s.descSize}px ${preset.fontFamily}`;
        ctx.fillStyle = s.descColor;
        ctx.fillText(
          item.desc,
          textX,
          cy + s.cardPadding + s.titleSize * 1.4 + 6
        );
      }
      cy += itemH + s.cardGap;
    }
    nextY = cy + 8;
  }

  // ── point-box ──
  else if (block.type === 'point-box' && block.content.text) {
    const s = bs.pointBox;
    const pad = s.padding;
    // 텍스트 높이 측정
    const innerW = contentWidth - pad * 2 - s.borderLeftWidth;
    ctx.font = `500 ${s.textSize}px ${preset.fontFamily}`;
    const lines = wrapText(ctx, block.content.text, innerW);
    const lineHeightPx = s.textSize * 1.4;
    const textH = lines.length * lineHeightPx;
    const labelH = block.content.boxLabel ? s.labelSize * 1.4 + 8 : 0;
    const boxH = pad * 2 + labelH + textH;

    // 배경
    ctx.fillStyle = hexToRgba(s.bgColor, s.bgOpacity ?? 1);
    ctx.beginPath();
    ctx.rect(paddingLeft, y, contentWidth, boxH); // 라운드 제거
    ctx.fill();
    // 왼쪽 보더
    ctx.fillStyle = s.borderLeftColor;
    ctx.fillRect(paddingLeft, y, s.borderLeftWidth, boxH);

    let cy = y + pad;
    const textX = paddingLeft + pad + s.borderLeftWidth;
    if (block.content.boxLabel) {
      ctx.font = `700 ${s.labelSize}px ${preset.fontFamily}`;
      ctx.fillStyle = s.labelColor;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText(block.content.boxLabel, textX, cy);
      cy += labelH;
    }
    ctx.font = `500 ${s.textSize}px ${preset.fontFamily}`;
    ctx.fillStyle = s.textColor;
    for (const line of lines) {
      ctx.fillText(line, textX, cy);
      cy += lineHeightPx;
    }
    nextY = y + boxH + 20;
  }

  // ── divider ──
  else if (block.type === 'divider') {
    const s = bs.divider;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.thickness;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y + 8);
    ctx.lineTo(width - paddingRight, y + 8);
    ctx.stroke();
    nextY = y + 24;
  }

  ctx.restore();
  return nextY;
}

// ─────────────────────────────────────────────
// 콘텐츠 유무 확인
// ─────────────────────────────────────────────
function hasContent(block: Block): boolean {
  if (block.visible === false) return false;
  if (block.type === 'divider') return true;
  if (block.content.text && block.content.text.trim()) return true;
  if (block.content.items && block.content.items.length > 0) return true;
  return false;
}

// ─────────────────────────────────────────────
// 마지막 카드 브랜드 (캔버스)
// ─────────────────────────────────────────────
async function drawBrand(
  ctx: CanvasRenderingContext2D,
  brand: BrandInfo | undefined,
  width: number,
  height: number,
  isDark: boolean,
  imageCache: Map<string, HTMLImageElement>
) {
  if (!brand?.brandName && !brand?.website && !brand?.logoUrl) return;
  const mainColor = isDark ? '#ffffff' : '#0a0a0a';
  const mutedColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(10,10,10,0.7)';
  const centerX = width / 2;
  let currentY = height - 260;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

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
      const logoSize = 80;
      ctx.drawImage(logo, centerX - logoSize / 2, currentY, logoSize, logoSize);
      currentY += logoSize + 16;
    } catch {}
  }
  if (brand.brandName) {
    ctx.fillStyle = mainColor;
    ctx.font = `900 34px ${'Pretendard, system-ui, sans-serif'}`;
    ctx.fillText(brand.brandName, centerX, currentY);
    currentY += 44;
  }
  if (brand.website) {
    ctx.fillStyle = mutedColor;
    ctx.font = `500 24px ${'Pretendard, system-ui, sans-serif'}`;
    ctx.fillText(brand.website, centerX, currentY);
    currentY += 32;
  }
  if (brand.handle) {
    ctx.fillStyle = mutedColor;
    ctx.globalAlpha = 0.8;
    ctx.font = `500 20px ${'Pretendard, system-ui, sans-serif'}`;
    ctx.fillText(brand.handle, centerX, currentY);
  }
  ctx.restore();
}

// ─────────────────────────────────────────────
// 슬라이드 하나 그리기
// ─────────────────────────────────────────────
async function drawSlide(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  preset: Preset,
  brand: BrandInfo | undefined,
  width: number,
  height: number,
  elapsedMs: number,
  staggerMs: number,
  imageCache: Map<string, HTMLImageElement>
) {
  await drawBackground(ctx, slide, width, height, imageCache);

  const paddingTop = 90;
  const paddingBottom = slide.isLast ? 260 : 120;
  const paddingLeft = 90;
  const paddingRight = 90;

  const visibleBlocks = slide.blocks
    .filter(hasContent)
    .sort((a, b) => a.y - b.y);

  // 블록 총 높이 추정 (y값이 0~1 정규화이므로 그대로 곱해서 사용)
  // y가 0~1이면 absolute 배치, 아니면 순차 배치
  // 여기서는 순차 배치 + 세로 중앙 정렬로 통일
  const totalH = visibleBlocks.reduce((sum, b) => {
    return sum + estimateBlockHeight(b, preset, width);
  }, 0) + Math.max(0, visibleBlocks.length - 1) * 28;

  const areaH = height - paddingTop - paddingBottom;
  let y = paddingTop + Math.max(0, (areaH - totalH) / 2);

  for (let i = 0; i < visibleBlocks.length; i++) {
    const block = visibleBlocks[i];
    y = drawBlock({
      ctx,
      block,
      preset,
      width,
      height,
      paddingLeft,
      paddingRight,
      y,
      slideElapsed: elapsedMs,
      staggerMs,
      orderIndex: i,
    });
    y += 28;
  }

  if (slide.isLast) {
    const bgDark = isDarkColor(slide.background.color);
    await drawBrand(ctx, brand, width, height, bgDark, imageCache);
  }
}

function estimateBlockHeight(block: Block, preset: Preset, width: number): number {
  const bs = preset.blockStyles;
  const contentWidth = width - 180;
  switch (block.type) {
    case 'headline':
      return bs.headline.fontSize * bs.headline.lineHeight * 1.5;
    case 'body':
      return bs.body.fontSize * bs.body.lineHeight * 2;
    case 'label':
      return bs.label.fontSize + (bs.label.padding ?? 12) * 2 + 20;
    case 'highlight':
      return bs.highlight.fontSize * 1.3;
    case 'list': {
      const s = bs.list;
      const n = block.content.items?.length ?? 0;
      return n * (s.itemPadding * 2 + s.titleSize * 1.4 + s.itemGap + 20);
    }
    case 'numbered-card': {
      const s = bs.numberedCard;
      const n = block.content.items?.length ?? 0;
      return n * (s.cardPadding * 2 + s.titleSize * 1.4 + s.cardGap + 20);
    }
    case 'point-box': {
      const s = bs.pointBox;
      return s.padding * 2 + s.textSize * 1.4 * 2 + 20;
    }
    case 'divider':
      return 24;
    default:
      return 120;
  }
}

// ─────────────────────────────────────────────
// 트랜지션
// ─────────────────────────────────────────────
function applyTransitionOverlay(
  ctx: CanvasRenderingContext2D,
  progress: number,
  transition: VideoTransition,
  width: number,
  height: number
) {
  if (transition === 'none' || progress >= 1) return;
  const t = progress;
  if (transition === 'fade') {
    ctx.fillStyle = `rgba(0,0,0,${1 - t})`;
    ctx.fillRect(0, 0, width, height);
  } else if (transition === 'slide' || transition === 'slide-up') {
    ctx.fillStyle = `rgba(0,0,0,${(1 - t) * 0.6})`;
    ctx.fillRect(0, 0, width, height);
  } else if (transition === 'zoom' || transition === 'blur') {
    ctx.fillStyle = `rgba(0,0,0,${(1 - t) * 0.5})`;
    ctx.fillRect(0, 0, width, height);
  }
}

// ─────────────────────────────────────────────
// 메인: 영상 생성
// ─────────────────────────────────────────────
export async function generateVideo(options: VideoOptions): Promise<Blob> {
  const {
    slides,
    preset,
    brand,
    width = 1080,
    height = 1350,
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
    videoBitsPerSecond: 8_000_000,
    audioBitsPerSecond: 128_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const totalMs = slides.length * slideDurationMs;
  const totalSec = totalMs / 1000;

  // 배경 이미지 프리로드
  onStatus?.('배경 이미지 준비 중...');
  for (const slide of slides) {
    if (slide.background.imageUrl) {
      try {
        await drawBackground(ctx, slide, width, height, imageCache);
      } catch {}
    }
  }

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

      ctx.clearRect(0, 0, width, height);

      if (isTransition) {
        const t = (slideElapsed - (slideDurationMs - transitionMs)) / transitionMs;
        // 두 슬라이드를 겹쳐 그림 (단순 fade 방식)
        ctx.save();
        ctx.globalAlpha = 1;
        await drawSlide(
          ctx,
          slides[slideIdx],
          preset,
          brand,
          width,
          height,
          slideElapsed,
          textStaggerMs,
          imageCache
        );
        ctx.restore();
        applyTransitionOverlay(ctx, t, transition, width, height);
      } else {
        await drawSlide(
          ctx,
          slides[slideIdx],
          preset,
          brand,
          width,
          height,
          slideElapsed,
          textStaggerMs,
          imageCache
        );
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

// ─────────────────────────────────────────────
// 다운로드 유틸
// ─────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}