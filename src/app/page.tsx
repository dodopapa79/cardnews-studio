'use client';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import type { ViewId } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { CreateView } from '@/components/views/CreateView';
import { PresetsView } from '@/components/views/PresetsView';
import { VideoView } from '@/components/views/VideoView';
import { SettingsView } from '@/components/views/SettingsView';
import {
  loadCustomPresets,
  loadSettings,
  loadSlides,
  saveCustomPresets,
  saveSettings,
  saveSlides,
} from '@/lib/storage';
import {
  EMPTY_SETTINGS,
  type Preset,
  type Settings,
  type Slide,
} from '@/lib/types';
import { STYLE_PRESETS } from '@/presets';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewId>('dashboard');
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [preset, setPreset] = useState<Preset>(STYLE_PRESETS[0]);
  const [presetColorId, setPresetColorId] = useState<string>(
    STYLE_PRESETS[0].colorVariants[0].id
  );
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    setSettings(loadSettings());
    setCustomPresets(loadCustomPresets());
    const saved = loadSlides();
    if (saved?.length) setSlides(saved);
  }, []);

  useEffect(() => {
    if (slides.length) saveSlides(slides);
  }, [slides]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  function handlePresetChange(p: Preset, colorId?: string) {
    setPreset(p);
    if (colorId) setPresetColorId(colorId);
    else setPresetColorId(p.colorVariants[0].id);
  }

  function handleSaveCustom(name: string) {
    const next: Preset = {
      ...preset,
      id: `custom-${Date.now()}`,
      name,
      category: 'custom',
      builtin: false,
    };
    const updated = [...customPresets, next];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    setPreset(next);
  }

  function handleDeleteCustom(id: string) {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    saveCustomPresets(updated);
    if (preset.id === id) handlePresetChange(STYLE_PRESETS[0]);
  }

  function handleImport(presets: Preset[]) {
    const imported = presets.map((p) => ({
      ...p,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: 'custom' as const,
      builtin: false,
    }));
    const updated = [...customPresets, ...imported];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    alert(`${imported.length}개의 프리셋을 가져왔습니다.`);
  }

  if (!mounted) return null;

  return (
    <AppShell active={view} onChange={setView} hasSlides={slides.length > 0}>
      {view === 'dashboard' && (
        <DashboardView settings={settings} slides={slides} onNavigate={setView} />
      )}
      {view === 'create' && (
        <CreateView
          settings={settings}
          slides={slides}
          onSlidesChange={setSlides}
          preset={preset}
          presetColorId={presetColorId}
          onPresetChange={handlePresetChange}
          customPresets={customPresets}
          onSaveCustom={handleSaveCustom}
          onDeleteCustom={handleDeleteCustom}
          cardRefs={cardRefs}
        />
      )}
      {view === 'presets' && (
        <PresetsView
          current={preset}
          currentColorId={presetColorId}
          onSelect={handlePresetChange}
          onColorChange={setPresetColorId}
          customPresets={customPresets}
          onSaveCustom={handleSaveCustom}
          onDeleteCustom={handleDeleteCustom}
          onImport={handleImport}
        />
      )}
      {view === 'video' && (
        <VideoView
          slides={slides}
          preset={preset}
          presetColorId={presetColorId}
          cardRefs={cardRefs}
        />
      )}
      {view === 'settings' && (
        <SettingsView
          settings={settings}
          onChange={setSettings}
          onReset={() => {
            setSlides([]);
            localStorage.removeItem('cardnews.slides.v2');
          }}
        />
      )}
    </AppShell>
  );
}