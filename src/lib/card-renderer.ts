import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function renderNodeToPng(
  node: HTMLElement,
  width = 1080,
  height = 1350
): Promise<Blob> {
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: false,
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function renderNodeToDataUrl(
  node: HTMLElement,
  width = 1080,
  height = 1350
): Promise<string> {
  return await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
  });
}

export async function exportCardsAsZip(
  nodes: HTMLElement[],
  filename = 'cardnews.zip',
  onProgress?: (i: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  for (let i = 0; i < nodes.length; i++) {
    const blob = await renderNodeToPng(nodes[i]);
    zip.file(`card_${String(i + 1).padStart(2, '0')}.png`, blob);
    onProgress?.(i + 1, nodes.length);
  }
  const out = await zip.generateAsync({ type: 'blob' });
  saveAs(out, filename);
}