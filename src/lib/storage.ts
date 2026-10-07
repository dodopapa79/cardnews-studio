import type {
  BrandInfo,
  CardNewsProject,
  Preset,
  Settings,
  Slide,
} from './types';
import { EMPTY_SETTINGS, EMPTY_BRAND } from './types';

const SETTINGS_KEY = 'cardnews.settings.v3';
const PROJECTS_KEY = 'cardnews.projects.v3';
const PRESETS_KEY = 'cardnews.customPresets.v3';
const PRESET_STATS_KEY = 'cardnews.presetStats.v3';
const FAVORITES_KEY = 'cardnews.favorites.v3';
const CURRENT_PROJECT_KEY = 'cardnews.currentProjectId.v3';

// ─────────────────────────────────────────────
// 설정
// ─────────────────────────────────────────────
export function loadSettings(): Settings {
  if (typeof window === 'undefined') return EMPTY_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return EMPTY_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_SETTINGS,
      ...parsed,
      brand: { ...EMPTY_BRAND, ...(parsed.brand || {}) },
    };
  } catch {
    return EMPTY_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ─────────────────────────────────────────────
// 카드뉴스 프로젝트
// ─────────────────────────────────────────────
export function loadProjects(): CardNewsProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as CardNewsProject[];
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveProjects(projects: CardNewsProject[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('프로젝트 저장 실패 (용량 초과 가능성):', e);
    throw e;
  }
}

export function createProject(
  name: string,
  slides: Slide[],
  presetId: string,
  presetColorId: string,
  brand: BrandInfo
): CardNewsProject {
  const now = Date.now();
  return {
    id: `proj-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    slides,
    presetId,
    presetColorId,
    brand,
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertProject(
  projects: CardNewsProject[],
  project: CardNewsProject
): CardNewsProject[] {
  const existing = projects.findIndex((p) => p.id === project.id);
  const updated = { ...project, updatedAt: Date.now() };
  if (existing >= 0) {
    const next = [...projects];
    next[existing] = updated;
    saveProjects(next);
    return next;
  }
  const next = [updated, ...projects].sort((a, b) => b.updatedAt - a.updatedAt);
  saveProjects(next);
  return next;
}

export function deleteProject(
  projects: CardNewsProject[],
  id: string
): CardNewsProject[] {
  const next = projects.filter((p) => p.id !== id);
  saveProjects(next);
  return next;
}

// ─────────────────────────────────────────────
// 현재 프로젝트 ID (영상 만들기에서 사용)
// ─────────────────────────────────────────────
export function loadCurrentProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

export function saveCurrentProjectId(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) localStorage.setItem(CURRENT_PROJECT_KEY, id);
  else localStorage.removeItem(CURRENT_PROJECT_KEY);
}

// ─────────────────────────────────────────────
// 커스텀 프리셋
// ─────────────────────────────────────────────
export function loadCustomPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPresets(presets: Preset[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

// ─────────────────────────────────────────────
// 프리셋 사용 통계
// ─────────────────────────────────────────────
export function loadPresetStats(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PRESET_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function incrementPresetStat(presetId: string): Record<string, number> {
  const stats = loadPresetStats();
  stats[presetId] = (stats[presetId] || 0) + 1;
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRESET_STATS_KEY, JSON.stringify(stats));
  }
  return stats;
}

// ─────────────────────────────────────────────
// 즐겨찾기 프리셋
// ─────────────────────────────────────────────
export function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(presetId: string): string[] {
  const favorites = loadFavorites();
  const next = favorites.includes(presetId)
    ? favorites.filter((id) => id !== presetId)
    : [...favorites, presetId];
  if (typeof window !== 'undefined') {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }
  return next;
}

// ─────────────────────────────────────────────
// 레거시 (이전 버전 호환 — 첫 로드 시 마이그레이션)
// ─────────────────────────────────────────────
export function migrateLegacySlides(settings: Settings): CardNewsProject | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cardnews.slides.v2');
    if (!raw) return null;
    const slides = JSON.parse(raw) as Slide[];
    if (!slides?.length) return null;
    const project = createProject(
      '이전 카드뉴스',
      slides,
      'preset-dark-bold',
      'neon-green',
      settings.brand
    );
    localStorage.removeItem('cardnews.slides.v2');
    return project;
  } catch {
    return null;
  }
}