import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ─────────────────────────────────────────────
// 단일 노드 → PNG Blob
// ─────────────────────────────────────────────
export async function renderNodeToPng(
  node: HTMLElement,
  width: number,
  height: number
): Promise<Blob> {
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: false,
    backgroundColor: undefined, // 투명도 유지
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

// ─────────────────────────────────────────────
// 단일 노드 → data URL
// ─────────────────────────────────────────────
export async function renderNodeToDataUrl(
  node: HTMLElement,
  width: number,
  height: number
): Promise<string> {
  return await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: undefined,
  });
}

// ─────────────────────────────────────────────
// 카드 1장 → PNG Blob (배경+텍스트)
// ─────────────────────────────────────────────
export async function renderCardToPng(
  node: HTMLElement,
  width: number,
  height: number
): Promise<Blob> {
  return renderNodeToPng(node, width, height);
}

// ─────────────────────────────────────────────
// 배경만 → PNG Blob
// ─────────────────────────────────────────────
export async function renderBackgroundToPng(
  node: HTMLElement,
  width: number,
  height: number
): Promise<Blob> {
  return renderNodeToPng(node, width, height);
}

// ─────────────────────────────────────────────
// 여러 카드 → ZIP (전체 = 배경 + 텍스트)
// ─────────────────────────────────────────────
export async function exportCardsAsZip(
  nodes: HTMLElement[],
  filename: string,
  width: number,
  height: number,
  onProgress?: (i: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('cards') || zip;

  for (let i = 0; i < nodes.length; i++) {
    const blob = await renderNodeToPng(nodes[i], width, height);
    folder.file(`card_${String(i + 1).padStart(2, '0')}.png`, blob);
    onProgress?.(i + 1, nodes.length);
  }

  const out = await zip.generateAsync({ type: 'blob' });
  saveAs(out, filename);
}

// ─────────────────────────────────────────────
// 배경 + 텍스트를 폴더 분리해서 ZIP
// ─────────────────────────────────────────────
export async function exportFullPackZip(
  cardNodes: HTMLElement[],
  backgroundNodes: HTMLElement[],
  filename: string,
  width: number,
  height: number,
  onProgress?: (msg: string) => void
): Promise<void> {
  const zip = new JSZip();
  const cardsFolder = zip.folder('cards') || zip;
  const bgFolder = zip.folder('backgrounds') || zip;

  const total = cardNodes.length + backgroundNodes.length;
  let done = 0;

  // 카드 (배경 + 텍스트)
  for (let i = 0; i < cardNodes.length; i++) {
    onProgress?.(`카드 렌더링 ${i + 1}/${cardNodes.length}`);
    const blob = await renderNodeToPng(cardNodes[i], width, height);
    cardsFolder.file(`card_${String(i + 1).padStart(2, '0')}.png`, blob);
    done++;
    onProgress?.(`진행 ${done}/${total}`);
  }

  // 배경만
  for (let i = 0; i < backgroundNodes.length; i++) {
    onProgress?.(`배경 렌더링 ${i + 1}/${backgroundNodes.length}`);
    const blob = await renderNodeToPng(backgroundNodes[i], width, height);
    bgFolder.file(`bg_${String(i + 1).padStart(2, '0')}.png`, blob);
    done++;
    onProgress?.(`진행 ${done}/${total}`);
  }

  const out = await zip.generateAsync({ type: 'blob' });
  saveAs(out, filename);
}

// ─────────────────────────────────────────────
// 단일 카드 즉시 다운로드
// ─────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}