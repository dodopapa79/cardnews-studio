import type { Slide, Preset } from './types';

export function generateProjectName(slides: Slide[]): string {
  if (!slides.length) return '제목 없는 카드뉴스';
  const cover = slides.find((s) => s.type === 'cover') || slides[0];
  const headlineBlock = cover.blocks.find((b) => b.type === 'headline');
  const headline = headlineBlock?.content.text || '제목 없는 카드뉴스';
  return headline.length > 30 ? headline.slice(0, 30) + '...' : headline;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  if (hour < 24) return `${hour}시간 전`;
  if (day < 30) return `${day}일 전`;

  const d = new Date(timestamp);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function sortPresets<T extends { id: string; name: string }>(
  presets: T[],
  favorites: string[]
): T[] {
  return [...presets].sort((a, b) => {
    const aFav = favorites.includes(a.id) ? 1 : 0;
    const bFav = favorites.includes(b.id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return a.name.localeCompare(b.name, 'ko');
  });
}