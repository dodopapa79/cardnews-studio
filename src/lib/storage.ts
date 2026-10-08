import type {
  BrandInfo,
  CardNewsProject,
  CardSize,
  Preset,
  Settings,
  Slide,
  Block,
} from './types';
import { EMPTY_SETTINGS, EMPTY_BRAND, DEFAULT_BACKGROUND } from './types';
import { makeBlockId } from './blocks';

const SETTINGS_KEY = 'cardnews.settings.v6';
const PROJECTS_KEY = 'cardnews.projects.v6';
const PRESETS_KEY = 'cardnews.customPresets.v6';
const FAVORITES_KEY = 'cardnews.favorites.v6';
const CURRENT_PROJECT_KEY = 'cardnews.currentProjectId.v6';

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
// 프로젝트
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
    console.error('프로젝트 저장 실패:', e);
    throw e;
  }
}

export function createProject(
  name: string,
  slides: Slide[],
  presetId: string,
  brand: BrandInfo,
  cardSize: CardSize = 'instagram'
): CardNewsProject {
  const now = Date.now();
  return {
    id: `proj-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    slides,
    presetId,
    cardSize,
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
  let next: CardNewsProject[];
  if (existing >= 0) {
    next = [...projects];
    next[existing] = updated;
  } else {
    next = [updated, ...projects];
  }
  next.sort((a, b) => b.updatedAt - a.updatedAt);
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
// 즐겨찾기
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
// 이미지 저장 (IndexedDB)
// ─────────────────────────────────────────────
const IMAGE_DB_NAME = 'cardnews-studio-v6';
const IMAGE_STORE = 'backgrounds';
let imageDbPromise: Promise<IDBDatabase> | null = null;

function openImageDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB는 브라우저에서만 사용 가능'));
  }
  if (imageDbPromise) return imageDbPromise;

  imageDbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IMAGE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return imageDbPromise;
}

export interface StoredImage {
  id: string;
  projectId: string;
  slideId: string;
  dataUrl: string;
  createdAt: number;
}

export async function saveBackgroundImages(images: StoredImage[]): Promise<void> {
  if (images.length === 0) return;
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    images.forEach((img) => store.put(img));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBackgroundImagesByProject(
  projectId: string
): Promise<StoredImage[]> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const allReq = store.getAll();
    allReq.onsuccess = () => {
      const all = allReq.result as StoredImage[];
      resolve(all.filter((i) => i.projectId === projectId));
    };
    allReq.onerror = () => reject(allReq.error);
  });
}

export async function deleteBackgroundImagesByProject(projectId: string): Promise<void> {
  const images = await getBackgroundImagesByProject(projectId);
  if (images.length === 0) return;
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    images.forEach((img) => store.delete(img.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllBackgroundImages(): Promise<void> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getStorageUsage(): Promise<{ count: number; bytes: number }> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result as StoredImage[];
      const bytes = items.reduce((sum, item) => sum + (item.dataUrl?.length || 0), 0);
      resolve({ count: items.length, bytes });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveProjectWithImages(
  projects: CardNewsProject[],
  project: CardNewsProject
): Promise<CardNewsProject[]> {
  const storedImages: StoredImage[] = [];
  const cleanedSlides = project.slides.map((slide) => {
    const bg = slide.background;
    if (!bg.imageUrl) return slide;

    const imageId = bg.imageId || `bg-${project.id}-${slide.id}`;
    storedImages.push({
      id: imageId,
      projectId: project.id,
      slideId: slide.id,
      dataUrl: bg.imageUrl,
      createdAt: Date.now(),
    });

    return {
      ...slide,
      background: { ...bg, imageId, imageUrl: '' },
    };
  });

  if (storedImages.length > 0) {
    await saveBackgroundImages(storedImages);
  }

  const cleanedProject = { ...project, slides: cleanedSlides };
  return upsertProject(projects, cleanedProject);
}

export async function loadProjectWithImages(
  project: CardNewsProject
): Promise<CardNewsProject> {
  const storedImages = await getBackgroundImagesByProject(project.id);
  const imageMap = new Map(storedImages.map((img) => [img.id, img.dataUrl]));

  const restoredSlides = project.slides.map((slide) => {
    const bg = slide.background;
    if (bg.imageId && imageMap.has(bg.imageId)) {
      return {
        ...slide,
        background: { ...bg, imageUrl: imageMap.get(bg.imageId)! },
      };
    }
    return slide;
  });

  return { ...project, slides: restoredSlides };
}

export async function deleteProjectWithImages(
  projects: CardNewsProject[],
  id: string
): Promise<CardNewsProject[]> {
  await deleteBackgroundImagesByProject(id);
  return deleteProject(projects, id);
}

// ─────────────────────────────────────────────
// 빈 슬라이드 생성
// ─────────────────────────────────────────────
export function createBlankSlide(
  type: Slide['type'] = 'cover',
  preset: Preset
): Slide {
  const id = `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const blocks: Block[] = [
    {
      id: makeBlockId(),
      type: 'headline',
      y: 0.3,
      content: { text: type === 'cover' ? '제목을 입력하세요' : '슬라이드 제목' },
      animation: 'slide-up',
      visible: true,
    },
    {
      id: makeBlockId(),
      type: 'body',
      y: 0.5,
      content: { text: '본문을 입력하세요' },
      animation: 'fade-in',
      visible: true,
    },
  ];

  return {
    id,
    type,
    background: { ...DEFAULT_BACKGROUND, ...preset.background } as any,
    blocks,
    imagePrompt: '',
    imagePromptKo: '',
    isLast: false,
  };
}