import type { Preset, Settings, Slide } from './types';
import { EMPTY_SETTINGS } from './types';

const SETTINGS_KEY = 'cardnews.settings.v1';
const SLIDES_KEY = 'cardnews.slides.v1';
const PRESETS_KEY = 'cardnews.customPresets.v1';

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return EMPTY_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...EMPTY_SETTINGS, ...JSON.parse(raw) } : EMPTY_SETTINGS;
  } catch {
    return EMPTY_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadSlides(): Slide[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SLIDES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSlides(slides: Slide[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SLIDES_KEY, JSON.stringify(slides));
  } catch {}
}

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